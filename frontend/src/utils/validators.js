// Reusable client-side validation helpers shared across every form in the app.

export const isRequired = (value) => {
  if (value === null || value === undefined) return 'This field is required'
  if (typeof value === 'string' && value.trim() === '') return 'This field is required'
  return null
}

export const isEmail = (value) => {
  if (!value) return null
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(value) ? null : 'Enter a valid email address'
}

export const minLength = (len) => (value) => {
  if (!value) return null
  return value.length >= len ? null : `Must be at least ${len} characters`
}

export const isStrongPassword = (value) => {
  if (!value) return null
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter'
  if (!/[0-9]/.test(value)) return 'Include at least one number'
  return null
}

export const passwordsMatch = (password) => (confirm) => {
  if (!confirm) return null
  return password === confirm ? null : 'Passwords do not match'
}

export const dateNotInFuture = (value) => {
  if (!value) return null
  return new Date(value) <= new Date() ? null : 'Date cannot be in the future'
}

/**
 * Runs a map of { field: [validatorFns] } against a values object.
 * Returns { field: errorMessage } for only the fields that failed.
 */
export function validateForm(values, rules) {
  const errors = {}
  for (const field in rules) {
    for (const validator of rules[field]) {
      const error = validator(values[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  return errors
}
