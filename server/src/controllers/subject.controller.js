// Every response returns the full, updated list so the UI can simply replace what it shows.
import * as subjectService from '../services/subject.service.js';

export async function list(req, res) {
  res.json({ subjects: await subjectService.listSubjects(req.user.id) });
}

export async function add(req, res) {
  const subjects = await subjectService.addSubject(req.user.id, req.valid.body.name);
  res.status(201).json({ subjects });
}

export async function rename(req, res) {
  const subjects = await subjectService.renameSubject(req.user.id, req.valid.params.subjectId, req.valid.body.name);
  res.json({ subjects });
}

export async function remove(req, res) {
  const subjects = await subjectService.deleteSubject(req.user.id, req.valid.params.subjectId);
  res.json({ subjects });
}
