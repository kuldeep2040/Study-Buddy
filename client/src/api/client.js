// One shared axios instance for every API call in the app.
// Components never import axios directly — they use the functions in src/api/*.js.
import axios from 'axios';

export const api = axios.create({
  // "/api" → same site as the app. Vite (dev) or Vercel (prod) forwards it to the Express server.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send our httpOnly login cookie with every request
  timeout: 60000, // Render's free tier can take ~30–50s to wake up, so be patient
});

// Turns any axios error into a plain, human-readable message for the UI.
export function getErrorMessage(error) {
  if (error?.response?.data?.error?.message) return error.response.data.error.message;
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (error?.request && !error?.response) return "Can't reach the server. Check your internet connection.";
  return 'Something went wrong. Please try again.';
}

/**
 * For forms: splits a server error into
 *   - fieldErrors: { fieldName: 'message' } to show under each input
 *   - formError:   one message for the top of the form, ONLY if no field-specific errors exist
 *                  (so the same message isn't shown twice)
 */
export function getFormErrors(error) {
  const fieldErrors = getFieldErrors(error);
  const formError = Object.keys(fieldErrors).length > 0 ? '' : getErrorMessage(error);
  return { fieldErrors, formError };
}

// Server validation errors → { fieldName: 'message' } so forms can show them under each input.
export function getFieldErrors(error) {
  const details = error?.response?.data?.error?.details;
  if (!Array.isArray(details)) return {};
  return Object.fromEntries(details.map((detail) => [detail.field, detail.message]).reverse());
}
