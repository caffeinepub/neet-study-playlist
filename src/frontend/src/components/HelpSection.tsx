import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ExternalLink,
  Key,
  Layers,
  ListChecks,
  Send,
  Sparkles,
  Video,
} from "lucide-react";
import { motion } from "motion/react";

interface HelpSectionProps {
  onImportTelegram: () => void;
}

const STEPS = [
  {
    icon: Send,
    title: "Paste Telegram Group Link",
    desc: "Copy the link to your NEET study Telegram group (e.g. https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m) and paste it into the Import Wizard.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Key,
    title: "Get Your Free Gemini API Key",
    desc: "Visit aistudio.google.com to get a free Gemini API key. Paste it into the wizard — it's used to analyze the group content with AI.",
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    icon: Sparkles,
    title: "AI Analyzes & Organizes",
    desc: "Gemini AI scans the Telegram group and automatically sorts every lecture into Physics, Chemistry, and Biology, then by chapter.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: ListChecks,
    title: "Preview & Confirm",
    desc: "Review the organized structure — edit subject or chapter names if needed — then click Import All to save everything.",
    color: "text-green-500",
    bg: "bg-green-50",
  },
];

const FEATURES = [
  {
    icon: Layers,
    label: "Subject-wise organization",
    desc: "Physics, Chemistry, Biology",
  },
  {
    icon: BookOpen,
    label: "Chapter-based playlists",
    desc: "Structured study paths",
  },
  { icon: Video, label: "Video tracking", desc: "Mark lectures as watched" },
  {
    icon: ListChecks,
    label: "Progress bars",
    desc: "See % completed per playlist",
  },
];

export default function HelpSection({ onImportTelegram }: HelpSectionProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              How to Use NEET Study Playlist
            </h1>
            <p className="text-sm text-muted-foreground">
              Import lectures from Telegram and organize your NEET prep
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-3">
          What this app does
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="help-card rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {f.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Telegram Import Steps */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-3">
          Telegram AI Import — Step by Step
        </h2>
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex gap-4 p-4 help-card rounded-xl"
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl ${step.bg} flex items-center justify-center shrink-0`}
                >
                  <step.icon className={`w-4.5 h-4.5 ${step.color}`} />
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-border min-h-[12px]" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    Step {i + 1}
                  </Badge>
                  <p className="text-sm font-semibold text-foreground">
                    {step.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Resources */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="font-display text-lg font-bold text-foreground mb-3">
          Useful Resources
        </h2>
        <div className="space-y-2">
          <a
            href="https://t.me/Pw_Lakshya_Neet_2_0_Lectures_u3m"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 help-card rounded-xl hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  PW Lakshya NEET 2.0 Lectures
                </p>
                <p className="text-xs text-muted-foreground">
                  Telegram study group with organized lecture content
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 help-card rounded-xl hover:border-primary/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Google AI Studio
                </p>
                <p className="text-xs text-muted-foreground">
                  Get your free Gemini API key here
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3"
      >
        <h3 className="font-display text-lg font-bold text-foreground">
          Ready to start?
        </h3>
        <p className="text-sm text-muted-foreground">
          Import your Telegram study group with one click. Gemini AI organizes
          everything automatically.
        </p>
        <Button
          data-ocid="help.import_telegram.button"
          onClick={onImportTelegram}
          className="tg-btn gap-2"
        >
          <Send className="w-4 h-4" />
          Import from Telegram
        </Button>
      </motion.div>
    </div>
  );
}
