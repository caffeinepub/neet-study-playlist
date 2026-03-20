import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, ExternalLink, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreatePlaylistItem,
  useItemsByPlaylist,
  useMarkItemStatus,
} from "../hooks/useQueries";
import type { Playlist } from "../hooks/useQueries";

interface PlaylistDetailModalProps {
  playlist: Playlist | null;
  chapterName?: string;
  open: boolean;
  onClose: () => void;
}

export default function PlaylistDetailModal({
  playlist,
  chapterName,
  open,
  onClose,
}: PlaylistDetailModalProps) {
  const { data: items = [], isLoading } = useItemsByPlaylist(
    playlist?.id ?? null,
  );
  const markStatus = useMarkItemStatus();

  const [showAddItem, setShowAddItem] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const createItem = useCreatePlaylistItem();

  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPct =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const isComplete = progressPct === 100 && items.length > 0;

  const handleToggle = async (itemId: bigint, current: boolean) => {
    if (!playlist) return;
    await markStatus.mutateAsync({
      itemId,
      isCompleted: !current,
      playlistId: playlist.id,
    });
  };

  const handleAddItem = async () => {
    if (!playlist || !newTitle.trim()) return;
    const newId = BigInt(Date.now());
    await createItem.mutateAsync({
      id: newId,
      playlistId: playlist.id,
      title: newTitle.trim(),
      desc: newDesc.trim(),
      resourceUrl: newUrl.trim(),
      notes: newNotes.trim(),
      order: BigInt(items.length + 1),
    });
    toast.success("Item added to playlist");
    setNewTitle("");
    setNewUrl("");
    setNewDesc("");
    setNewNotes("");
    setShowAddItem(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="playlist_detail.dialog"
        className="max-w-2xl max-h-[90vh] flex flex-col"
      >
        <DialogHeader className="pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg leading-snug">
                {playlist?.name}
              </DialogTitle>
              {chapterName && (
                <p className="text-muted-foreground text-xs mt-0.5">
                  {chapterName}
                </p>
              )}
              {playlist?.description && (
                <p className="text-muted-foreground text-sm mt-1">
                  {playlist.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completedCount}/{items.length} completed
              </span>
              <span
                className={cn(
                  "font-semibold",
                  isComplete ? "text-green-600" : "text-primary",
                )}
              >
                {progressPct}%
              </span>
            </div>
            <Progress
              value={progressPct}
              className={cn(
                "h-1.5",
                isComplete ? "[&>div]:bg-green-500" : "[&>div]:bg-primary",
              )}
            />
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div
              data-ocid="playlist_detail.loading_state"
              className="py-8 text-center text-muted-foreground text-sm"
            >
              Loading items…
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="playlist_detail.empty_state"
              className="py-8 text-center"
            >
              <p className="text-muted-foreground text-sm">
                No items yet. Add your first resource!
              </p>
            </div>
          ) : (
            <ul className="space-y-2 py-2">
              {items
                .slice()
                .sort((a, b) => Number(a.order) - Number(b.order))
                .map((item, idx) => (
                  <li
                    key={item.id.toString()}
                    data-ocid={`playlist_detail.item.${idx + 1}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                  >
                    <Checkbox
                      data-ocid={`playlist_detail.checkbox.${idx + 1}`}
                      checked={item.isCompleted}
                      onCheckedChange={() =>
                        handleToggle(item.id, item.isCompleted)
                      }
                      className="mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium leading-snug",
                          item.isCompleted
                            ? "line-through text-muted-foreground"
                            : "text-foreground",
                        )}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {item.description}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs mt-1 text-amber-600 italic">
                          📝 {item.notes}
                        </p>
                      )}
                      {item.resourceUrl && (
                        <a
                          href={item.resourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-xs mt-1.5 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open Resource
                        </a>
                      )}
                    </div>
                    {item.isCompleted && (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500 mt-0.5" />
                    )}
                  </li>
                ))}
            </ul>
          )}
        </ScrollArea>

        <Separator />

        {showAddItem ? (
          <div data-ocid="add_item.panel" className="space-y-3 pt-2">
            <p className="font-semibold text-sm">Add Resource</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="item-title" className="text-xs">
                  Title *
                </Label>
                <Input
                  id="item-title"
                  data-ocid="add_item.title.input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. DNA Replication Video Lecture"
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="item-url" className="text-xs">
                  Resource URL
                </Label>
                <Input
                  id="item-url"
                  data-ocid="add_item.url.input"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="item-desc" className="text-xs">
                  Description
                </Label>
                <Input
                  id="item-desc"
                  data-ocid="add_item.desc.input"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="item-notes" className="text-xs">
                  Notes
                </Label>
                <Input
                  id="item-notes"
                  data-ocid="add_item.notes.input"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Study tip or reminder"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="add_item.submit_button"
                onClick={handleAddItem}
                disabled={!newTitle.trim() || createItem.isPending}
                size="sm"
              >
                {createItem.isPending ? "Adding…" : "Add Item"}
              </Button>
              <Button
                data-ocid="add_item.cancel_button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddItem(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <Button
              data-ocid="playlist_detail.add_item.button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </Button>
            <Button
              data-ocid="playlist_detail.close_button"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
