import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, uploadFileToS3 } from "@/lib/api";
import { toast } from "sonner";

export const PROFILE_QUERY_KEY = ["profile"] as const;

/** Fetch the logged-in user's profile from GET /users/profile */
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const res = await api.getProfile();
      return res.data as ProfileData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

/** Update the logged-in user's profile via POST /users/profile */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => api.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profile updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile.");
    },
  });
}

/**
 * Upload a profile image:
 *   1. POST /users/profile/avatar-upload-url → presigned S3 URL + object URL
 *   2. PUT {presignedUrl} with image file
 *   3. POST /users/profile with avatar = objectUrl
 *
 * NOTE: Step 1 requires backend support for POST /users/profile/avatar-upload-url.
 * If that endpoint doesn't exist yet, the mutation will throw and show a toast.
 */
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Request a presigned upload URL
      const urlRes = await api.getProfileImageUploadUrl(file.type);

      const { uploadUrl, imageUrl } = urlRes.data as {
        uploadUrl: string;
        imageUrl: string;
      };

      // Step 2: Upload the image directly to S3
      await uploadFileToS3(uploadUrl, file);

      // Step 3: Save the image URL in the user's profile
      await api.updateProfile({
        profileImage: imageUrl,
      });

      return imageUrl;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY,
      });

      toast.success("Profile picture updated!");
    },

    onError: (err: Error) => {
      console.error("Profile image upload failed:", err);

      toast.error(err.message || "Failed to upload profile picture.");
    },
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileData {
  userId: string;
  fullName: string;
  email?: string;
  bio?: string;
  department?: string;
  semester?: number;
  username?: string;
  profileImage?: string;
  avatar?: string;
  followers?: number;
  following?: number;
  uploads?: number;
  contribution?: number;
  verified?: boolean;
  createdAt?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  department?: string;
  semester?: number;
  profileImage?: string;
}
