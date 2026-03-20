import { motion } from "motion/react";
import type { Chapter } from "../hooks/useQueries";

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
  onClick: () => void;
}

export default function ChapterCard({
  chapter,
  index,
  onClick,
}: ChapterCardProps) {
  return (
    <motion.button
      type="button"
      data-ocid={`chapter.card.${index + 1}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="text-left p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-card transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {chapter.number.toString()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {chapter.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {chapter.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
