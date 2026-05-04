import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authApi = {
    login: (email, password) => api.post("/auth/login", { email, password }),
    register: (data) => api.post("/auth/register", data),
    oauthSync: (data) => api.post("/auth/oauth-sync", data),
    getMe: () => api.get("/auth/me"),
    setUsername: (username) => api.put("/auth/set-username", { username }),
    checkUsername: (username) => api.get(`/auth/check-username/${username}`),
    updateProfile: (data) => api.put("/auth/update-profile", data),
    updateAvatar: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return api.put("/auth/update-avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    updatePassword: (data) => api.put("/auth/update-password", data),
    deleteAccount: () => api.delete("/auth/delete-account"),
};

// ================= UPLOAD API =================
export const uploadApi = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return api.post("/upload/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    uploadVideo: (file) => {
        const formData = new FormData();
        formData.append("video", file);
        return api.post("/upload/video", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export const blocksApi = {
    getUserBlocks: (username) => api.get(`/blocks/user/${username}`),
    getMyBlocks: () => api.get("/blocks/me"),
    getBlockById: (id) => api.get(`/blocks/${id}`),
    createBlock: (data) => api.post("/blocks", data),
    updateBlock: (id, data) => {
        console.log(`🔄 Updating block ${id} with:`, data);
        return api.put(`/blocks/${id}`, data);
    },
    updateBlockSize: (id, width) => {
        console.log(`📐 Updating block ${id} size to:`, width);
        return api.put(`/blocks/${id}/size`, { width });
    },
    updatePositions: (blocksData) => {
        // Ensure correct format: { blocks: [...] }
        const payload = blocksData.blocks ? blocksData : { blocks: blocksData };
        console.log("📍 Updating positions with payload:", JSON.stringify(payload, null, 2));
        return api.put("/blocks/positions", payload);
    },
    toggleBlockActive: (id) => api.put(`/blocks/toggle/${id}`),
    duplicateBlock: (id) => api.post(`/blocks/duplicate/${id}`),
    deleteBlock: (id) => {
        console.log(`🗑️ Deleting block ${id}`);
        return api.delete(`/blocks/${id}`);
    },
    trackBlockClick: (id) => api.post(`/blocks/click/${id}`),
};


// ================= LINKS API (Microlink Preview) =================
export const linksApi = {
    createLink: (url) => api.post("/links", { url }),
};

// ================= SEO API =================
export const seoApi = {
    updateSEO: (data) => api.put("/seo", data),
};

// ================= ANALYTICS API =================
export const analyticsApi = {
    getOwnerAnalytics: () => api.get("/analytics/owner"),
    getPublicAnalytics: (username) => api.get(`/analytics/public/${username}`),
};

// ================= SOCIALS API =================
export const socialsApi = {
    updateSocials: (data) => api.put("/auth/social", data),
    getSocials: () => api.get("/auth"),
};

export const getUsername = {
    getUsername: (userId) => api.get(`/auth/username/${userId}`),
    getMyUsername: () => api.get("/auth/get-my-username"),
};
export default api;