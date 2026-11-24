import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

// Generic create/edit form driven by a field list.
// Validates on the client first, then shows any field errors the API returns next to the field.
function validate(fields, values) {
  const errors = {}
  for (const field of fields) {
    const value = values[field.name]
    const empty = value === '' || value === null || value === undefined
    if (field.required && empty) errors[field.name] = `${field.label} is required.`
    else if (field.maxLength && String(value ?? '').length > field.maxLength)
      errors[field.name] = `${field.label} must be at most ${field.maxLength} characters.`
    else if (field.type === 'number' && !empty && Number(value) < (field.min ?? -Infinity))
      errors[field.name] = `${field.label} must be at least ${field.min}.`
  }
  return errors
}

export default function EntityForm({ fields, initialValues, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const setValue = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const clientErrors = validate(fields, values)
    setErrors(clientErrors)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) {
      document.getElementById(`field-${Object.keys(clientErrors)[0]}`)?.focus()
      return
    }

    setSaving(true)
    try {
      await onSubmit(values)
    } catch (error) {
      setErrors(error.fieldErrors ?? {})
      if (!error.fieldErrors || Object.keys(error.fieldErrors).length === 0) setFormError(error.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {formError && (
          <p role="alert" className="flex items-start gap-2 bg-danger-tint p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}
        {fields.map((field) => {
          const id = `field-${field.name}`
          const error = errors[field.name]
          const common = {
            id,
            name: field.name,
            value: values[field.name] ?? '',
            onChange: (e) => setValue(field.name, e.target.value),
            'aria-invalid': Boolean(error),
            'aria-describedby': error ? `${id}-error` : field.hint ? `${id}-hint` : undefined,
            className: `field-input ${error ? 'border-danger' : ''}`,
          }

          return (
            <div key={field.name}>
              <label htmlFor={id} className="field-label">
                {field.label}
                {!field.required && <span className="font-normal text-muted"> (optional)</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea {...common} rows={4} className={`${common.className} py-2`} />
              ) : field.type === 'select' ? (
                <select {...common}>
                  <option value="">Select {field.label.toLowerCase()}…</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...common}
                  type={field.type ?? 'text'}
                  inputMode={field.type === 'number' ? 'decimal' : undefined}
                  step={field.step}
                  min={field.min}
                />
              )}
              {error ? (
                <p id={`${id}-error`} className="field-error">
                  {error}
                </p>
              ) : (
                field.hint && (
                  <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
                    {field.hint}
                  </p>
                )
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-solid">
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
