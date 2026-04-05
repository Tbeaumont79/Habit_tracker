<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    type?: string
    label?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    id?: string
  }>(),
  {
    type: 'text',
    label: undefined,
    placeholder: '',
    error: undefined,
    disabled: false,
    id: undefined,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['base-input', { 'base-input--error': error }]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="input-error" role="alert">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.01em;
}

.base-input {
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  width: 100%;
}

.base-input::placeholder {
  color: var(--text-muted);
}

.base-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.15);
}

.base-input:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.base-input--error {
  border-color: var(--error);
}

.base-input--error:focus {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(232, 60, 60, 0.12);
}

.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-error {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--error);
  font-weight: 500;
}
</style>
