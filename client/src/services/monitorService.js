import api from "./api"

async function getMonitors() {
    const result = await api.get('/monitors/');
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

async function getMonitorStats(username) {
    const result = await api.get(`/status/${username}`);
    return result.data;
}

export { getMonitors, createMonitor, deleteMonitor, toggleMonitor, getMonitorStats };