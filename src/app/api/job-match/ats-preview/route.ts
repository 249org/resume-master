import { NextResponse } from "next/server";
import { runAtsEngine } from "@/lib/ats-engine";
import { getJobType } from "@/lib/job-types";
import {
  checkGuestAtsPreviewRateLimit,
  getRequestIpKey,
} from "@/lib/kv-rate-limit";
import { HOME_ATS_DEFAULT_JOB_TYPE_ID } from "@/lib/pending-ats";

const MAX_RESUME_LENGTH = 50_000;
const MIN_RESUME_LENGTH = 100;

export async function POST(request: Request) {
  try {
    const ipKey = getRequestIpKey(request);
    const allowed = await checkGuestAtsPreviewRateLimit(ipKey);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many preview checks from this network. Try again in an hour or sign in to run analyses on your account.",
        },
        { status: 429 }
      );
    }

    let body: { resumeText?: unknown; jobTypeId?: unknown };
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
    const jobTypeIdRaw =
      typeof body.jobTypeId === "string" ? body.jobTypeId.trim() : "";
    const jobTypeId = jobTypeIdRaw || HOME_ATS_DEFAULT_JOB_TYPE_ID;

    if (!resumeText || resumeText.length < MIN_RESUME_LENGTH) {
      return NextResponse.json(
        {
          error:
            "resumeText is required and must be at least 100 characters after extraction.",
        },
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

    const sanitizedText =
      resumeText.length > MAX_RESUME_LENGTH
        ? resumeText.slice(0, MAX_RESUME_LENGTH)
        : resumeText;

    const report = runAtsEngine(sanitizedText, jobTypeId);

    const teaser =
      report.strongPoints[0] ??
      report.weakPoints[0] ??
      report.suggestions[0] ??
      "Sign in for the full breakdown: strengths, gaps, and tailored suggestions.";

    return NextResponse.json({
      summary: {
        score: report.score,
        jobTypeLabel: jobType.label,
        jobTypeId,
        teaser,
      },
    });
  } catch (err) {
    console.error("job-match/ats-preview error:", err);
    return NextResponse.json(
      { error: "Could not generate a preview. Please try again." },
      { status: 500 }
    );
  }
}
