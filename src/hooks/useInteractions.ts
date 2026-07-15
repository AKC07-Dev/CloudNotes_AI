import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LikeData } from "@/lib/api";
import { toast } from "sonner";
import { notesKeys } from "@/hooks/useNotes";

export const interactionKeys = {
  likes: (noteId: string) => ["likes", noteId] as const,
  comments: (noteId: string) => ["comments", noteId] as const,
  bookmarks: ["bookmarks"] as const,
  follows: ["follows"] as const,
};

// ======================
// LIKES
// ======================

export function useLikes(noteId: string) {
  return useQuery({
    queryKey: interactionKeys.likes(noteId),
    queryFn: async () => {
      const res = await api.getLikes(noteId);
      return res.data as LikeData;
    },
    enabled: !!noteId,
  });
}

function invalidateLikeQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  noteId: string,
) {
  queryClient.invalidateQueries({ queryKey: interactionKeys.likes(noteId) });
  queryClient.invalidateQueries({ queryKey: notesKeys.detail(noteId) });
  queryClient.invalidateQueries({ queryKey: ["notes", "mine"] });
  queryClient.invalidateQueries({ queryKey: ["notes", "public"] });
}

export function useLikeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => api.likeNote({ noteId }),
    onError: () => {
      toast.error("Failed to like note.");
    },
    onSettled: (_data, _error, noteId) => {
      invalidateLikeQueries(queryClient, noteId);
    },
  });
}

export function useUnlikeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => api.unlikeNote({ noteId }),
    onError: () => {
      toast.error("Failed to unlike note.");
    },
    onSettled: (_data, _error, noteId) => {
      invalidateLikeQueries(queryClient, noteId);
    },
  });
}

// ======================
// BOOKMARKS
// ======================

export interface BookmarkData {
  noteId: string;
  collection: string;
  createdAt: string;
}

export function useBookmarks() {
  return useQuery({
    queryKey: interactionKeys.bookmarks,
    queryFn: async () => {
      const res = await api.getBookmarks();
      return (res.data ?? res) as BookmarkData[];
    },
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { noteId: string; collection?: string }) => api.addBookmark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.bookmarks });
      toast.success("Saved to bookmarks");
    },
    onError: () => {
      toast.error("Failed to add bookmark.");
    },
  });
}

export function useUpdateBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { noteId: string; collection: string }) => api.updateBookmark(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.bookmarks });
      toast.success("Bookmark updated");
    },
    onError: () => {
      toast.error("Failed to update bookmark.");
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => api.deleteBookmark({ noteId }),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.bookmarks });
      const previous = queryClient.getQueryData<BookmarkData[]>(interactionKeys.bookmarks);
      if (previous) {
        queryClient.setQueryData<BookmarkData[]>(
          interactionKeys.bookmarks,
          previous.filter((b) => b.noteId !== noteId),
        );
      }
      return { previous };
    },
    onError: (err, noteId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(interactionKeys.bookmarks, context.previous);
      }
      toast.error("Failed to remove bookmark.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.bookmarks });
    },
  });
}

// ======================
// FOLLOWS
// ======================

interface FollowUser {
  userId: string;
  fullName: string;
  username: string;
  profileImage: string;
  bio: string;
  followers: number;
  following: number;
}

export function useFollows() {
  return useQuery({
    queryKey: interactionKeys.follows,
    queryFn: async () => {
      const res = await api.getFollows();
      return res.data ?? [];
    },
  });
}
    


export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
   mutationFn: (userId: string) => api.followUser({ userId }),
    onMutate: async (userId) => {
  await queryClient.cancelQueries({ queryKey: interactionKeys.follows });

  const previous = queryClient.getQueryData<string[]>(interactionKeys.follows);

  if (previous && !previous.includes(userId)) {
    queryClient.setQueryData<string[]>(
      interactionKeys.follows,
      [...previous, userId]
    );
  }

  return { previous };
},
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(interactionKeys.follows, context.previous);
      }
      toast.error("Failed to follow user.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.follows });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
   mutationFn: (userId: string) =>
    api.unfollowUser({ userId }),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.follows });
      const previous = queryClient.getQueryData<string[]>(interactionKeys.follows);
      if (previous) {
        queryClient.setQueryData<string[]>(
          interactionKeys.follows,
          previous.filter((id) => id !== userId)
        );
      }
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(interactionKeys.follows, context.previous);
      }
      toast.error("Failed to unfollow user.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.follows });
    },
  });
}

// ======================
// COMMENTS
// ======================

export interface CommentData {
  commentId: string;
  noteId: string;
  userId: string;
  comment: string;
  createdAt: string;

  author?: {
    name?: string;
    avatar?: string;
  };
}

export function useComments(noteId: string) {
  return useQuery({
    queryKey: interactionKeys.comments(noteId),
    queryFn: async () => {
      const res = await api.getComments(noteId);
      return (res.data?.comments ?? []) as CommentData[];
    },
    enabled: !!noteId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { noteId: string; comment: string }) => api.createComment(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.comments(variables.noteId) });
      toast.success("Comment posted!");
    },
    onError: () => {
      toast.error("Failed to post comment.");
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, noteId, comment }: { id: string; noteId: string; comment: string }) =>
      api.updateComment(id, { comment }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.comments(variables.noteId) });
      toast.success("Comment updated!");
    },
    onError: () => {
      toast.error("Failed to update comment.");
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, noteId }: { id: string; noteId: string }) => api.deleteComment(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.comments(variables.noteId) });
      toast.success("Comment deleted");
    },
    onError: () => {
      toast.error("Failed to delete comment.");
    },
  });
}
