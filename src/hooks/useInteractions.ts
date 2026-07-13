import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const interactionKeys = {
  likes: ["likes"] as const,
  comments: (noteId: string) => ["comments", noteId] as const,
  bookmarks: ["bookmarks"] as const,
  follows: ["follows"] as const,
};

// ======================
// LIKES
// ======================

export function useLikes() {
  return useQuery({
    queryKey: interactionKeys.likes,
    queryFn: async () => {
      const res = await api.getLikes();
      return (res.data ?? res) as string[]; // Assuming array of noteIds
    },
  });
}

export function useLikeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => api.likeNote({ noteId }),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.likes });
      const previousLikes = queryClient.getQueryData<string[]>(interactionKeys.likes);

      if (previousLikes && !previousLikes.includes(noteId)) {
        queryClient.setQueryData<string[]>(interactionKeys.likes, [...previousLikes, noteId]);
      }
      return { previousLikes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(interactionKeys.likes, context.previousLikes);
      }
      toast.error("Failed to like note.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.likes });
    },
  });
}

export function useUnlikeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => api.unlikeNote({ noteId }),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.likes });
      const previousLikes = queryClient.getQueryData<string[]>(interactionKeys.likes);

      if (previousLikes) {
        queryClient.setQueryData<string[]>(
          interactionKeys.likes,
          previousLikes.filter((id) => id !== noteId),
        );
      }
      return { previousLikes };
    },
    onError: (err, noteId, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(interactionKeys.likes, context.previousLikes);
      }
      toast.error("Failed to unlike note.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.likes });
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

export function useFollows() {
  return useQuery({
    queryKey: interactionKeys.follows,
    queryFn: async () => {
      const res = await api.getFollows();
      return (res.data ?? res) as string[]; // Array of followed userIds
    },
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followedId: string) => api.followUser({ followedId }),
    onMutate: async (followedId) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.follows });
      const previous = queryClient.getQueryData<string[]>(interactionKeys.follows);
      if (previous && !previous.includes(followedId)) {
        queryClient.setQueryData<string[]>(interactionKeys.follows, [...previous, followedId]);
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
    mutationFn: (followedId: string) => api.unfollowUser({ followedId }),
    onMutate: async (followedId) => {
      await queryClient.cancelQueries({ queryKey: interactionKeys.follows });
      const previous = queryClient.getQueryData<string[]>(interactionKeys.follows);
      if (previous) {
        queryClient.setQueryData<string[]>(
          interactionKeys.follows,
          previous.filter((id) => id !== followedId),
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
