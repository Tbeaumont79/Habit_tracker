<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    loading: false,
  },
)

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['base-btn', `base-btn--${variant}`, { 'base-btn--loading': loading }]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    transform 0.1s ease,
    opacity 0.15s ease,
    box-shadow 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.base-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* Primary */
.base-btn--primary {
  background: var(--primary);
  color: #ffffff;
}

.base-btn--primary:hover:not(:disabled) {
  background: var(--primary-dark);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.35);
}

/* Secondary */
.base-btn--secondary {
  background: var(--surface-alt);
  color: var(--primary);
  border: 1.5px solid var(--primary-light);
}

.base-btn--secondary:hover:not(:disabled) {
  background: var(--primary-light);
  color: #ffffff;
}

/* Ghost */
.base-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
}

.base-btn--ghost:hover:not(:disabled) {
  background: var(--surface-alt);
  color: var(--text);
}

/* Loading spinner */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  opacity: 0.8;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
