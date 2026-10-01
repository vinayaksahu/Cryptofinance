import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customId = searchParams.get("customId")?.trim().toUpperCase();

    if (!customId) {
      return NextResponse.json({ error: "customId is required" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { customId },
      select: {
        id: true,
        customId: true,
        fullName: true,
        status: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: targetUser.id,
        customId: targetUser.customId,
        fullName: targetUser.fullName,
        status: targetUser.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to lookup user" }, { status: 500 });
  }
}
