import { NextResponse } from "next/server";
import { buildGuestAtsPreviewCopy, runAtsEngine } from "@/lib/ats-engine";
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
    const copy = buildGuestAtsPreviewCopy(report);
    const wordCount = sanitizedText.trim().split(/\s+/).filter(Boolean).length;
    const statsLine = `${wordCount.toLocaleString()} words · ${sanitizedText.length.toLocaleString()} characters analyzed`;

    return NextResponse.json({
      summary: {
        score: report.score,
        jobTypeLabel: jobType.label,
        jobTypeId,
        teaser: copy.teaser,
        moreFeedback: copy.moreFeedback,
        statsLine,
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
