import { z } from "zod";

export const dashboardQuerySchema = z
  .object({
    range: z
      .enum(["today", "yesterday", "last7days", "thismonth", "custom"])
      .optional()
      .default("today"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.range !== "custom") {
      return;
    }

    if (!value.startDate || !value.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "Start and end dates are required for a custom range.",
        path: ["startDate"],
      });
    }
  });

export type DashboardQueryValues = z.infer<typeof dashboardQuerySchema>;
