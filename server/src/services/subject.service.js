// A student's subjects live inside their Settings document (settings.subjects = [{ _id, name }]).
import { AppError } from '../utils/AppError.js';
import { getOrCreateSettings } from './settings.service.js';

const MAX_SUBJECTS = 20;

// What we send to the browser: { id, name }
const toSubjectList = (settings) => settings.subjects.map((s) => ({ id: s._id.toString(), name: s.name }));

// "physics" and "Physics " count as the same subject.
const sameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

function findSubjectOr404(settings, subjectId) {
  const subject = settings.subjects.id(subjectId); // Mongoose helper: find sub-document by _id
  if (!subject) throw new AppError(404, 'Subject not found');
  return subject;
}

export async function listSubjects(userId) {
  return toSubjectList(await getOrCreateSettings(userId));
}

/** Finds one of the student's subjects by name (case-insensitive). Returns the stored name or null. */
export async function findSubjectName(userId, name) {
  const settings = await getOrCreateSettings(userId);
  return settings.subjects.find((s) => sameName(s.name, name))?.name ?? null;
}

export async function addSubject(userId, name) {
  const settings = await getOrCreateSettings(userId);

  if (settings.subjects.some((s) => sameName(s.name, name))) {
    throw new AppError(409, `You already have a subject called "${name}"`);
  }
  if (settings.subjects.length >= MAX_SUBJECTS) {
    throw new AppError(400, `You can have at most ${MAX_SUBJECTS} subjects`);
  }

  settings.subjects.push({ name });
  await settings.save();
  return toSubjectList(settings);
}

export async function renameSubject(userId, subjectId, name) {
  const settings = await getOrCreateSettings(userId);
  const subject = findSubjectOr404(settings, subjectId);

  const clash = settings.subjects.some((s) => !s._id.equals(subject._id) && sameName(s.name, name));
  if (clash) {
    throw new AppError(409, `You already have a subject called "${name}"`);
  }

  // Past sessions keep the old name (they store a copy), which is what we want for history.
  subject.name = name;
  await settings.save();
  return toSubjectList(settings);
}

export async function deleteSubject(userId, subjectId) {
  const settings = await getOrCreateSettings(userId);
  const subject = findSubjectOr404(settings, subjectId);

  if (settings.subjects.length === 1) {
    throw new AppError(400, 'Keep at least one subject so you can start studying');
  }

  subject.deleteOne(); // removes it from the array
  await settings.save();
  return toSubjectList(settings);
}
