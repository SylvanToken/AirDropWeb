import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logLogin, getClientIP } from "@/lib/login-logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent");

    await logLogin(session.user.id, ipAddress, userAgent);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login logging error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
