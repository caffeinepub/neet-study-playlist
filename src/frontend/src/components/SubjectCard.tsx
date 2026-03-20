import { cn } from "@/lib/utils";
import { Atom, BookOpen, ChevronRight, FlaskConical, Leaf } from "lucide-react";
import { motion } from "motion/react";

interface SubjectCardProps {
  id: bigint;
  name: string;
  desc: string;
  chapterCount: number;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const CONFIG: Record<
  string,
  {
    gradientClass: string;
    icon: React.ElementType;
    bg: string;
    iconColor: string;
  }
> = {
  Biology: {
    gradientClass: "subject-bio-gradient",
    icon: Leaf,
    bg: "oklch(0.56 0.16 152 / 0.10)",
    iconColor: "oklch(0.42 0.13 152)",
  },
  Chemistry: {
    gradientClass: "subject-chem-gradient",
    icon: FlaskConical,
    bg: "oklch(0.54 0.18 280 / 0.10)",
    iconColor: "oklch(0.42 0.15 280)",
  },
  Physics: {
    gradientClass: "subject-phys-gradient",
    icon: Atom,
    bg: "oklch(0.62 0.17 50 / 0.10)",
    iconColor: "oklch(0.50 0.14 50)",
  },
};

export default function SubjectCard({
  name,
  desc,
  chapterCount,
  index,
  isActive,
  onClick,
}: SubjectCardProps) {
  const cfg = CONFIG[name] ?? {
    gradientClass: "subject-default-gradient",
    icon: BookOpen,
    bg: "oklch(0.48 0.16 260 / 0.10)",
    iconColor: "oklch(0.38 0.13 260)",
  };
  const Icon = cfg.icon;

  return (
    <motion.button
      type="button"
      data-ocid={`subject.card.${index + 1}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className={cn(
        "text-left rounded-2xl overflow-hidden border transition-all group",
        isActive
          ? "border-primary/40 shadow-card-hover ring-2 ring-primary/15"
          : "border-border hover:border-primary/25 hover:shadow-card",
      )}
    >
      {/* Gradient top strip */}
      <div className={cn("h-2", cfg.gradientClass)} />
      <div className="p-5 bg-card">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: cfg.bg }}
          >
            <Icon className="w-5 h-5" style={{ color: cfg.iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-base leading-tight">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {desc}
            </p>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 shrink-0 transition-all mt-1",
              isActive
                ? "text-primary"
                : "text-muted-foreground/40 group-hover:text-primary/60",
            )}
          />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {chapterCount} chapters
          </span>
          <span className="text-xs font-semibold text-primary">Explore →</span>
        </div>
      </div>
    </motion.button>
  );
}
