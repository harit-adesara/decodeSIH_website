import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api/v1`
  : "/api/v1";

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120000, // 2 minutes (120s) for AI chat & proactive analysis
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bharat_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardized ApiResponse handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Unwraps standardized ApiResponse envelope { statusCode, data, message, success }
    return response.data;
  },
  (error) => {
    const customError = {
      statusCode: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred",
      errors: error.response?.data?.errors || [],
    };

    // Auto logout on 401 if token expired
    if (error.response?.status === 401 && localStorage.getItem("bharat_token")) {
      localStorage.removeItem("bharat_token");
      localStorage.removeItem("bharat_user");
    }

    return Promise.reject(customError);
  }
);

export default axiosInstance;
