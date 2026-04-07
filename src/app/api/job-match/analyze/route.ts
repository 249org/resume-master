import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { runAtsEngine } from "@/lib/ats-engine";
import { getJobType } from "@/lib/job-types";
import { checkRateLimit } from "@/lib/kv-rate-limit";
import { getDb } from "@/db/index";
import { resumeAnalysis } from "@/db/schema/resume-analysis-schema";

const MAX_RESUME_LENGTH = 50_000;

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      resumeText?: unknown;
      jobTypeId?: unknown;
      fileName?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const resumeText =
      typeof body.resumeText === "string" ? body.resumeText.trim() : "";
    const jobTypeId =
      typeof body.jobTypeId === "string" ? body.jobTypeId.trim() : "";
    const fileName =
      typeof body.fileName === "string" && body.fileName.trim()
        ? body.fileName.trim()
        : "Resume";

    if (!resumeText || resumeText.length < 100) {
      return NextResponse.json(
        {
          error:
            "resumeText is required and must be at least 100 characters",
        },
        { status: 400 }
      );
    }

    if (!jobTypeId) {
      return NextResponse.json(
        { error: "jobTypeId is required" },
        { status: 400 }
      );
    }

    const jobType = getJobType(jobTypeId);
    if (jobType == null) {
      return NextResponse.json(
        { error: "Invalid jobTypeId" },
        { status: 400 }
      );
    }

    const allowed = await checkRateLimit(session.user.id, "ats");
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. You can run up to 20 ATS analyses per hour.",
        },
        { status: 429 }
      );
    }

    const sanitizedText =
      resumeText.length > MAX_RESUME_LENGTH
        ? resumeText.slice(0, MAX_RESUME_LENGTH)
        : resumeText;

    const atsReport = runAtsEngine(sanitizedText, jobTypeId);

    const analysisId = crypto.randomUUID();
    const now = new Date();
    const db = getDb();
    await db.insert(resumeAnalysis).values({
      id: analysisId,
      userId: session.user.id,
      fileName,
      jobTypeId,
      jobTypeLabel: jobType.label,
      mode: "ats",
      atsReportJson: atsReport ? JSON.stringify(atsReport) : null,
      aiReportJson: null,
      aiError: null,
      createdAt: now,
    });

    return NextResponse.json({
      atsReport,
      aiReport: null,
      analysisId,
    });
  } catch (err) {
    console.error("job-match/analyze error:", err);
    return NextResponse.json(
      { error: "An error occurred while analyzing your resume." },
      { status: 500 }
    );
  }
}
