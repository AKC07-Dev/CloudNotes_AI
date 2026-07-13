import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, uploadFileToS3, type NotesQueryParams } from "@/lib/api";
import { toast } from "sonner";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const notesKeys = {
  all: ["notes"] as const,
  myNotes: (params?: NotesQueryParams) => ["notes", "mine", params] as const,
  publicNotes: (params?: NotesQueryParams) => ["notes", "public", params] as const,
  detail: (id: string) => ["notes", "detail", id] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────────────────

/** GET /notes — the current user's notes with optional filters */
export function useMyNotes(params?: NotesQueryParams) {
  return useQuery({
    queryKey: notesKeys.myNotes(params),
    queryFn: async () => {
      const res = await api.getMyNotes(params);
      // API returns { success, data: { notes: [], page, limit, total } }
      return (res.data?.notes ?? res.data ?? []) as NoteData[];
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

/** GET /notes/public — public feed, with optional search/department filter */
export function usePublicNotes(params?: NotesQueryParams) {
  return useQuery({
    queryKey: notesKeys.publicNotes(params),
    queryFn: async () => {
      const res = await api.getPublicNotes(params);
      return (res.data?.notes ?? res.data ?? []) as NoteData[];
    },
    staleTime: 1000 * 60 * 1,
    retry: 1,
  });
}

/** GET /notes/{id} — single note detail */
export function useNote(id: string) {
  return useQuery({
    queryKey: notesKeys.detail(id),
    queryFn: async () => {
      const res = await api.getNote(id);
      return (res.data ?? res) as NoteData;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

/** POST /notes — create a note (metadata only, no PDF yet) */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) => api.createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create note.");
    },
  });
}

/** PUT /notes/{id} — update note metadata */
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateNotePayload) =>
      api.updateNote(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      queryClient.invalidateQueries({ queryKey: notesKeys.detail(id) });
      toast.success("Note updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update note.");
    },
  });
}

/** DELETE /notes/{id} */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      toast.success("Note deleted.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete note.");
    },
  });
}

/**
 * Full PDF upload flow:
 *   1. POST /notes  → get noteId
 *   2. POST /notes/{noteId}/upload-url → get presigned S3 URL
 *   3. PUT {presignedUrl} with PDF file
 */
export function useUploadNotePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ metadata, file, onProgress }: UploadNotePDFPayload) => {
      // Step 1: create the note record
      const createRes = await api.createNote(metadata);
      const noteId: string = createRes.data?.noteId ?? createRes.data?.id;

      if (!noteId) {
        throw new Error("Server did not return a noteId.");
      }

      // Step 2: request a presigned upload URL
      const urlRes = await api.getUploadUrl(noteId);
      const { uploadUrl } = urlRes.data as {
        uploadUrl: string;
        pdfKey: string;
        expiresIn: number;
      };

      // Step 3: upload directly to S3 (no auth header)
      onProgress?.(50);
      await uploadFileToS3(uploadUrl, file);
      onProgress?.(100);

      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Upload failed.");
    },
  });
}

/**
 * GET /notes/{id}/download — fetches a presigned download URL and opens it.
 * Returns as a mutation so it can be triggered on button click.
 */
export function useDownloadNote() {
  return useMutation({
    mutationFn: async (noteId: string) => {
      const res = await api.getDownloadUrl(noteId);
      const { downloadUrl } = res.data as { downloadUrl: string; expiresIn: number };
      window.open(downloadUrl, "_blank");
      return downloadUrl;
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to get download link.");
    },
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NoteData {
  noteId: string;
  title: string;
  description: string;
  subject: string;
  department: string;
  semester: number | string;
  tags: string[];
  visibility: string;
  pdfKey?: string;
  views?: number;
  downloads?: number;
  likes?: number;
  comments?: number;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    userId?: string;
    name?: string;
    fullName?: string;
    avatar?: string;
    department?: string;
    verified?: boolean;
  };
}

export interface CreateNotePayload {
  title: string;
  description: string;
  subject: string;
  department: string;
  semester: number;
  tags: string[];
  visibility: string;
}

export interface UpdateNotePayload {
  title?: string;
  description?: string;
  subject?: string;
  department?: string;
  semester?: number;
  tags?: string[];
  visibility?: string;
}

export interface UploadNotePDFPayload {
  metadata: CreateNotePayload;
  file: File;
  onProgress?: (pct: number) => void;
}
