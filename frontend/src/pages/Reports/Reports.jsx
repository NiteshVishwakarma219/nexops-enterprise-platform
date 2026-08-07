import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../../components/PageHeader'
import Loader from '../../components/Loader'
import * as reportService from '../../services/reportService'

const COLORS = ['#3466fa', '#22c55e', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#ef4444']

function ReportCard({ title, data, type = 'bar' }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-300 mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={240}>
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1f2937' }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" fill="#3466fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={45} outerRadius={80} paddingAngle={3} label={({ label }) => label}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8, fontSize: 12 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default function Reports() {
  const [reports, setReports] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.getHeadcountByDepartment(),
      reportService.getEmployeeStatusBreakdown(),
      reportService.getLeaveTypeBreakdown(),
      reportService.getAssetCategoryBreakdown(),
      reportService.getAttendanceStatusBreakdown(),
    ]).then(([headcount, empStatus, leaveType, assetCategory, attendanceStatus]) => {
      setReports({
        headcount: headcount.data, empStatus: empStatus.data, leaveType: leaveType.data,
        assetCategory: assetCategory.data, attendanceStatus: attendanceStatus.data,
      })
    }).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Loader fullHeight label="Generating reports..." />

  return (
    <div>
      <PageHeader title="Reports" description="Cross-module insights into headcount, leave, assets, and attendance." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard title="Headcount by Department" data={reports.headcount} type="bar" />
        <ReportCard title="Employee Status Breakdown" data={reports.empStatus} type="pie" />
        <ReportCard title="Approved Leave by Type" data={reports.leaveType} type="bar" />
        <ReportCard title="Asset Distribution by Category" data={reports.assetCategory} type="pie" />
        <ReportCard title="Attendance Status Breakdown" data={reports.attendanceStatus} type="bar" />
      </div>
    </div>
  )
}
