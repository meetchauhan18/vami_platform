// local imports
import { axiosInstance } from "./client/axiosInstance.js";
import { setupInterceptors } from "./client/interceptors.js";

setupInterceptors(axiosInstance);

export default axiosInstance;