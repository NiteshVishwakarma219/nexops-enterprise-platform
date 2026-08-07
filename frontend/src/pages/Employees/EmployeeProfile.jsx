import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Building2, DollarSign, Upload, FileText, Pencil } from 'lucide-react'
import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import Loader from '../../components/Loader'
import EmployeeFormModal from './EmployeeFormModal'
import * as employeeService from '../../services/employeeService'
import * as departmentService from '../../services/departmentService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../constants/roles'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { extractErrorMessage, resolveUploadUrl } from '../../services/api'

const DOC_TYPES = [
  { key: 'photo', label: 'Profile Photo', field: 'photo_path' },
  { key: 'resume', label: 'Resume', field: 'resume_path' },
  { key: 'offer_letter', label: 'Offer Letter', field: 'offer_letter_path' },
  { key: 'id_proof', label: 'ID Proof', field: 'id_proof_path' },
]

export default function EmployeeProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const canManage = [ROLES.ADMIN, ROLES.HR].includes(user?.role)

  const [employee, setEmployee] = useState(null)
  const [departments, setDepartments] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [uploadingKey, setUploadingKey] = useState(null)
  const fileInputRefs = useRef({})

  const load = () => {
    setIsLoading(true)
    employeeService.getEmployee(id).then((res) => setEmployee(res.data)).finally(() => setIsLoading(false))
  }

  useEffect(() => {
    load()
    departmentService.listDepartments({ page: 1, page_size: 100 }).then((res) => setDepartments(res.data.items))
    employeeService.listEmployees({ page: 1, page_size: 200 }).then((res) => setAllEmployees(res.data.items))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleFileSelected = async (docType, file) => {
    if (!file) return
    setUploadingKey(docType)
    try {
      const res = await employeeService.uploadEmployeeDocument(id, docType, file)
      setEmployee(res.data)
      showToast('Document uploaded successfully', 'success')
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setUploadingKey(null)
    }
  }

  if (isLoading || !employee) return <Loader fullHeight label="Loading employee profile..." />

  return (
    <div>
      <button onClick={() => navigate('/employees')} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={15} /> Back to employees
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar name={employee.full_name} size="lg" src={employee.photo_path ? resolveUploadUrl(employee.photo_path) : null} />
            <h2 className="text-lg font-semibold text-slate-50 mt-4">{employee.full_name}</h2>
            <p className="text-sm text-slate-500">{employee.designation}</p>
            <div className="mt-3"><Badge status={employee.status} /></div>
            {canManage && (
              <button className="btn-secondary w-full mt-5" onClick={() => setEditOpen(true)}>
                <Pencil size={14} /> Edit Employee
              </button>
            )}
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-400"><Mail size={15} className="shrink-0" /> {employee.email}</div>
            {employee.phone && <div className="flex items-center gap-3 text-slate-400"><Phone size={15} className="shrink-0" /> {employee.phone}</div>}
            {employee.address && <div className="flex items-center gap-3 text-slate-400"><MapPin size={15} className="shrink-0" /> {employee.address}</div>}
            <div className="flex items-center gap-3 text-slate-400"><Building2 size={15} className="shrink-0" /> {employee.department_name || 'Unassigned'}</div>
            <div className="flex items-center gap-3 text-slate-400"><Briefcase size={15} className="shrink-0" /> Reports to {employee.manager_name || '—'}</div>
            <div className="flex items-center gap-3 text-slate-400"><Calendar size={15} className="shrink-0" /> Joined {formatDate(employee.date_of_joining)}</div>
            {canManage && (
              <div className="flex items-center gap-3 text-slate-400"><DollarSign size={15} className="shrink-0" /> {formatCurrency(employee.salary)} / year</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <p className="text-sm font-medium text-slate-300 mb-4">Employee Details</p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div><dt className="text-xs text-slate-500 mb-1">Employee Code</dt><dd className="text-slate-200">{employee.employee_code}</dd></div>
              <div><dt className="text-xs text-slate-500 mb-1">Date of Birth</dt><dd className="text-slate-200">{formatDate(employee.date_of_birth)}</dd></div>
              <div><dt className="text-xs text-slate-500 mb-1">Department</dt><dd className="text-slate-200">{employee.department_name || '—'}</dd></div>
              <div><dt className="text-xs text-slate-500 mb-1">Designation</dt><dd className="text-slate-200">{employee.designation}</dd></div>
              <div><dt className="text-xs text-slate-500 mb-1">Status</dt><dd><Badge status={employee.status} /></dd></div>
              <div><dt className="text-xs text-slate-500 mb-1">Manager</dt><dd className="text-slate-200">{employee.manager_name || '—'}</dd></div>
            </dl>
          </div>

          {canManage && (
            <div className="card p-6">
              <p className="text-sm font-medium text-slate-300 mb-4">Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOC_TYPES.map((doc) => {
                  const hasFile = !!employee[doc.field]
                  return (
                    <div key={doc.key} className="flex items-center justify-between rounded-lg border border-surface-border px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${hasFile ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-300 truncate">{doc.label}</p>
                          <p className="text-xs text-slate-500">{hasFile ? 'Uploaded' : 'Not uploaded'}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <input
                          type="file" className="hidden" ref={(el) => (fileInputRefs.current[doc.key] = el)}
                          onChange={(e) => handleFileSelected(doc.key, e.target.files[0])}
                        />
                        <button
                          className="btn-secondary !px-2.5 !py-1.5"
                          disabled={uploadingKey === doc.key}
                          onClick={() => fileInputRefs.current[doc.key]?.click()}
                        >
                          <Upload size={13} /> {uploadingKey === doc.key ? '...' : hasFile ? 'Replace' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <EmployeeFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={load}
        employee={employee}
        departments={departments}
        employees={allEmployees}
      />
    </div>
  )
}
