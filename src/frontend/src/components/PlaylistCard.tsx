import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, Play, PlayCircle } from "lucide-react";
import { motion } from "motion/react";
import type { Playlist } from "../hooks/useQueries";

interface PlaylistCardProps {
  playlist: Playlist;
  itemCount: number;
  completedCount: number;
  chapterName?: string;
  index: number;
  onOpen: (p: Playlist) => void;
}

export default function PlaylistCard({
  playlist,
  itemCount,
  completedCount,
  chapterName: _chapterName,
  index,
  onOpen,
}: PlaylistCardProps) {
  const pct =
    itemCount > 0 ? Math.round((completedCount / itemCount) * 100) : 0;
  const done = pct === 100 && itemCount > 0;

  return (
    <motion.div
      data-ocid={`playlist.card.${index + 1}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-card border rounded-xl overflow-hidden flex flex-col transition-all",
        done
          ? "border-green-300/60 shadow-[0_0_0_1px_oklch(0.58_0.17_152/0.2)]"
          : "border-border hover:border-primary/30 hover:shadow-card",
      )}
    >
      {/* Top accent bar */}
      <div className={cn("h-1", done ? "bg-green-500" : "bg-primary/30")} />

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-foreground text-sm leading-snug line-clamp-2 flex-1">
              {playlist.name}
            </h3>
            {done && (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500 mt-0.5" />
            )}
          </div>
          {playlist.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {playlist.description}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Play className="w-2.5 h-2.5" />
              {itemCount} video{itemCount !== 1 ? "s" : ""}
            </span>
            <span
              className={cn(
                "font-semibold",
                done ? "text-green-600" : "text-primary",
              )}
            >
              {pct}%
            </span>
          </div>
          <Progress
            value={pct}
            className={cn("h-1", done ? "[&>div]:bg-green-500" : "")}
          />
        </div>

        {/* CTA */}
        <Button
          data-ocid={`playlist.open_button.${index + 1}`}
          size="sm"
          variant={done ? "outline" : "default"}
          className="w-full gap-1.5 mt-auto text-xs h-8"
          onClick={() => onOpen(playlist)}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          {done ? "Review" : completedCount > 0 ? "Continue" : "Start"}
        </Button>
      </div>
    </motion.div>
  );
}
