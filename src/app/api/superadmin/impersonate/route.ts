import { NextRequest, NextResponse } from "next/server";
import { getSession, createSessionToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { recordActivity } from "@/lib/auditLogger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ROOT_ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Super Root Admin privileges required." }, { status: 403 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required." }, { status: 400 });
    }

    // Lookup target user
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        customId: true,
        fullName: true,
        email: true,
        role: true,
        adminId: true,
        status: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found." }, { status: 404 });
    }

    // Role boundary checks:
    if (session.role === "SUPER_ROOT_ADMIN") {
      // Super Root Admin can inspect any user or admin
    } else if (session.role === "SUPER_ADMIN") {
      // Super Admin (CMD) can inspect any regular USER and branch ADMIN
      if (targetUser.role === "SUPER_ROOT_ADMIN") {
        return NextResponse.json({ error: "Forbidden: Cannot inspect Super Root Administrator." }, { status: 403 });
      }
    } else if (session.role === "ADMIN") {
      // Branch Admin can inspect regular USERs
      if (targetUser.role !== "USER") {
        return NextResponse.json({ error: "Forbidden: You can only inspect regular member portals." }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "Forbidden: Insufficient privileges." }, { status: 403 });
    }

    const cookieStore = await cookies();
    const currentSessionToken = cookieStore.get("df_session")?.value;

    // Check if backup admin token already exists
    const existingBackup = cookieStore.get("df_superroot_backup")?.value;
    const backupToken = existingBackup || currentSessionToken;

    // Create target session token
    const targetToken = await createSessionToken({
      userId: targetUser.id,
      customId: targetUser.customId,
      role: targetUser.role,
      email: targetUser.email,
      adminId: targetUser.adminId,
    });

    // Log the impersonation action into audit logs
    await recordActivity({
      userId: session.userId,
      action: "IMPERSONATE_PORTAL_ENTER",
      category: "SECURITY",
      description: `${session.role} (${session.customId}) entered portal of ${targetUser.role} ${targetUser.customId} (${targetUser.fullName})`,
      req,
      metadata: {
        impersonatorId: session.userId,
        impersonatorCustomId: session.customId,
        impersonatorRole: session.role,
        targetUserId: targetUser.id,
        targetCustomId: targetUser.customId,
        targetRole: targetUser.role,
      },
    });

    // Destination portal
    const redirectUrl = targetUser.role === "USER" ? "/member" : "/admin";

    const response = NextResponse.json({
      success: true,
      redirectUrl,
      targetUser: {
        id: targetUser.id,
        customId: targetUser.customId,
        fullName: targetUser.fullName,
        role: targetUser.role,
      },
    });

    // Set cookies:
    // 1. Preserve the original Super Root Admin token in backup cookie
    if (backupToken) {
      response.cookies.set("df_superroot_backup", backupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });
    }

    // 2. Set impersonator label cookie
    response.cookies.set("df_impersonator", `${session.customId}|${session.role}`, {
      httpOnly: false, // Accessible by client UI for banner
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // 3. Switch main session to the target user
    response.cookies.set("df_session", targetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Impersonate Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to switch portal." }, { status: 500 });
  }
}
