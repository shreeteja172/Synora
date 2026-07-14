import { z, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      parsedQuery?: unknown;
      parsedParams?: unknown;
    }
  }
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.parsedQuery = result.data;
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.parsedParams = result.data;
    next();
  };
}

export const schemas = {
  chatCreate: z.object({
    receiverId: z.string().cuid(),
  }),

  userSearch: z.object({
    q: z.string().min(1).max(200),
  }),

  messagesQuery: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(30),
    before: z.string().datetime({ offset: true }).optional(),
  }),

  chatIdParam: z.object({
    chatId: z.string().cuid(),
  }),

  wsMessage: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("MESSAGE"),
      payload: z.object({
        chatId: z.string().cuid(),
        content: z.string().min(1).max(5000),
        clientMessageId: z.string().uuid().optional(),
      }),
    }),
    z.object({
      type: z.literal("TYPING"),
      payload: z.object({
        chatId: z.string().cuid(),
      }),
    }),
    z.object({
      type: z.literal("SEEN"),
      payload: z.object({
        chatId: z.string().cuid(),
      }),
    }),
  ]),
};
