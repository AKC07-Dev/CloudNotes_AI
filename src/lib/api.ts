import { API_BASE_URL } from "./config";
import { authHeader } from "./auth";

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
    avatar?: string;
  }) {
    return request("/users/profile", {
      method: "POST",
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
  getProfileImageUploadUrl() {
    return request("/users/profile/avatar-upload-url", {
      method: "POST",
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

  followUser(payload: { followedId: string }) {
    return request("/follow", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  unfollowUser(payload: { followedId: string }) {
    return request("/follow", {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  },

  getFollows() {
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

  getLikes() {
    return request("/likes");
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
 id:string,
 payload:{
   comment:string
 }
){
 return request(`/comments/${id}`,{
   method:"PUT",
   body:JSON.stringify(payload),
 });
},

deleteComment(id:string){
 return request(`/comments/${id}`,{
   method:"DELETE",
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
export async function uploadFileToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error("Failed to upload file to S3.");
  }
}
