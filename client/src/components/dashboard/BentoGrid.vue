<script setup lang="ts">
// BentoGrid — slot-based CSS grid container
// Desktop (>=1024px): 4 cols, gap 24px
// Tablet (>=768px):   2 cols, gap 20px
// Mobile (<768px):    1 col,  gap 16px
</script>

<template>
  <div class="bento-grid">
    <slot />
  </div>
</template>

<style scoped>
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  grid-auto-rows: minmax(200px, auto);
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}
</style>
