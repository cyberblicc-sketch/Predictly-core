'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalClose } from '@/components/ui/Modal'
import { Plus, Search, ChevronLeft, ChevronRight, Edit, Pause, Play, Gavel } from 'lucide-react'

interface Market {
  id: string; question: string; description: string | null; status: string
  yes_probability: number; no_probability: number; total_volume_sc: number
  total_traders: number; expires_at: string | null; resolution: string | null
  categories?: { name: string }; created_at: string
}

interface CreateForm { question: string; description: string; category_id: string; expires_at: string; source_kind: string; rules_text: string; invalidation_clause: string }

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [selected, setSelected] = useState<Market | null>(null)
  const [form, setForm] = useState<CreateForm>({ question: '', description: '', category_id: '', expires_at: '', source_kind: '', rules_text: '', invalidation_clause: '' })
  const [categories, setCategories] = useState<{id: number, name: string}[]>([])

  useEffect(() => { fetchMarkets(); fetchCategories() }, [page, search])

  const fetchMarkets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/markets?${params}`)
      if (res.ok) { const d = await res.json(); setMarkets(d.markets); setTotalPages(d.totalPages); setTotalCount(d.total) }
    } catch {} finally { setLoading(false) }
  }

  const fetchCategories = async () => {
    try { const res = await fetch('/api/categories'); if (res.ok) { const d = await res.json(); setCategories(d.categories || []) } } catch {}
  }

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/markets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setCreateOpen(false); setForm({ question: '', description: '', category_id: '', expires_at: '', source_kind: '', rules_text: '', invalidation_clause: '' }); fetchMarkets() }
      else { const d = await res.json(); alert(d.error || 'Failed') }
    } catch { alert('Failed to create market') }
  }

  const handleResolve = async (outcome: string) => {
    if (!selected) return
    if (!confirm(`Resolve as ${outcome.toUpperCase()}?`)) return
    try {
      const res = await fetch(`/api/admin/markets/${selected.id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outcome, evidence: 'Admin resolution' }) })
      if (res.ok) { setResolveOpen(false); setSelected(null); fetchMarkets() }
      else { const d = await res.json(); alert(d.error || 'Failed') }
    } catch { alert('Failed to resolve') }
  }

  const toggleStatus = async (m: Market, newStatus: string) => {
    if (!confirm(`${newStatus === 'active' ? 'Activate' : 'Pause'}?`)) return
    try {
      const res = await fetch(`/api/admin/markets/${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
      if (res.ok) fetchMarkets()
    } catch {}
  }

  const statusBadge = (s: string, r?: string | null) => {
    if (r) return <Badge variant={r === 'yes' ? 'success' : r === 'no' ? 'destructive' : 'secondary'}>{r.toUpperCase()}</Badge>
    return s === 'active' ? <Badge variant="success">Active</Badge> : s === 'paused' ? <Badge variant="warning">Paused</Badge> : <Badge variant="secondary">{s}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="text-[10px] font-mono text-amber-400/70 tracking-[0.25em] uppercase mb-2">Admin Panel</div><h1 className="text-3xl font-semibold text-white">Markets</h1><p className="text-sm text-slate-400 mt-1">{totalCount.toLocaleString()} total</p></div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Create Market</Button>
      </div>
      <Card className="p-4"><div className="flex gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search markets..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10 bg-slate-800/50 border-slate-700" /></div></div></Card>
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800">
            <th className="p-3 text-left text-xs text-slate-400 uppercase">Question</th><th className="p-3 text-left text-xs text-slate-400 uppercase">Status</th>
            <th className="p-3 text-right text-xs text-slate-400 uppercase">Yes %</th><th className="p-3 text-right text-xs text-slate-400 uppercase">Volume</th>
            <th className="p-3 text-center text-xs text-slate-400 uppercase">Traders</th><th className="p-3 text-left text-xs text-slate-400 uppercase">Expires</th>
            <th className="p-3 text-center text-xs text-slate-400 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="p-8 text-center text-slate-400"><svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
            : markets.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-slate-500">No markets found</td></tr>
            : markets.map(m => (
              <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="p-3"><p className="text-sm text-white max-w-md truncate">{m.question}</p><p className="text-xs text-slate-500 mt-1">#{m.id.slice(0, 8)}</p></td>
                <td className="p-3">{statusBadge(m.status, m.resolution)}</td>
                <td className="p-3 text-right font-mono text-sm"><span className={m.yes_probability > 0.5 ? 'text-emerald-400' : 'text-red-400'}>{(m.yes_probability * 100).toFixed(1)}%</span></td>
                <td className="p-3 text-right font-mono text-sm text-slate-400">{m.total_volume_sc.toLocaleString()}</td>
                <td className="p-3 text-center text-sm text-slate-400">{m.total_traders}</td>
                <td className="p-3 text-xs text-slate-500">{m.expires_at ? new Date(m.expires_at).toLocaleDateString() : '—'}</td>
                <td className="p-3"><div className="flex gap-1">
                  {m.status === 'active' && !m.resolution && <><Button size="icon" variant="ghost" onClick={() => toggleStatus(m, 'paused')}><Pause className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => { setSelected(m); setResolveOpen(true) }}><Gavel className="w-4 h-4" /></Button></>}
                  {m.status === 'paused' && <Button size="icon" variant="ghost" onClick={() => toggleStatus(m, 'active')}><Play className="w-4 h-4" /></Button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between p-4 border-t border-slate-800">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
          <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </Card>
      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <ModalHeader><ModalTitle>Create Market</ModalTitle><ModalDescription>Create a new prediction market</ModalDescription></ModalHeader>
          <div className="space-y-4">
            <div><label className="text-sm text-slate-300 mb-1 block">Question *</label><Input value={form.question} onChange={e => setForm({...form, question: e.target.value})} placeholder="Will AI surpass human intelligence by 2030?" className="bg-slate-800 border-slate-700" /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white h-20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-slate-300 mb-1 block">Category</label><select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="text-sm text-slate-300 mb-1 block">Source</label><select value={form.source_kind} onChange={e => setForm({...form, source_kind: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"><option value="">Select</option><option value="huggingface">HuggingFace</option><option value="github">GitHub</option><option value="arxiv">arXiv</option><option value="official">Official</option></select></div>
            </div>
            <div><label className="text-sm text-slate-300 mb-1 block">Expires</label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} className="bg-slate-800 border-slate-700" /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Rules</label><textarea value={form.rules_text} onChange={e => setForm({...form, rules_text: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white h-20" placeholder="Resolution rules..." /></div>
            <div><label className="text-sm text-slate-300 mb-1 block">Invalidation</label><textarea value={form.invalidation_clause} onChange={e => setForm({...form, invalidation_clause: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white h-16" placeholder="What makes this invalid?" /></div>
            <div className="flex gap-2 pt-4"><Button onClick={handleCreate}>Create</Button><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button></div>
          </div>
          <ModalClose />
        </ModalContent>
      </Modal>
      <Modal open={resolveOpen} onOpenChange={setResolveOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader><ModalTitle>Resolve Market</ModalTitle><ModalDescription>{selected?.question}</ModalDescription></ModalHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Select outcome:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="success" onClick={() => handleResolve('yes')} className="h-16 text-lg">YES</Button>
              <Button variant="destructive" onClick={() => handleResolve('no')} className="h-16 text-lg">NO</Button>
              <Button variant="outline" onClick={() => handleResolve('invalid')} className="h-16">INVALID</Button>
              <Button variant="outline" onClick={() => handleResolve('cancel')} className="h-16">CANCEL</Button>
            </div>
          </div>
          <ModalClose />
        </ModalContent>
      </Modal>
    </div>
  )
}
