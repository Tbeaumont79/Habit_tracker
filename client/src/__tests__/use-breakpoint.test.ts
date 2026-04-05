import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useBreakpoint } from '../composables/useBreakpoint'

// Helper: create a minimal component that uses the composable so we can test
// lifecycle hooks (onMounted / onUnmounted) properly.
function makeWrapper() {
  return defineComponent({
    setup() {
      return useBreakpoint()
    },
    template: '<div />',
  })
}

// Build a minimal matchMedia mock that can be toggled per query.
function buildMatchMediaMock(initialMatches: Record<string, boolean>) {
  const listeners: Record<string, Array<(e: MediaQueryListEvent) => void>> = {}

  const mock = vi.fn().mockImplementation((query: string) => {
    const mql = {
      matches: initialMatches[query] ?? false,
      media: query,
      addEventListener: vi.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (!listeners[query]) listeners[query] = []
        listeners[query].push(cb)
      }),
      removeEventListener: vi.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (listeners[query]) {
          listeners[query] = listeners[query].filter((l) => l !== cb)
        }
      }),
    }
    return mql
  })

  function trigger(query: string, matches: boolean) {
    if (listeners[query]) {
      listeners[query].forEach((cb) =>
        cb({ matches, media: query } as MediaQueryListEvent),
      )
    }
  }

  return { mock, trigger }
}

describe('useBreakpoint', () => {
  const MOBILE_QUERY = '(max-width: 767px)'
  const TABLET_QUERY = '(min-width: 768px) and (max-width: 1023px)'
  const DESKTOP_QUERY = '(min-width: 1024px)'

  let originalMatchMedia: typeof window.matchMedia

  beforeEach(() => {
    originalMatchMedia = window.matchMedia
  })

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
    vi.clearAllMocks()
  })

  it('returns isMobile=true when viewport is < 768px', async () => {
    const { mock } = buildMatchMediaMock({
      [MOBILE_QUERY]: true,
      [TABLET_QUERY]: false,
      [DESKTOP_QUERY]: false,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    expect(wrapper.vm.isMobile).toBe(true)
    expect(wrapper.vm.isTablet).toBe(false)
    expect(wrapper.vm.isDesktop).toBe(false)
  })

  it('returns isTablet=true when viewport is 768-1023px', async () => {
    const { mock } = buildMatchMediaMock({
      [MOBILE_QUERY]: false,
      [TABLET_QUERY]: true,
      [DESKTOP_QUERY]: false,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    expect(wrapper.vm.isMobile).toBe(false)
    expect(wrapper.vm.isTablet).toBe(true)
    expect(wrapper.vm.isDesktop).toBe(false)
  })

  it('returns isDesktop=true when viewport is >= 1024px', async () => {
    const { mock } = buildMatchMediaMock({
      [MOBILE_QUERY]: false,
      [TABLET_QUERY]: false,
      [DESKTOP_QUERY]: true,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    expect(wrapper.vm.isMobile).toBe(false)
    expect(wrapper.vm.isTablet).toBe(false)
    expect(wrapper.vm.isDesktop).toBe(true)
  })

  it('all flags are false when no media query matches (SSR-like state)', async () => {
    const { mock } = buildMatchMediaMock({
      [MOBILE_QUERY]: false,
      [TABLET_QUERY]: false,
      [DESKTOP_QUERY]: false,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    expect(wrapper.vm.isMobile).toBe(false)
    expect(wrapper.vm.isTablet).toBe(false)
    expect(wrapper.vm.isDesktop).toBe(false)
  })

  it('reacts to a change event — switches to mobile', async () => {
    const { mock, trigger } = buildMatchMediaMock({
      [MOBILE_QUERY]: false,
      [TABLET_QUERY]: false,
      [DESKTOP_QUERY]: true,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    expect(wrapper.vm.isDesktop).toBe(true)

    // Simulate resize to mobile
    trigger(MOBILE_QUERY, true)
    await flushPromises()

    expect(wrapper.vm.isMobile).toBe(true)
  })

  it('reacts to a change event — switches to desktop', async () => {
    const { mock, trigger } = buildMatchMediaMock({
      [MOBILE_QUERY]: true,
      [TABLET_QUERY]: false,
      [DESKTOP_QUERY]: false,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    expect(wrapper.vm.isMobile).toBe(true)

    trigger(DESKTOP_QUERY, true)
    await flushPromises()

    expect(wrapper.vm.isDesktop).toBe(true)
  })

  it('removes event listeners on unmount', async () => {
    const { mock } = buildMatchMediaMock({
      [MOBILE_QUERY]: false,
      [TABLET_QUERY]: false,
      [DESKTOP_QUERY]: true,
    })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: mock })

    const wrapper = mount(makeWrapper())
    await flushPromises()

    // Each mql instance tracks removeEventListener calls
    const mqlInstances = (mock as ReturnType<typeof vi.fn>).mock.results.map(
      (r: { value: { removeEventListener: ReturnType<typeof vi.fn> } }) => r.value,
    )

    wrapper.unmount()

    // Every mql instance should have had removeEventListener called once
    mqlInstances.forEach((mql: { removeEventListener: ReturnType<typeof vi.fn> }) => {
      expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
    })
  })
})
