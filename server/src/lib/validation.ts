const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: unknown): email is string {
  return typeof email === 'string' && EMAIL_REGEX.test(email)
}

export function validatePassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 6
}

export function validateName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length > 0
}
