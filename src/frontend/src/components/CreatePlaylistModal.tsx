import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreatePlaylist, useCreatePlaylistItem } from "../hooks/useQueries";
import type { Chapter } from "../hooks/useQueries";
import { SUBJECTS } from "../hooks/useQueries";

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  selectedChapter: Chapter | null;
  selectedSubjectId: bigint | null;
}

interface GeneratedItem {
  title: string;
  description: string;
  resourceUrl: string;
}

export default function CreatePlaylistModal({
  open,
  onClose,
  selectedChapter,
  selectedSubjectId,
}: CreatePlaylistModalProps) {
  // Manual tab state
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // AI tab state
  const [geminiKey, setGeminiKey] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[] | null>(
    null,
  );
  const [aiPlaylistName, setAiPlaylistName] = useState("");
  const [aiError, setAiError] = useState("");
  const [isSavingAi, setIsSavingAi] = useState(false);

  const createPlaylist = useCreatePlaylist();
  const createPlaylistItem = useCreatePlaylistItem();
  const { actor } = useActor();
  const qc = useQueryClient();

  const subject = SUBJECTS.find((s) => s.id === selectedSubjectId);
  const contextLabel = selectedChapter
    ? `${subject?.name ?? ""} › ${selectedChapter.name}`
    : (subject?.name ?? "Select a chapter first");

  const handleCreate = async () => {
    if (!selectedChapter) {
      toast.error("Please select a chapter first");
      return;
    }
    if (!name.trim()) return;
    const newId = BigInt(Date.now());
    await createPlaylist.mutateAsync({
      id: newId,
      chapterId: selectedChapter.id,
      name: name.trim(),
      desc: desc.trim(),
    });
    toast.success("Playlist created!");
    setName("");
    setDesc("");
    onClose();
  };

  const handleGenerate = async () => {
    if (!selectedChapter) {
      toast.error("Please select a chapter first");
      return;
    }
    if (!geminiKey.trim()) {
      toast.error("Please enter your Gemini API key");
      return;
    }
    if (!telegramUrl.trim()) {
      toast.error("Please enter a Telegram channel URL");
      return;
    }

    setIsGenerating(true);
    setAiError("");
    setGeneratedItems(null);

    try {
      if (!actor) throw new Error("Actor not ready");
      const raw = await actor.generatePlaylistFromTelegram(
        telegramUrl.trim(),
        selectedChapter.id,
        geminiKey.trim(),
      );

      // Parse Gemini API response
      let items: GeneratedItem[] = [];
      try {
        const parsed = JSON.parse(raw);
        let text: string;
        if (parsed?.candidates?.[0]?.content?.parts?.[0]?.text) {
          text = parsed.candidates[0].content.parts[0].text;
        } else if (typeof parsed === "string") {
          text = parsed;
        } else {
          text = raw;
        }
        // Strip markdown code fences if present
        text = text
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        const inner = JSON.parse(text);
        items = Array.isArray(inner)
          ? inner
          : (inner.items ?? inner.playlist ?? []);
      } catch {
        throw new Error(
          "Could not parse AI response. The response format was unexpected.",
        );
      }

      if (!items.length)
        throw new Error("No playlist items were returned by the AI.");

      setGeneratedItems(items);
      setAiPlaylistName(`${selectedChapter.name} — AI Playlist`);
    } catch (err: any) {
      setAiError(err?.message ?? "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAi = async () => {
    if (!selectedChapter || !generatedItems) return;
    setIsSavingAi(true);
    try {
      const playlistId = BigInt(Date.now());
      await createPlaylist.mutateAsync({
        id: playlistId,
        chapterId: selectedChapter.id,
        name: aiPlaylistName.trim() || "AI Generated Playlist",
        desc: `Generated from ${telegramUrl}`,
      });

      for (let i = 0; i < generatedItems.length; i++) {
        const item = generatedItems[i];
        await createPlaylistItem.mutateAsync({
          id: BigInt(Date.now() + i + 1),
          playlistId,
          title: item.title ?? "Untitled",
          desc: item.description ?? "",
          resourceUrl: item.resourceUrl ?? telegramUrl,
          notes: "",
          order: BigInt(i + 1),
        });
      }

      qc.invalidateQueries({
        queryKey: ["playlists", selectedChapter.id.toString()],
      });
      toast.success("AI playlist saved!");
      resetAiState();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save playlist");
    } finally {
      setIsSavingAi(false);
    }
  };

  const resetAiState = () => {
    setGeminiKey("");
    setTelegramUrl("");
    setGeneratedItems(null);
    setAiPlaylistName("");
    setAiError("");
  };

  const handleClose = () => {
    setName("");
    setDesc("");
    resetAiState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent data-ocid="create_playlist.dialog" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Playlist</DialogTitle>
        </DialogHeader>

        <div className="p-3 bg-accent rounded-lg">
          <p className="text-xs text-muted-foreground">Adding to:</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {contextLabel}
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger
              data-ocid="create_playlist.manual.tab"
              value="manual"
              className="flex-1"
            >
              Manual
            </TabsTrigger>
            <TabsTrigger
              data-ocid="create_playlist.ai.tab"
              value="ai"
              className="flex-1 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate with AI
            </TabsTrigger>
          </TabsList>

          {/* ── Manual Tab ── */}
          <TabsContent value="manual" className="space-y-4 pt-2">
            <div>
              <Label htmlFor="playlist-name" className="text-xs font-medium">
                Playlist Name *
              </Label>
              <Input
                id="playlist-name"
                data-ocid="create_playlist.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DNA Replication Master Class"
                className="mt-1"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div>
              <Label htmlFor="playlist-desc" className="text-xs font-medium">
                Description
              </Label>
              <Textarea
                id="playlist-desc"
                data-ocid="create_playlist.desc.textarea"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What topics does this playlist cover?"
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                data-ocid="create_playlist.cancel_button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                data-ocid="create_playlist.submit_button"
                onClick={handleCreate}
                disabled={
                  !name.trim() || !selectedChapter || createPlaylist.isPending
                }
              >
                {createPlaylist.isPending ? "Creating…" : "Create Playlist"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ── AI Tab ── */}
          <TabsContent value="ai" className="space-y-4 pt-2">
            <div>
              <Label htmlFor="gemini-key" className="text-xs font-medium">
                Gemini API Key *
              </Label>
              <Input
                id="gemini-key"
                type="password"
                data-ocid="create_playlist.gemini_key.input"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Get your free key at{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-4 hover:underline inline-flex items-center gap-0.5"
                >
                  aistudio.google.com
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>

            <div>
              <Label htmlFor="telegram-url" className="text-xs font-medium">
                Telegram Channel URL *
              </Label>
              <Input
                id="telegram-url"
                data-ocid="create_playlist.telegram_url.input"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="https://t.me/channel_name"
                className="mt-1"
              />
            </div>

            {!generatedItems && (
              <Button
                data-ocid="create_playlist.generate.primary_button"
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !geminiKey.trim() ||
                  !telegramUrl.trim() ||
                  !selectedChapter
                }
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Telegram channel with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Playlist
                  </>
                )}
              </Button>
            )}

            {/* Loading state */}
            {isGenerating && (
              <div
                data-ocid="create_playlist.generate.loading_state"
                className="flex items-center justify-center gap-3 py-6 rounded-lg bg-muted/50"
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Analyzing Telegram channel with Gemini AI…
                </p>
              </div>
            )}

            {/* Error state */}
            {aiError && (
              <div
                data-ocid="create_playlist.generate.error_state"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3"
              >
                <p className="text-sm text-destructive font-medium">
                  Generation failed
                </p>
                <p className="text-xs text-destructive/80 mt-1">{aiError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => setAiError("")}
                >
                  Try again
                </Button>
              </div>
            )}

            {/* Preview section */}
            {generatedItems && (
              <div
                data-ocid="create_playlist.preview.panel"
                className="space-y-3"
              >
                <div>
                  <Label
                    htmlFor="ai-playlist-name"
                    className="text-xs font-medium"
                  >
                    Playlist Name
                  </Label>
                  <Input
                    id="ai-playlist-name"
                    data-ocid="create_playlist.ai_name.input"
                    value={aiPlaylistName}
                    onChange={(e) => setAiPlaylistName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="rounded-lg border bg-muted/30 divide-y max-h-56 overflow-y-auto">
                  {generatedItems.map((item, idx) => (
                    <div
                      key={`${item.title}-${idx}`}
                      data-ocid={`create_playlist.preview.item.${idx + 1}`}
                      className="px-3 py-2.5"
                    >
                      <p className="text-sm font-medium leading-tight">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      )}
                      {item.resourceUrl && (
                        <a
                          href={item.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline-offset-4 hover:underline mt-0.5 block truncate"
                        >
                          {item.resourceUrl}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {generatedItems.length} items ready to save
                </p>

                <DialogFooter className="pt-1">
                  <Button
                    data-ocid="create_playlist.ai_cancel.cancel_button"
                    variant="outline"
                    onClick={() => {
                      setGeneratedItems(null);
                      setAiError("");
                    }}
                  >
                    Re-generate
                  </Button>
                  <Button
                    data-ocid="create_playlist.ai_save.primary_button"
                    onClick={handleSaveAi}
                    disabled={isSavingAi}
                  >
                    {isSavingAi ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      "Save Playlist"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {!generatedItems && (
              <DialogFooter className="pt-0">
                <Button
                  data-ocid="create_playlist.ai_close.cancel_button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </DialogFooter>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
