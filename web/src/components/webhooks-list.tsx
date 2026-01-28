import { Loader2, Wand2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { WebhooksListItem } from './webhooks-list-item'
import { webhookListSchema } from '../http/schemas/webhooks'
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { CodeBlock } from './ui/code-block'

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver>(null)

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([])
  const [generateHandlerCode, setGenerateHandlerCode] = useState<string | null>(
    null,
  )

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['webhooks'],
      queryFn: async ({ pageParam }) => {
        const url = new URL('http://localhost:3333/api/webhooks')

        if (pageParam) {
          url.searchParams.set('cursor', pageParam)
        }

        const response = await fetch(url)
        const data = await response.json()

        return webhookListSchema.parse(data)
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined
      },
      initialPageParam: undefined as string | undefined,
    })

  const webhooks = data.pages.flatMap((page) => page.webhooks)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1, // 10% scrolling to change next pages
      },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  function handleCheckWebhook(checkedWebhooksId: string) {
    if (checkedWebhooksIds.includes(checkedWebhooksId)) {
      setCheckedWebhooksIds((state) => {
        return state.filter((webhookId) => webhookId !== checkedWebhooksId)
      })
    } else {
      setCheckedWebhooksIds((state) => [...state, checkedWebhooksId])
    }
  }

  async function handleGenerateHandler() {
    const response = await fetch('http://localhost:3333/api/generate', {
      method: 'POST',
      body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    type generateResponse = { code: string }

    const data = await response.json()

    setGenerateHandlerCode(data.code)
  }

  const hasAnyWebhookChecked = checkedWebhooksIds.length > 0

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          <button
            onClick={handleGenerateHandler}
            disabled={!hasAnyWebhookChecked}
            type="button"
            className=" bg-indigo-400 text-white size-8 w-full mb-3 rounded-lg flex gap-3 items-center justify-center font-medium text-sm p-2 disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="size-4" />
            Gerar handler
          </button>

          {webhooks.map((webhook) => {
            return (
              <WebhooksListItem
                key={webhook.id}
                webhook={webhook}
                onWebhookChecked={handleCheckWebhook}
                isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
              />
            )
          })}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {!!generateHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className='bg-black/60 inset-0 fixed z-20' />
            <Dialog.Content className='flex items-center justify-center fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[85vh] w-[90vh] max-w-[500px] z-40'>
              <div className='bg-zinc-900 w-[600px]  p-4 rounded-lg border border-zinc-800 max-h-[400px] overflow-auto'>
                <CodeBlock language="typescript" code={generateHandlerCode} />
              </div>
            </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  )
}
