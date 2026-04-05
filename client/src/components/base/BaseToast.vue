<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { ToastType } from '../../composables/useToast'

const props = defineProps<{
  id: number
  type: ToastType
  message: string
}>()

const emit = defineEmits<{
  close: [id: number]
}>()

function close() {
  emit('close', props.id)
}

const isSuccess = computed(() => props.type === 'success')

// Countdown bar — shrinks over the auto-dismiss duration
const duration = computed(() => (props.type === 'success' ? 4000 : 6000))
const progressStyle = ref({ transition: 'none', width: '100%' })

onMounted(() => {
  // Kick off the shrink after next paint
  requestAnimationFrame(() => {
    progressStyle.value = {
      transition: `width ${duration.value}ms linear`,
      width: '0%',
    }
  })
})
</script>

<template>
  <div
    class="toast"
    :class="isSuccess ? 'toast--success' : 'toast--error'"
    role="alert"
    aria-live="polite"
  >
    <!-- Icon -->
    <span class="toast__icon" aria-hidden="true">
      <template v-if="isSuccess">
        <!-- Checkmark -->
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
      <template v-else>
        <!-- X -->
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </template>
    </span>

    <!-- Message -->
    <p class="toast__message">{{ message }}</p>

    <!-- Close button -->
    <button class="toast__close" type="button" aria-label="Dismiss notification" @click="close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    </button>

    <!-- Auto-dismiss countdown bar -->
    <span class="toast__progress" :style="progressStyle" />
  </div>
</template>

<style scoped>
.toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px 18px;
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 4px 20px rgba(45, 43, 61, 0.12);
  border-left: 4px solid transparent;
  width: 320px;
  max-width: calc(100vw - 32px);
  overflow: hidden;
}

.toast--success {
  border-left-color: var(--accent);
}

.toast--error {
  border-left-color: var(--error);
}

.toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-top: 1px;
}

.toast--success .toast__icon {
  color: var(--accent);
}

.toast--error .toast__icon {
  color: var(--error);
}

.toast__message {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  font-weight: 500;
}

.toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 6px;
  padding: 0;
  transition: color 0.15s ease, background 0.15s ease;
}

.toast__close:hover {
  color: var(--text);
  background: var(--surface-alt);
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 0 2px 2px 0;
}

.toast--success .toast__progress {
  background: var(--accent);
}

.toast--error .toast__progress {
  background: var(--error);
}
</style>
