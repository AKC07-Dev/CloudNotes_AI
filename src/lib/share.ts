import { toast } from "sonner";

export function getNoteShareUrl(noteId: string): string {
  return `${window.location.origin}/note/${noteId}`;
}

/**
 * Share a note via the Web Share API when available, otherwise copy the link.
 */
export async function shareNote(noteId: string, title?: string): Promise<void> {
  const url = getNoteShareUrl(noteId);

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: title ?? "CloudNotes AI",
        url,
      });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
    }
  }

  await navigator.clipboard.writeText(url);
  toast.success("Link copied");
}
