import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { recordActivity } from "@/lib/auditLogger";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const backupToken = cookieStore.get("df_superroot_backup")?.value;
    const currentSession = await getSession();

    const impCookie = cookieStore.get("df_impersonator")?.value || "";
    const isSuperRoot = impCookie.includes("SUPER_ROOT_ADMIN");
    const redirectUrl = isSuperRoot ? "/qscwdv" : "/admin";

    const response = NextResponse.json({
      success: true,
      redirectUrl,
    });

    if (backupToken) {
      // Restore the original Super Root Admin session
      response.cookies.set("df_session", backupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    // Clear backup and impersonator cookies
    response.cookies.delete("df_superroot_backup");
    response.cookies.delete("df_impersonator");

    return response;
  } catch (error: any) {
    console.error("[Impersonate Exit Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to exit impersonation mode." }, { status: 500 });
  }
}
