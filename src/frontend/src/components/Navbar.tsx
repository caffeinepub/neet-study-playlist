import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, HelpCircle, Search, Send } from "lucide-react";

interface NavbarProps {
  globalSearch: string;
  onGlobalSearch: (v: string) => void;
  onImportTelegram: () => void;
  onHelp: () => void;
  activeView: string;
}

export default function Navbar({
  globalSearch,
  onGlobalSearch,
  onImportTelegram,
  onHelp,
  activeView,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 h-14 bg-card border-b border-border flex items-center px-5 gap-4 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-foreground text-sm tracking-tight block leading-tight">
            NEET Study
          </span>
          <span className="text-[10px] text-muted-foreground leading-none">
            Playlist Manager
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          data-ocid="nav.search_input"
          placeholder="Search playlists…"
          value={globalSearch}
          onChange={(e) => onGlobalSearch(e.target.value)}
          className="pl-8 h-8 text-sm bg-muted/50 border-border/60 focus:bg-card"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          data-ocid="nav.help.button"
          variant="ghost"
          size="sm"
          onClick={onHelp}
          className={
            activeView === "help" ? "text-primary" : "text-muted-foreground"
          }
        >
          <HelpCircle className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Help</span>
        </Button>
        <Button
          data-ocid="nav.telegram_import.button"
          onClick={onImportTelegram}
          size="sm"
          className="tg-btn gap-1.5 hidden sm:flex"
        >
          <Send className="w-3.5 h-3.5" />
          Import from Telegram
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs hero-gradient text-white font-bold">
            NA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
