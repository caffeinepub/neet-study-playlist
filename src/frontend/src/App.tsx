import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChevronRight, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import ChapterCard from "./components/ChapterCard";
import CreatePlaylistModal from "./components/CreatePlaylistModal";
import HelpSection from "./components/HelpSection";
import Navbar from "./components/Navbar";
import PlaylistCard from "./components/PlaylistCard";
import PlaylistDetailModal from "./components/PlaylistDetailModal";
import Sidebar from "./components/Sidebar";
import SubjectCard from "./components/SubjectCard";
import TelegramImportModal from "./components/TelegramImportModal";

import { useActor } from "./hooks/useActor";
import {
  SUBJECTS,
  useChaptersBySubject,
  useItemsByPlaylist,
  usePlaylistsByChapter,
  useSeedData,
} from "./hooks/useQueries";
import type { Chapter, Playlist } from "./hooks/useQueries";

const queryClient = new QueryClient();

function AppInner() {
  const { actor } = useActor();
  const seed = useSeedData();
  const seededRef = useRef(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState<bigint | null>(1n);
  const [selectedChapterId, setSelectedChapterId] = useState<bigint | null>(
    null,
  );
  const [activeView, setActiveView] = useState<
    "home" | "subject" | "chapter" | "help"
  >("home");
  const [chapterSearch, setChapterSearch] = useState("");
  const [openPlaylist, setOpenPlaylist] = useState<Playlist | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  const { data: chapters = [], isLoading: chaptersLoading } =
    useChaptersBySubject(selectedSubjectId);
  const { data: playlists = [], isLoading: playlistsLoading } =
    usePlaylistsByChapter(selectedChapterId);

  useEffect(() => {
    if (actor && !seededRef.current) {
      seededRef.current = true;
      seed.mutateAsync().catch(() => {});
    }
  }, [actor, seed]);

  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) ?? null,
    [chapters, selectedChapterId],
  );

  const selectedSubject = SUBJECTS.find((s) => s.id === selectedSubjectId);

  const filteredPlaylists = useMemo(() => {
    const q = chapterSearch.toLowerCase().trim();
    if (!q) return playlists;
    return playlists.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [playlists, chapterSearch]);

  const handleSelectSubject = (id: bigint) => {
    setSelectedSubjectId(id);
    setSelectedChapterId(null);
    setChapterSearch("");
    setActiveView("subject");
  };

  const handleSelectChapter = (id: bigint) => {
    setSelectedChapterId(id);
    setChapterSearch("");
    setActiveView("chapter");
  };

  const handleHelp = () => setActiveView("help");

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar
        globalSearch={""}
        onGlobalSearch={() => {}}
        onImportTelegram={() => setTelegramModalOpen(true)}
        onHelp={handleHelp}
        activeView={activeView}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedSubjectId={selectedSubjectId}
          selectedChapterId={selectedChapterId}
          chapters={chapters}
          activeView={activeView}
          onSelectSubject={handleSelectSubject}
          onSelectChapter={handleSelectChapter}
          onCreatePlaylist={() => setCreateModalOpen(true)}
          onImportTelegram={() => setTelegramModalOpen(true)}
          onHelp={handleHelp}
        />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeView === "help" ? (
              <motion.div
                key="help"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <HelpSection
                  onImportTelegram={() => setTelegramModalOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 max-w-5xl mx-auto space-y-6"
              >
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setActiveView("home")}
                    className="hover:text-foreground transition-colors font-medium"
                  >
                    NEET
                  </button>
                  {selectedSubject && activeView !== "home" && (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChapterId(null);
                          setActiveView("subject");
                        }}
                        className="hover:text-foreground transition-colors"
                      >
                        {selectedSubject.name}
                      </button>
                    </>
                  )}
                  {selectedChapter && activeView === "chapter" && (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      <span className="text-foreground font-semibold truncate max-w-[260px]">
                        Ch {selectedChapter.number.toString()}:{" "}
                        {selectedChapter.name}
                      </span>
                    </>
                  )}
                </nav>

                {/* Home: subject cards */}
                {activeView === "home" && (
                  <section>
                    <div className="mb-5">
                      <h1 className="font-display text-2xl font-bold text-foreground">
                        Your NEET Study Dashboard
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        Organize lectures by subject and chapter. Track your
                        progress.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {SUBJECTS.map((s, i) => (
                        <SubjectCard
                          key={s.id.toString()}
                          id={s.id}
                          name={s.name}
                          desc={s.desc}
                          chapterCount={s.chapters}
                          index={i}
                          isActive={selectedSubjectId === s.id}
                          onClick={() => handleSelectSubject(s.id)}
                        />
                      ))}
                    </div>

                    {/* Quick actions */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 bg-card border border-border rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            Create a Playlist
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Manually add study resources to any chapter
                          </p>
                        </div>
                        <Button
                          data-ocid="home.create_playlist.button"
                          size="sm"
                          variant="outline"
                          onClick={() => setCreateModalOpen(true)}
                        >
                          Create
                        </Button>
                      </div>
                      <div className="p-5 bg-card border border-border rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl tg-btn flex items-center justify-center shrink-0 opacity-90">
                          <Search className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-foreground">
                            Import from Telegram
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Let Gemini AI organize lectures automatically
                          </p>
                        </div>
                        <Button
                          data-ocid="home.import_telegram.button"
                          size="sm"
                          className="tg-btn"
                          onClick={() => setTelegramModalOpen(true)}
                        >
                          Import
                        </Button>
                      </div>
                    </div>
                  </section>
                )}

                {/* Subject view: chapter grid */}
                {activeView === "subject" && selectedSubjectId && (
                  <section>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h1 className="font-display text-xl font-bold text-foreground">
                          {selectedSubject?.name} Chapters
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {selectedSubject?.desc}
                        </p>
                      </div>
                    </div>
                    {chaptersLoading || seed.isPending ? (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {[1, 2, 3, 4].map((k) => (
                          <Skeleton key={k} className="h-24 rounded-xl" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {chapters
                          .slice()
                          .sort((a, b) => Number(a.number) - Number(b.number))
                          .map((ch, idx) => (
                            <ChapterCard
                              key={ch.id.toString()}
                              chapter={ch}
                              index={idx}
                              onClick={() => handleSelectChapter(ch.id)}
                            />
                          ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Chapter view: playlists */}
                {activeView === "chapter" && selectedChapterId && (
                  <section>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <h1 className="font-display text-xl font-bold text-foreground">
                          {selectedChapter?.name}
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedSubject?.name} · Chapter{" "}
                          {selectedChapter?.number.toString()}
                        </p>
                      </div>
                      <Button
                        data-ocid="chapter.create_playlist.button"
                        size="sm"
                        variant="outline"
                        onClick={() => setCreateModalOpen(true)}
                        className="gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Playlist
                      </Button>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xs mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        data-ocid="chapter.search_input"
                        placeholder="Search playlists…"
                        value={chapterSearch}
                        onChange={(e) => setChapterSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                      />
                    </div>

                    {playlistsLoading || seed.isPending ? (
                      <div
                        data-ocid="playlist.loading_state"
                        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      >
                        {[1, 2, 3, 4].map((k) => (
                          <Skeleton key={k} className="h-48 rounded-xl" />
                        ))}
                      </div>
                    ) : filteredPlaylists.length === 0 ? (
                      <div
                        data-ocid="playlist.empty_state"
                        className="py-16 text-center"
                      >
                        <p className="text-muted-foreground text-sm">
                          {chapterSearch
                            ? "No playlists match your search."
                            : "No playlists yet. Create one!"}
                        </p>
                        {!chapterSearch && (
                          <Button
                            data-ocid="playlist.create_first.button"
                            onClick={() => setCreateModalOpen(true)}
                            className="mt-3"
                            size="sm"
                          >
                            Create First Playlist
                          </Button>
                        )}
                      </div>
                    ) : (
                      <motion.div
                        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {filteredPlaylists.map((playlist, idx) => (
                          <PlaylistCardWrapper
                            key={playlist.id.toString()}
                            playlist={playlist}
                            index={idx}
                            chapterName={selectedChapter?.name}
                            onOpen={setOpenPlaylist}
                          />
                        ))}
                      </motion.div>
                    )}
                  </section>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {activeView !== "help" && (
            <footer className="px-6 py-4 border-t border-border mt-6">
              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()}. Built with ❤️ using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  caffeine.ai
                </a>
              </p>
            </footer>
          )}
        </main>
      </div>

      <PlaylistDetailModal
        playlist={openPlaylist}
        chapterName={selectedChapter?.name}
        open={!!openPlaylist}
        onClose={() => setOpenPlaylist(null)}
      />
      <CreatePlaylistModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        selectedChapter={selectedChapter}
        selectedSubjectId={selectedSubjectId}
      />
      <TelegramImportModal
        open={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
      />

      <Toaster richColors position="top-right" />
    </div>
  );
}

function PlaylistCardWrapper({
  playlist,
  index,
  chapterName,
  onOpen,
}: {
  playlist: Playlist;
  index: number;
  chapterName?: string;
  onOpen: (p: Playlist) => void;
}) {
  const { data: items = [] } = useItemsByPlaylist(playlist.id);
  const completedCount = items.filter((i) => i.isCompleted).length;
  return (
    <PlaylistCard
      playlist={playlist}
      itemCount={items.length}
      completedCount={completedCount}
      chapterName={chapterName}
      index={index}
      onOpen={onOpen}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
