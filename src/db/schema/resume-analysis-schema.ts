import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export const resumeAnalysis = sqliteTable("resume_analysis", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  jobTypeId: text("job_type_id").notNull(),
  jobTypeLabel: text("job_type_label").notNull(),
  mode: text("mode").notNull(), // 'ats' | 'ai'
  atsReportJson: text("ats_report_json"),
  aiReportJson: text("ai_report_json"),
  aiError: text("ai_error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
