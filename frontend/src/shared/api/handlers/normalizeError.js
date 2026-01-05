export function normalizeError(error) {
  const response = error?.response;
  const data = response?.data;

  const status = response?.status ?? null;

  const apiError = {
    message:
      data?.message ||
      error?.message ||
      "Something went wrong. Please try again.",

    code: data?.code || (status ? `HTTP_${status}` : "NETWORK_ERROR"),

    status,

    details: data?.errors || data?.details || null,

    isNetworkError: !response,
    isAuthError: status === 401 || status === 403,
    isTimeout: error?.code === "ECONNABORTED",

    originalError: error,
  };

  return apiError;
}
