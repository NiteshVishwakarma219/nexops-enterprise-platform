import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, FolderKanban, Loader2, X as XIcon } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import FormField, { TextInput, Select, TextArea } from '../../components/FormField'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as projectService from '../../services/projectService'
import * as employeeService from '../../services/employeeService'
import * as departmentService from '../../services/departmentService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { validateForm, isRequired } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/formatters'

const STATUSES = ['planned', 'in_progress', 'on_hold', 'completed', 'cancelled']

function ProjectFormModal({ isOpen, onClose, onSaved, project, employees, departments }) {
  const { showToast } = useToast()
  const isEdit = !!project
  const [values, setValues] = useState({})
  const [members, setMembers] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(isEdit
        ? { name: project.name, description: project.description || '', status: project.status,
            start_date: project.start_date || '', end_date: project.end_date || '',
            department_id: project.department_id || '', lead_id: project.lead_id || '' }
        : { name: '', description: '', status: 'planned', start_date: '', end_date: '', department_id: '', lead_id: '' })
      setMembers(isEdit ? project.members.map((m) => m.employee_id) : [])
      setErrors({})
    }
  }, [isOpen, project, isEdit])

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const toggleMember = (empId) => {
    setMembers((prev) => prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, { name: [isRequired] })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setIsSubmitting(true)
    try {
      const payload = {
        ...values, department_id: values.department_id || null, lead_id: values.lead_id || null,
        start_date: values.start_date || null, end_date: values.end_date || null,
      }
      if (isEdit) {
        await projectService.updateProject(project.id, payload)
        showToast('Project updated', 'success')
      } else {
        payload.members = members.map((id) => ({ employee_id: id }))
        await projectService.createProject(payload)
        showToast('Project created', 'success')
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Project' : 'New Project'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Project Name" required error={errors.name}>
          <TextInput name="name" value={values.name || ''} onChange={handleChange} error={errors.name} placeholder="Q3 Platform Migration" />
        </FormField>
        <FormField label="Description">
          <TextArea name="description" value={values.description || ''} onChange={handleChange} placeholder="Project goals and scope..." />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Status">
            <Select name="status" value={values.status || 'planned'} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
          <FormField label="Start Date">
            <TextInput name="start_date" type="date" value={values.start_date || ''} onChange={handleChange} />
          </FormField>
          <FormField label="End Date">
            <TextInput name="end_date" type="date" value={values.end_date || ''} onChange={handleChange} />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Department">
            <Select name="department_id" value={values.department_id || ''} onChange={handleChange}>
              <option value="">None</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Project Lead">
            <Select name="lead_id" value={values.lead_id || ''} onChange={handleChange}>
              <option value="">Unassigned</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </Select>
          </FormField>
        </div>
        {!isEdit && (
          <FormField label="Team Members">
            <div className="border border-surface-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-1.5">
              {employees.map((e) => (
                <label key={e.id} className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={members.includes(e.id)} onChange={() => toggleMember(e.id)} className="rounded border-surface-border" />
                  {e.full_name}
                </label>
              ))}
            </div>
          </FormField>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.MANAGER].includes(user?.role)
  const canDelete = user?.role === ROLES.ADMIN

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewing, setViewing] = useState(null)

  const { data, isLoading, error, page, setPage, search, setSearch, sort, toggleSort, reload } = usePaginatedFetch(
    projectService.listProjects, { status: statusFilter || undefined }, { sort_by: 'created_at', sort_dir: 'desc' }
  )

  useEffect(() => {
    employeeService.listEmployees({ page: 1, page_size: 200 }).then((res) => setEmployees(res.data.items))
    departmentService.listDepartments({ page: 1, page_size: 100 }).then((res) => setDepartments(res.data.items))
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await projectService.deleteProject(deleteTarget.id)
      showToast('Project deleted', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Project', sortable: true, render: (row) => (
      <button className="text-slate-200 font-medium hover:text-brand-400 transition" onClick={() => setViewing(row)}>{row.name}</button>
    )},
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'lead_name', label: 'Lead', render: (row) => row.lead_name || '—' },
    { key: 'start_date', label: 'Start', render: (row) => formatDate(row.start_date) },
    { key: 'end_date', label: 'End', render: (row) => formatDate(row.end_date) },
    { key: 'members', label: 'Team', render: (row) => `${row.members.length} members` },
  ]

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Plan, track, and staff projects across your organization."
        actions={canManage && <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus size={16} /> New Project</button>}
      />

      <DataTable
        columns={columns} rows={data.items} isLoading={isLoading} error={error}
        search={search} onSearchChange={setSearch} searchPlaceholder="Search projects..."
        sort={sort} onSort={toggleSort} page={page} totalPages={data.total_pages}
        total={data.total} onPageChange={setPage} emptyTitle="No projects yet" emptyIcon={FolderKanban}
        filters={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </Select>
        }
        actions={(row) => (
          <>
            {canManage && <IconButton icon={Pencil} title="Edit" onClick={() => { setEditing(row); setFormOpen(true) }} />}
            {canDelete && <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => setDeleteTarget(row)} />}
          </>
        )}
      />

      <ProjectFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={reload} project={editing} employees={employees} departments={departments} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete project" description={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />

      <Modal isOpen={!!viewing} onClose={() => setViewing(null)} title={viewing?.name} size="lg">
        {viewing && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">{viewing.description || 'No description provided.'}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-slate-500 mb-1">Status</p><Badge status={viewing.status} /></div>
              <div><p className="text-xs text-slate-500 mb-1">Lead</p><p className="text-slate-300">{viewing.lead_name || '—'}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">Start Date</p><p className="text-slate-300">{formatDate(viewing.start_date)}</p></div>
              <div><p className="text-xs text-slate-500 mb-1">End Date</p><p className="text-slate-300">{formatDate(viewing.end_date)}</p></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-2">Team Members ({viewing.members.length})</p>
              <div className="flex flex-wrap gap-2">
                {viewing.members.length === 0 && <p className="text-sm text-slate-500">No members assigned yet.</p>}
                {viewing.members.map((m) => (
                  <span key={m.employee_id} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-surface-border px-3 py-1 text-xs text-slate-300">
                    {m.employee_name}{m.role_in_project ? ` · ${m.role_in_project}` : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
