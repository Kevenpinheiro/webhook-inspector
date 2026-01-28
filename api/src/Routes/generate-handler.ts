import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { z } from 'zod'
import { webhooks } from '@/db/schema'
import { db } from '@/db'
import { inArray } from 'drizzle-orm'
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const generateHander: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/generate',
    {
      schema: {
        summary: 'Generate a TypeScripe handler',
        tags: ['Webhooks'],
        body: z.object({
          webhookIds: z.array(z.string())
        }),
        response: {
          201: z.object({
            code: z.string()
          }),
        },
      },
    },
    async (request, reply) => {
      const { webhookIds } = request.body

      const result = await db
        .select({ body: webhooks.body})
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds))

      const webhooksBodies = result.map(webhook => webhook.body).join('\n\n')

      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `
          Generate a TypeScript function that serves as a handler for multiple webhook events. The function should accept request body containg
            different webhooks

            The function should handle the following webhook events with example payloads:

            """
            ${webhooksBodies}
            """

            The generated code should include:

            - A main function that takes the webhooks request body as input.
            - Zod schemas for each event type.
            - Logic to handle each event based on the validated data.
            - Appropriete error handling for invalalid payloads.

            ---

            you can use this prompt to request TypeScript code you need for handling webhook events with zod validator.
          `.trim(),
        });

      return reply.status(201).send({ code: text })
    },
  )
}
