import { Button } from "@/components/ui/button";
import { BookOpen, List, Plus, Send } from "lucide-react";
import type { Chapter } from "../hooks/useQueries";
import { SUBJECTS } from "../hooks/useQueries";

interface HeroBannerProps {
  selectedSubjectId: bigint | null;
  selectedChapter: Chapter | null;
  playlistCount: number;
  itemCount: number;
  onCreatePlaylist: () => void;
  onImportTelegram: () => void;
}

export default function HeroBanner({
  selectedSubjectId,
  selectedChapter,
  playlistCount,
  itemCount,
  onCreatePlaylist,
  onImportTelegram,
}: HeroBannerProps) {
  const subject = SUBJECTS.find((s) => s.id === selectedSubjectId);
  const gradientClass =
    subject?.color === "bio"
      ? "subject-bio"
      : subject?.color === "chem"
        ? "subject-chem"
        : subject?.color === "phys"
          ? "subject-phys"
          : "hero-gradient";

  const title = selectedChapter
    ? `Chapter ${selectedChapter.number}: ${selectedChapter.name}`
    : subject
      ? subject.name
      : "NEET Study Playlists";

  const subtitle = selectedChapter
    ? selectedChapter.description
    : subject
      ? subject.desc
      : "Organise your NEET preparation with curated chapter-wise playlists";

  return (
    <div
      className={`${gradientClass} rounded-xl p-6 flex items-start justify-between gap-4 text-white`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">
          {subject ? subject.name.toUpperCase() : "OVERVIEW"}
          {selectedChapter && " › CHAPTER"}
        </p>
        <h1 className="text-xl font-bold leading-tight truncate">{title}</h1>
        <p className="text-white/75 text-sm mt-1 line-clamp-2">{subtitle}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-white/80 text-xs">
            <List className="w-3.5 h-3.5" />
            {playlistCount} playlist{playlistCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5 text-white/80 text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            {itemCount} resource{itemCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Button
          data-ocid="hero.telegram_import.button"
          onClick={onImportTelegram}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm gap-1.5"
          size="sm"
        >
          <Send className="w-3.5 h-3.5" />
          Import from Telegram
        </Button>
        <Button
          data-ocid="hero.create_playlist.button"
          onClick={onCreatePlaylist}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Playlist
        </Button>
      </div>
    </div>
  );
}
