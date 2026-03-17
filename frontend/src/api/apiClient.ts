import axios from 'axios';

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const DEFAULT_BASE_URL = isLocalhost
  ? "http://localhost:5000/api"
  : "https://auto-verse1.onrender.com/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
    // NOTE: don't force Content-Type globally; it breaks multipart uploads.
});

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Let the browser set the proper boundary for multipart/form-data requests.
        if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
            delete (config.headers as any)["Content-Type"];
            delete (config.headers as any)["content-type"];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
