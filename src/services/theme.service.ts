import api from './api';
import type { ThemePreference } from '../contexts/ThemeContext';

/**
 * Persists the user's theme preference to the backend via PUT /users/me.
 * Throws on non-2xx so the caller can handle the error.
 */
export async function persistThemePreference(preference: ThemePreference): Promise<void> {
  await api.put('/users/me', { theme_preference: preference });
}
