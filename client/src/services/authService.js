import api from "./api";

export async function login(email, password) {
    const result = await api.post('/auth/login', { email, password });
    return result.data;
}   

export async function register(name, username, email, password) {
    const result = await api.post('/auth/register', { name, username, email, password });
    return result.data;
}