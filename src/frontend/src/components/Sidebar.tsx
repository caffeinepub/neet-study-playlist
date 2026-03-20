import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Atom,
  BookOpen,
  ChevronRight,
  FlaskConical,
  HelpCircle,
  Leaf,
  Plus,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SUBJECTS } from "../hooks/useQueries";
import type { Chapter } from "../hooks/useQueries";

interface SidebarProps {
  selectedSubjectId: bigint | null;
  selectedChapterId: bigint | null;
  chapters: Chapter[];
  activeView: string;
  onSelectSubject: (id: bigint) => void;
  onSelectChapter: (id: bigint) => void;
  onCreatePlaylist: () => void;
  onImportTelegram: () => void;
  onHelp: () => void;
}

const SUBJECT_ICONS = { 1: Leaf, 2: FlaskConical, 3: Atom };
const SUBJECT_COLORS = {
  1: {
    dot: "bg-[oklch(0.56_0.16_152)]",
    ring: "ring-[oklch(0.56_0.16_152/0.3)]",
  },
  2: {
    dot: "bg-[oklch(0.54_0.18_280)]",
    ring: "ring-[oklch(0.54_0.18_280/0.3)]",
  },
  3: {
    dot: "bg-[oklch(0.62_0.17_50)]",
    ring: "ring-[oklch(0.62_0.17_50/0.3)]",
  },
};

export default function Sidebar({
  selectedSubjectId,
  selectedChapterId,
  chapters,
  activeView,
  onSelectSubject,
  onSelectChapter,
  onCreatePlaylist,
  onImportTelegram,
  onHelp,
}: SidebarProps) {
  return (
    <aside className="w-[240px] shrink-0 sidebar-bg flex flex-col h-full border-r border-sidebar-border">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-6">
          {/* Subjects */}
          <section>
            <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-2">
              Subjects
            </p>
            <ul className="space-y-0.5">
              {SUBJECTS.map((subj) => {
                const Icon =
                  SUBJECT_ICONS[
                    subj.id as unknown as keyof typeof SUBJECT_ICONS
                  ];
                const colors =
                  SUBJECT_COLORS[
                    subj.id as unknown as keyof typeof SUBJECT_COLORS
                  ];
                const isActive =
                  selectedSubjectId === subj.id && activeView !== "help";
                return (
                  <li key={subj.id.toString()}>
                    <button
                      type="button"
                      data-ocid={`sidebar.${subj.name.toLowerCase()}.button`}
                      onClick={() => onSelectSubject(subj.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                          isActive
                            ? `${colors.dot} ring-2 ${colors.ring}`
                            : "bg-sidebar-border/60",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-3.5 h-3.5",
                            isActive
                              ? "text-white"
                              : "text-sidebar-foreground/50",
                          )}
                        />
                      </span>
                      <span className="flex-1 text-left truncate">
                        {subj.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 bg-transparent border-sidebar-border text-sidebar-foreground/40"
                      >
                        {subj.chapters}
                      </Badge>
                    </button>

                    <AnimatePresence>
                      {isActive && chapters.length > 0 && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-0.5 ml-4 space-y-0.5 border-l border-sidebar-border/50 pl-3 overflow-hidden"
                        >
                          {chapters
                            .slice()
                            .sort((a, b) => Number(a.number) - Number(b.number))
                            .map((ch, idx) => (
                              <li key={ch.id.toString()}>
                                <button
                                  type="button"
                                  data-ocid={`sidebar.chapter.button.${idx + 1}`}
                                  onClick={() => onSelectChapter(ch.id)}
                                  className={cn(
                                    "w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center gap-1.5",
                                    selectedChapterId === ch.id
                                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                                  )}
                                >
                                  {selectedChapterId === ch.id && (
                                    <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {ch.number.toString()}. {ch.name}
                                  </span>
                                </button>
                              </li>
                            ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Actions */}
          <section>
            <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest mb-2 px-2">
              Actions
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  data-ocid="sidebar.create_playlist.button"
                  onClick={onCreatePlaylist}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-sidebar-border/60 flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                  </span>
                  <span>New Playlist</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-ocid="sidebar.import_telegram.button"
                  onClick={onImportTelegram}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-sidebar-border/60 flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                  </span>
                  <span>Import Telegram</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  data-ocid="sidebar.help.button"
                  onClick={onHelp}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    activeView === "help"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <span className="w-6 h-6 rounded-md bg-sidebar-border/60 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                  </span>
                  <span>Help</span>
                </button>
              </li>
            </ul>
          </section>
        </div>
      </ScrollArea>

      {/* Bottom branding */}
      <div className="p-3 border-t border-sidebar-border/50">
        <div className="flex items-center gap-2 px-2">
          <BookOpen className="w-3.5 h-3.5 text-sidebar-foreground/30" />
          <span className="text-[10px] text-sidebar-foreground/30 font-medium">
            NEET Study Playlist
          </span>
        </div>
      </div>
    </aside>
  );
}
