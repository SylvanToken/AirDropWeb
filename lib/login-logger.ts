import { prisma } from "./prisma";
import { NextRequest } from "next/server";

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const cfConnecting = request.headers.get("cf-connecting-ip");
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }
  
  if (real) {
    return real;
  }
  
  if (cfConnecting) {
    return cfConnecting;
  }
  
  // Fallback to unknown if no IP found
  return "unknown";
}

/**
 * Log successful login
 */
export async function logLogin(
  userId: string,
  ipAddress: string,
  userAgent: string | null
): Promise<void> {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success: true,
      },
    });
  } catch (error) {
    // Don't throw error if logging fails - it shouldn't break login
    console.error("Failed to log login:", error);
  }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
  userId: string,
  ipAddress: string,
  userAgent: string | null
): Promise<void> {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success: false,
      },
    });
  } catch (error) {
    console.error("Failed to log failed login:", error);
  }
}
