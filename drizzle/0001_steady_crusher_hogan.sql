CREATE TABLE `resume_analysis` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`file_name` text NOT NULL,
	`job_type_id` text NOT NULL,
	`job_type_label` text NOT NULL,
	`mode` text NOT NULL,
	`ats_report_json` text,
	`ai_report_json` text,
	`ai_error` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
