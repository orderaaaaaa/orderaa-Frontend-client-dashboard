import { useEffect, useState } from 'react';
import axios from 'axios';
import { resetPassword } from '@/lib/api/auth';
import { API_ERROR_CODES } from '@/lib/api/errorCodes';

const FALLBACK_MESSAGE =
  'إعادة تعيين كلمة المرور غير متاحة حاليًا. تواصل مع الدعم لتعيين كلمة مرور جديدة.';

export function useForgotPassword() {
  const [message, setMessage] = useState(FALLBACK_MESSAGE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    resetPassword()
      .catch((err: unknown) => {
        if (!isMounted) return;

        if (
          axios.isAxiosError(err) &&
          err.response?.status === 403 &&
          err.response.data?.error === API_ERROR_CODES.PASSWORD_RESET_DISABLED &&
          typeof err.response.data?.message === 'string'
        ) {
          setMessage(err.response.data.message);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { message, isLoading };
}
