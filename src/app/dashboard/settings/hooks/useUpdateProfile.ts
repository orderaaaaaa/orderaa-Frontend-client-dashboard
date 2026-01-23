import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateProfile } from '../api/Settings';
import { updateProfilePayload } from '../types/settings';
import { useAuthStore } from '@/store/authStore';
import { fetchMe } from '@/lib/api/auth';

export default function useUpdateProfile() {
  const { mutate, mutateAsync, data, error, isPending, isSuccess, isError } =
    useMutation({
      mutationFn: (payload: updateProfilePayload) => updateProfile(payload),
      onSuccess: async () => {
        toast.success('تم تحديث البيانات بنجاح');
        const token = useAuthStore.getState().token;
        if (token) {
          const userData = await fetchMe(token);
          useAuthStore.getState().setUser(userData);
        }
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
