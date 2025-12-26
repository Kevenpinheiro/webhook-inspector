import { z } from 'zod'

export const webhookListItemsSchema = z.object({
  id: z.uuidv7(),
  method: z.string(),
  pathname: z.string(),
  createdAt: z.coerce.date(),
})

export const webhookListSchema = z.object({
  webhooks: z.array(webhookListItemsSchema),
  nextCursor: z.string().nullable(),
})

export const webhookDetailsSchema = z.object({
  id: z.uuidv7(),
  method: z.string(),
  pathname: z.string(),
  ip: z.string(),
  statusCode: z.number(),
  contentType: z.string().nullable(),
  contentLength: z.string().nullable(),
  queryParams: z.record(z.string(), z.string()).nullable(),
  headers: z.record(z.string(), z.string()),
  body: z.string().nullable(),
  createdAt: z.coerce.date(),
})
