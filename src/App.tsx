import { useEffect, useMemo, useRef, useState } from 'react'
import { makeEvent, makeSin, store } from './data'
import { getStatus, isSameDay, paceCopy, sinStats, startOfWeek, statusCopy, weeklyEvents } from './status'
import type { AppData, LogEvent, Sin } from './types'

type Page = 'home' | 'insights' | 'settings' | 'detail'
const toasts = ['Evidence recorded.', 'Again? Efficient.', 'Bold use of a Tuesday.', 'The prosecution rests.', 'Another one for the permanent record.', 'I’m not angry. I’m updating the graph.', 'Noted, you absolute creature.']
const iconPaths: Record<string, string> = {
  spark: 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2z', smoke: 'M7 20c7-2 1-8 8-10 5-2 3-6 1-7', eye: 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12zm10-2a2 2 0 100 4 2 2 0 000-4', bolt: 'M13 2L4 14h7l-1 8 10-13h-7V2z', moon: 'M20 15a8 8 0 01-11-11 9 9 0 1011 11z', flame: 'M12 22c5 0 8-3 8-8 0-4-2-7-6-11 0 4-4 5-4 9-1-2-2-3-3-4-2 3-3 5-3 7 0 4 3 7 8 7z', mouth: 'M3 12c5-4 13-4 18 0-5 6-13 6-18 0zm3 0h12', spiral: 'M12 12c0-3 5-3 5 1 0 5-10 7-13 0-4-9 8-14 15-8',
}
function Icon({ name, size = 24 }: { name: string; size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name] || iconPaths.spark}/></svg> }

function App() {
  const [data, setData] = useState<AppData>(() => store.load())
  const [page, setPage] = useState<Page>('home')
  const [selectedId, setSelectedId] = useState<string>()
  const [formSin, setFormSin] = useState<Sin | null | undefined>(undefined)
  const [toast, setToast] = useState<{ text: string; event: LogEvent }>()
  const [onboarding, setOnboarding] = useState(() => store.load().sins.length === 0)
  const toastTimer = useRef<number | undefined>(undefined)
  useEffect(() => store.save(data), [data])
  useEffect(() => () => clearTimeout(toastTimer.current), [])
  const active = data.sins.filter(s => !s.archived)

  const log = (sinId: string) => {
    const event = makeEvent(sinId)
    setData(d => ({ ...d, events: [...d.events, event] }))
    setToast({ text: toasts[Math.floor(Math.random() * toasts.length)], event })
    clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(undefined), 5000)
  }
  const undo = () => { if (toast) setData(d => ({ ...d, events: d.events.filter(e => e.id !== toast.event.id) })); setToast(undefined) }
  const saveSin = (values: { name: string; definition: string; weeklyLimit: number; icon?: string; color?: string }) => {
    if (formSin) setData(d => ({ ...d, sins: d.sins.map(s => s.id === formSin.id ? { ...s, ...values } : s) }))
    else setData(d => { const made = makeSin(values.name, values.definition, values.weeklyLimit, d.sins.length); return { ...d, sins: [...d.sins, made] } })
    setFormSin(undefined); setOnboarding(false)
  }
  const openDetail = (id: string) => { setSelectedId(id); setPage('detail'); window.scrollTo(0, 0) }
  const navigate = (next: Page) => { setPage(next); setSelectedId(undefined); window.scrollTo(0, 0) }

  if (onboarding) return <Onboarding onStart={() => setFormSin(null)} formOpen={formSin !== undefined} onSave={saveSin} onClose={() => setFormSin(undefined)} />
  return <div className="app-shell">
    <header className="topbar"><button className="wordmark" onClick={() => navigate('home')} aria-label="Sinner home">SINNER<span>™</span></button>{page !== 'home' && <button className="round-button" onClick={() => navigate('home')} aria-label="Close">×</button>}</header>
    <main>
      {page === 'home' && <Home sins={active} events={data.events} weekStart={data.settings.weekStart} onLog={log} onDetail={openDetail} onAdd={() => setFormSin(null)} />}
      {page === 'detail' && selectedId && <Detail sin={data.sins.find(s => s.id === selectedId)!} events={data.events} weekStart={data.settings.weekStart} onLog={log} onEdit={() => setFormSin(data.sins.find(s => s.id === selectedId)!)} onData={setData} onDone={() => navigate('home')} />}
      {page === 'insights' && <Insights sins={active} events={data.events} weekStart={data.settings.weekStart} />}
      {page === 'settings' && <Settings data={data} setData={setData} />}
    </main>
    {page !== 'detail' && <nav className="bottom-nav" aria-label="Main navigation">
      <NavButton label="Ledger" icon="spark" active={page === 'home'} onClick={() => navigate('home')} />
      <NavButton label="Testimony" icon="eye" active={page === 'insights'} onClick={() => navigate('insights')} />
      <NavButton label="Settings" icon="bolt" active={page === 'settings'} onClick={() => navigate('settings')} />
    </nav>}
    {formSin !== undefined && <SinForm sin={formSin} onSave={saveSin} onClose={() => setFormSin(undefined)} />}
    {toast && <div className="toast" role="status"><span>{toast.text}</span><button onClick={undo}>Undo</button></div>}
  </div>
}

function NavButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) { return <button className={active ? 'active' : ''} onClick={onClick}><Icon name={icon} size={21}/><span>{label}</span></button> }

function Onboarding({ onStart, formOpen, onSave, onClose }: { onStart: () => void; formOpen: boolean; onSave: (v: { name: string; definition: string; weeklyLimit: number }) => void; onClose: () => void }) { return <div className="onboarding"><div className="onboard-art"><div className="halo"/><div className="guilty-face"><i/><i/><b/></div></div><div><p className="eyebrow">A PRIVATE VICE LEDGER</p><h1>Nobody’s perfect.<br/><em>Keep receipts.</em></h1><p className="lede">Set limits for your favorite character defects, tap whenever they happen, and receive an unnecessarily dramatic statistical assessment.</p><button className="primary wide" onClick={onStart}>Confess your first Sin <span>→</span></button><p className="privacy">No account. No cloud. Your depravity remains on this device.</p></div>{formOpen && <SinForm sin={null} onSave={onSave} onClose={onClose} first />}</div> }

function SinForm({ sin, onSave, onClose, first }: { sin: Sin | null; onSave: (v: { name: string; definition: string; weeklyLimit: number }) => void; onClose: () => void; first?: boolean }) {
  const [name, setName] = useState(sin?.name || '')
  const [definition, setDefinition] = useState(sin?.definition || '')
  const [limit, setLimit] = useState(sin?.weeklyLimit || 7)
  return <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget && !first) onClose() }}><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sin-form-title"><div className="sheet-grab"/><div className="sheet-head"><div><p className="eyebrow">{sin ? 'ALTER THE RECORD' : 'NEW CONFESSION'}</p><h2 id="sin-form-title">{sin ? 'Edit your Sin' : 'Name your poison.'}</h2></div>{!first && <button className="round-button" onClick={onClose} aria-label="Close">×</button>}</div><form onSubmit={e => { e.preventDefault(); if (name.trim() && definition.trim() && limit > 0) onSave({ name, definition, weeklyLimit: limit }) }}><label>Sin name<input autoFocus required maxLength={32} value={name} onChange={e => setName(e.target.value)} placeholder="Doomscrolling" /></label><label>One tap means…<input required maxLength={64} value={definition} onChange={e => setDefinition(e.target.value)} placeholder="one regrettable scroll session" /></label><label>Weekly limit<div className="limit-control"><button type="button" onClick={() => setLimit(v => Math.max(1, v - 1))} aria-label="Decrease limit">−</button><strong>{limit}</strong><button type="button" onClick={() => setLimit(v => Math.min(999, v + 1))} aria-label="Increase limit">+</button></div></label><button className="primary wide" type="submit">{sin ? 'Save amendments' : 'Enter into evidence'} <span>→</span></button></form></section></div>
}

function Home({ sins, events, weekStart, onLog, onDetail, onAdd }: { sins: Sin[]; events: LogEvent[]; weekStart: 0 | 1; onLog: (id: string) => void; onDetail: (id: string) => void; onAdd: () => void }) {
  const stats = sins.map(s => ({ sin: s, ...sinStats(s, events, weekStart) }))
  const worst = stats.reduce<(typeof stats)[number] | undefined>((a, b) => !a || b.status.rank > a.status.rank ? b : a, undefined)
  const within = stats.filter(s => s.weekly <= s.sin.weeklyLimit).length
  const over = stats.length - within
  const summary = !sins.length ? 'No sins yet. Coward.' : `${within || 'No'} ${within === 1 ? 'Sin is' : 'Sins are'} in bounds.${over ? ` ${over === 1 ? 'One is' : `${over} are`} becoming a situation.` : ' Revoltingly respectable.'}`
  return <><section className={`overall rank-${worst?.status.rank || 0}`}><div className="motif"><span className="halo-mini"/><span className="horn left"/><span className="horn right"/></div><p className="eyebrow">CURRENT MORAL CONDITION</p><h1>{worst?.status.name || 'Suspiciously Pure'}</h1><p>{summary}</p><div className="overall-meta"><span>{within}/{sins.length} within limits</span><span>Week in progress</span></div></section><div className="section-title"><div><p className="eyebrow">THE LEDGER</p><h2>Your usual suspects</h2></div><button className="add-button" onClick={onAdd}>+ Add Sin</button></div>{sins.length ? <div className="sin-list">{stats.map(item => <SinCard key={item.sin.id} {...item} onLog={onLog} onDetail={onDetail} weekStart={weekStart}/>)}</div> : <button className="empty" onClick={onAdd}><span>＋</span><strong>No sins yet. Coward.</strong><small>Tap to ruin the immaculate record.</small></button>}</>
}

function SinCard({ sin, today, weekly, remaining, percent, status, onLog, onDetail, weekStart }: ReturnType<typeof sinStats> & { sin: Sin; onLog: (id: string) => void; onDetail: (id: string) => void; weekStart: 0 | 1 }) { return <article className="sin-card" style={{ '--accent': sin.color } as React.CSSProperties}><button className="card-main" onClick={() => onDetail(sin.id)} aria-label={`View ${sin.name} details`}><span className="sin-icon"><Icon name={sin.icon}/></span><span className="card-copy"><span className="card-name">{sin.name}</span><span className="card-definition">{sin.definition}</span></span><span className="chevron">›</span></button><div className="meter"><i style={{ width: `${Math.min(100, percent)}%` }}/><b style={{ left: '100%' }}/></div><button className="stat-line" onClick={() => onDetail(sin.id)}><span><strong>{weekly}</strong> / {sin.weeklyLimit} this week</span><span>{remaining ? `${remaining} remaining` : weekly > sin.weeklyLimit ? `${weekly - sin.weeklyLimit} over` : 'allowance spent'}</span></button><div className="card-foot"><div><span className="status-pill">{status.name}</span><small>{today ? `${today} today · ` : ''}{paceCopy(percent, weekStart)}</small></div><button className="log-button" onClick={() => onLog(sin.id)} aria-label={`Log one ${sin.definition}`}><span>+</span><small>LOG</small></button></div></article> }

function Detail({ sin, events, weekStart, onLog, onEdit, onData, onDone }: { sin: Sin; events: LogEvent[]; weekStart: 0 | 1; onLog: (id: string) => void; onEdit: () => void; onData: React.Dispatch<React.SetStateAction<AppData>>; onDone: () => void }) {
  const stats = sinStats(sin, events, weekStart)
  const history = events.filter(e => e.sinId === sin.id).sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt))
  const weeks = [-3, -2, -1, 0].map(offset => ({ date: startOfWeek(new Date(), weekStart, offset), count: weeklyEvents(history, weekStart, offset).length }))
  const max = Math.max(sin.weeklyLimit, ...weeks.map(w => w.count), 1)
  const removeEvent = (id: string) => { if (confirm('Strike this event from the record? Totals will be recalculated.')) onData(d => ({ ...d, events: d.events.filter(e => e.id !== id) })) }
  const archive = () => { if (confirm(`Archive ${sin.name}? Its history will remain in your export.`)) { onData(d => ({ ...d, sins: d.sins.map(s => s.id === sin.id ? { ...s, archived: true } : s) })); onDone() } }
  const removeSin = () => { if (confirm(`Permanently delete ${sin.name} and every event? This cannot be undone.`)) { onData(d => ({ ...d, sins: d.sins.filter(s => s.id !== sin.id), events: d.events.filter(e => e.sinId !== sin.id) })); onDone() } }
  return <div className="detail" style={{ '--accent': sin.color } as React.CSSProperties}><section className="detail-hero"><div className="detail-icon"><Icon name={sin.icon} size={34}/></div><p className="eyebrow">CASE FILE</p><h1>{sin.name}</h1><p>{sin.definition}</p><span className="status-pill">{stats.status.name}</span><h3>{statusCopy(stats.status.rank)}</h3><button className="primary quick-log" onClick={() => onLog(sin.id)}><b>+</b> Log one occurrence</button></section><section className="big-stats"><div><strong>{stats.today}</strong><span>today</span></div><div><strong>{stats.weekly}<small>/{sin.weeklyLimit}</small></strong><span>this week</span></div><div><strong>{stats.remaining}</strong><span>remaining</span></div></section><section className="panel"><div className="panel-head"><div><p className="eyebrow">FOUR-WEEK TESTIMONY</p><h2>The pattern</h2></div><span className="limit-key">— LIMIT {sin.weeklyLimit}</span></div><div className="bar-chart" style={{ '--limit': `${100 - sin.weeklyLimit / max * 100}%` } as React.CSSProperties}>{weeks.map((w, i) => <div className="bar-column" key={i}><div className="bar-space"><i style={{ height: `${w.count / max * 100}%` }}><b>{w.count}</b></i></div><span>{i === 3 ? 'NOW' : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(w.date)}</span></div>)}</div><p className="interpretation">{trendCopy(weeks.map(w => w.count))}</p></section><section className="panel"><div className="panel-head"><div><p className="eyebrow">PAPER TRAIL</p><h2>Event history</h2></div><span>{history.length} total</span></div>{history.length ? <div className="history">{history.map(event => <div key={event.id}><span><b>{new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(event.occurredAt))}</b><small>{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(event.occurredAt))}</small></span><button onClick={() => removeEvent(event.id)} aria-label={`Delete event from ${event.occurredAt}`}>×</button></div>)}</div> : <p className="empty-copy">A completely clean history. We both know that isn’t true.</p>}</section><section className="panel actions"><button onClick={onEdit}>Edit Sin settings <span>›</span></button><button onClick={archive}>Archive this Sin <span>›</span></button><button className="danger" onClick={removeSin}>Delete permanently <span>›</span></button></section></div>
}

function trendCopy(counts: number[]) { const recent = counts[3], prior = counts[2]; if (!recent && !prior) return 'Silence in the record. Suspicious, but legally admissible.'; if (recent < prior) return `Down ${Math.round((prior - recent) / prior * 100)}%. Character development?`; if (recent === prior) return 'No improvement whatsoever. Consistency!'; return 'The pattern is beginning to testify.' }

function Insights({ sins, events, weekStart }: { sins: Sin[]; events: LogEvent[]; weekStart: 0 | 1 }) {
  const currentEvents = weeklyEvents(events, weekStart)
  const stats = sins.map(s => ({ sin: s, current: currentEvents.filter(e => e.sinId === s.id).length, prior: weeklyEvents(events.filter(e => e.sinId === s.id), weekStart, -1).length }))
  const within = stats.filter(s => s.current <= s.sin.weeklyLimit).length
  const most = stats.reduce<(typeof stats)[number] | undefined>((a, b) => !a || b.current > a.current ? b : a, undefined)
  const change = stats.reduce<(typeof stats)[number] | undefined>((a, b) => !a || Math.abs(b.current - b.prior) > Math.abs(a.current - a.prior) ? b : a, undefined)
  const totals = [-7,-6,-5,-4,-3,-2,-1,0].map(offset => weeklyEvents(events, weekStart, offset).length)
  const max = Math.max(...totals, 1)
  const worstDay = [0,1,2,3,4,5,6].map(day => ({ day, count: currentEvents.filter(e => ((new Date(e.occurredAt).getDay() - weekStart + 7) % 7) === day).length })).sort((a,b) => b.count-a.count)[0]
  const dayDate = new Date(startOfWeek(new Date(), weekStart)); dayDate.setDate(dayDate.getDate() + worstDay.day)
  return <div className="insights"><div className="page-title"><p className="eyebrow">WEEKLY TESTIMONY</p><h1>The numbers<br/><em>have concerns.</em></h1><p>{currentEvents.length < weeklyEvents(events, weekStart, -1).length ? 'Statistically less feral.' : currentEvents.length ? 'The pattern is beginning to testify.' : 'A surprisingly respectable week. Disgusting.'}</p></div><section className="report-grid"><div><strong>{currentEvents.length}</strong><span>occurrences<br/>this week</span></div><div><strong>{within}<small>/{sins.length}</small></strong><span>Sins within<br/>their limits</span></div></section><section className="panel trend-panel"><div className="panel-head"><div><p className="eyebrow">EIGHT-WEEK ARC</p><h2>Character development?</h2></div></div><div className="spark-chart">{totals.map((count, i) => <div key={i}><i style={{ height: `${Math.max(5, count / max * 100)}%` }} className={i === 7 ? 'current' : ''}><b>{count}</b></i><span>{i === 7 ? 'NOW' : `${7-i}W`}</span></div>)}</div></section><section className="editorial"><p>EDITORIAL ASSESSMENT № {String(new Date().getMonth()+1).padStart(2,'0')}</p><blockquote>“{worstDay.count ? `Your worst day was ${new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(dayDate)}. You know what you did.` : 'No evidence this week. An airtight alibi, apparently.'}”</blockquote></section><section className="panel findings"><p className="eyebrow">NOTABLE FINDINGS</p><div><span>Most active Sin</span><strong>{most?.current ? most.sin.name : 'No testimony'} <small>{most?.current || 0}</small></strong></div><div><span>Largest week-over-week change</span><strong>{change?.sin.name || 'Nothing moved'} <small>{change ? `${change.current-change.prior >= 0 ? '+' : ''}${change.current-change.prior}` : '—'}</small></strong></div></section></div>
}

function Settings({ data, setData }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>> }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const exportData = () => { const blob = new Blob([store.export(data)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `sinner-export-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url) }
  const importData = async (file?: File) => { if (!file) return; try { const imported = store.import(await file.text()); if (confirm(`Import ${imported.sins.length} Sins and replace current data?`)) setData(imported) } catch (error) { alert(error instanceof Error ? error.message : 'Could not import this file.') } if (fileRef.current) fileRef.current.value = '' }
  const clear = () => { if (confirm('Clear every Sin and event? This is permanent. Export first if you are sentimental.')) setData({ version: 1, sins: [], events: [], settings: { weekStart: 1 } }) }
  return <div className="settings"><div className="page-title"><p className="eyebrow">ADMINISTRATION</p><h1>Terms of<br/><em>your corruption.</em></h1></div><section className="panel settings-panel"><p className="eyebrow">CALENDAR LAW</p><h2>Week begins</h2><div className="segmented"><button className={data.settings.weekStart === 1 ? 'active' : ''} onClick={() => setData(d => ({ ...d, settings: { weekStart: 1 } }))}>Monday</button><button className={data.settings.weekStart === 0 ? 'active' : ''} onClick={() => setData(d => ({ ...d, settings: { weekStart: 0 } }))}>Sunday</button></div></section><section className="panel actions"><p className="eyebrow">YOUR EVIDENCE</p><button onClick={exportData}>Export all data <span>↓</span></button><button onClick={() => fileRef.current?.click()}>Import an export <span>↑</span></button><input ref={fileRef} hidden type="file" accept="application/json,.json" onChange={e => importData(e.target.files?.[0])}/><button className="danger" onClick={clear}>Clear all data <span>×</span></button></section><section className="panel install"><p className="eyebrow">INSTALLATION</p><h2>Put Sinner on your Home Screen</h2><p>On iPhone, open this page in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>. On supported desktop browsers, use the install icon in the address bar.</p></section><section className="app-info"><div className="mini-mark"><Icon name="spark" size={30}/></div><h2>Sinner <sup>™</sup></h2><p>Private vice ledger · Version 0.1</p><small>Your data lives only on this device. No accounts, no surveillance, no spiritual authorities.</small></section></div>
}

export default App
