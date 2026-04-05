import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useToast } from '../composables/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset shared toast state between tests by removing all toasts
    const { toasts, remove } = useToast()
    toasts.value.forEach((t) => remove(t.id))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('success()', () => {
    it('adds a success toast to the list', () => {
      const { toasts, success } = useToast()
      success('Habit saved!')
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('success')
      expect(toasts.value[0].message).toBe('Habit saved!')
    })

    it('auto-dismisses after 4 seconds', () => {
      const { toasts, success } = useToast()
      success('Habit saved!')
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(3999)
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(toasts.value).toHaveLength(0)
    })

    it('returns the toast id', () => {
      const { success } = useToast()
      const id = success('Hello')
      expect(typeof id).toBe('number')
    })
  })

  describe('error()', () => {
    it('adds an error toast to the list', () => {
      const { toasts, error } = useToast()
      error('Something went wrong')
      expect(toasts.value).toHaveLength(1)
      expect(toasts.value[0].type).toBe('error')
      expect(toasts.value[0].message).toBe('Something went wrong')
    })

    it('auto-dismisses after 6 seconds', () => {
      const { toasts, error } = useToast()
      error('Something went wrong')
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(5999)
      expect(toasts.value).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(toasts.value).toHaveLength(0)
    })
  })

  describe('remove()', () => {
    it('removes a toast by id before auto-dismiss', () => {
      const { toasts, success, remove } = useToast()
      const id = success('To be removed')
      expect(toasts.value).toHaveLength(1)

      remove(id)
      expect(toasts.value).toHaveLength(0)
    })

    it('does nothing when the id does not exist', () => {
      const { toasts, success, remove } = useToast()
      success('Keep me')
      expect(toasts.value).toHaveLength(1)

      remove(99999)
      expect(toasts.value).toHaveLength(1)
    })
  })

  describe('max 3 visible', () => {
    it('caps the visible stack at 3 toasts', () => {
      const { toasts, success } = useToast()
      success('First')
      success('Second')
      success('Third')
      success('Fourth')
      // The oldest toast was dropped to keep max 3
      expect(toasts.value).toHaveLength(3)
    })

    it('removes the oldest toast when capacity is exceeded', () => {
      const { toasts, success } = useToast()
      success('First')
      const secondId = toasts.value[0].id + 1
      success('Second')
      success('Third')
      success('Fourth')

      const ids = toasts.value.map((t) => t.id)
      expect(ids).not.toContain(secondId - 1) // First was dropped
    })
  })
})
