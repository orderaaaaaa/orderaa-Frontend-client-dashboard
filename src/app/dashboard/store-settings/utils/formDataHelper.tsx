export function convertToFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === 'logo') {
      if (value instanceof File) {
        formData.append('logo', value);
      } else if (value && value.length > 0 && value[0] instanceof File) {
        formData.append('logo', value[0]);
      }
      return;
    }

    if (key === 'cancellationReasons' && Array.isArray(value)) {
      value.forEach((item) => {
        formData.append('cancellationReasons[]', item);
      });
      return;
    }

    if (key === 'utmSources' && Array.isArray(value)) {
      value.forEach((item) => {
        formData.append('utmSources[]', item);
      });
      return;
    }

    if (typeof value === 'boolean') {
      formData.append(key, value.toString());
      return;
    }

    if (typeof value === 'number') {
      formData.append(key, value.toString());
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}
