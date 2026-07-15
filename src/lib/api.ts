import { API_BASE_URL } from "./config";
import { authHeader, getToken } from "./auth";

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader() as Record<string, string>),
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export interface NotesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  department?: string;
  semester?: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  username: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LikeData {
  likes: number;
  liked: boolean;
}

export interface LikeResponse extends LikeData {
  noteId: string;
}

export const api = {
  // ======================
  // AUTH
  // ======================

  signup(payload: { fullName: string; username: string; email: string; password: string }) {
    return request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload: { email: string; password: string }) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // ======================
  // USERS / PROFILE
  // ======================

  getProfile() {
    return request("/users/profile");
  },

  updateProfile(payload: {
    fullName?: string;
    bio?: string;
    department?: string;
    semester?: number;
    profileImage?: string;
  }) {
    return request("/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Request a presigned S3 upload URL for a profile image.
   * Backend endpoint: POST /users/profile/avatar-upload-url
   *
   * NOTE: If this endpoint does not yet exist on the backend,
   * it will throw an error. The UI handles this gracefully.
   */
  getProfileImageUploadUrl(fileType: string) {
    return request("/users/profile/avatar-upload-url", {
      method: "POST",
      body: JSON.stringify({
        fileType,
      }),
    });
  },

  // ======================
  // NOTES
  // ======================

  createNote(payload: {
    title: string;
    description: string;
    subject: string;
    department: string;
    semester: number;
    tags: string[];
    visibility: string;
  }) {
    return request("/notes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getMyNotes(params?: NotesQueryParams) {
    const qs = params ? buildQueryString(params) : "";
    return request(`/notes${qs}`);
  },

  getPublicNotes(params?: NotesQueryParams) {
    const qs = params ? buildQueryString(params) : "";
    return request(`/notes/public${qs}`);
  },

  getNote(id: string) {
    return request(`/notes/${id}`);
  },

  updateNote(
    id: string,
    payload: {
      title?: string;
      description?: string;
      subject?: string;
      department?: string;
      semester?: number;
      tags?: string[];
      visibility?: string;
    },
  ) {
    return request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteNote(id: string) {
    return request(`/notes/${id}`, {
      method: "DELETE",
    });
  },

  getUploadUrl(id: string) {
    return request(`/notes/${id}/upload-url`, {
      method: "POST",
    });
  },

  getDownloadUrl(id: string) {
    return request(`/notes/${id}/download`);
  },




  // ======================
  // FOLLOW
  // ======================

  followUser(payload: { userId: string }) {
  return request("/follow", {
    method: "POST",
    body: JSON.stringify(payload),
  });
},

unfollowUser(payload: { userId: string }) {
  return request("/follow", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
},
  getFollows() {
    return request("/follow");
  },

  getFollowing() {
  return request("/follow");
},

  // ======================
  // LIKES
  // ======================

  likeNote(payload: { noteId: string }) {
    return request("/like", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  unlikeNote(payload: { noteId: string }) {
    return request("/like", {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  },

  getLikes(noteId: string) {
    return request(`/likes?noteId=${encodeURIComponent(noteId)}`);
  },

  // ======================
  // COMMENTS
  // ======================

  getComments(noteId: string) {
    return request(`/comments?noteId=${noteId}`);
  },

  createComment(payload: { noteId: string; comment: string }) {
    return request(`/comment`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateComment(
    id: string,
    payload: {
      comment: string;
    },
  ) {
    return request(`/comments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteComment(id: string) {
    return request(`/comments/${id}`, {
      method: "DELETE",
    });
  },

  // ======================
  // BOOKMARKS
  // ======================

  getBookmarks() {
    return request("/bookmarks");
  },

  addBookmark(payload: { noteId: string; collection?: string }) {
    return request("/bookmark", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBookmark(payload: { noteId: string; collection: string }) {
    return request("/bookmark", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteBookmark(payload: { noteId: string }) {
    return request("/bookmark", {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  },

  // ======================
  // CHAT
  // ======================

  getChats() {
    const token = getToken();
    return request(`/chats?token=${token}`);
  },

  getMessages(receiverId: string) {
    const token = getToken();
    return request(`/messages?receiverId=${receiverId}&token=${token}`);
  },

  deleteMessage(conversationId: string, createdAt: string) {
    const token = getToken();
    return request(`/messages?token=${token}`, {
      method: "DELETE",
      body: JSON.stringify({ conversationId, createdAt }),
    });
  },
};

function buildQueryString(params: { [key: string]: unknown }): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (filtered.length === 0) return "";
  return "?" + filtered.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

/**
 * Upload a file directly to S3 using a presigned PUT URL.
 * No auth header is sent — S3 presigned URLs don't accept it.
 * Uses the actual file's MIME type so this works for PDFs and images alike.
 */
/**
 * Upload file directly to S3 using a presigned URL.
 */
export async function uploadFileToS3(
  presignedUrl: string,
  file: File
): Promise<void> {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `S3 upload failed (${response.status}) ${text}`
    );
  }
}