import { writable } from 'svelte/store'

const messages = writable<Record<string, any>>({})

export const sendMessage = (key: string, message: any = true) =>
  messages.update((m) => ({ ...m, [key]: message }))

export const onMessage = (
  listenedKeys: string[],
  messageHandler: (key: string, message: any) => boolean
) => {
  return messages.subscribe((m) => {
    const purgeables: string[] = []
    for (const key of listenedKeys) {
      if (key in m) {
        if (messageHandler(key, m[key])) {
          purgeables.push(key)
        }
      }
    }
    if (purgeables.length) {
      for (const key of purgeables) {
        delete m[key]
      }
      messages.set({ ...m })
    }
  })
}
