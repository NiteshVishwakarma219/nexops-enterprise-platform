import { useEffect, useState } from 'react'
import { Plus, Check, X, Ban, CalendarClock, Loader2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import DataTable from '../../components/DataTable'
import Badge from '../../components/Badge'
import IconButton from '../../components/IconButton'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import FormField, { TextInput, Select, TextArea } from '../../components/FormField'
import { usePaginatedFetch } from '../../hooks/usePaginatedFetch'
import * as leaveService from '../../services/leaveService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { validateForm, isRequired } from '../../utils/validators'
import { extractErrorMessage } from '../../services/api'
import { formatDate } from '../../utils/formatters'

const LEAVE_TYPES = ['sick', 'casual', 'annual', 'unpaid', 'maternity', 'paternity']

function ApplyLeaveModal({ isOpen, onClose, onSaved }) {
  const { showToast } = useToast()
  const [values, setValues] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) { setValues({ leave_type: 'casual', start_date: '', end_date: '', reason: '' }); setErrors({}) }
  }, [isOpen])

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm(values, {
      start_date: [isRequired], end_date: [isRequired],
      reason: [isRequired, (v) => (v && v.length < 5 ? 'Please provide a bit more detail' : null)],
    })
    if (values.start_date && values.end_date && values.end_date < values.start_date) {
      validationErrors.end_date = 'End date must be on or after start date'
    }
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    setIsSubmitting(true)
    try {
      await leaveService.applyLeave(values)
      showToast('Leave request submitted', 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Leave Type">
          <Select name="leave_type" value={values.leave_type} onChange={handleChange}>
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Start Date" required error={errors.start_date}>
            <TextInput name="start_date" type="date" value={values.start_date} onChange={handleChange} error={errors.start_date} />
          </FormField>
          <FormField label="End Date" required error={errors.end_date}>
            <TextInput name="end_date" type="date" value={values.end_date} onChange={handleChange} error={errors.end_date} />
          </FormField>
        </div>
        <FormField label="Reason" required error={errors.reason}>
          <TextArea name="reason" value={values.reason} onChange={handleChange} error={errors.reason} placeholder="Briefly describe the reason for your leave..." />
        </FormField>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ReviewModal({ isOpen, onClose, onSaved, leave, decision }) {
  const { showToast } = useToast()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => { if (isOpen) setComment('') }, [isOpen])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await leaveService.reviewLeave(leave.id, { status: decision, review_comment: comment || null })
      showToast(`Leave request ${decision}`, 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={decision === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'} size="sm">
      <p className="text-sm text-slate-400 mb-4">
        {leave?.employee_name}'s {leave?.leave_type} leave from {formatDate(leave?.start_date)} to {formatDate(leave?.end_date)}.
      </p>
      <FormField label="Comment (optional)">
        <TextArea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a note for the employee..." />
      </FormField>
      <div className="flex justify-end gap-3 mt-6">
        <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
        <button className={decision === 'approved' ? 'btn-primary' : 'btn-danger'} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : decision === 'approved' ? 'Approve' : 'Reject'}
        </button>
      </div>
    </Modal>
  )
}

export default function Leave() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const canReview = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER].includes(user?.role)

  const [applyOpen, setApplyOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewDecision, setReviewDecision] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading, error, page, setPage, sort, toggleSort, reload } = usePaginatedFetch(
    leaveService.listLeaves, { status: statusFilter || undefined }, { sort_by: 'created_at', sort_dir: 'desc' }
  )

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await leaveService.cancelLeave(cancelTarget.id)
      showToast('Leave request cancelled', 'success')
      setCancelTarget(null)
      reload()
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsCancelling(false)
    }
  }

  const columns = [
    ...(canReview ? [{ key: 'employee_name', label: 'Employee' }] : []),
    { key: 'leave_type', label: 'Type', render: (row) => <span className="capitalize">{row.leave_type}</span> },
    { key: 'start_date', label: 'From', render: (row) => formatDate(row.start_date) },
    { key: 'end_date', label: 'To', render: (row) => formatDate(row.end_date) },
    { key: 'reason', label: 'Reason', render: (row) => <span className="max-w-xs truncate block">{row.reason}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge status={row.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description={canReview ? "Review and manage employee leave requests." : "Apply for and track your leave requests."}
        actions={<button className="btn-primary" onClick={() => setApplyOpen(true)}><Plus size={16} /> Apply for Leave</button>}
      />

      <DataTable
        columns={columns} rows={data.items} isLoading={isLoading} error={error}
        sort={sort} onSort={toggleSort} page={page} totalPages={data.total_pages}
        total={data.total} onPageChange={setPage} emptyTitle="No leave requests" emptyIcon={CalendarClock}
        filters={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="!w-auto">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        }
        actions={(row) => (
          <>
            {canReview && row.status === 'pending' && (
              <>
                <IconButton icon={Check} title="Approve" variant="brand" onClick={() => { setReviewTarget(row); setReviewDecision('approved') }} />
                <IconButton icon={X} title="Reject" variant="danger" onClick={() => { setReviewTarget(row); setReviewDecision('rejected') }} />
              </>
            )}
            {row.status === 'pending' && (
              <IconButton icon={Ban} title="Cancel" variant="danger" onClick={() => setCancelTarget(row)} />
            )}
          </>
        )}
      />

      <ApplyLeaveModal isOpen={applyOpen} onClose={() => setApplyOpen(false)} onSaved={reload} />
      <ReviewModal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)} onSaved={reload} leave={reviewTarget} decision={reviewDecision} />
      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} isLoading={isCancelling}
        title="Cancel leave request" description="This pending request will be cancelled." confirmLabel="Cancel Request" />
    </div>
  )
}
