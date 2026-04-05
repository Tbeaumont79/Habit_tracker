import { ref } from 'vue'

export type ToastType = 'success' | 'error'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

const MAX_VISIBLE = 3
const SUCCESS_DURATION = 4000
const ERROR_DURATION = 6000

const toasts = ref<Toast[]>([])
let nextId = 0

function add(type: ToastType, message: string): number {
  const id = nextId++

  // Enforce max 3 visible — remove the oldest if at capacity
  if (toasts.value.length >= MAX_VISIBLE) {
    toasts.value.splice(0, toasts.value.length - MAX_VISIBLE + 1)
  }

  toasts.value.push({ id, type, message })

  const duration = type === 'success' ? SUCCESS_DURATION : ERROR_DURATION
  setTimeout(() => remove(id), duration)

  return id
}

function remove(id: number): void {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  function success(message: string): number {
    return add('success', message)
  }

  function error(message: string): number {
    return add('error', message)
  }

  return {
    toasts,
    success,
    error,
    remove,
  }
}
