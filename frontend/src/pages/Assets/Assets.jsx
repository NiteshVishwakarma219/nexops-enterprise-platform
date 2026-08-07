import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Boxes, Loader2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import FormField, { TextInput, Select, TextArea } from '../../components/FormField'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as assetService from '../../services/assetService'
import * as employeeService from '../../services/employeeService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { validateForm, isRequired } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'
import { formatCurrency, formatDate } from '../../utils/formatters'

const CATEGORIES = ['laptop', 'desktop', 'monitor', 'mobile', 'accessory', 'software_license', 'other']
const STATUSES = ['available', 'assigned', 'under_repair', 'retired']

function AssetFormModal({ isOpen, onClose, onSaved, asset, employees }) {
  const { showToast } = useToast()
  const isEdit = !!asset
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setValues(isEdit
        ? { asset_tag: asset.asset_tag, name: asset.name, category: asset.category, status: asset.status,
            purchase_date: asset.purchase_date || '', purchase_cost: asset.purchase_cost || '',
            warranty_expiry: asset.warranty_expiry || '', assigned_to_id: asset.assigned_to_id || '', notes: asset.notes || '' }
        : { asset_tag: '', name: '', category: 'laptop', status: 'available', purchase_date: '', purchase_cost: '', warranty_expiry: '', assigned_to_id: '', notes: '' })
      setErrors({})
    }
  }, [isOpen, asset, isEdit])

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, { asset_tag: [isRequired], name: [isRequired] })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setIsSubmitting(true)
    try {
      const payload = {
        ...values, assigned_to_id: values.assigned_to_id || null,
        purchase_cost: values.purchase_cost === '' ? null : Number(values.purchase_cost),
        purchase_date: values.purchase_date || null, warranty_expiry: values.warranty_expiry || null,
      }
      if (isEdit) {
        await assetService.updateAsset(asset.id, payload)
        showToast('Asset updated', 'success')
      } else {
        await assetService.createAsset(payload)
        showToast('Asset created', 'success')
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Asset' : 'Add Asset'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Asset Tag" required error={errors.asset_tag}>
            <TextInput name="asset_tag" value={values.asset_tag || ''} onChange={handleChange} error={errors.asset_tag} placeholder="AST-1005" />
          </FormField>
          <FormField label="Asset Name" required error={errors.name}>
            <TextInput name="name" value={values.name || ''} onChange={handleChange} error={errors.name} placeholder="MacBook Pro 16&quot;" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category">
            <Select name="category" value={values.category || 'laptop'} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select name="status" value={values.status || 'available'} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Assigned To">
          <Select name="assigned_to_id" value={values.assigned_to_id || ''} onChange={handleChange}>
            <option value="">Unassigned</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </Select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Purchase Date">
            <TextInput name="purchase_date" type="date" value={values.purchase_date || ''} onChange={handleChange} />
          </FormField>
          <FormField label="Purchase Cost (USD)">
            <TextInput name="purchase_cost" type="number" min="0" value={values.purchase_cost || ''} onChange={handleChange} placeholder="1200" />
          </FormField>
          <FormField label="Warranty Expiry">
            <TextInput name="warranty_expiry" type="date" value={values.warranty_expiry || ''} onChange={handleChange} />
          </FormField>
        </div>
        <FormField label="Notes">
          <TextArea name="notes" value={values.notes || ''} onChange={handleChange} placeholder="Additional notes..." />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'Save Changes' : 'Create Asset'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Assets() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.HR].includes(user?.role)
  const canDelete = user?.role === ROLES.ADMIN

  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [employees, setEmployees] = useState([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, page, setPage, search, setSearch, sort, toggleSort, reload } = usePaginatedFetch(
    assetService.listAssets,
    { category: categoryFilter || undefined, status: statusFilter || undefined },
    { sort_by: 'name', sort_dir: 'asc' }
  )

  useEffect(() => {
    employeeService.listEmployees({ page: 1, page_size: 200 }).then((res) => setEmployees(res.data.items))
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await assetService.deleteAsset(deleteTarget.id)
      showToast('Asset deleted', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Asset', sortable: true, render: (row) => (
      <div><p className="text-slate-200 font-medium">{row.name}</p><p className="text-xs text-slate-500">{row.asset_tag}</p></div>
    )},
    { key: 'category', label: 'Category', render: (row) => <span className="capitalize">{row.category.replace('_', ' ')}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'assigned_to_name', label: 'Assigned To', render: (row) => row.assigned_to_name || '—' },
    { key: 'purchase_cost', label: 'Cost', render: (row) => formatCurrency(row.purchase_cost) },
    { key: 'warranty_expiry', label: 'Warranty', render: (row) => formatDate(row.warranty_expiry) },
  ]

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Track company hardware, software licenses, and equipment."
        actions={canManage && <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus size={16} /> Add Asset</button>}
      />

      <DataTable
        columns={columns} rows={data.items} isLoading={isLoading} error={error}
        search={search} onSearchChange={setSearch} searchPlaceholder="Search assets..."
        sort={sort} onSort={toggleSort} page={page} totalPages={data.total_pages}
        onPageChange={setPage} total={data.total} emptyTitle="No assets found" emptyIcon={Boxes}
        filters={
          <>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="!w-auto">
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
          </>
        }
        actions={(row) => (
          <>
            {canManage && <IconButton icon={Pencil} title="Edit" onClick={() => { setEditing(row); setFormOpen(true) }} />}
            {canDelete && <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => setDeleteTarget(row)} />}
          </>
        )}
      />

      <AssetFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSaved={reload} asset={editing} employees={employees} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete asset" description={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  )
}
