/**
 * VidCraft AI - API Response Utilities
 * Standardized API response formatting
 */

interface ApiResponseShape<T> {
  readonly code: number;
  readonly message: string;
  readonly data: T;
  readonly timestamp: number;
}

export function apiResponse<T>(
  data: T,
  message: string = 'success',
  code: number = 200
): ApiResponseShape<T> {
  return { code, message, data, timestamp: Date.now() };
}
