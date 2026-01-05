export function normalizeResponse(response) {
  const raw = response?.data;

  if (raw && typeof raw === "object") {
    return {
      data: raw.data ?? raw,
      meta: raw.meta,
      message: raw.message,
      success: raw.success ?? true,
    };
  }

  return {
    data: raw,
    success: true,
  };
}
