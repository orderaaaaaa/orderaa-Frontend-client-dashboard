export function convertToFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === 'logo' && value instanceof FileList && value.length > 0) {
      formData.append('logo', value[0]);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        formData.append(`${key}[]`, item);
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
