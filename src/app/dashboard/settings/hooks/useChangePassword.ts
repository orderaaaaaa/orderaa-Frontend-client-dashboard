import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/Settings';
import { changePasswordPayload } from '../types/settings';
import { toast } from 'react-toastify';

export default function useChangePassword() {
  const { mutate, mutateAsync, data, error, isPending, isSuccess, isError } =
    useMutation({
      mutationFn: (payload: changePasswordPayload) => changePassword(payload),
      onSuccess: () => {
        toast.success('تم تغيير الباسورد بنجاح');
      },
      onError: () => {
        toast.error('حدث خطأ اثناء تغيير الباسورد ');
      },
    });

  return {
    changePassword: mutate,
    changePasswordAsync: mutateAsync,
    data,
    error,
    isLoading: isPending,
    isSuccess,
    isError,
  };
}
