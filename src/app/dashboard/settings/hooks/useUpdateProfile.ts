import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateProfile } from '../api/Settings';
import { updateProfilePayload } from '../types/settings';

export default function useUpdateProfile() {
  const { mutate, mutateAsync, data, error, isPending, isSuccess, isError } =
    useMutation({
      mutationFn: (payload: updateProfilePayload) => updateProfile(payload),
      onSuccess: () => {
        toast.success('تم تحديث البيانات بنجاح');
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
