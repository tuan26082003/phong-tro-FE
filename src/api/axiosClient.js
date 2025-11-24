import axios from "axios";

const baseURL = "http://localhost:8080";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const axiosClient = axios.create({
  baseURL,
});

// ========== REQUEST INTERCEPTOR ==========
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ========== RESPONSE INTERCEPTOR ==========
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Nếu là 401 → accessToken hết hạn
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // 1) Ngăn lặp vô hạn
      originalRequest._retry = true;

      // 2) Nếu đang refresh → đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      // 3) Refresh token
      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        // Lưu lại token mới
        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        axiosClient.defaults.headers.Authorization = "Bearer " + newAccessToken;

        processQueue(null, newAccessToken);

        // Retry request ban đầu
        originalRequest.headers.Authorization = "Bearer " + newAccessToken;

        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Refresh thất bại → logout
        localStorage.clear();
        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
