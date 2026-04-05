<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  title?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  size: 'small',
})
</script>

<template>
  <div
    class="bento-card"
    :class="[`bento-card--${size}`]"
  >
    <div v-if="title || icon" class="bento-card__header">
      <span v-if="icon" class="bento-card__icon" aria-hidden="true">{{ icon }}</span>
      <span v-if="title" class="bento-card__title">{{ title }}</span>
    </div>
    <div class="bento-card__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bento-card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(45, 43, 61, 0.04);
  padding: 32px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
}

.bento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 107, 157, 0.08);
}

/* Size — small: 1 col span */
.bento-card--small {
  grid-column: span 1;
  grid-row: span 1;
}

/* Size — medium: 2 col span */
.bento-card--medium {
  grid-column: span 1;
  grid-row: span 1;
}

/* Size — large: 2 col + 2 row span */
.bento-card--large {
  grid-column: span 1;
  grid-row: span 1;
}

@media (min-width: 768px) {
  .bento-card--medium {
    grid-column: span 2;
  }

  .bento-card--large {
    grid-column: span 2;
    grid-row: span 2;
  }
}

@media (min-width: 1024px) {
  .bento-card--medium {
    grid-column: span 2;
  }

  .bento-card--large {
    grid-column: span 2;
    grid-row: span 2;
  }
}

.bento-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bento-card__icon {
  font-size: 16px;
  line-height: 1;
}

.bento-card__title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.bento-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
