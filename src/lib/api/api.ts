import axios from "axios";

export const api = axios.create({
  baseURL: "https://production.docai.asia/api",
  // baseURL: "https://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};
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
  async (error) => {
    const originalRequest = error.config;

    // Nếu token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh thì chờ
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          "https://production.docai.asia/api/auth/refresh-token",
          {
            refreshToken,
          }
        );

        const newToken = res.data.docaiToken;

        localStorage.setItem("token", newToken);
        localStorage.setItem("docaiRefreshToken", res.data.docaiRefreshToken);
        api.defaults.headers.common["Authorization"] = "Bearer " + newToken;

        processQueue(null, newToken);

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
