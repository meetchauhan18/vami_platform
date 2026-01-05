// local imports
import { normalizeResponse } from "../handlers/normalizeResponse.js";
import { handle401 } from "../handlers/handle401.js";
import { normalizeError } from "../handlers/normalizeError.js";
import { generateRequestId } from "../../utils/utils.js";
import { HEADERS } from "../../constants/index.js";

export function setupInterceptors(apiClient) {
  // REQUEST INTERCEPTOR - Add request ID for tracing
  apiClient.interceptors.request.use(
    (config) => {
      config.headers[HEADERS.REQUEST_ID] = generateRequestId();
      return config;
    },
    (error) => Promise.reject(error)
  );

  // RESPONSE INTERCEPTOR - Normalize responses and handle auth
  apiClient.interceptors.response.use(
    (response) => normalizeResponse(response),

    async (error) => {
      // Auth recovery first
      if (error?.response?.status === 401) {
        try {
          return await handle401(error, apiClient);
        } catch (authError) {
          return Promise.reject(normalizeError(authError));
        }
      }

      // All other errors → normalized
      return Promise.reject(normalizeError(error));
    }
  );
}
