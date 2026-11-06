// Door guard #3 (supporter routes only): "Is this supporter ACTIVELY linked to this student?"
//
// Checked against the DATABASE on EVERY request — never trusted from the JWT, the URL or the
// browser. So the moment the student revokes the link, the very next request is refused.
//
// Use after requireAuth + requireRole('supporter') + validate({ params: studentParamsSchema }).
import { SupportLink } from '../models/SupportLink.js';
import { AppError } from '../utils/AppError.js';

export async function requireLinkedStudent(req, res, next) {
  const { studentId } = req.valid.params;

  const link = await SupportLink.findOne({
    studentId,
    supporterId: req.user.id,
    status: 'active',
  })
    .select('_id')
    .lean();

  if (!link) {
    // 404, not 403: an unlinked supporter shouldn't even learn whether this student exists.
    throw new AppError(404, 'Student not found');
  }

  req.linkedStudentId = studentId;
  req.supportLinkId = link._id.toString(); // lets the supporter remove this link from the page
  next();
}
