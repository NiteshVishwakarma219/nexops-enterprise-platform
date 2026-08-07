/**
 * Create / Edit employee modal. Handles both flows since the fields
 * mostly overlap (create additionally needs email/password/employee code).
 */
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '../../components/Modal'
import FormField, { TextInput, Select } from '../../components/FormField'
import { validateForm, isRequired, isEmail, isStrongPassword } from '../../utils/validators'
import * as employeeService from '../../services/employeeService'
import { extractErrorMessage } from '../../services/api'
import { useToast } from '../../context/ToastContext'

const STATUS_OPTIONS = ['active', 'on_leave', 'probation', 'terminated']

export default function EmployeeFormModal({ isOpen, onClose, onSaved, employee, departments, employees }) {
  const { showToast } = useToast()
  const isEdit = !!employee
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(
        isEdit
          ? {
              full_name: employee.full_name, designation: employee.designation,
              department_id: employee.department_id || '', phone: employee.phone || '',
              address: employee.address || '', date_of_birth: employee.date_of_birth || '',
              date_of_joining: employee.date_of_joining || '', status: employee.status,
              salary: employee.salary || '', manager_id: employee.manager_id || '',
            }
          : {
              email: '', password: '', full_name: '', employee_code: '', designation: '',
              department_id: '', phone: '', address: '', date_of_birth: '',
              date_of_joining: '', status: 'active', salary: '', manager_id: '',
            }
      )
      setErrors({})
    }
  }, [isOpen, employee, isEdit])

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const rules = isEdit
      ? { full_name: [isRequired], designation: [isRequired], date_of_joining: [isRequired] }
      : { email: [isRequired, isEmail], password: [isStrongPassword], full_name: [isRequired], employee_code: [isRequired], designation: [isRequired], date_of_joining: [isRequired] }
    const validationErrors = validateForm(values, rules)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        department_id: values.department_id || null,
        manager_id: values.manager_id || null,
        salary: values.salary === '' ? null : Number(values.salary),
        date_of_birth: values.date_of_birth || null,
      }
      if (isEdit) {
        await employeeService.updateEmployee(employee.id, payload)
        showToast('Employee updated successfully', 'success')
      } else {
        await employeeService.createEmployee(payload)
        showToast('Employee created successfully', 'success')
      }
      onSaved()
      onClose()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Employee' : 'Add Employee'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" required error={errors.email}>
              <TextInput name="email" type="email" value={values.email || ''} onChange={handleChange} error={errors.email} placeholder="employee@company.com" />
            </FormField>
            <FormField label="Temporary Password" required error={errors.password} hint="Min 8 characters, 1 uppercase, 1 number">
              <TextInput name="password" type="password" value={values.password || ''} onChange={handleChange} error={errors.password} />
            </FormField>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.full_name}>
            <TextInput name="full_name" value={values.full_name || ''} onChange={handleChange} error={errors.full_name} placeholder="Jane Doe" />
          </FormField>
          {!isEdit && (
            <FormField label="Employee Code" required error={errors.employee_code}>
              <TextInput name="employee_code" value={values.employee_code || ''} onChange={handleChange} error={errors.employee_code} placeholder="EMP-0006" />
            </FormField>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Designation" required error={errors.designation}>
            <TextInput name="designation" value={values.designation || ''} onChange={handleChange} error={errors.designation} placeholder="Software Engineer" />
          </FormField>
          <FormField label="Department">
            <Select name="department_id" value={values.department_id || ''} onChange={handleChange}>
              <option value="">Unassigned</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Phone">
            <TextInput name="phone" value={values.phone || ''} onChange={handleChange} placeholder="+1-555-0100" />
          </FormField>
          <FormField label="Manager">
            <Select name="manager_id" value={values.manager_id || ''} onChange={handleChange}>
              <option value="">No manager</option>
              {employees.filter((e) => e.id !== employee?.id).map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Date of Birth">
            <TextInput name="date_of_birth" type="date" value={values.date_of_birth || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Date of Joining" required error={errors.date_of_joining}>
            <TextInput name="date_of_joining" type="date" value={values.date_of_joining || ''} onChange={handleChange} error={errors.date_of_joining} />
          </FormField>
          <FormField label="Status">
            <Select name="status" value={values.status || 'active'} onChange={handleChange}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Salary (Annual USD)">
            <TextInput name="salary" type="number" min="0" value={values.salary || ''} onChange={handleChange} placeholder="95000" />
          </FormField>
          <FormField label="Address">
            <TextInput name="address" value={values.address || ''} onChange={handleChange} placeholder="123 Main St, City" />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
