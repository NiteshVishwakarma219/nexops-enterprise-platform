import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, Pencil, Trash2, UserPlus } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import Avatar from '../../components/Avatar'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Select } from '../../components/FormField'
import { resolveUploadUrl } from '../../services/api'
import EmployeeFormModal from './EmployeeFormModal'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as employeeService from '../../services/employeeService'
import * as departmentService from '../../services/departmentService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { extractErrorMessage } from '../../services/api'

export default function EmployeesList() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.HR].includes(user?.role)

  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departments, setDepartments] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, page, setPage, search, setSearch, sort, toggleSort, reload } = usePaginatedFetch(
    employeeService.listEmployees,
    { department_id: departmentFilter || undefined, status: statusFilter || undefined },
    { sort_by: 'full_name', sort_dir: 'asc' }
  )

  useEffect(() => {
    departmentService.listDepartments({ page: 1, page_size: 100 }).then((res) => setDepartments(res.data.items))
    employeeService.listEmployees({ page: 1, page_size: 200 }).then((res) => setAllEmployees(res.data.items))
  }, [])

  const openCreate = () => { setEditingEmployee(null); setFormOpen(true) }
  const openEdit = (emp) => { setEditingEmployee(emp); setFormOpen(true) }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await employeeService.deleteEmployee(deleteTarget.id)
      showToast('Employee deleted', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'full_name', label: 'Employee', sortable: true, render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.full_name} src={row.photo_path ? resolveUploadUrl(row.photo_path) : null} size="sm" />
        <div>
          <p className="text-slate-200 font-medium">{row.full_name}</p>
          <p className="text-xs text-slate-500">{row.employee_code}</p>
        </div>
      </div>
    )},
    { key: 'designation', label: 'Designation' },
    { key: 'department_name', label: 'Department', render: (row) => row.department_name || '—' },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'date_of_joining', label: 'Joined', render: (row) => formatDate(row.date_of_joining) },
    ...(canManage ? [{ key: 'salary', label: 'Salary', render: (row) => formatCurrency(row.salary) }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage your workforce, roles, and organizational structure."
        actions={canManage && (
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add Employee</button>
        )}
      />

      <DataTable
        columns={columns}
        rows={data.items}
        isLoading={isLoading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or code..."
        sort={sort}
        onSort={toggleSort}
        page={page}
        totalPages={data.total_pages}
        onPageChange={setPage}
        total={data.total}
        emptyTitle="No employees found"
        emptyDescription="Try a different search or add your first employee."
        emptyIcon={UserPlus}
        filters={
          <>
            <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="!w-auto">
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="probation">Probation</option>
              <option value="terminated">Terminated</option>
            </Select>
          </>
        }
        actions={(row) => (
          <>
            <Link to={`/employees/${row.id}`}><IconButton icon={Eye} title="View profile" /></Link>
            {canManage && <IconButton icon={Pencil} title="Edit" onClick={() => openEdit(row)} />}
            {canManage && <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => setDeleteTarget(row)} />}
          </>
        )}
      />

      <EmployeeFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={reload}
        employee={editingEmployee}
        departments={departments}
        employees={allEmployees}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete employee"
        description={`This will permanently remove ${deleteTarget?.full_name} and their account. This cannot be undone.`}
      />
    </div>
  )
}
