// The "box" that holds login state. AuthProvider fills it; useAuth() reads it.
// (Kept in its own file so React's fast-refresh works well during development.)
import { createContext } from 'react';

export const AuthContext = createContext(null);
