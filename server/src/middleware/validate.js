// validate({ body, params, query }) → middleware that checks the request with zod schemas.
// On success, the cleaned data is put on req.valid.body / req.valid.params / req.valid.query
// (unknown fields are stripped, strings trimmed, etc.). Controllers read ONLY from req.valid.
// On failure → 400 with a friendly message + a list of field errors.
import { AppError } from '../utils/AppError.js';

const PARTS = ['body', 'params', 'query'];

export function validate(schemas) {
  return (req, res, next) => {
    req.valid = {};

    for (const part of PARTS) {
      if (!schemas[part]) continue;

      // In Express 5, req.body is undefined when no JSON was sent — treat that as {}.
      const result = schemas[part].safeParse(req[part] ?? {});

      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.') || part,
          message: issue.message,
        }));
        // Top-level message = the first problem, so the UI can show something simple.
        throw new AppError(400, details[0].message, details);
      }

      req.valid[part] = result.data;
    }

    next();
  };
}
