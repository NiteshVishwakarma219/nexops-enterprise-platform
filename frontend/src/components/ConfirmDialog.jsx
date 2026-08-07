import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Are you sure?', description, isLoading, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} />
        </div>
        <p className="text-sm text-slate-400 pt-1.5">{description}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button className="btn-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
