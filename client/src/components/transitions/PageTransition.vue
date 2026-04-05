<script setup lang="ts">
// PageTransition wraps RouterView with CSS-based enter/leave transitions.
// Enter: fade in + slide up from 10px below, 250ms ease-out
// Leave: fade out, 150ms ease-in
</script>

<template>
  <Transition name="page" mode="out-in">
    <slot />
  </Transition>
</template>

<style scoped>
.page-enter-active {
  transition:
    opacity 250ms ease-out,
    transform 250ms ease-out;
}

.page-leave-active {
  transition: opacity 150ms ease-in;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.page-leave-from {
  opacity: 1;
}

.page-leave-to {
  opacity: 0;
}
</style>
