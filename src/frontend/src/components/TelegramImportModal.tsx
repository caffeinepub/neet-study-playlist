import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Loader2,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ImportItem {
  title: string;
  description: string;
  resourceUrl: string;
  order: number;
}

interface ImportPlaylist {
  name: string;
  description: string;
  items: ImportItem[];
}

interface ImportChapter {
  name: string;
  number: number;
  description: string;
  playlists: ImportPlaylist[];
}

interface ImportSubject {
  name: string;
  description: string;
  color: string;
  chapters: ImportChapter[];
}

interface ParsedData {
  subjects: ImportSubject[];
}

function genId() {
  return BigInt(Date.now() + Math.floor(Math.random() * 100000));
}

const ANALYZE_STEPS = [
  "Fetching Telegram content...",
  "Analyzing with Gemini AI...",
  "Organizing by subject & chapter...",
];

const IMPORT_STEPS = [
  "Creating subjects...",
  "Creating chapters...",
  "Creating playlists...",
  "Adding videos...",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function TelegramImportModal({ open, onClose }: Props) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  // Step 1
  const [telegramUrl, setTelegramUrl] = useState(
    "https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m",
  );
  const [geminiKey, setGeminiKey] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [analyzeError, setAnalyzeError] = useState("");

  // Step 2
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(
    new Set([0]),
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );

  // Step 3
  const [importing, setImporting] = useState(false);
  const [importStep, setImportStep] = useState(0);
  const [importProgress, setImportProgress] = useState(0);
  const [importDone, setImportDone] = useState(false);
  const [importStats, setImportStats] = useState({
    subjects: 0,
    chapters: 0,
    playlists: 0,
    videos: 0,
  });

  const step =
    parsed && !importing && !importDone ? 2 : importing || importDone ? 3 : 1;

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function resetAll() {
    setParsed(null);
    setExpandedSubjects(new Set([0]));
    setExpandedChapters(new Set());
    setAnalyzing(false);
    setAnalyzeStep(0);
    setAnalyzeError("");
    setImporting(false);
    setImportStep(0);
    setImportProgress(0);
    setImportDone(false);
    setImportStats({ subjects: 0, chapters: 0, playlists: 0, videos: 0 });
  }

  function handleClose() {
    resetAll();
    onClose();
  }

  function countTotals(data: ParsedData) {
    let chapters = 0;
    let playlists = 0;
    let videos = 0;
    for (const s of data.subjects) {
      for (const c of s.chapters) {
        chapters++;
        for (const p of c.playlists) {
          playlists++;
          videos += p.items.length;
        }
      }
    }
    return { subjects: data.subjects.length, chapters, playlists, videos };
  }

  // ── Step 1: Analyze ──────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!actor || !telegramUrl.trim() || !geminiKey.trim()) return;
    setAnalyzing(true);
    setAnalyzeError("");
    setAnalyzeStep(0);

    // simulate step progression
    const timer1 = setTimeout(() => setAnalyzeStep(1), 1200);
    const timer2 = setTimeout(() => setAnalyzeStep(2), 3000);

    try {
      const raw = await actor.generatePlaylistFromTelegram(
        telegramUrl.trim(),
        0n,
        geminiKey.trim(),
      );
      clearTimeout(timer1);
      clearTimeout(timer2);

      // Parse Gemini JSON
      const parsed_raw = JSON.parse(raw);
      const text = parsed_raw.candidates?.[0]?.content?.parts?.[0]?.text ?? raw;
      const clean = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const data: ParsedData = JSON.parse(clean);
      if (!data.subjects || !Array.isArray(data.subjects)) {
        throw new Error("Unexpected response structure from Gemini");
      }
      setParsed(data);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setAnalyzeError(
        err instanceof Error
          ? err.message
          : "Failed to analyze. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Step 2 → 3: Import ───────────────────────────────────────────────────────
  async function handleImport() {
    if (!actor || !parsed) return;
    setImporting(true);
    setImportStep(0);
    setImportProgress(0);

    try {
      const subjectIds: bigint[] = [];
      // Step 0 – subjects
      setImportStep(0);
      await Promise.all(
        parsed.subjects.map(async (s) => {
          const id = genId();
          subjectIds.push(id);
          await actor.createSubject(
            id,
            s.name,
            s.description,
            s.color || "blue",
          );
        }),
      );
      setImportProgress(25);

      // Step 1 – chapters
      setImportStep(1);
      const chapterIds: Map<string, bigint> = new Map();
      await Promise.all(
        parsed.subjects.flatMap((s, si) =>
          s.chapters.map(async (ch) => {
            const id = genId();
            chapterIds.set(`${si}-${ch.number}`, id);
            await actor.createChapter(
              id,
              subjectIds[si],
              ch.name,
              BigInt(ch.number),
              ch.description,
            );
          }),
        ),
      );
      setImportProgress(50);

      // Step 2 – playlists
      setImportStep(2);
      const playlistIds: Map<string, bigint> = new Map();
      await Promise.all(
        parsed.subjects.flatMap((s, si) =>
          s.chapters.flatMap((ch, ci) =>
            ch.playlists.map(async (pl, pi) => {
              const chId = chapterIds.get(`${si}-${ch.number}`);
              if (!chId) return;
              const id = genId();
              playlistIds.set(`${si}-${ci}-${pi}`, id);
              await actor.createPlaylist(id, chId, pl.name, pl.description);
            }),
          ),
        ),
      );
      setImportProgress(75);

      // Step 3 – items
      setImportStep(3);
      await Promise.all(
        parsed.subjects.flatMap((s, si) =>
          s.chapters.flatMap((ch, ci) =>
            ch.playlists.flatMap((pl, pi) =>
              pl.items.map(async (item) => {
                const plId = playlistIds.get(`${si}-${ci}-${pi}`);
                if (!plId) return;
                const id = genId();
                await actor.createPlaylistItem(
                  id,
                  plId,
                  item.title,
                  item.description,
                  item.resourceUrl,
                  "",
                  BigInt(item.order),
                );
              }),
            ),
          ),
        ),
      );
      setImportProgress(100);

      const stats = countTotals(parsed);
      setImportStats(stats);
      setImportDone(true);
      queryClient.invalidateQueries();
    } catch (err) {
      setAnalyzeError(
        err instanceof Error ? err.message : "Import failed. Please try again.",
      );
      setImporting(false);
      setParsed(null);
    }
  }

  const totals = parsed ? countTotals(parsed) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border-border shadow-2xl"
        data-ocid="telegram_import.dialog"
      >
        {/* Header */}
        <div className="tg-header px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white leading-tight">
              Import from Telegram with AI
            </h2>
            <p className="text-white/70 text-xs">
              {step === 1 &&
                "Paste a study group link — Gemini will organize everything"}
              {step === 2 &&
                "Review & edit the AI-organized structure before importing"}
              {step === 3 &&
                (importDone
                  ? "Import complete!"
                  : "Importing your study content...")}
            </p>
          </div>
          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-all ${
                  step >= s
                    ? "bg-white text-blue-600"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="px-6 py-5 space-y-4"
            >
              <div className="space-y-1.5">
                <Label
                  className="text-xs font-semibold text-foreground"
                  htmlFor="tg-url"
                >
                  Telegram Study Group Link
                </Label>
                <div className="relative">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="tg-url"
                    data-ocid="telegram_import.input"
                    placeholder="https://t.me/your_study_group"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    className="pl-8 text-sm"
                    disabled={analyzing}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  className="text-xs font-semibold text-foreground"
                  htmlFor="gemini-key"
                >
                  Gemini API Key
                </Label>
                <Input
                  id="gemini-key"
                  data-ocid="telegram_import.gemini_key.input"
                  type="password"
                  placeholder="AIza..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="text-sm font-mono"
                  disabled={analyzing}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Free key at{" "}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    aistudio.google.com
                  </a>
                </p>
              </div>

              {analyzeError && (
                <div
                  data-ocid="telegram_import.error_state"
                  className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 text-xs text-destructive"
                >
                  {analyzeError}
                </div>
              )}

              {analyzing && (
                <div
                  data-ocid="telegram_import.loading_state"
                  className="bg-muted/60 rounded-xl px-4 py-4 space-y-3"
                >
                  {ANALYZE_STEPS.map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                      {i < analyzeStep ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : i === analyzeStep ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          i <= analyzeStep
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  data-ocid="telegram_import.analyze.button"
                  onClick={handleAnalyze}
                  disabled={
                    analyzing ||
                    !telegramUrl.trim() ||
                    !geminiKey.trim() ||
                    !actor
                  }
                  className="tg-btn gap-2"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {analyzing ? "Analyzing..." : "Analyze with Gemini AI"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && parsed && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col"
            >
              {/* Stats bar */}
              {totals && (
                <div className="px-6 py-3 bg-muted/40 border-b border-border flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <strong className="text-foreground">
                      {totals.subjects}
                    </strong>{" "}
                    subjects
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <strong className="text-foreground">
                      {totals.chapters}
                    </strong>{" "}
                    chapters
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <strong className="text-foreground">
                      {totals.playlists}
                    </strong>{" "}
                    playlists
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-primary" />
                    <strong className="text-foreground">{totals.videos}</strong>{" "}
                    videos
                  </span>
                </div>
              )}

              <ScrollArea className="h-[360px]">
                <div className="px-4 py-3 space-y-2">
                  {parsed.subjects.map((subject, si) => (
                    <div
                      key={subject.name || String(si)}
                      className="border border-border rounded-xl overflow-hidden"
                      data-ocid={`telegram_import.subject.item.${si + 1}`}
                    >
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/50 transition-colors text-left"
                        onClick={() =>
                          setExpandedSubjects((prev) => {
                            const next = new Set(prev);
                            if (next.has(si)) next.delete(si);
                            else next.add(si);
                            return next;
                          })
                        }
                      >
                        {expandedSubjects.has(si) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <Input
                          value={subject.name}
                          onChange={(e) => {
                            const next = { ...parsed };
                            next.subjects[si].name = e.target.value;
                            setParsed(next);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 text-sm font-semibold border-transparent bg-transparent hover:bg-muted/60 focus:bg-card focus:border-border px-2 flex-1"
                        />
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {subject.chapters.length} chapters
                        </Badge>
                      </button>

                      {expandedSubjects.has(si) && (
                        <div className="px-4 pb-3 space-y-1.5 bg-muted/20">
                          {subject.chapters.map((ch, ci) => (
                            <div
                              key={ch.name || String(ci)}
                              className="border border-border/60 rounded-lg overflow-hidden"
                            >
                              <button
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 bg-card hover:bg-muted/50 transition-colors text-left"
                                onClick={() => {
                                  const key = `${si}-${ci}`;
                                  setExpandedChapters((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(key)) next.delete(key);
                                    else next.add(key);
                                    return next;
                                  });
                                }}
                              >
                                {expandedChapters.has(`${si}-${ci}`) ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                )}
                                <span className="text-xs text-muted-foreground shrink-0 w-6">
                                  Ch{ch.number}
                                </span>
                                <Input
                                  value={ch.name}
                                  onChange={(e) => {
                                    const next = { ...parsed };
                                    next.subjects[si].chapters[ci].name =
                                      e.target.value;
                                    setParsed(next);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-6 text-xs border-transparent bg-transparent hover:bg-muted/60 focus:bg-card focus:border-border px-1.5 flex-1"
                                />
                                <Badge
                                  variant="outline"
                                  className="text-[10px] shrink-0"
                                >
                                  {ch.playlists.reduce(
                                    (a, p) => a + p.items.length,
                                    0,
                                  )}{" "}
                                  videos
                                </Badge>
                              </button>

                              {expandedChapters.has(`${si}-${ci}`) && (
                                <div className="px-3 pb-2 pt-1 space-y-1 bg-muted/30">
                                  {ch.playlists.map((pl, pi) => (
                                    <div
                                      key={pl.name || String(pi)}
                                      className="flex items-center gap-2 px-2 py-1.5 bg-card rounded-md border border-border/50"
                                    >
                                      <Layers className="w-3 h-3 text-muted-foreground shrink-0" />
                                      <Input
                                        value={pl.name}
                                        onChange={(e) => {
                                          const next = { ...parsed };
                                          next.subjects[si].chapters[
                                            ci
                                          ].playlists[pi].name = e.target.value;
                                          setParsed(next);
                                        }}
                                        className="h-6 text-xs border-transparent bg-transparent hover:bg-muted/60 focus:bg-card focus:border-border px-1 flex-1"
                                      />
                                      <span className="text-[10px] text-muted-foreground shrink-0">
                                        {pl.items.length} items
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t border-border flex justify-between gap-3">
                <Button
                  data-ocid="telegram_import.back.button"
                  variant="outline"
                  onClick={() => setParsed(null)}
                  size="sm"
                >
                  ← Back
                </Button>
                <Button
                  data-ocid="telegram_import.import_all.button"
                  onClick={handleImport}
                  disabled={!actor}
                  className="tg-btn gap-2"
                  size="sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Import All
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="px-6 py-8 space-y-6"
            >
              {!importDone ? (
                <>
                  <div className="text-center space-y-2">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-semibold text-foreground">
                      {IMPORT_STEPS[importStep]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This may take a moment…
                    </p>
                  </div>
                  <div
                    className="space-y-2"
                    data-ocid="telegram_import.loading_state"
                  >
                    <Progress value={importProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {IMPORT_STEPS.map((label, i) => (
                        <span
                          key={label}
                          className={
                            i <= importStep ? "text-primary font-medium" : ""
                          }
                        >
                          {i + 1}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {IMPORT_STEPS.map((label, i) => (
                        <div
                          key={label}
                          className={`text-center text-[10px] px-1 py-1 rounded ${
                            i < importStep
                              ? "bg-green-500/15 text-green-600"
                              : i === importStep
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="text-center space-y-4"
                  data-ocid="telegram_import.success_state"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      Import Successful!
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your study content has been organized and imported.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Subjects", value: importStats.subjects },
                      { label: "Chapters", value: importStats.chapters },
                      { label: "Playlists", value: importStats.playlists },
                      { label: "Videos", value: importStats.videos },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-muted/60 rounded-xl p-3 text-center"
                      >
                        <p className="text-xl font-bold text-primary">
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    data-ocid="telegram_import.view_playlists.button"
                    onClick={handleClose}
                    className="tg-btn w-full gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    View Playlists
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
