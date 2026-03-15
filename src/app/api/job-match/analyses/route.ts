import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db/index";
import { resumeAnalysis } from "@/db/schema/resume-analysis-schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const rows = await db
      .select({
        id: resumeAnalysis.id,
        fileName: resumeAnalysis.fileName,
        jobTypeId: resumeAnalysis.jobTypeId,
        jobTypeLabel: resumeAnalysis.jobTypeLabel,
        mode: resumeAnalysis.mode,
        atsReportJson: resumeAnalysis.atsReportJson,
        createdAt: resumeAnalysis.createdAt,
      })
      .from(resumeAnalysis)
      .where(eq(resumeAnalysis.userId, session.user.id))
      .orderBy(desc(resumeAnalysis.createdAt))
      .limit(50);

    const list = rows.map((r) => {
      let score: number | null = null;
      if (r.atsReportJson) {
        try {
          const parsed = JSON.parse(r.atsReportJson) as { score?: number };
          if (typeof parsed.score === "number") score = parsed.score;
        } catch {
          // ignore
        }
      }
      return {
        id: r.id,
        fileName: r.fileName,
        jobTypeId: r.jobTypeId,
        jobTypeLabel: r.jobTypeLabel,
        mode: r.mode,
        score,
        createdAt: r.createdAt,
      };
    });

    return NextResponse.json(list);
  } catch (err) {
    console.error("job-match/analyses list error:", err);
    return NextResponse.json(
      { error: "Failed to load analyses." },
      { status: 500 }
    );
  }
}
