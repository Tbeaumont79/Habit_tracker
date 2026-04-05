<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import BaseToast from './BaseToast.vue'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-label="Notifications" role="region">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <BaseToast
          v-for="toast in toasts"
          :key="toast.id"
          :id="toast.id"
          :type="toast.type"
          :message="toast.message"
          @close="remove"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  /* Top-right on desktop */
  top: 16px;
  right: 16px;
  z-index: 9999;
  pointer-events: none;
}

/* Top-center on mobile */
@media (max-width: 640px) {
  .toast-container {
    right: 50%;
    transform: translateX(50%);
  }
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: auto;
}

/* Enter: slide in from top */
.toast-enter-active {
  transition:
    opacity 300ms ease-out,
    transform 300ms ease-out;
}

/* Exit: fade out */
.toast-leave-active {
  transition: opacity 200ms ease-in;
  position: absolute;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}

.toast-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.toast-leave-from {
  opacity: 1;
}

.toast-leave-to {
  opacity: 0;
}

/* Smooth re-stack when an item is removed */
.toast-move {
  transition: transform 200ms ease;
}
</style>
