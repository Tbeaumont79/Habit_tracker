<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: string
    variant: 'text' | 'circle' | 'card'
  }>(),
  {
    width: undefined,
    height: undefined,
    radius: undefined,
  },
)
</script>

<template>
  <span
    class="skeleton animate-pulse"
    :class="`skeleton--${variant}`"
    :style="{
      width: width ?? undefined,
      height: height ?? undefined,
      borderRadius: radius ?? undefined,
    }"
    aria-hidden="true"
  />
</template>

<style scoped>
.skeleton {
  display: block;
  background: var(--border);
}

/* Text variant: rounded rectangle */
.skeleton--text {
  height: v-bind("height ?? '16px'");
  border-radius: v-bind("radius ?? '8px'");
  width: v-bind("width ?? '100%'");
}

/* Circle variant: perfect circle */
.skeleton--circle {
  width: v-bind("width ?? '40px'");
  height: v-bind("height ?? width ?? '40px'");
  border-radius: 50%;
  flex-shrink: 0;
}

/* Card variant: full card shape */
.skeleton--card {
  width: v-bind("width ?? '100%'");
  height: v-bind("height ?? '120px'");
  border-radius: v-bind("radius ?? '20px'");
}

/* Pulse animation */
.animate-pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
