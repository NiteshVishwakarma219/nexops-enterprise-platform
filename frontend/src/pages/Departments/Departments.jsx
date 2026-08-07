import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import FormField, { TextInput, TextArea, Select } from '../../components/FormField'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as departmentService from '../../services/departmentService'
import * as employeeService from '../../services/employeeService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { validateForm, isRequired } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'
import { Loader2 } from 'lucide-react'

function DepartmentFormModal({ isOpen, onClose, onSaved, department, employees }) {
  const { showToast } = useToast()
  const isEdit = !!department
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(isEdit
        ? { name: department.name, code: department.code, description: department.description || '', manager_id: department.manager_id || '' }
        : { name: '', code: '', description: '', manager_id: '' })
      setErrors({})
    }
  }, [isOpen, department, isEdit])

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, { name: [isRequired], code: [isRequired] })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setIsSubmitting(true)
    try {
      const payload = { ...values, manager_id: values.manager_id || null }
      if (isEdit) {
        await departmentService.updateDepartment(department.id, payload)
        showToast('Department updated', 'success')
      } else {
        await departmentService.createDepartment(payload)
        showToast('Department created', 'success')
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Department' : 'Add Department'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Department Name" required error={errors.name}>
            <TextInput name="name" value={values.name || ''} onChange={handleChange} error={errors.name} placeholder="Engineering" />
          </FormField>
          <FormField label="Department Code" required error={errors.code}>
            <TextInput name="code" value={values.code || ''} onChange={handleChange} error={errors.code} placeholder="ENG" />
          </FormField>
        </div>
        <FormField label="Description">
          <TextArea name="description" value={values.description || ''} onChange={handleChange} placeholder="What this department does..." />
        </FormField>
        <FormField label="Department Manager">
          <Select name="manager_id" value={values.manager_id || ''} onChange={handleChange}>
            <option value="">Unassigned</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </Select>
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Save Changes' : 'Create Department'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Departments() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.HR].includes(user?.role)
  const canDelete = user?.role === ROLES.ADMIN

  const [employees, setEmployees] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, page, setPage, search, setSearch, sort, toggleSort, reload } = usePaginatedFetch(
    departmentService.listDepartments, {}, { sort_by: 'name', sort_dir: 'asc' }
  )

  useEffect(() => {
    employeeService.listEmployees({ page: 1, page_size: 200 }).then((res) => setEmployees(res.data.items))
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await departmentService.deleteDepartment(deleteTarget.id)
      showToast('Department deleted', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Department', sortable: true, render: (row) => (
      <div>
        <p className="text-slate-200 font-medium">{row.name}</p>
        <p className="text-xs text-slate-500">{row.code}</p>
      </div>
    )},
    { key: 'description', label: 'Description', render: (row) => <span className="text-slate-400">{row.description || '—'}</span> },
    { key: 'employee_count', label: 'Employees', sortable: true },
  ]

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize your company into departments and assign leadership."
        actions={canManage && <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus size={16} /> Add Department</button>}
      />

      <DataTable
        columns={columns} rows={data.items} isLoading={isLoading} error={error}
        search={search} onSearchChange={setSearch} searchPlaceholder="Search departments..."
        sort={sort} onSort={toggleSort} page={page} totalPages={data.total_pages}
        onPageChange={setPage} total={data.total}
        emptyTitle="No departments yet" emptyIcon={Building2}
        actions={(row) => (
          <>
            {canManage && <IconButton icon={Pencil} title="Edit" onClick={() => { setEditing(row); setFormOpen(true) }} />}
            {canDelete && <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => setDeleteTarget(row)} />}
          </>
        )}
      />

      <DepartmentFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={reload} department={editing} employees={employees} />
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete department" description={`Delete "${deleteTarget?.name}"? Departments with employees cannot be deleted.`}
      />
    </div>
  )
}
