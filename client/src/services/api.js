import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})



async function getMonitors() {
    const result = await api.get('/monitors');
    return result.data;
}

async function createMonitor(title, url) {
    const result = await api.post('/monitors', { title, url });
    return result.data;
}

async function deleteMonitor(id) {
    const result = await api.delete(`/monitors/${id}`);
    return result.data;
}

async function toggleMonitor(id) {
    const result = await api.patch(`/monitors/${id}/toggle`);
    return result.data;
}

export default api;