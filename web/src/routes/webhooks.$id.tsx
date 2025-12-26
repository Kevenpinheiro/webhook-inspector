import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { WebhookDetails } from '../components/webhook-details'
import { WebhooksListSkeleton } from '../components/webhooks-list-skeleton'

export const Route = createFileRoute('/webhooks/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  return (
    <Suspense fallback={<WebhooksListSkeleton />}>
      <WebhookDetails id={id} />
    </Suspense>
  )
}
