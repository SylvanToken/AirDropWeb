import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { ZodError } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API Error Response Interface
export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: any
}

// Standard API error response creator
export function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
  details?: any
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      message,
      statusCode,
      ...(details && { details }),
    },
    { status: statusCode }
  )
}

// Handle Prisma errors
export function handlePrismaError(error: unknown): NextResponse<ApiError> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        // Unique constraint violation
        const target = (error.meta?.target as string[]) || []
        const field = target[0] || "field"
        return createErrorResponse(
          "Conflict",
          `This ${field} is already in use`,
          409
        )
      }
      case "P2025": {
        // Record not found
        return createErrorResponse(
          "Not Found",
          "The requested resource was not found",
          404
        )
      }
      case "P2003": {
        // Foreign key constraint violation
        return createErrorResponse(
          "Bad Request",
          "Invalid reference to related resource",
          400
        )
      }
      case "P2014": {
        // Required relation violation
        return createErrorResponse(
          "Bad Request",
          "Required relation is missing",
          400
        )
      }
      default: {
        console.error("Prisma error:", error)
        return createErrorResponse(
          "Database Error",
          "A database error occurred",
          500
        )
      }
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse(
      "Validation Error",
      "Invalid data provided to database",
      400
    )
  }

  // Unknown Prisma error
  console.error("Unknown Prisma error:", error)
  return createErrorResponse(
    "Internal Server Error",
    "An unexpected database error occurred",
    500
  )
}

// Handle Zod validation errors
export function handleZodError(error: ZodError): NextResponse<ApiError> {
  const firstError = error.errors[0]
  return createErrorResponse(
    "Validation Error",
    firstError.message,
    400,
    { errors: error.errors }
  )
}

// Generic error handler for API routes
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Zod validation error
  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  // Prisma errors
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    return handlePrismaError(error)
  }

  // Generic error with message
  if (error instanceof Error) {
    console.error("API Error:", error.message, error.stack)
    return createErrorResponse(
      "Internal Server Error",
      error.message || "An unexpected error occurred",
      500
    )
  }

  // Unknown error
  console.error("Unknown error:", error)
  return createErrorResponse(
    "Internal Server Error",
    "An unexpected error occurred",
    500
  )
}

// Validate request body with Zod schema
export async function validateRequest<T>(
  request: Request,
  schema: { safeParse: (data: any) => { success: boolean; data?: T; error?: any } }
): Promise<{ success: true; data: T } | { success: false; error: NextResponse<ApiError> }> {
  try {
    const body = await request.json()
    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return {
        success: false,
        error: handleZodError(validationResult.error),
      }
    }

    return {
      success: true,
      data: validationResult.data as T,
    }
  } catch (error) {
    return {
      success: false,
      error: createErrorResponse(
        "Bad Request",
        "Invalid JSON in request body",
        400
      ),
    }
  }
}
