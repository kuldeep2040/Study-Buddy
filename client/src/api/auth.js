// Auth API calls. Each returns plain data (the user object), not the axios response.
import { api } from './client.js';

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data.user;
}

export async function signup({ name, email, password, role }) {
  const { data } = await api.post('/auth/signup', { name, email, password, role });
  return data.user;
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.user;
}

export async function logout() {
  await api.post('/auth/logout');
}
