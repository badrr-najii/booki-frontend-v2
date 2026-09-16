import { environment } from '../../../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export const API_ORIGIN =
  new URL(API_BASE_URL).origin;

export function resolveApiAssetUrl(
  path: string | null | undefined
): string | null {
  if (!path) {
    return null;
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }

  return new URL(path, API_ORIGIN).toString();
}