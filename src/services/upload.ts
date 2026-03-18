import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '@/lib/api/upload';

export const useUploadFileMutation = () => {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
  });
};
