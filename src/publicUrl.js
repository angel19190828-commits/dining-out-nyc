export const publicUrl = path => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
