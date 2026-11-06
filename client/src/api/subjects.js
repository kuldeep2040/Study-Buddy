// Subject API calls. Each one returns the FULL updated list: [{ id, name }].
import { api } from './client.js';

export async function listSubjects() {
  const { data } = await api.get('/subjects');
  return data.subjects;
}

export async function addSubject(name) {
  const { data } = await api.post('/subjects', { name });
  return data.subjects;
}

export async function renameSubject(subjectId, name) {
  const { data } = await api.patch(`/subjects/${subjectId}`, { name });
  return data.subjects;
}

export async function deleteSubject(subjectId) {
  const { data } = await api.delete(`/subjects/${subjectId}`);
  return data.subjects;
}
