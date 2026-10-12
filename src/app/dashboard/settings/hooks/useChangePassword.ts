import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { changePassword } from '../api/Settings';
import { changePasswordPayload } from '../types/settings';
import { toast } from 'react-toastify';
import { signOut } from '@/lib/api/refresh';

export default function useChangePassword() {
  const router = useRouter();

  const { mutate, mutateAsync, data, error, isPending, isSuccess, isError } =
    useMutation({
      mutationFn: (payload: changePasswordPayload) => changePassword(payload),
      onSuccess: async () => {
        await signOut();
        toast.success('تم تغيير كلمة المرور بنجاح، يرجى تسجيل الدخول مرة أخرى');
        router.push('/signin');
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
