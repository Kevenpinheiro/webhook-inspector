export function WebhooksListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {Array.from({ length: 10 }).map((_, index) => (
          <WebhookListItemSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function WebhookListItemSkeleton() {
  return (
    <div className="rounded-lg bg-zinc-700/20 mb-6">
      <div className="flex items-start gap-3 px-4 py-2.5">
        <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-zinc-700" />

        <div className="flex flex-1 min-w-0 items-start gap-3">
          <div className="h-4 w-12 shrink-0 animate-pulse rounded bg-zinc-700" />

          <div className="flex-1 min-w-0 space-y-2 ">
            <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-700" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-700" />
          </div>
        </div>

        <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-zinc-700" />
      </div>
    </div>
  )
}
