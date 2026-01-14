import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if the error is 401 AND the request was NOT to the login endpoint
        const isLoginRequest = error.config.url.includes("/login");

        if (
            error.response &&
            error.response.status === 401 &&
            !isLoginRequest
        ) {
            console.warn("Session expired. Redirecting...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
