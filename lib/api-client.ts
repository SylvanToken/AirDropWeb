// Client-side API error handling utilities

export interface ApiErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}

export class ApiError extends Error {
  statusCode: number
  error: string
  details?: any

  constructor(response: ApiErrorResponse) {
    super(response.message)
    this.name = "ApiError"
    this.statusCode = response.statusCode
    this.error = response.error
    this.details = response.details
  }
}

/**
 * Handles API response and throws ApiError if response is not ok
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse

    try {
      errorData = await response.json()
    } catch {
      // If response is not JSON, create a generic error
      errorData = {
        error: response.statusText || "Unknown Error",
        message: `Request failed with status ${response.status}`,
        statusCode: response.status,
      }
    }

    throw new ApiError(errorData)
  }

  return response.json()
}

/**
 * Makes a GET request to the API
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  return handleApiResponse<T>(response)
}

/**
 * Makes a POST request to the API
 */
export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  })

  return handleApiResponse<T>(response)
}

/**
 * Makes a PUT request to the API
 */
export async function apiPut<T>(url: string, data: any): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return handleApiResponse<T>(response)
}

/**
 * Makes a DELETE request to the API
 */
export async function apiDelete<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })

  return handleApiResponse<T>(response)
}

/**
 * Gets user-friendly error message from ApiError
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}
