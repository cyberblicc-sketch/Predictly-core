"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalClose } from "@/components/ui/Modal"
import { AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, Clock, User as UserIcon } from "lucide-react"

interface FraudReport {
  id: string; reporter_id: string; reported_user_id: string | null; market_id: string | null
  report_type: string; description: string; evidence_urls: string[] | null
  status: "pending" | "investigating" | "resolved" | "dismissed"
  resolution_notes: string | null; created_at: string
  reporter?: { email: string; handle: string }
  reported_user?: { email: string; handle: string }
  market?: { question: string }
}

export default function DisputesPage() {
  const [reports, setReports] = useState<FraudReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")

  useEffect(() => { fetchReports() }, [statusFilter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      const res = await fetch(`/api/admin/disputes?${params}`)
      if (res.ok) { const d = await res.json(); setReports(d.reports) }
    } catch {} finally { setLoading(false) }
  }

  const handleResolve = async (reportId: string, action: "resolved" | "dismissed", notes: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${reportId}/resolve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes })
      })
      if (res.ok) { setDetailOpen(false); setSelectedReport(null); fetchReports() }
      else { const d = await res.json(); alert(d.error || "Failed") }
    } catch { alert("Failed to resolve") }
  }

  const handleTakeAction = async (reportId: string, action: string) => {
    if (!confirm(`Take action: ${action}?`)) return
    try {
      const res = await fetch(`/api/admin/disputes/${reportId}/action`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      if (res.ok) { fetchReports() }
      else { const d = await res.json(); alert(d.error || "Failed") }
    } catch { alert("Failed") }
  }

  const openDetail = (report: FraudReport) => { setSelectedReport(report); setDetailOpen(true) }

  const statusBadge = (s: string) => {
    switch (s) {
      case "pending": return <Badge variant="warning">Pending</Badge>
      case "investigating": return <Badge variant="secondary">Investigating</Badge>
      case "resolved": return <Badge variant="success">Resolved</Badge>
      case "dismissed": return <Badge variant="secondary">Dismissed</Badge>
      default: return <Badge>{s}</Badge>
    }
  }

  const reportTypeLabel = (t: string) => {
    const labels: Record<string, string> = {
      suspicious_activity: "Suspicious Activity", market_manipulation: "Market Manipulation",
      unfair_payout: "Unfair Payout", spam: "Spam", other: "Other"
    }
    return labels[t] || t
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-mono text-amber-400/70 tracking-[0.25em] uppercase mb-2">Admin Panel</div>
        <h1 className="text-3xl font-semibold text-white">Dispute Resolution</h1>
        <p className="text-sm text-slate-400 mt-1">{reports.length} reports</p>
      </div>

      <Card className="p-4">
        <div className="flex gap-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="p-3 text-left text-xs text-slate-400 uppercase">Type</th>
            <th className="p-3 text-left text-xs text-slate-400 uppercase">Reporter</th>
            <th className="p-3 text-left text-xs text-slate-400 uppercase">Reported</th>
            <th className="p-3 text-left text-xs text-slate-400 uppercase">Status</th>
            <th className="p-3 text-left text-xs text-slate-400 uppercase">Date</th>
            <th className="p-3 text-center text-xs text-slate-400 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-8 text-center text-slate-400"><svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
            : reports.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No reports</td></tr>
            : reports.map(r => (
              <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-3"><span className="text-sm text-white">{reportTypeLabel(r.report_type)}</span></td>
                <td className="p-3"><div className="flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-500" /><span className="text-sm text-slate-400">{r.reporter?.email || "—"}</span></div></td>
                <td className="p-3"><span className="text-sm text-slate-400">{r.reported_user?.email || "—"}</span></td>
                <td className="p-3">{statusBadge(r.status)}</td>
                <td className="p-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-center"><Button size="sm" variant="ghost" onClick={() => openDetail(r)}><Eye className="w-4 h-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={detailOpen} onOpenChange={setDetailOpen}>
        <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Report Details</ModalTitle>
            <ModalDescription>{selectedReport && reportTypeLabel(selectedReport.report_type)}</ModalDescription>
          </ModalHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Reporter</p>
                  <p className="text-sm text-white">{selectedReport.reporter?.email || "—"}</p>
                  <p className="text-xs text-slate-500">@{selectedReport.reporter?.handle || "—"}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Reported User</p>
                  <p className="text-sm text-white">{selectedReport.reported_user?.email || "—"}</p>
                  <p className="text-xs text-slate-500">@{selectedReport.reported_user?.handle || "—"}</p>
                </div>
              </div>
              {selectedReport.market && (
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Market</p>
                  <p className="text-sm text-white">{selectedReport.market.question}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-2">Description</p>
                <p className="text-sm text-white">{selectedReport.description}</p>
              </div>
              {selectedReport.evidence_urls && selectedReport.evidence_urls.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Evidence</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.evidence_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">{url}</a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400">Status:</p>
                {statusBadge(selectedReport.status)}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                {selectedReport.status === "pending" && (
                  <Button variant="outline" size="sm" onClick={() => handleTakeAction(selectedReport.id, "investigate")}>
                    <Clock className="w-4 h-4 mr-1" />Investigate
                  </Button>
                )}
                <Button variant="success" size="sm" onClick={() => handleResolve(selectedReport.id, "resolved", "Issue resolved")}>
                  <CheckCircle className="w-4 h-4 mr-1" />Resolve
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleResolve(selectedReport.id, "dismissed", "Report dismissed")}>
                  <XCircle className="w-4 h-4 mr-1" />Dismiss
                </Button>
              </div>
              {selectedReport.resolution_notes && (
                <div>
                  <p className="text-xs text-slate-400 mb-2">Resolution Notes</p>
                  <p className="text-sm text-slate-300">{selectedReport.resolution_notes}</p>
                </div>
              )}
            </div>
          )}
          <ModalClose />
        </ModalContent>
      </Modal>
    </div>
  )
}
