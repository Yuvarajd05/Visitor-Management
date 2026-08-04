import { z } from "zod";

export const reportQuerySchema = z
  .object({
    type: z.enum(["daterange", "inside", "purpose"]).default("daterange"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    purpose: z.string().optional(),
    status: z.enum(["ALL", "CHECKED_IN", "CHECKED_OUT"]).optional().default("ALL"),
  })
  .superRefine((value, ctx) => {
    if (value.type === "inside") {
      return;
    }

    if (!value.startDate || !value.endDate) {
      ctx.addIssue({
        code: "custom",
        message: "Start and end dates are required for this report.",
        path: ["startDate"],
      });
    }
  });

export type ReportQueryValues = z.infer<typeof reportQuerySchema>;
