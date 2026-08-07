import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarCheck2, Loader2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import FormField, { TextInput, Select } from '../../components/FormField'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as attendanceService from '../../services/attendanceService'
import * as employeeService from '../../services/employeeService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { validateForm, isRequired } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'
import { formatDate, formatDateTime } from '../../utils/formatters'

const STATUSES = ['present', 'absent', 'half_day', 'late', 'work_from_home']

function AttendanceFormModal({ isOpen, onClose, onSaved, record, employees }) {
  const { showToast } = useToast()
  const isEdit = !!record
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(isEdit
        ? { check_in: record.check_in ? record.check_in.slice(0, 16) : '', check_out: record.check_out ? record.check_out.slice(0, 16) : '', status: record.status }
        : { employee_id: '', date: new Date().toISOString().slice(0, 10), check_in: '', check_out: '', status: 'present' })
      setErrors({})
    }
  }, [isOpen, record, isEdit])

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const rules = isEdit ? {} : { employee_id: [isRequired], date: [isRequired] }
    const validationErrors = validateForm(values, rules)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setIsSubmitting(true)
    try {
      const payload = {
        ...values,
        check_in: values.check_in ? new Date(values.check_in).toISOString() : null,
        check_out: values.check_out ? new Date(values.check_out).toISOString() : null,
      }
      if (isEdit) {
        await attendanceService.updateAttendance(record.id, payload)
        showToast('Attendance updated', 'success')
      } else {
        await attendanceService.markAttendance(payload)
        showToast('Attendance marked', 'success')
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Attendance' : 'Mark Attendance'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employee" required error={errors.employee_id}>
              <Select name="employee_id" value={values.employee_id || ''} onChange={handleChange} error={errors.employee_id}>
                <option value="">Select employee</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </Select>
            </FormField>
            <FormField label="Date" required error={errors.date}>
              <TextInput name="date" type="date" value={values.date || ''} onChange={handleChange} error={errors.date} />
            </FormField>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Check In">
            <TextInput name="check_in" type="datetime-local" value={values.check_in || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Check Out">
            <TextInput name="check_out" type="datetime-local" value={values.check_out || ''} onChange={handleChange} />
          </FormField>
        </div>
        <FormField label="Status">
          <Select name="status" value={values.status || 'present'} onChange={handleChange}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </Select>
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Save Changes' : 'Mark Attendance'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Attendance() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER].includes(user?.role)

  const [employees, setEmployees] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, page, setPage, sort, toggleSort, reload } = usePaginatedFetch(
    attendanceService.listAttendance, {}, { sort_by: 'date', sort_dir: 'desc' }
  )

  useEffect(() => {
    employeeService.listEmployees({ page: 1, page_size: 200 }).then((res) => setEmployees(res.data.items))
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await attendanceService.deleteAttendance(deleteTarget.id)
      showToast('Attendance record deleted', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'employee_name', label: 'Employee' },
    { key: 'date', label: 'Date', sortable: true, render: (row) => formatDate(row.date) },
    { key: 'check_in', label: 'Check In', render: (row) => row.check_in ? formatDateTime(row.check_in) : '—' },
    { key: 'check_out', label: 'Check Out', render: (row) => row.check_out ? formatDateTime(row.check_out) : '—' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track daily check-ins, check-outs, and attendance status."
        actions={canManage && <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus size={16} /> Mark Attendance</button>}
      />

      <DataTable
        columns={columns} rows={data.items} isLoading={isLoading} error={error}
        sort={sort} onSort={toggleSort} page={page} totalPages={data.total_pages}
        total={data.total} onPageChange={setPage} emptyTitle="No attendance records" emptyIcon={CalendarCheck2}
        actions={canManage ? (row) => (
          <>
            <IconButton icon={Pencil} title="Edit" onClick={() => { setEditing(row); setFormOpen(true) }} />
            <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => setDeleteTarget(row)} />
          </>
        ) : undefined}
      />

      <AttendanceFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={reload} record={editing} employees={employees} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete attendance record" description="This record will be permanently removed." />
    </div>
  )
}
