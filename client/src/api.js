import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // if error is a 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.warn("Token expired or invalid. Redirecting to login...");

            // Clear local storage to remove the bad token
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Force redirect to login page
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;
