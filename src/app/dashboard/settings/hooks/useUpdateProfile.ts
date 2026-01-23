import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateProfile } from '../api/Settings';
import { updateProfilePayload } from '../types/settings';
import { useAuthStore } from '@/store/authStore';
import { fetchMe } from '@/lib/api/auth';

const refreshUserData = async (maxRetries = 3): Promise<void> => {
  const token = useAuthStore.getState().token;
  if (!token) return;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const userData = await fetchMe(token);
      useAuthStore.getState().setUser(userData);
      return;
    } catch {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
};

export default function useUpdateProfile() {
  const { mutate, mutateAsync, data, error, isPending, isSuccess, isError } =
    useMutation({
      mutationFn: (payload: updateProfilePayload) => updateProfile(payload),
      onSuccess: async () => {
        toast.success('تم تحديث البيانات بنجاح');
        await refreshUserData();
      },
      onError: () => {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      },
    });

  return {
    updateProfile: mutate,
    updateProfileAsync: mutateAsync,
    data,
    error,
    isLoading: isPending,
    isSuccess,
    isError,
  };
}
