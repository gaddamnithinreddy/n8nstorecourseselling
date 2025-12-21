export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status: number, code?: string): Response {
  return Response.json({ success: false, error: message, code }, { status })
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_ERROR: 500,
} as const
