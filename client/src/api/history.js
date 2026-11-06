import { api } from './client.js';

/** The student's own history. → { days: [{ date, totalMinutes, subjects, sessions }], range, nextBefore } */
export async function getMyHistory({ days, before, signal } = {}) {
  const { data } = await api.get('/history', { params: { days, before }, signal });
  return data;
}
