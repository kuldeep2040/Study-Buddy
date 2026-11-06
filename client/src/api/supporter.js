// Supporter API calls (student data is read-only).
import { api } from './client.js';

/** → { students: [...], notices: [...], serverTime } */
export async function getSupporterDashboard({ signal } = {}) {
  const { data } = await api.get('/supporter/students', { signal });
  return data;
}

/** → { student: { studentId, linkId, name, date, todayTotalMinutes, activeSession, telegramConnected }, serverTime } */
export async function getStudentOverview(studentId, { signal } = {}) {
  const { data } = await api.get(`/supporter/students/${studentId}/overview`, { signal });
  return data;
}

/** Same shape as the student's own history. */
export async function getStudentHistory(studentId, { days, before, signal } = {}) {
  const { data } = await api.get(`/supporter/students/${studentId}/history`, { params: { days, before }, signal });
  return data;
}

/** → { deepLink: 'https://t.me/<bot>?start=…', expiresAt } */
export async function connectTelegram(linkId) {
  const { data } = await api.post(`/supporter/links/${linkId}/telegram`);
  return data;
}

export async function disconnectTelegram(linkId) {
  const { data } = await api.delete(`/supporter/links/${linkId}/telegram`);
  return data;
}
