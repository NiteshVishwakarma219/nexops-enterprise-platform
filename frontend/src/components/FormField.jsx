/**
 * Standard labeled form field: input, select, or textarea with
 * inline validation error display. Used by every form in the app.
 */
export default function FormField({ label, error, required, children, hint }) {
  return (
    <div>
      {label && (
        <label className="label-text">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}

export function TextInput(props) {
  const { error, ...rest } = props
  return <input className={`input-field ${error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`} {...rest} />
}

export function TextArea(props) {
  const { error, ...rest } = props
  return <textarea className={`input-field resize-none ${error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : ''}`} rows={4} {...rest} />
}

export function Select({ error, children, ...rest }) {
  return (
    <select className={`input-field ${error ? 'border-red-500/60' : ''}`} {...rest}>
      {children}
    </select>
  )
}
