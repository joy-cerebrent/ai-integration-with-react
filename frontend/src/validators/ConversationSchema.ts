import { z } from "zod";

export const TitleSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export type TitleSchemaType = z.infer<typeof TitleSchema>;

export const MessageSchema = z.object({
  prompt: z.string().min(1, "Message is required"),
  file: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type === "application/pdf", {
      message: "Only PDF files are allowed",
    }),
});

export type MessageSchemaType = z.infer<typeof MessageSchema>;