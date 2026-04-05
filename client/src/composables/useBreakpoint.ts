import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint() {
  const isMobile = ref(false)   // < 768px
  const isTablet = ref(false)   // 768-1023px
  const isDesktop = ref(false)  // >= 1024px

  const mobileQuery = window.matchMedia('(max-width: 767px)')
  const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
  const desktopQuery = window.matchMedia('(min-width: 1024px)')

  function update() {
    isMobile.value = mobileQuery.matches
    isTablet.value = tabletQuery.matches
    isDesktop.value = desktopQuery.matches
  }

  function onMobileChange(e: MediaQueryListEvent) {
    isMobile.value = e.matches
  }

  function onTabletChange(e: MediaQueryListEvent) {
    isTablet.value = e.matches
  }

  function onDesktopChange(e: MediaQueryListEvent) {
    isDesktop.value = e.matches
  }

  onMounted(() => {
    update()
    mobileQuery.addEventListener('change', onMobileChange)
    tabletQuery.addEventListener('change', onTabletChange)
    desktopQuery.addEventListener('change', onDesktopChange)
  })

  onUnmounted(() => {
    mobileQuery.removeEventListener('change', onMobileChange)
    tabletQuery.removeEventListener('change', onTabletChange)
    desktopQuery.removeEventListener('change', onDesktopChange)
  })

  return { isMobile, isTablet, isDesktop }
}
