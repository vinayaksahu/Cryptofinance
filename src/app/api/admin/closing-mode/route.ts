import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSystemConfigValue, invalidateConfigCache } from "@/lib/configService";
import { recordActivity } from "@/lib/auditLogger";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const mode = await getSystemConfigValue("CLOSING_MODE", "AUTO");
    return NextResponse.json({ success: true, mode });
  } catch (error: any) {
    console.error("GET /api/admin/closing-mode error:", error);
    return NextResponse.json({ error: error.message || "Failed to get closing mode" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN" && session.role !== "SUPER_ROOT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await req.json();
    const mode = body.mode === "MANUAL" ? "MANUAL" : "AUTO";

    await db.systemConfig.upsert({
      where: { key: "CLOSING_MODE" },
      update: { value: mode },
      create: {
        key: "CLOSING_MODE",
        value: mode,
        description: "Daily protocol closing execution mode ('AUTO' or 'MANUAL')",
      },
    });

    invalidateConfigCache();

    await recordActivity({
      userId: session.userId,
      action: "UPDATE_CLOSING_MODE",
      category: "ADMIN",
      description: `Closing mode updated to ${mode}`,
      metadata: { previousMode: body.previousMode, newMode: mode, actorRole: session.role },
    });

    return NextResponse.json({
      success: true,
      mode,
      message: mode === "MANUAL"
        ? "Switched to MANUAL Closing Mode. Admin can execute closing anytime & multiple times per day."
        : "Switched to AUTO Closing Mode. Automated daily schedule active at 12:01 AM UTC.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/closing-mode error:", error);
    return NextResponse.json({ error: error.message || "Failed to update closing mode" }, { status: 500 });
  }
}
