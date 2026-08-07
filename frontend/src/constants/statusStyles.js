// Centralized badge color mapping so status pills look consistent across every module/table.
export const STATUS_STYLES = {
  // Employee status
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  on_leave: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  terminated: 'bg-red-500/15 text-red-300 border-red-500/30',
  probation: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  // Asset status
  available: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  assigned: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  under_repair: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  retired: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  // Leave / Ticket status
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
  cancelled: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  open: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  in_progress: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  resolved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  closed: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  // Project status
  planned: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  on_hold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  // Priority
  low: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  medium: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  high: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  urgent: 'bg-red-500/15 text-red-300 border-red-500/30',
  // Attendance
  present: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  absent: 'bg-red-500/15 text-red-300 border-red-500/30',
  half_day: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  late: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  work_from_home: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
}

export const formatStatusLabel = (status) =>
  (status || '').split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
