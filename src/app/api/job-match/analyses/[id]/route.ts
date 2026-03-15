import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/index";
import { resumeAnalysis } from "@/db/schema/resume-analysis-schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const db = getDb();
    const rows = await db
      .select()
      .from(resumeAnalysis)
      .where(
        and(
          eq(resumeAnalysis.id, id),
          eq(resumeAnalysis.userId, session.user.id)
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let atsReport = null;
    let aiReport = null;
    if (row.atsReportJson) {
      try {
        atsReport = JSON.parse(row.atsReportJson);
      } catch {
        // ignore
      }
    }
    if (row.aiReportJson) {
      try {
        aiReport = JSON.parse(row.aiReportJson);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      id: row.id,
      fileName: row.fileName,
      jobTypeId: row.jobTypeId,
      jobTypeLabel: row.jobTypeLabel,
      mode: row.mode,
      atsReport,
      aiReport,
      aiError: row.aiError ?? null,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error("job-match/analyses/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to load analysis." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: _request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const db = getDb();
    const deleted = await db
      .delete(resumeAnalysis)
      .where(
        and(
          eq(resumeAnalysis.id, id),
          eq(resumeAnalysis.userId, session.user.id)
        )
      );

    // D1 returns a result object; we just need to confirm we ran the delete
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("job-match/analyses/[id] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete analysis." },
      { status: 500 }
    );
  }
}
