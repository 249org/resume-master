/** sessionStorage payload after a guest home ATS preview (consumed on job-match after sign-in). */

/** Fallback when API requests omit `jobTypeId` (home flow always sends an explicit role). */
export const HOME_ATS_DEFAULT_JOB_TYPE_ID = "software-engineer";

export const PENDING_ATS_STORAGE_KEY = "rm_pending_ats";

export const PENDING_ATS_VERSION = 1;

export type PendingAtsPayload = {
  v: typeof PENDING_ATS_VERSION;
  resumeText: string;
  fileName: string;
  jobTypeId: string;
};

export function parsePendingAtsPayload(raw: string | null): PendingAtsPayload | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<PendingAtsPayload>;
    if (o.v !== PENDING_ATS_VERSION) return null;
    if (typeof o.resumeText !== "string" || o.resumeText.trim().length < 100)
      return null;
    if (typeof o.jobTypeId !== "string" || !o.jobTypeId.trim()) return null;
    const fileName =
      typeof o.fileName === "string" && o.fileName.trim()
        ? o.fileName.trim()
        : "Resume";
    return {
      v: PENDING_ATS_VERSION,
      resumeText: o.resumeText.trim(),
      fileName,
      jobTypeId: o.jobTypeId.trim(),
    };
  } catch {
    return null;
  }
}
