import axios from "axios";

export const api = axios.create({
  baseURL: "https://production.docai.asia/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log API requests in production for debugging
  console.log(
    `🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
      config.url
    }`
  );

  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    console.error(
      `❌ API Error: ${
        error.response?.status || "Network Error"
      } ${error.config?.method?.toUpperCase()} ${error.config?.url}`
    );
    console.error("Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
