import { useEffect, useState } from 'react'
import { Plus, LifeBuoy, Loader2, Send, Trash2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import Avatar from '../../components/Avatar'
import FormField, { TextInput, Select, TextArea } from '../../components/FormField'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as ticketService from '../../services/ticketService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { validateForm, isRequired } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'
import { timeAgo } from '../../utils/formatters'

const CATEGORIES = ['it', 'hr', 'facilities', 'finance', 'other']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['open', 'in_progress', 'resolved', 'closed']

function CreateTicketModal({ isOpen, onClose, onSaved }) {
  const { showToast } = useToast()
  const [values, setValues] = useState({ subject: '', description: '', category: 'it', priority: 'medium' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { if (isOpen) { setValues({ subject: '', description: '', category: 'it', priority: 'medium' }); setErrors({}) } }, [isOpen])
  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, { subject: [isRequired], description: [isRequired] })
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setIsSubmitting(true)
    try {
      await ticketService.createTicket(values)
      showToast('Ticket submitted', 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise a Ticket">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Subject" required error={errors.subject}>
          <TextInput name="subject" value={values.subject} onChange={handleChange} error={errors.subject} placeholder="Brief summary of the issue" />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Category">
            <Select name="category" value={values.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select name="priority" value={values.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Description" required error={errors.description}>
          <TextArea name="description" value={values.description} onChange={handleChange} error={errors.description} placeholder="Describe the issue in detail..." />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function TicketDetailModal({ ticket, isOpen, onClose, onUpdated, canManage }) {
  const { showToast } = useToast()
  const [comment, setComment] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState(ticket?.status)
  const [priority, setPriority] = useState(ticket?.priority)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => { setStatus(ticket?.status); setPriority(ticket?.priority) }, [ticket])

  if (!ticket) return null

  const handleComment = async () => {
    if (!comment.trim()) return
    setIsSending(true)
    try {
      await ticketService.addTicketComment(ticket.id, comment)
      setComment('')
      onUpdated()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSending(false)
    }
  }

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    try {
      await ticketService.updateTicket(ticket.id, { status, priority })
      showToast('Ticket updated', 'success')
      onUpdated()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket.subject} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge status={ticket.status} /><Badge status={ticket.priority} />
          <span className="text-xs text-slate-500 capitalize">{ticket.category}</span>
          <span className="text-xs text-slate-500 ml-auto">Raised by {ticket.raised_by_name}</span>
        </div>
        <p className="text-sm text-slate-300 bg-white/[0.02] border border-surface-border rounded-lg p-4">{ticket.description}</p>

        {canManage && (
          <div className="grid grid-cols-2 gap-4 items-end">
            <FormField label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </Select>
            </FormField>
            <div className="flex gap-3">
              <FormField label="Priority" >
                <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </FormField>
              <button className="btn-primary shrink-0 self-end" onClick={handleStatusUpdate} disabled={isUpdating}>
                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-slate-400 mb-3">Comments ({ticket.comments.length})</p>
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            {ticket.comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
            {ticket.comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.author_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-200">{c.author_name}</p><p className="text-xs text-slate-500">{timeAgo(c.created_at)}</p></div>
                  <p className="text-sm text-slate-400 mt-0.5">{c.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input value={comment} onChange={(e) => setComment(e.target.value)} className="input-field" placeholder="Write a comment..." onKeyDown={(e) => e.key === 'Enter' && handleComment()} />
            <button className="btn-primary shrink-0 !px-3.5" onClick={handleComment} disabled={isSending}>
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function Tickets() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER].includes(user?.role)
  const canDelete = user?.role === ROLES.ADMIN

  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data, isLoading, error, page, setPage, search, setSearch, sort, toggleSort, reload } = usePaginatedFetch(
    ticketService.listTickets,
    { status: statusFilter || undefined, priority: priorityFilter || undefined },
    { sort_by: 'created_at', sort_dir: 'desc' }
  )

  const openTicket = async (row) => {
    const res = await ticketService.getTicket(row.id)
    setSelectedTicket(res.data)
  }

  const refreshSelected = async () => {
    if (selectedTicket) {
      const res = await ticketService.getTicket(selectedTicket.id)
      setSelectedTicket(res.data)
    }
    reload()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await ticketService.deleteTicket(deleteTarget.id)
      showToast('Ticket deleted', 'success')
      setDeleteTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    { key: 'subject', label: 'Subject', render: (row) => (
      <button className="text-slate-200 font-medium hover:text-brand-400 transition text-left" onClick={() => openTicket(row)}>{row.subject}</button>
    )},
    ...(canManage ? [{ key: 'raised_by_name', label: 'Raised By' }] : []),
    { key: 'category', label: 'Category', render: (row) => <span className="uppercase text-xs">{row.category}</span> },
    { key: 'priority', label: 'Priority', render: (row) => <Badge status={row.priority} /> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
    { key: 'created_at', label: 'Created', render: (row) => timeAgo(row.created_at) },
  ]

  return (
    <div>
      <PageHeader
        title="Help Desk"
        description={canManage ? "Manage and resolve support tickets across the company." : "Raise and track your support requests."}
        actions={<button className="btn-primary" onClick={() => setCreateOpen(true)}><Plus size={16} /> Raise a Ticket</button>}
      />

      <DataTable
        columns={columns} rows={data.items} isLoading={isLoading} error={error}
        search={search} onSearchChange={setSearch} searchPlaceholder="Search tickets..."
        sort={sort} onSort={toggleSort} page={page} totalPages={data.total_pages}
        total={data.total} onPageChange={setPage} emptyTitle="No tickets found" emptyIcon={LifeBuoy}
        filters={
          <>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="!w-auto">
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </>
        }
        actions={canDelete ? (row) => <IconButton icon={Trash2} title="Delete" variant="danger" onClick={() => setDeleteTarget(row)} /> : undefined}
      />

      <CreateTicketModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSaved={reload} />
      <TicketDetailModal ticket={selectedTicket} isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} onUpdated={refreshSelected} canManage={canManage} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete ticket" description={`Delete "${deleteTarget?.subject}"? This cannot be undone.`} />
    </div>
  )
}
