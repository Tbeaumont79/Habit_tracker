<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = shallowRef('')
const password = shallowRef('')
const loading = shallowRef(false)
const serverError = shallowRef('')

const emailError = ref('')
const passwordError = ref('')

function validateEmail(value: string): string {
  if (!value) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return 'Password is required'
  if (value.length < 6) return 'Password must be at least 6 characters'
  return ''
}

function handleEmailBlur() {
  emailError.value = validateEmail(email.value)
}

function handlePasswordBlur() {
  passwordError.value = validatePassword(password.value)
}

async function handleSubmit() {
  emailError.value = validateEmail(email.value)
  passwordError.value = validatePassword(password.value)
  serverError.value = ''

  if (emailError.value || passwordError.value) return

  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await router.push('/dashboard')
  } catch (err) {
    serverError.value = err instanceof Error ? err.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">✨</div>
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to continue your habit journey</p>
      </div>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div v-if="serverError" class="server-error" role="alert">
          {{ serverError }}
        </div>

        <BaseInput
          id="email"
          v-model="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          :error="emailError"
          @blur="handleEmailBlur"
        />

        <BaseInput
          id="password"
          v-model="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          :error="passwordError"
          @blur="handlePasswordBlur"
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="loading"
          class="submit-btn"
        >
          Sign in
        </BaseButton>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <RouterLink to="/register" class="auth-link">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow:
    0 4px 24px rgba(45, 43, 61, 0.06),
    0 1px 4px rgba(45, 43, 61, 0.04);
  padding: 40px 36px;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-logo {
  font-size: 36px;
  margin-bottom: 12px;
  line-height: 1;
}

.auth-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}

.auth-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.server-error {
  background: var(--error-light);
  border: 1px solid var(--error);
  border-radius: 10px;
  padding: 10px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--error);
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-muted);
}

.auth-link {
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}

.auth-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}
</style>
