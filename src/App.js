import { useState, useRef, useMemo, useEffect } from "react";
import { Moon, Sun, LayoutGrid, List, BarChart3, Calendar, FolderOpen, FileText, Settings, AlertCircle, Download, Flag, Clock, X, ChevronRight, Paperclip, CheckSquare, Plus, Trash2, GripVertical, Pencil, Users, RefreshCw } from "lucide-react";

const TODAY = '2026-06-16';
const PROJECT_COLORS = ['#4285F4', '#A142F4', '#34A853', '#EA4335', '#FBBC04', '#00ACC1', '#FF7043', '#8D6E63'];
const NOTE_COLORS = ['#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#FFE4E0'];

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function diffDays(a, b) {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}
function initials(name) { return name ? name.slice(0, 1) : '?'; }
function avatarColor(name) {
  const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853', '#A142F4', '#00ACC1'];
  let h = 0;
  for (const c of (name || '')) h += c.charCodeAt(0);
  return colors[h % colors.length];
}

const STATUS = {
  todo: { label: '待辦', color: '#9AA0A6' },
  inprogress: { label: '進行中', color: '#4285F4' },
  review: { label: '審核中', color: '#FBBC04' },
  done: { label: '已完成', color: '#34A853' },
};
const PRIORITY = {
  high: { label: '高', color: '#EA4335' },
  medium: { label: '中', color: '#FBBC04' },
  low: { label: '低', color: '#9AA0A6' },
};

const SEED_PROJECTS = [
  { id: 'p1', name: 'App 全新改版', color: '#4285F4', desc: '手機應用程式介面與後端全面改版', members: ['小美', '阿凱', 'Leo', 'Tina'] },
  { id: 'p2', name: '客戶A 季度行銷專案', color: '#A142F4', desc: 'Q3 社群與廣告投放整合行銷企劃', members: ['阿凱', 'Tina', 'Wendy'] },
  { id: 'p3', name: '內部系統優化', color: '#34A853', desc: '內部工具效能與使用體驗優化', members: ['Leo', '小美'] },
];

const SEED_TASKS = [
  { id: 't1', projectId: 'p1', title: '需求訪談與分析', status: 'done', assignee: '小美', start: '2026-06-01', end: '2026-06-05', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: [], desc: '彙整現有使用者回饋與業務需求,確認本次改版範圍。', subtasks: [{ id: 'st1', text: '整理使用者調查結果', done: true }, { id: 'st2', text: '確認改版範圍', done: true }], comments: [{ id: 'c1', user: '阿凱', text: '範圍確認沒問題,可以開始設計', time: '06-05' }], custom: { cf1: 12 }, completedDate: '2026-06-05' },
  { id: 't2', projectId: 'p1', title: 'UI/UX 視覺設計', status: 'inprogress', assignee: '阿凱', start: '2026-06-04', end: '2026-06-14', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: ['t1'], desc: '依據訪談結果產出線框圖與視覺稿。', subtasks: [{ id: 'st3', text: '線框圖', done: true }, { id: 'st4', text: '視覺稿', done: false }], comments: [{ id: 'c2', user: '小美', text: '記得對齊品牌色票', time: '06-06' }], custom: { cf1: 24 }, completedDate: null },
  { id: 't3', projectId: 'p1', title: '前端開發 - 首頁', status: 'inprogress', assignee: 'Leo', start: '2026-06-12', end: '2026-06-25', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['t2'], desc: '依視覺稿實作首頁與導覽元件。', subtasks: [], comments: [], custom: { cf1: 30 }, completedDate: null },
  { id: 't4', projectId: 'p1', title: '後端 API 開發', status: 'todo', assignee: 'Tina', start: '2026-06-15', end: '2026-06-28', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['t1'], desc: '提供帳戶設定與個人化資料相關端點。', subtasks: [], comments: [], custom: { cf1: 28 }, completedDate: null },
  { id: 't5', projectId: 'p1', title: '內部測試', status: 'todo', assignee: '小美', start: '2026-06-26', end: '2026-07-03', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['t3', 't4'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 't6', projectId: 'p1', title: '上線發布', status: 'todo', assignee: '阿凱', start: '2026-07-04', end: '2026-07-04', startTime: '14:00', endTime: '15:00', priority: 'high', milestone: true, deps: ['t5'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 't7', projectId: 'p1', title: '客戶驗收會議', status: 'review', assignee: 'Tina', start: '2026-06-20', end: '2026-06-20', startTime: '10:00', endTime: '11:00', priority: 'low', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 'u1', projectId: 'p2', title: '市場調查與受眾分析', status: 'done', assignee: 'Wendy', start: '2026-06-01', end: '2026-06-06', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: { cf2: 'CA-208' }, completedDate: '2026-06-06' },
  { id: 'u2', projectId: 'p2', title: '創意內容企劃', status: 'inprogress', assignee: '阿凱', start: '2026-06-05', end: '2026-06-16', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: ['u1'], desc: '', subtasks: [], comments: [], custom: { cf2: 'CA-208' }, completedDate: null },
  { id: 'u3', projectId: 'p2', title: '社群廣告素材製作', status: 'todo', assignee: 'Tina', start: '2026-06-15', end: '2026-06-24', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['u2'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 'u4', projectId: 'p2', title: '廣告投放上線', status: 'todo', assignee: 'Wendy', start: '2026-06-25', end: '2026-06-25', startTime: '09:00', endTime: '10:00', priority: 'high', milestone: true, deps: ['u3'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 'u5', projectId: 'p2', title: '期中成效檢視會議', status: 'todo', assignee: '阿凱', start: '2026-06-30', end: '2026-06-30', startTime: '10:00', endTime: '11:00', priority: 'low', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 'v1', projectId: 'p3', title: '系統效能盤點', status: 'done', assignee: 'Leo', start: '2026-06-01', end: '2026-06-04', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: {}, completedDate: '2026-06-04' },
  { id: 'v2', projectId: 'p3', title: '資料庫查詢優化', status: 'inprogress', assignee: 'Leo', start: '2026-06-05', end: '2026-06-18', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: ['v1'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 'v3', projectId: 'p3', title: '前端載入優化', status: 'todo', assignee: '小美', start: '2026-06-12', end: '2026-06-22', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['v1'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
  { id: 'v4', projectId: 'p3', title: '上線驗證', status: 'todo', assignee: 'Leo', start: '2026-06-23', end: '2026-06-25', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['v2', 'v3'], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null },
];

const SEED_NOTES = [
  { id: 'n1', projectId: 'p1', title: '需求訪談會議紀錄 6/2', blocks: [
    { id: 'b1', type: 'heading', text: '會議重點' },
    { id: 'b2', type: 'text', text: '與產品團隊確認本次改版主要聚焦在首頁瀏覽動線與帳戶設定流程簡化。' },
    { id: 'b3', type: 'todo', text: '整理現有使用者回饋報告', done: true },
    { id: 'b4', type: 'todo', text: '確認設計交付時程', done: false },
    { id: 'b5', type: 'text', text: '下次會議時間訂於 6/9,將 review 初版線框圖。' },
  ]},
  { id: 'n2', projectId: 'p1', title: '技術規格草稿', blocks: [
    { id: 'b6', type: 'heading', text: 'API 規劃' },
    { id: 'b7', type: 'text', text: '使用者驗證採用既有 OAuth 服務,新增個人化設定相關端點。' },
    { id: 'b8', type: 'todo', text: '撰寫 API 文件', done: false },
  ]},
  { id: 'n3', projectId: 'p2', title: 'Q3 行銷企劃摘要', blocks: [
    { id: 'b9', type: 'heading', text: '目標客群' },
    { id: 'b10', type: 'text', text: '本季聚焦 25-35 歲都市專業族群,主打社群口碑擴散與口碑推薦。' },
  ]},
];

const SEED_ATTACHMENTS = [
  { id: 'a1', projectId: 'p1', name: '視覺設計稿_v2.fig', size: '4.2 MB', by: '阿凱', date: '2026-06-10' },
  { id: 'a2', projectId: 'p1', name: 'API規格書.pdf', size: '860 KB', by: 'Tina', date: '2026-06-08' },
  { id: 'a3', projectId: 'p1', name: '使用者調查結果.xlsx', size: '1.1 MB', by: '小美', date: '2026-06-03' },
  { id: 'a4', projectId: 'p2', name: 'Q3預算總表.xlsx', size: '320 KB', by: 'Wendy', date: '2026-06-05' },
  { id: 'a5', projectId: 'p3', name: '效能測試報告.pdf', size: '2.0 MB', by: 'Leo', date: '2026-06-01' },
];

const SEED_ACTIVITY = [
  { id: 'ac1', projectId: 'p1', user: '阿凱', action: '更新了「UI/UX 視覺設計」的進度', time: '今天 10:24' },
  { id: 'ac2', projectId: 'p1', user: 'Tina', action: '新增了附件 API規格書.pdf', time: '昨天 16:02' },
  { id: 'ac3', projectId: 'p2', user: 'Wendy', action: '建立了新筆記「Q3 行銷企劃摘要」', time: '昨天 11:40' },
  { id: 'ac4', projectId: 'p3', user: 'Leo', action: '將「系統效能盤點」標記為已完成', time: '2天前' },
];

const SEED_MEETINGS = [
  { id: 'm1', projectId: 'p1', title: '視覺稿 review 會議', date: '2026-06-16', time: '14:00' },
  { id: 'm2', projectId: 'p2', title: 'Q3 行銷期中檢視', date: '2026-06-30', time: '10:00' },
];

const SEED_CUSTOM_FIELDS = {
  p1: [{ id: 'cf1', name: '預估工時(hr)', type: 'number' }],
  p2: [{ id: 'cf2', name: '客戶代碼', type: 'text' }],
  p3: [],
};

function TopNav({ theme, dark, setDark, view, setView, project }) {
  const navItems = [
    { key: 'dashboard', label: '總覽' },
    { key: 'idea', label: '點子大師' },
    { key: 'meeting', label: '會議紀錄' },
    { key: 'board', label: '創意板' },
    { key: 'members', label: '成員' },
  ];
  return (
    <div className={`border-b ${theme.border} ${theme.surface} sticky top-0 z-30`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-bold text-lg flex-shrink-0">專案小幫手</span>
          {project && <span className={`text-sm truncate ${theme.sub}`}>/ {project.name}</span>}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {navItems.map(it => (
            <button key={it.key} onClick={() => setView(it.key)} className={`text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap ${view === it.key ? 'bg-blue-600 text-white' : `${theme.hover} ${theme.sub}`}`}>{it.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setDark(d => !d)} className={`p-2 rounded-lg ${theme.hover}`}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium" style={{ backgroundColor: '#4285F4' }}>我</div>
        </div>
      </div>
    </div>
  );
}

function DailySummary({ theme, projects, tasks, onExport }) {
  const projName = id => (projects.find(p => p.id === id) || {}).name || '';
  const completedToday = tasks.filter(t => t.completedDate === TODAY);
  const startedToday = tasks.filter(t => t.status === 'inprogress' && t.start === TODAY);
  const delayed = tasks.filter(t => t.end < TODAY && t.status !== 'done');
  const renderList = (list) => list.length === 0 ? (
    <div className={`text-xs ${theme.sub}`}>尚無項目</div>
  ) : list.map(t => (
    <div key={t.id} className="flex items-center justify-between py-1 text-sm gap-2">
      <span className={`truncate ${theme.text}`}>{t.title}<span className={`text-xs ${theme.sub} ml-1`}>({projName(t.projectId)})</span></span>
      <span className={`text-xs flex-shrink-0 ${theme.sub}`}>{t.assignee}</span>
    </div>
  ));
  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-5 mb-6`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className={`text-sm font-semibold ${theme.text}`}>今日工作彙整(給主管看)<span className={`text-xs font-normal ml-2 ${theme.sub}`}>{TODAY}</span></h3>
        <button onClick={onExport} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover}`}><Download size={12} />匯出報告</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-xs font-medium text-green-600 mb-1">✓ 今日完成({completedToday.length})</div>
          {renderList(completedToday)}
        </div>
        <div>
          <div className="text-xs font-medium text-blue-600 mb-1">▶ 今日開始進行({startedToday.length})</div>
          {renderList(startedToday)}
        </div>
        <div>
          <div className="text-xs font-medium text-red-500 mb-1">⚠ Delay 項目({delayed.length})</div>
          {renderList(delayed)}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ theme, projects, tasks, activity, onOpenProject, onNewTask, onNewProject, onEditProject, onDeleteProject, onExportDaily }) {
  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <button onClick={onNewTask} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}><Plus size={14} />新增任務</button>
        <button onClick={onNewProject} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"><Plus size={14} />新增專案</button>
      </div>
      <DailySummary theme={theme} projects={projects} tasks={tasks} onExport={onExportDaily} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {projects.map(p => {
          const pTasks = tasks.filter(t => t.projectId === p.id);
          const done = pTasks.filter(t => t.status === 'done').length;
          const overdue = pTasks.filter(t => t.end < TODAY && t.status !== 'done').length;
          const progress = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
          return (
            <div key={p.id} onClick={() => onOpenProject(p.id)} className={`group relative rounded-2xl border ${theme.border} ${theme.surface} p-5 cursor-pointer hover:shadow-md transition-shadow`}>
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); onEditProject(p); }} className={`p-1 rounded-lg ${theme.hover}`}><Pencil size={13} className={theme.sub} /></button>
                <button onClick={e => { e.stopPropagation(); onDeleteProject(p.id); }} className={`p-1 rounded-lg ${theme.hover}`}><Trash2 size={13} className="text-red-400" /></button>
              </div>
              <div className="flex items-center gap-2 mb-3 pr-12">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }}></span>
                <span className={`font-semibold ${theme.text}`}>{p.name}</span>
              </div>
              <p className={`text-sm mb-4 ${theme.sub}`}>{p.desc}</p>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className={theme.sub}>進度</span><span className={theme.text}>{progress}%</span>
                </div>
                <div className={`h-1.5 rounded-full ${theme.dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="h-1.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: p.color }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {p.members.slice(0, 4).map(m => (
                    <div key={m} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white border-2" style={{ backgroundColor: avatarColor(m), borderColor: theme.dark ? '#1f2937' : '#ffffff' }}>{initials(m)}</div>
                  ))}
                </div>
                {overdue > 0 && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{overdue} 逾期</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-5`}>
        <h3 className={`text-sm font-semibold mb-3 ${theme.text}`}>最近動態</h3>
        <div className="space-y-3">
          {activity.slice(0, 10).map(a => {
            const p = projects.find(pr => pr.id === a.projectId);
            return (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: avatarColor(a.user) }}>{initials(a.user)}</div>
                <div className="text-sm">
                  <span className={`font-medium ${theme.text}`}>{a.user}</span>
                  <span className={theme.sub}> {a.action}</span>
                  <span className={`text-xs ${theme.sub} block`}>{p ? p.name + ' · ' : ''}{a.time}</span>
                </div>
              </div>
            );
          })}
          {activity.length === 0 && <div className={`text-sm ${theme.sub}`}>尚無動態</div>}
        </div>
      </div>
    </div>
  );
}

function FilterBar({ theme, projects, filterProjectIds, setFilterProjectIds, filterAssignee, setFilterAssignee, assignees }) {
  const [open, setOpen] = useState(false);
  function toggleProject(id) {
    setFilterProjectIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }
  const label = filterProjectIds.length === projects.length ? '全部專案' : filterProjectIds.length === 1 ? ((projects.find(p => p.id === filterProjectIds[0]) || {}).name || '選擇專案') : `${filterProjectIds.length} 個專案`;
  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <div className="relative">
        <button onClick={() => setOpen(o => !o)} className={`text-sm font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}>顯示專案:{label}</button>
        {open && (
          <div className={`absolute top-full left-0 mt-1 w-56 rounded-xl border ${theme.border} ${theme.surface} shadow-lg p-2 z-20`}>
            <button onClick={() => setFilterProjectIds(projects.map(p => p.id))} className={`text-xs ${theme.sub} mb-1 underline px-2`}>全選</button>
            {projects.map(p => (
              <label key={p.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${theme.hover}`}>
                <input type="checkbox" checked={filterProjectIds.includes(p.id)} onChange={() => toggleProject(p.id)} className="rounded" />
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className={`text-sm ${theme.text}`}>{p.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className={`text-sm rounded-lg border px-3 py-1.5 ${theme.input}`}>
        <option value="all">全部負責人</option>
        {assignees.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
}

function TaskCard({ task, theme, onClick, onDelete, projectTag }) {
  const pc = PRIORITY[task.priority];
  const sc = STATUS[task.status];
  return (
    <div onClick={onClick} className={`group rounded-xl border ${theme.border} ${theme.surface} p-3 mb-2 cursor-pointer shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: pc.color + '20', color: pc.color }}>{pc.label}</span>
        <div className="flex items-center gap-1.5">
          {task.milestone && <Flag size={14} style={{ color: sc.color }} />}
          <button onClick={e => { e.stopPropagation(); onDelete(task.id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"><Trash2 size={13} /></button>
        </div>
      </div>
      <div className={`text-sm font-medium mb-1 ${theme.text}`}>{task.title}</div>
      {projectTag && <div className="flex items-center gap-1 mb-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projectTag.color }}></span><span className={`text-xs ${theme.sub}`}>{projectTag.name}</span></div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium" style={{ backgroundColor: avatarColor(task.assignee) }}>{initials(task.assignee)}</div>
          <span className={`text-xs ${theme.sub}`}>{task.assignee}</span>
        </div>
        <span className={`text-xs ${theme.sub} flex items-center gap-1`}><Clock size={12} />{task.end.slice(5)} {task.endTime}</span>
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, theme, onCardClick, onDrop, onDelete, projects, multiProject }) {
  const cols = [['todo', '待辦'], ['inprogress', '進行中'], ['review', '審核中'], ['done', '已完成']];
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {cols.map(([key, label]) => {
        const list = tasks.filter(t => t.status === key);
        return (
          <div key={key}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { const id = e.dataTransfer.getData('text/plain'); onDrop(id, key); }}
            className={`w-72 flex-shrink-0 rounded-2xl ${theme.surface} border ${theme.border} p-3`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className={`text-sm font-semibold ${theme.text}`}>{label}</span>
              <span className={`text-xs ${theme.sub} ${theme.bg} rounded-full px-2 py-0.5`}>{list.length}</span>
            </div>
            <div className="min-h-[40px]">
              {list.map(t => {
                const tag = multiProject ? projects.find(p => p.id === t.projectId) : null;
                return (
                  <div key={t.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', t.id)}>
                    <TaskCard task={t} theme={theme} onClick={() => onCardClick(t.id)} onDelete={onDelete} projectTag={tag} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks, theme, onRowClick, onDelete, customFields, projects, multiProject }) {
  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.surface} overflow-hidden overflow-x-auto`}>
      <table className="w-full text-sm">
        <thead>
          <tr className={theme.bg}>
            <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>任務</th>
            {multiProject && <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>專案</th>}
            <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>負責人</th>
            <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>狀態</th>
            <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>優先級</th>
            <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>開始</th>
            <th className={`px-4 py-3 text-left font-medium ${theme.sub}`}>截止</th>
            {customFields.map(cf => <th key={cf.id} className={`px-4 py-3 text-left font-medium ${theme.sub}`}>{cf.name}</th>)}
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(t => {
            const tag = multiProject ? projects.find(p => p.id === t.projectId) : null;
            return (
              <tr key={t.id} onClick={() => onRowClick(t.id)} className={`border-t ${theme.border} cursor-pointer ${theme.hover}`}>
                <td className={`px-4 py-3 font-medium ${theme.text}`}>{t.title}</td>
                {multiProject && <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: (tag ? tag.color : '#999') + '20', color: tag ? tag.color : '#999' }}>{tag ? tag.name : ''}</span></td>}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: avatarColor(t.assignee) }}>{initials(t.assignee)}</div>
                    <span className={theme.sub}>{t.assignee}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: STATUS[t.status].color + '20', color: STATUS[t.status].color }}>{STATUS[t.status].label}</span></td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: PRIORITY[t.priority].color + '20', color: PRIORITY[t.priority].color }}>{PRIORITY[t.priority].label}</span></td>
                <td className={`px-4 py-3 ${theme.sub}`}>{t.start} {t.startTime}</td>
                <td className={`px-4 py-3 ${theme.sub}`}>{t.end} {t.endTime}</td>
                {customFields.map(cf => <td key={cf.id} className={`px-4 py-3 ${theme.sub}`}>{(t.custom && t.custom[cf.id]) || '—'}</td>)}
                <td className="px-4 py-3 text-right">
                  <button onClick={e => { e.stopPropagation(); onDelete(t.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GanttChart({ tasks, theme, dark, exportLabel, projects, multiProject }) {
  const svgRef = useRef(null);
  const dayW = 30, rowH = 46, labelW = 200, headerH = 54, pad = 16;

  const { minStart, totalDays, rows } = useMemo(() => {
    if (tasks.length === 0) return { minStart: TODAY, totalDays: 1, rows: [] };
    const starts = tasks.map(t => t.start);
    const ends = tasks.map(t => t.end);
    let min = starts.reduce((a, b) => (a < b ? a : b));
    let max = ends.reduce((a, b) => (a > b ? a : b));
    min = addDays(min, -2); max = addDays(max, 2);
    const days = diffDays(min, max) + 1;
    const sortedRows = [...tasks].sort((a, b) => a.start.localeCompare(b.start));
    return { minStart: min, totalDays: days, rows: sortedRows };
  }, [tasks]);

  const chartW = labelW + totalDays * dayW + pad * 2;
  const chartH = headerH + rows.length * rowH + pad;
  const rowIndex = {};
  rows.forEach((t, i) => { rowIndex[t.id] = i; });
  function xFor(dateStr) { return labelW + diffDays(minStart, dateStr) * dayW + pad; }
  function rowLabel(t) {
    const base = multiProject ? `${t.title} · ${(projects.find(p => p.id === t.projectId) || {}).name || ''}` : t.title;
    return base.length > 26 ? base.slice(0, 25) + '…' : base;
  }

  function exportImg() {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const xml = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = chartW * scale; canvas.height = chartH * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = dark ? '#1f2937' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, chartW, chartH);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        const a = document.createElement('a');
        a.download = `${exportLabel}_甘特圖.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
      });
    };
    img.src = url;
  }

  const dayList = Array.from({ length: totalDays }, (_, i) => addDays(minStart, i));
  const monthGroups = [];
  dayList.forEach((d, i) => {
    const m = d.slice(0, 7);
    const last = monthGroups[monthGroups.length - 1];
    if (last && last.key === m) last.count++;
    else monthGroups.push({ key: m, count: 1, startIdx: i });
  });
  const todayIdx = diffDays(minStart, TODAY);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={exportImg} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}>
          <Download size={15} /> 匯出圖片
        </button>
      </div>
      <div className={`rounded-2xl border ${theme.border} ${theme.surface} overflow-auto`} style={{ maxHeight: 600 }}>
        <svg ref={svgRef} width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
          <rect x="0" y="0" width={chartW} height={chartH} fill={dark ? '#1f2937' : '#ffffff'} />
          {dayList.map((d, i) => {
            const dow = new Date(d + 'T00:00:00').getDay();
            if (dow !== 0 && dow !== 6) return null;
            return <rect key={'we' + i} x={labelW + i * dayW + pad} y={headerH} width={dayW} height={rows.length * rowH} fill={dark ? '#111827' : '#f1f3f4'} />;
          })}
          {monthGroups.map((g, i) => (
            <text key={'m' + i} x={labelW + g.startIdx * dayW + pad + 4} y={20} fontSize="12" fontWeight="600" fill={dark ? '#d1d5db' : '#5f6368'}>
              {Number(g.key.slice(5, 7))}月
            </text>
          ))}
          {dayList.map((d, i) => (
            <text key={'d' + i} x={labelW + i * dayW + pad + dayW / 2} y={42} fontSize="10" textAnchor="middle" fill={dark ? '#9ca3af' : '#80868b'}>
              {Number(d.slice(8, 10))}
            </text>
          ))}
          <line x1={labelW + pad} y1={headerH} x2={labelW + pad} y2={chartH} stroke={dark ? '#374151' : '#e0e0e0'} />
          {rows.map((t, i) => (
            <g key={'row' + t.id}>
              <rect x={0} y={headerH + i * rowH} width={labelW + pad} height={rowH} fill={i % 2 === 0 ? (dark ? '#1f2937' : '#ffffff') : (dark ? '#1a2129' : '#fafafa')} />
              <line x1={0} y1={headerH + i * rowH} x2={chartW} y2={headerH + i * rowH} stroke={dark ? '#374151' : '#eeeeee'} />
              <text x={12} y={headerH + i * rowH + rowH / 2 + 4} fontSize="12" fill={dark ? '#e5e7eb' : '#202124'}>{rowLabel(t)}</text>
            </g>
          ))}
          {todayIdx >= 0 && todayIdx < totalDays && (
            <g>
              <line x1={xFor(TODAY) + dayW / 2} y1={headerH} x2={xFor(TODAY) + dayW / 2} y2={chartH} stroke="#EA4335" strokeWidth="1.5" strokeDasharray="4,3" />
              <text x={xFor(TODAY) + dayW / 2 + 4} y={headerH - 6} fontSize="10" fill="#EA4335">今天</text>
            </g>
          )}
          <defs>
            <marker id="gantt-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={dark ? '#6b7280' : '#9aa0a6'} />
            </marker>
          </defs>
          {rows.map(t => (t.deps || []).map(depId => {
            const pi = rowIndex[depId];
            if (pi === undefined) return null;
            const pred = rows[pi];
            const ti = rowIndex[t.id];
            const x1 = xFor(pred.end) + dayW - 6;
            const y1 = headerH + pi * rowH + rowH / 2;
            const x2 = xFor(t.start);
            const y2 = headerH + ti * rowH + rowH / 2;
            const midX = x2 - 12;
            return <path key={depId + '-' + t.id} d={`M${x1},${y1} H${midX} V${y2} H${x2}`} fill="none" stroke={dark ? '#6b7280' : '#9aa0a6'} strokeWidth="1.5" markerEnd="url(#gantt-arrow)" />;
          }))}
          {rows.map((t, i) => {
            const y = headerH + i * rowH + rowH / 2;
            const sc = STATUS[t.status];
            if (t.milestone) {
              const cx = xFor(t.start) + dayW / 2;
              return <path key={'bar' + t.id} d={`M${cx},${y - 9} L${cx + 9},${y} L${cx},${y + 9} L${cx - 9},${y} Z`} fill={sc.color} />;
            }
            const x = xFor(t.start) + 3;
            const w = Math.max((diffDays(t.start, t.end) + 1) * dayW - 6, 10);
            return (
              <g key={'bar' + t.id}>
                <rect x={x} y={y - 12} width={w} height={24} rx={6} fill={sc.color} opacity={0.92} />
                {w > 50 && <text x={x + 8} y={y + 4} fontSize="11" fill="#ffffff" fontWeight="500">{t.assignee}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className={`flex gap-4 mt-3 text-xs flex-wrap ${theme.sub}`}>
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }}></span>{v.label}</div>
        ))}
        <div className="flex items-center gap-1.5"><Flag size={12} />里程碑</div>
      </div>
    </div>
  );
}

function CalendarView({ theme, tasks, meetings, projects, onAddMeeting, showTasks, setShowTasks, showMeetings, setShowMeetings, showMilestones, setShowMilestones }) {
  const [sel, setSel] = useState(16);
  const [showForm, setShowForm] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mTime, setMTime] = useState('10:00');
  const [mProject, setMProject] = useState(projects[0] ? projects[0].id : '');

  const firstDow = new Date(2026, 5, 1).getDay();
  const daysInMonth = new Date(2026, 6, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const dateStr = d => `2026-06-${String(d).padStart(2, '0')}`;

  const dayTasks = d => showTasks ? tasks.filter(t => !t.milestone && t.start <= dateStr(d) && t.end >= dateStr(d)) : [];
  const dayMilestones = d => showMilestones ? tasks.filter(t => t.milestone && t.end === dateStr(d)) : [];
  const dayMeetings = d => showMeetings ? meetings.filter(m => m.date === dateStr(d)) : [];

  function submitMeeting() {
    if (!mTitle.trim()) return;
    onAddMeeting({ id: 'm' + Date.now(), projectId: mProject, title: mTitle, date: dateStr(sel), time: mTime });
    setMTitle(''); setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 flex-wrap text-sm">
        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={showTasks} onChange={e => setShowTasks(e.target.checked)} className="rounded" /><span className={theme.text}>任務</span></label>
        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={showMeetings} onChange={e => setShowMeetings(e.target.checked)} className="rounded" /><span className={theme.text}>會議</span></label>
        <label className="flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={showMilestones} onChange={e => setShowMilestones(e.target.checked)} className="rounded" /><span className={theme.text}>里程碑</span></label>
      </div>
      <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-4`}>
        <div className={`text-sm font-semibold mb-3 ${theme.text}`}>2026年 6月</div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className={`text-xs py-1 ${theme.sub}`}>{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i}></div>;
            const has = dayTasks(d).length > 0 || dayMeetings(d).length > 0 || dayMilestones(d).length > 0;
            const isToday = d === 16;
            return (
              <div key={i} onClick={() => { setSel(d); setShowForm(false); }} className={`aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer text-sm relative ${sel === d ? 'ring-2 ring-blue-500' : ''} ${isToday ? 'font-bold' : ''} ${theme.hover} ${theme.text}`}>
                {d}
                {has && (
                  <span className="flex gap-0.5 absolute bottom-1">
                    {dayTasks(d).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                    {dayMeetings(d).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                    {dayMilestones(d).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`mt-4 rounded-2xl border ${theme.border} ${theme.surface} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-semibold ${theme.text}`}>{dateStr(sel)}</span>
          <button onClick={() => setShowForm(s => !s)} className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${theme.border} ${theme.hover}`}>+ 新增會議</button>
        </div>
        {showForm && (
          <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg border flex-wrap ${theme.border}`}>
            <input value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="會議主題" className={`text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
            <input type="time" value={mTime} onChange={e => setMTime(e.target.value)} className={`text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
            <select value={mProject} onChange={e => setMProject(e.target.value)} className={`text-sm rounded-lg border px-2 py-1.5 ${theme.input}`}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={submitMeeting} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">新增</button>
          </div>
        )}
        {dayMeetings(sel).map(m => (
          <div key={m.id} className="flex items-center gap-2 py-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className={`text-sm ${theme.text}`}>{m.time} {m.title}</span>
          </div>
        ))}
        {dayMilestones(sel).map(t => (
          <div key={t.id} className="flex items-center gap-2 py-1.5">
            <Flag size={12} className="text-yellow-500" />
            <span className={`text-sm ${theme.text}`}>{t.title}(里程碑)</span>
          </div>
        ))}
        {dayTasks(sel).map(t => (
          <div key={t.id} className="flex items-center gap-2 py-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS[t.status].color }}></span>
            <span className={`text-sm ${theme.text}`}>{t.title}</span>
          </div>
        ))}
        {dayMeetings(sel).length === 0 && dayMilestones(sel).length === 0 && dayTasks(sel).length === 0 && !showForm && <div className={`text-sm ${theme.sub}`}>當日無項目</div>}
      </div>
    </div>
  );
}

function FileSection({ theme, icon: Icon, title, count, children }) {
  return (
    <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-4 mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={theme.sub} />
        <span className={`text-sm font-semibold ${theme.text}`}>{title}</span>
        <span className={`text-xs ${theme.sub}`}>({count})</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function FileRow({ theme, icon: Icon, title, sub, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${theme.hover}`}>
      <Icon size={16} className={theme.sub} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${theme.text}`}>{title}</div>
        <div className={`text-xs ${theme.sub}`}>{sub}</div>
      </div>
      <ChevronRight size={14} className={theme.sub} />
    </div>
  );
}
function FilesView({ theme, notes, attachments, tasks, onOpenNote, onOpenTask, onOpenAttachment }) {
  return (
    <div>
      <FileSection theme={theme} icon={FileText} title="文件筆記" count={notes.length}>
        {notes.length === 0 && <div className={`text-sm px-3 ${theme.sub}`}>尚無文件</div>}
        {notes.map(n => <FileRow key={n.id} theme={theme} icon={FileText} title={n.title} sub={`${n.blocks.length} 個區塊`} onClick={() => onOpenNote(n.id)} />)}
      </FileSection>
      <FileSection theme={theme} icon={CheckSquare} title="相關任務" count={tasks.length}>
        {tasks.map(t => <FileRow key={t.id} theme={theme} icon={CheckSquare} title={t.title} sub={`${STATUS[t.status].label} · ${t.assignee}`} onClick={() => onOpenTask(t.id)} />)}
      </FileSection>
      <FileSection theme={theme} icon={Paperclip} title="附件檔案" count={attachments.length}>
        {attachments.length === 0 && <div className={`text-sm px-3 ${theme.sub}`}>尚無附件</div>}
        {attachments.map(a => <FileRow key={a.id} theme={theme} icon={Paperclip} title={a.name} sub={`${a.size} · ${a.by} · ${a.date}`} onClick={() => onOpenAttachment(a.id)} />)}
      </FileSection>
    </div>
  );
}

function NotesView({ theme, notes, selectedNoteId, onSelectNote, onToggleTodo, onAddBlock, onAddNote }) {
  const [draft, setDraft] = useState('');
  const [draftType, setDraftType] = useState('text');
  const [addingNote, setAddingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const note = notes.find(n => n.id === selectedNoteId) || notes[0];
  return (
    <div className="flex gap-4 flex-col md:flex-row">
      <div className={`w-full md:w-56 flex-shrink-0 rounded-2xl border ${theme.border} ${theme.surface} p-2`}>
        {notes.map(n => (
          <div key={n.id} onClick={() => onSelectNote(n.id)} className={`px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 flex items-center gap-1.5 ${note && n.id === note.id ? (theme.dark ? 'bg-gray-700' : 'bg-blue-50') : theme.hover} ${theme.text}`}>
            <FileText size={13} />{n.title}
          </div>
        ))}
        {addingNote ? (
          <div className="flex gap-1 mt-1 px-1">
            <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="筆記標題" className={`flex-1 text-xs rounded-lg border px-2 py-1.5 ${theme.input}`} />
            <button onClick={() => { if (!newTitle.trim()) return; onAddNote(newTitle); setNewTitle(''); setAddingNote(false); }} className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white">新增</button>
          </div>
        ) : (
          <button onClick={() => setAddingNote(true)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 ${theme.hover} ${theme.sub}`}>
            <Plus size={13} />新增筆記
          </button>
        )}
      </div>
      <div className={`flex-1 rounded-2xl border ${theme.border} ${theme.surface} p-6`}>
        {!note ? <div className={`text-sm ${theme.sub}`}>此專案尚無筆記文件,請先新增一份。</div> : (
          <>
            <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>{note.title}</h3>
            <div className="space-y-2">
              {note.blocks.map(b => {
                if (b.type === 'heading') return <div key={b.id} className={`text-base font-semibold mt-3 ${theme.text}`}>{b.text}</div>;
                if (b.type === 'todo') return (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={b.done} onChange={() => onToggleTodo(note.id, b.id)} className="rounded" />
                    <span className={`text-sm ${b.done ? theme.sub + ' line-through' : theme.text}`}>{b.text}</span>
                  </label>
                );
                return <p key={b.id} className={`text-sm leading-relaxed whitespace-pre-wrap ${theme.text}`}>{b.text}</p>;
              })}
            </div>
            <div className={`flex items-center gap-2 mt-5 pt-4 border-t flex-wrap ${theme.border}`}>
              <select value={draftType} onChange={e => setDraftType(e.target.value)} className={`text-xs rounded-lg border px-2 py-1.5 ${theme.input}`}>
                <option value="text">文字</option>
                <option value="heading">標題</option>
                <option value="todo">待辦</option>
              </select>
              <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="新增區塊內容..." className={`flex-1 text-sm rounded-lg border px-3 py-1.5 ${theme.input}`} />
              <button onClick={() => { if (!draft.trim()) return; onAddBlock(note.id, draftType, draft); setDraft(''); }} className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">新增</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TaskDetailPanel({ task, theme, customFields, onClose, onChange, onAddComment, onToggleSubtask, onDelete }) {
  const [commentDraft, setCommentDraft] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  if (!task) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className={`relative w-full max-w-md h-full ${theme.surface} ${theme.text} overflow-y-auto shadow-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-medium ${theme.sub}`}>任務詳情</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hover}`}><X size={18} /></button>
        </div>
        <input value={task.title} onChange={e => onChange('title', e.target.value)} className={`w-full text-lg font-semibold mb-4 bg-transparent outline-none border-b ${theme.border} pb-2`} />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>狀態</label>
            <select value={task.status} onChange={e => onChange('status', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>優先級</label>
            <select value={task.priority} onChange={e => onChange('priority', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>開始日期</label>
            <input type="date" value={task.start} onChange={e => onChange('start', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>開始時間</label>
            <input type="time" value={task.startTime} onChange={e => onChange('startTime', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>截止日期</label>
            <input type="date" value={task.end} onChange={e => onChange('end', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>截止時間</label>
            <input type="time" value={task.endTime} onChange={e => onChange('endTime', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
          <div className="col-span-2">
            <label className={`text-xs ${theme.sub} block mb-1`}>負責人</label>
            <input value={task.assignee} onChange={e => onChange('assignee', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
        </div>
        {customFields.length > 0 && (
          <div className="mb-4">
            <label className={`text-xs ${theme.sub} block mb-2`}>自訂欄位</label>
            <div className="space-y-2">
              {customFields.map(cf => (
                <div key={cf.id} className="flex items-center gap-2">
                  <span className={`text-xs w-28 flex-shrink-0 ${theme.sub}`}>{cf.name}</span>
                  <input type={cf.type === 'number' ? 'number' : 'text'} value={(task.custom && task.custom[cf.id]) || ''} onChange={e => onChange('custom', { ...task.custom, [cf.id]: e.target.value })} className={`flex-1 text-sm rounded-lg border px-2 py-1 ${theme.input}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className={`text-xs ${theme.sub} block mb-1`}>說明</label>
          <textarea value={task.desc || ''} onChange={e => onChange('desc', e.target.value)} rows={3} className={`w-full text-sm rounded-lg border px-3 py-2 ${theme.input}`} />
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mb-4">
            <label className={`text-xs ${theme.sub} block mb-2`}>子任務</label>
            {task.subtasks.map(st => (
              <label key={st.id} className="flex items-center gap-2 mb-1 cursor-pointer">
                <input type="checkbox" checked={st.done} onChange={() => onToggleSubtask(st.id)} className="rounded" />
                <span className={`text-sm ${st.done ? theme.sub + ' line-through' : theme.text}`}>{st.text}</span>
              </label>
            ))}
          </div>
        )}
        <div>
          <label className={`text-xs ${theme.sub} block mb-2`}>留言</label>
          {(task.comments || []).map(c => (
            <div key={c.id} className="mb-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: avatarColor(c.user) }}>{initials(c.user)}</div>
                <span className={`text-xs font-medium ${theme.text}`}>{c.user}</span>
                <span className={`text-xs ${theme.sub}`}>{c.time}</span>
              </div>
              <div className={`text-sm ml-6 ${theme.text}`}>{c.text}</div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)} placeholder="新增留言..." className={`flex-1 text-sm rounded-lg border px-3 py-1.5 ${theme.input}`} />
            <button onClick={() => { if (!commentDraft.trim()) return; onAddComment(commentDraft); setCommentDraft(''); }} className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">送出</button>
          </div>
        </div>
        <div className={`mt-6 pt-4 border-t ${theme.border}`}>
          {!confirmDel ? (
            <button onClick={() => setConfirmDel(true)} className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5"><Trash2 size={14} />刪除任務</button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-red-500">確定要刪除這個任務嗎?</span>
              <button onClick={() => onDelete(task.id)} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-red-500 text-white">確定刪除</button>
              <button onClick={() => setConfirmDel(false)} className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${theme.border}`}>取消</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({ theme, projects, defaultProjectId, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0] && projects[0].id) || '');
  const [creatingNew, setCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState(TODAY);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(TODAY);
  const [endTime, setEndTime] = useState('18:00');
  const [milestone, setMilestone] = useState(false);

  function handleSubmit() {
    if (!title.trim()) return;
    if (creatingNew && !newProjectName.trim()) return;
    onSubmit({ title, isNewProject: creatingNew, newProjectName, projectId, assignee: assignee || '未指派', priority, startDate, startTime, endDate, endTime, milestone });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl ${theme.surface} ${theme.text} p-6 shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">新增任務</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hover}`}><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>標題</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={`w-full text-sm rounded-lg border px-3 py-2 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>所屬專案</label>
            {!creatingNew ? (
              <div className="flex gap-2">
                <select value={projectId} onChange={e => setProjectId(e.target.value)} className={`flex-1 text-sm rounded-lg border px-2 py-2 ${theme.input}`}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={() => setCreatingNew(true)} className={`text-xs font-medium px-3 py-2 rounded-lg border ${theme.border} ${theme.hover} whitespace-nowrap`}>+ 新專案</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="新專案名稱" className={`flex-1 text-sm rounded-lg border px-3 py-2 ${theme.input}`} />
                <button onClick={() => setCreatingNew(false)} className={`text-xs font-medium px-3 py-2 rounded-lg border ${theme.border} ${theme.hover}`}>取消</button>
              </div>
            )}
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>負責人</label>
            <input value={assignee} onChange={e => setAssignee(e.target.value)} className={`w-full text-sm rounded-lg border px-3 py-2 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>優先級</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs ${theme.sub} block mb-1`}>開始日期</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`} />
            </div>
            <div>
              <label className={`text-xs ${theme.sub} block mb-1`}>開始時間</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`} />
            </div>
            <div>
              <label className={`text-xs ${theme.sub} block mb-1`}>截止日期</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`} />
            </div>
            <div>
              <label className={`text-xs ${theme.sub} block mb-1`}>截止時間</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={milestone} onChange={e => setMilestone(e.target.checked)} className="rounded" />
            <span className={`text-sm ${theme.text}`}>標記為里程碑</span>
          </label>
        </div>
        <button onClick={handleSubmit} className="w-full mt-5 text-sm font-medium px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">建立任務</button>
      </div>
    </div>
  );
}

function ProjectModal({ theme, initial, onClose, onSubmit }) {
  const [name, setName] = useState(initial ? initial.name : '');
  const [desc, setDesc] = useState(initial ? initial.desc : '');
  const [color, setColor] = useState(initial ? initial.color : PROJECT_COLORS[0]);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className={`relative w-full max-w-sm rounded-2xl ${theme.surface} ${theme.text} p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">{initial ? '編輯專案' : '新增專案'}</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hover}`}><X size={18} /></button>
        </div>
        <label className={`text-xs ${theme.sub} block mb-1`}>專案名稱</label>
        <input value={name} onChange={e => setName(e.target.value)} className={`w-full text-sm rounded-lg border px-3 py-2 mb-3 ${theme.input}`} />
        <label className={`text-xs ${theme.sub} block mb-1`}>描述</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} className={`w-full text-sm rounded-lg border px-3 py-2 mb-3 ${theme.input}`} />
        <label className={`text-xs ${theme.sub} block mb-2`}>顏色</label>
        <div className="flex gap-2 mb-5 flex-wrap">
          {PROJECT_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full" style={{ backgroundColor: c, boxShadow: color === c ? '0 0 0 2px white, 0 0 0 4px #111827' : 'none' }}></button>
          ))}
        </div>
        <button onClick={() => { if (!name.trim()) return; onSubmit({ name, desc, color }); }} className="w-full text-sm font-medium px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{initial ? '儲存變更' : '建立專案'}</button>
      </div>
    </div>
  );
}

function StickyNote({ note, onMove, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(note.content);
  function onMouseDown(e) {
    const startX = e.clientX, startY = e.clientY;
    const origX = note.x, origY = note.y;
    function onMove2(ev) { onMove(note.id, origX + (ev.clientX - startX), origY + (ev.clientY - startY)); }
    function onUp() { window.removeEventListener('mousemove', onMove2); window.removeEventListener('mouseup', onUp); }
    window.addEventListener('mousemove', onMove2);
    window.addEventListener('mouseup', onUp);
  }
  return (
    <div style={{ position: 'absolute', left: note.x, top: note.y, width: 180, backgroundColor: note.color }} className="rounded-xl shadow-md p-2.5 select-none">
      <div onMouseDown={onMouseDown} className="flex items-center justify-between mb-1 cursor-move">
        <span className="flex items-center gap-1.5">
          <GripVertical size={13} className="text-gray-500" />
          {note.category && <span className="text-[10px] text-gray-600 bg-black/10 rounded px-1.5 py-0.5">{note.category}</span>}
        </span>
        <button onClick={() => onDelete(note.id)} className="text-gray-500 hover:text-red-500 text-xs">✕</button>
      </div>
      {note.type === 'image' ? (
        <img src={note.content} alt="note" className="w-full rounded-lg" />
      ) : editing ? (
        <textarea autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => { onEdit(note.id, val); setEditing(false); }} className="w-full text-sm bg-transparent outline-none resize-none text-gray-800" rows={4} />
      ) : (
        <p onDoubleClick={() => setEditing(true)} className="text-sm text-gray-800 whitespace-pre-wrap break-words">{note.content}</p>
      )}
    </div>
  );
}

function CreativeBoard({ theme }) {
  const [categories, setCategories] = useState(['發想', '設計', '技術', '其他']);
  const [activeCat, setActiveCat] = useState('all');
  const [draftCat, setDraftCat] = useState('發想');
  const [newCat, setNewCat] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [notes, setNotes] = useState([
    { id: 'bn1', x: 30, y: 30, color: NOTE_COLORS[0], type: 'text', category: '發想', content: '新功能發想:可以加入語音輸入待辦事項?' },
    { id: 'bn2', x: 260, y: 80, color: NOTE_COLORS[1], type: 'text', category: '設計', content: '品牌色可以再活潑一點' },
  ]);
  const fileInputRef = useRef(null);

  function addTextNote() {
    const id = 'bn' + Date.now();
    setNotes(prev => [...prev, { id, x: 60 + Math.random() * 250, y: 60 + Math.random() * 200, color: NOTE_COLORS[prev.length % NOTE_COLORS.length], type: 'text', category: draftCat, content: '雙擊編輯內容...' }]);
  }
  function addImageNote(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const id = 'bn' + Date.now();
      setNotes(prev => [...prev, { id, x: 60 + Math.random() * 250, y: 60 + Math.random() * 200, color: '#ffffff', type: 'image', category: draftCat, content: reader.result }]);
    };
    reader.readAsDataURL(file);
  }
  function updateNotePos(id, x, y) { setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n)); }
  function updateNoteContent(id, content) { setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n)); }
  function deleteNote(id) { setNotes(prev => prev.filter(n => n.id !== id)); }
  function addCategory() {
    if (!newCat.trim()) return;
    setCategories(prev => [...prev, newCat.trim()]);
    setDraftCat(newCat.trim());
    setNewCat(''); setAddingCat(false);
  }

  const visibleNotes = activeCat === 'all' ? notes : notes.filter(n => n.category === activeCat);
  const pillCls = active => `text-xs px-2.5 py-1 rounded-full font-medium ${active ? 'bg-blue-600 text-white' : `${theme.bg} ${theme.sub} ${theme.hover}`}`;

  return (
    <div>
      <h2 className={`text-lg font-semibold mb-1 ${theme.text}`}>創意紀錄板</h2>
      <p className={`text-sm mb-3 ${theme.sub}`}>雙擊便利貼可編輯文字,拖曳上方把手可移動位置</p>
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <button onClick={() => setActiveCat('all')} className={pillCls(activeCat === 'all')}>全部</button>
        {categories.map(c => <button key={c} onClick={() => setActiveCat(c)} className={pillCls(activeCat === c)}>{c}</button>)}
      </div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <select value={draftCat} onChange={e => setDraftCat(e.target.value)} className={`text-sm rounded-lg border px-2 py-1.5 ${theme.input}`}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={addTextNote} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}><Plus size={14} />文字便利貼</button>
        <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}><Plus size={14} />插入圖片</button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files[0]) addImageNote(e.target.files[0]); e.target.value = ''; }} />
        {addingCat ? (
          <span className="flex items-center gap-1">
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="新分類名稱" className={`text-xs rounded-lg border px-2 py-1.5 ${theme.input}`} style={{ width: 100 }} />
            <button onClick={addCategory} className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-600 text-white">新增</button>
          </span>
        ) : (
          <button onClick={() => setAddingCat(true)} className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border ${theme.border} ${theme.hover}`}>+ 自訂分類</button>
        )}
      </div>
      <div className={`relative rounded-2xl border ${theme.border} overflow-hidden`} style={{ height: 520, backgroundImage: 'radial-gradient(circle, #00000014 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: theme.dark ? '#111827' : '#fafafa' }}>
        {visibleNotes.map(n => <StickyNote key={n.id} note={n} onMove={updateNotePos} onEdit={updateNoteContent} onDelete={deleteNote} />)}
      </div>
    </div>
  );
}

function IdeaMasterPage({ theme, logActivity }) {
  const [topics, setTopics] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [report, setReport] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [saved, setSaved] = useState([]);
  const [categories, setCategories] = useState(['行銷', '產品', '社群', '其他']);
  const [newCat, setNewCat] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  function startProgress(setP) {
    setP(8);
    return setInterval(() => setP(p => (p < 90 ? p + Math.random() * 10 : p)), 350);
  }

  async function fetchIdeas() {
    setError(''); setTopics([]); setReport(''); setSources([]); setLoading(true);
    const timer = startProgress(setProgress);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: "請使用網路搜尋,找出近期在網路上曝光量暴增、討論度與瀏覽數很高的話題或議題,共6個,適合作為內容企劃靈感。針對每個話題,用繁體中文整理 title(話題名稱)、reason(為什麼會紅,一句話)、angle(可發展的內容切入角度建議,一句話)。只回覆一個 JSON 陣列,不要有任何說明文字、前言或 Markdown 標記,格式必須是:[{\"title\":\"\",\"reason\":\"\",\"angle\":\"\"}]" }],
          tools: [{ type: "web_search_20250305", name: "web_search" }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      const clean = text.replace(/```json|```/g, '').trim();
      setTopics(JSON.parse(clean));
      const srcs = [];
      (data.content || []).filter(b => b.type === 'web_search_tool_result').forEach(b => {
        (b.content || []).forEach(r => { if (r.url) srcs.push({ title: r.title || r.url, url: r.url }); });
      });
      setSources(srcs.slice(0, 8));
    } catch (err) {
      setError('搜尋失敗,請稍後再試一次。');
    } finally {
      clearInterval(timer); setProgress(100);
      setTimeout(() => { setLoading(false); setProgress(0); }, 400);
    }
  }

  async function fetchReport() {
    setReportLoading(true);
    const timer = startProgress(setReportProgress);
    try {
      const topicsText = topics.map((t, i) => `${i + 1}. ${t.title} — ${t.reason}(切入角度:${t.angle})`).join('\n');
      const srcText = sources.length ? `\n參考來源:\n${sources.map(s => `- ${s.title}(${s.url})`).join('\n')}` : '';
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: `你是一位企劃顧問。根據以下熱門話題清單與參考來源,用繁體中文撰寫一份給內部團隊參考的企劃報告,使用 Markdown 標題與條列,內容包含:總覽摘要、各話題建議執行方式、優先順序建議、參考資料。話題清單:\n${topicsText}${srcText}` }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      setReport(text);
    } catch (err) {
      setError('報告生成失敗,請稍後再試一次。');
    } finally {
      clearInterval(timer); setReportProgress(100);
      setTimeout(() => { setReportLoading(false); setReportProgress(0); }, 400);
    }
  }

  function downloadReport() {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '熱門話題企劃報告.md';
    a.click();
  }

  function saveIdea(t) {
    setSaved(prev => [...prev, { id: 'sv' + Date.now(), title: t.title, reason: t.reason, angle: t.angle, category: categories[0] }]);
    if (logActivity) logActivity(null, `收藏了點子「${t.title}」`);
  }
  function deleteSaved(id) { setSaved(prev => prev.filter(s => s.id !== id)); }
  function updateSavedCategory(id, cat) { setSaved(prev => prev.map(s => s.id === id ? { ...s, category: cat } : s)); }
  function addCategory() {
    if (!newCat.trim()) return;
    setCategories(prev => [...prev, newCat.trim()]);
    setNewCat(''); setAddingCat(false);
  }

  const visibleSaved = filterCat === 'all' ? saved : saved.filter(s => s.category === filterCat);
  const pillCls = active => `text-xs px-2.5 py-1 rounded-full font-medium ${active ? 'bg-blue-600 text-white' : `${theme.bg} ${theme.sub} ${theme.hover}`}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className={`text-lg font-semibold ${theme.text}`}>點子大師</h2>
          <p className={`text-sm ${theme.sub}`}>搜尋近期熱門話題,協助發想內容企劃</p>
        </div>
        <button onClick={fetchIdeas} disabled={loading} className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? '搜尋中...' : '搜尋熱門話題'}
        </button>
      </div>
      {loading && (
        <div className="mb-4">
          <div className={`h-1.5 rounded-full overflow-hidden ${theme.dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="h-1.5 bg-blue-600 transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}></div>
          </div>
          <div className={`text-xs mt-1 ${theme.sub}`}>搜尋並整理話題中... {Math.min(Math.round(progress), 99)}%</div>
        </div>
      )}
      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {topics.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {topics.map((t, i) => (
              <div key={i} className={`rounded-2xl border ${theme.border} ${theme.surface} p-4`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className={`font-medium ${theme.text}`}>{t.title}</div>
                  <button onClick={() => saveIdea(t)} className={`text-xs px-2 py-1 rounded-lg border ${theme.border} ${theme.hover} whitespace-nowrap flex-shrink-0`}>★ 收藏</button>
                </div>
                <div className={`text-sm mb-2 ${theme.sub}`}>{t.reason}</div>
                <div className="text-xs px-2 py-1 rounded-full inline-block" style={{ backgroundColor: '#4285F420', color: '#4285F4' }}>{t.angle}</div>
              </div>
            ))}
          </div>
          {sources.length > 0 && (
            <div className="mb-4">
              <div className={`text-xs font-medium mb-1.5 ${theme.sub}`}>參考資料</div>
              <div className="flex flex-col gap-1">
                {sources.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate">{s.title}</a>)}
              </div>
            </div>
          )}
          <button onClick={fetchReport} disabled={reportLoading} className={`text-sm font-medium px-4 py-2 rounded-lg border ${theme.border} ${theme.hover} ${theme.text} disabled:opacity-50`}>
            {reportLoading ? '生成中...' : '生成完整企劃報告'}
          </button>
          {reportLoading && (
            <div className="mt-3 max-w-xs">
              <div className={`h-1.5 rounded-full overflow-hidden ${theme.dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="h-1.5 bg-blue-600 transition-all duration-300" style={{ width: `${Math.min(reportProgress, 100)}%` }}></div>
              </div>
              <div className={`text-xs mt-1 ${theme.sub}`}>報告生成中... {Math.min(Math.round(reportProgress), 99)}%</div>
            </div>
          )}
        </>
      )}
      {report && (
        <div className={`mt-4 rounded-2xl border ${theme.border} ${theme.surface} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${theme.text}`}>企劃報告</span>
            <button onClick={downloadReport} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover}`}><Download size={13} />匯出</button>
          </div>
          <pre className={`text-sm whitespace-pre-wrap font-sans ${theme.text}`}>{report}</pre>
        </div>
      )}
      <div className={`mt-6 rounded-2xl border ${theme.border} ${theme.surface} p-5`}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className={`text-sm font-semibold ${theme.text}`}>已收藏的點子({saved.length})</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setFilterCat('all')} className={pillCls(filterCat === 'all')}>全部</button>
            {categories.map(c => <button key={c} onClick={() => setFilterCat(c)} className={pillCls(filterCat === c)}>{c}</button>)}
            {addingCat ? (
              <span className="flex items-center gap-1">
                <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="新分類" className={`text-xs rounded-lg border px-2 py-1 ${theme.input}`} style={{ width: 80 }} />
                <button onClick={addCategory} className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white">新增</button>
              </span>
            ) : (
              <button onClick={() => setAddingCat(true)} className={`text-xs px-2 py-1 rounded-lg border ${theme.border} ${theme.hover}`}>+ 分類</button>
            )}
          </div>
        </div>
        {visibleSaved.length === 0 ? <div className={`text-sm ${theme.sub}`}>尚無收藏的點子</div> : (
          <div className="space-y-2">
            {visibleSaved.map(s => (
              <div key={s.id} className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border ${theme.border}`}>
                <div className="min-w-0">
                  <div className={`text-sm font-medium truncate ${theme.text}`}>{s.title}</div>
                  <div className={`text-xs truncate ${theme.sub}`}>{s.reason}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <select value={s.category} onChange={e => updateSavedCategory(s.id, e.target.value)} className={`text-xs rounded-lg border px-1.5 py-1 ${theme.input}`}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={() => deleteSaved(s.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingRecorderPage({ theme, projects, setNotes, logActivity }) {
  const recognitionRef = useRef(null);
  const wantRecRef = useRef(false);
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [minutes, setMinutes] = useState('');
  const [minutesLoading, setMinutesLoading] = useState(false);
  const [saveProjectId, setSaveProjectId] = useState(projects[0] ? projects[0].id : '');
  const [savedMsg, setSavedMsg] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [micError, setMicError] = useState(false);

  async function loadDevices() {
    setMicError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      const list = await navigator.mediaDevices.enumerateDevices();
      const mics = list.filter(d => d.kind === 'audioinput');
      setDevices(mics);
      if (mics.length > 0) setSelectedDevice(mics[0].deviceId); else setMicError(true);
    } catch (err) {
      setDevices([]); setMicError(true);
    }
  }
  useEffect(() => {
    loadDevices();
    return () => { wantRecRef.current = false; if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} } };
  }, []);

  async function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    setSupported(true);
    try {
      const constraints = selectedDevice ? { audio: { deviceId: { exact: selectedDevice } } } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {}
    const recog = new SR();
    recog.lang = 'zh-TW';
    recog.continuous = true;
    recog.interimResults = false;
    recog.onresult = (e) => {
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
      if (finalText) setTranscript(prev => prev + finalText);
    };
    recog.onerror = () => {};
    recog.onend = () => { if (wantRecRef.current) { try { recog.start(); } catch (err) {} } };
    recognitionRef.current = recog;
    wantRecRef.current = true;
    setRecording(true);
    try { recog.start(); } catch (err) {}
  }
  function stopRecording() {
    wantRecRef.current = false;
    setRecording(false);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (err) {} }
  }

  async function generateMinutes() {
    if (!transcript.trim()) return;
    setMinutesLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          messages: [{ role: "user", content: `請將以下會議逐字稿整理成正式的會議紀錄,使用繁體中文與 Markdown 格式,需包含:會議主題、討論重點、決議事項、待辦事項與負責人(若逐字稿未明確提及,合理標註「未提及」)。逐字稿:\n${transcript}` }]
        })
      });
      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      setMinutes(text);
    } catch (err) {
      setMinutes('整理失敗,請稍後再試一次。');
    } finally { setMinutesLoading(false); }
  }

  function saveAsNote() {
    if (!saveProjectId || !minutes) return;
    const id = 'n' + Date.now();
    setNotes(prev => [...prev, { id, projectId: saveProjectId, title: `會議紀錄 ${TODAY}`, blocks: [{ id: 'b' + Date.now(), type: 'text', text: minutes, done: false }] }]);
    setSavedMsg('已儲存到該專案的筆記!');
    if (logActivity) logActivity(saveProjectId, '新增了一筆會議紀錄');
    setTimeout(() => setSavedMsg(''), 2500);
  }

  return (
    <div>
      <h2 className={`text-lg font-semibold mb-1 ${theme.text}`}>會議紀錄</h2>
      <p className={`text-sm mb-4 ${theme.sub}`}>錄音轉文字後,由 AI 整理成正式會議紀錄(需使用支援語音辨識的瀏覽器,如 Chrome)。瀏覽器語音辨識僅能使用系統預設麥克風,以下裝置選擇用於確認麥克風是否可正常偵測使用。</p>
      {!supported && <div className="text-sm text-red-500 mb-3">此瀏覽器不支援語音辨識,建議使用 Chrome 開啟。</div>}
      <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-5 mb-4`}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <label className={`text-xs ${theme.sub}`}>麥克風輸入源</label>
          {micError || devices.length === 0 ? (
            <span className="text-xs text-red-500">未偵測到麥克風,請確認裝置已連接並允許瀏覽器使用麥克風權限</span>
          ) : (
            <select value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)} className={`text-xs rounded-lg border px-2 py-1 ${theme.input}`}>
              {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `麥克風裝置 ${d.deviceId.slice(0, 6)}`}</option>)}
            </select>
          )}
          <button onClick={loadDevices} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${theme.border} ${theme.hover}`}><RefreshCw size={11} />重新偵測</button>
        </div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <button onClick={recording ? stopRecording : startRecording} className={`text-sm font-medium px-4 py-2 rounded-lg text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {recording ? '■ 停止錄音' : '● 開始錄音'}
          </button>
          {recording && <span className="text-sm text-red-500 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>錄音中...</span>}
        </div>
        <textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="逐字稿會顯示在這裡,您也可以直接手動編輯..." rows={6} className={`w-full text-sm rounded-lg border px-3 py-2 ${theme.input}`} />
        <button onClick={generateMinutes} disabled={minutesLoading || !transcript.trim()} className="mt-3 text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
          {minutesLoading ? '整理中...' : '整理成會議紀錄'}
        </button>
      </div>
      {minutes && (
        <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-5`}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <span className={`text-sm font-semibold ${theme.text}`}>會議紀錄</span>
            <div className="flex items-center gap-2">
              <select value={saveProjectId} onChange={e => setSaveProjectId(e.target.value)} className={`text-xs rounded-lg border px-2 py-1.5 ${theme.input}`}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button onClick={saveAsNote} className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover}`}>存成筆記</button>
            </div>
          </div>
          {savedMsg && <div className="text-xs text-green-600 mb-2">{savedMsg}</div>}
          <pre className={`text-sm whitespace-pre-wrap font-sans ${theme.text}`}>{minutes}</pre>
        </div>
      )}
    </div>
  );
}

function MembersPage({ theme, projects, tasks }) {
  const members = useMemo(() => {
    const map = {};
    projects.forEach(p => (p.members || []).forEach(m => {
      if (!map[m]) map[m] = { name: m, projects: new Set(), active: 0, overdue: 0, done: 0 };
      map[m].projects.add(p.name);
    }));
    tasks.forEach(t => {
      if (!t.assignee || t.assignee === '未指派') return;
      if (!map[t.assignee]) map[t.assignee] = { name: t.assignee, projects: new Set(), active: 0, overdue: 0, done: 0 };
      const proj = projects.find(p => p.id === t.projectId);
      if (proj) map[t.assignee].projects.add(proj.name);
      if (t.status === 'done') map[t.assignee].done++; else map[t.assignee].active++;
      if (t.end < TODAY && t.status !== 'done') map[t.assignee].overdue++;
    });
    return Object.values(map);
  }, [projects, tasks]);

  return (
    <div>
      <h2 className={`text-lg font-semibold mb-1 flex items-center gap-1.5 ${theme.text}`}><Users size={18} />成員列表</h2>
      <p className={`text-sm mb-4 ${theme.sub}`}>所有專案中的成員與工作量總覽</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(m => (
          <div key={m.name} className={`rounded-2xl border ${theme.border} ${theme.surface} p-4`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-white font-medium" style={{ backgroundColor: avatarColor(m.name) }}>{initials(m.name)}</div>
              <div className={`font-medium ${theme.text}`}>{m.name}</div>
            </div>
            <div className={`text-xs mb-2 ${theme.sub}`}>參與專案:{Array.from(m.projects).join('、') || '—'}</div>
            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className={theme.sub}>進行中 <b className={theme.text}>{m.active}</b></span>
              <span className={theme.sub}>已完成 <b className={theme.text}>{m.done}</b></span>
              {m.overdue > 0 && <span className="text-red-500">逾期 <b>{m.overdue}</b></span>}
            </div>
          </div>
        ))}
        {members.length === 0 && <div className={`text-sm ${theme.sub}`}>尚無成員資料</div>}
      </div>
    </div>
  );
}

export default function App() {
    const [dark, setDark] = useState(false);
  const [view, setView] = useState('dashboard');
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('kanban');
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [meetings, setMeetings] = useState(SEED_MEETINGS);
  const [activityLog, setActivityLog] = useState(SEED_ACTIVITY);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [customFields, setCustomFields] = useState(SEED_CUSTOM_FIELDS);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [filterProjectIds, setFilterProjectIds] = useState([]);
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [showTasksCal, setShowTasksCal] = useState(true);
  const [showMeetingsCal, setShowMeetingsCal] = useState(true);
  const [showMilestonesCal, setShowMilestonesCal] = useState(true);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const theme = {
    dark,
    bg: dark ? 'bg-gray-900' : 'bg-gray-50',
    surface: dark ? 'bg-gray-800' : 'bg-white',
    border: dark ? 'border-gray-700' : 'border-gray-200',
    text: dark ? 'text-gray-100' : 'text-gray-900',
    sub: dark ? 'text-gray-400' : 'text-gray-500',
    hover: dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    input: dark ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
  };

  const project = projects.find(p => p.id === activeProjectId);
  const projectNotes = notes.filter(n => n.projectId === activeProjectId);
  const projectAttachments = SEED_ATTACHMENTS.filter(a => a.projectId === activeProjectId);
  const projectFields = customFields[activeProjectId] || [];
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const assignees = Array.from(new Set(tasks.map(t => t.assignee))).filter(Boolean);
  const filteredTasks = tasks.filter(t => filterProjectIds.includes(t.projectId) && (filterAssignee === 'all' || t.assignee === filterAssignee));
  const multiProject = filterProjectIds.length > 1;

  function logActivity(projectId, action) {
    setActivityLog(prev => [{ id: 'ac' + Date.now() + Math.random().toString(36).slice(2, 6), projectId, user: '我', action, time: '剛剛' }, ...prev].slice(0, 40));
  }

  function openProject(id) {
    setActiveProjectId(id); setView('project'); setActiveTab('kanban'); setSelectedNoteId(null);
    setFilterProjectIds([id]); setFilterAssignee('all');
  }
  function updateTask(field, value) {
    const current = tasks.find(t => t.id === selectedTaskId);
    setTasks(prev => prev.map(t => {
      if (t.id !== selectedTaskId) return t;
      const next = { ...t, [field]: value };
      if (field === 'status') next.completedDate = value === 'done' ? TODAY : null;
      return next;
    }));
    if (field === 'status' && current) logActivity(current.projectId, `將「${current.title}」狀態改為「${STATUS[value].label}」`);
  }
  function moveTask(id, status) {
    const t = tasks.find(x => x.id === id);
    setTasks(prev => prev.map(x => x.id === id ? { ...x, status, completedDate: status === 'done' ? TODAY : null } : x));
    if (t) logActivity(t.projectId, `將「${t.title}」移動到「${STATUS[status].label}」`);
  }
  function deleteTask(id) {
    const t = tasks.find(x => x.id === id);
    setTasks(prev => prev.filter(x => x.id !== id));
    setSelectedTaskId(null);
    if (t) logActivity(t.projectId, `刪除了任務「${t.title}」`);
  }
  function addComment(text) {
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, comments: [...(t.comments || []), { id: 'c' + Date.now(), user: '我', text, time: '剛剛' }] } : t));
  }
  function toggleSubtask(stId) {
    setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, subtasks: t.subtasks.map(s => s.id === stId ? { ...s, done: !s.done } : s) } : t));
  }
  function toggleNoteTodo(noteId, blockId) {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, blocks: n.blocks.map(b => b.id === blockId ? { ...b, done: !b.done } : b) } : n));
  }
  function addBlock(noteId, type, text) {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, blocks: [...n.blocks, { id: 'b' + Date.now(), type, text, done: false }] } : n));
  }
  function addNote(title) {
    const id = 'n' + Date.now();
    setNotes(prev => [...prev, { id, projectId: activeProjectId, title, blocks: [] }]);
    setSelectedNoteId(id);
    logActivity(activeProjectId, `新增了筆記「${title}」`);
  }
  function addCustomField() {
    if (!newFieldName.trim()) return;
    const id = 'cf' + Date.now();
    setCustomFields(prev => ({ ...prev, [activeProjectId]: [...(prev[activeProjectId] || []), { id, name: newFieldName, type: newFieldType }] }));
    setNewFieldName(''); setShowAddField(false);
  }
  function deleteCustomField(fieldId) {
    setCustomFields(prev => ({ ...prev, [activeProjectId]: (prev[activeProjectId] || []).filter(f => f.id !== fieldId) }));
  }
  function handleNewTask(data) {
    let pid = data.projectId;
    if (data.isNewProject) {
      pid = 'p' + Date.now();
      const newProj = { id: pid, name: data.newProjectName, color: PROJECT_COLORS[projects.length % PROJECT_COLORS.length], desc: '', members: [data.assignee] };
      setProjects(prev => [...prev, newProj]);
      setCustomFields(prev => ({ ...prev, [pid]: [] }));
      logActivity(pid, `建立了新專案「${data.newProjectName}」`);
    }
    const id = 't' + Date.now();
    const newTask = { id, projectId: pid, title: data.title, status: 'todo', assignee: data.assignee, start: data.startDate, end: data.endDate, startTime: data.startTime, endTime: data.endTime, priority: data.priority, milestone: data.milestone, deps: [], desc: '', subtasks: [], comments: [], custom: {}, completedDate: null };
    setTasks(prev => [...prev, newTask]);
    if (!filterProjectIds.includes(pid)) setFilterProjectIds(prev => [...prev, pid]);
    logActivity(pid, `建立了新任務「${data.title}」`);
    setShowNewTaskModal(false);
  }
  function handleNewProject(data) {
    const id = 'p' + Date.now();
    const newProj = { id, name: data.name, color: data.color, desc: data.desc, members: [] };
    setProjects(prev => [...prev, newProj]);
    setCustomFields(prev => ({ ...prev, [id]: [] }));
    logActivity(id, `建立了新專案「${data.name}」`);
    setShowNewProjectModal(false);
  }
  function handleEditProject(data) {
    setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, name: data.name, desc: data.desc, color: data.color } : p));
    logActivity(editingProject.id, '編輯了專案資訊');
    setEditingProject(null);
  }
  function deleteProject(id) {
    setConfirmDeleteId(id);
    if (view === 'project') setView('dashboard');
  }
  function doDeleteProject() {
    const id = confirmDeleteId;
    const proj = projects.find(p => p.id === id);
    if (!proj) { setConfirmDeleteId(null); return; }
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setNotes(prev => prev.filter(n => n.projectId !== id));
    setMeetings(prev => prev.filter(m => m.projectId !== id));
    setCustomFields(prev => { const cp = { ...prev }; delete cp[id]; return cp; });
    setFilterProjectIds(prev => prev.filter(pid => pid !== id));
    logActivity(null, `刪除了專案「${proj.name}」`);
    if (activeProjectId === id) { setActiveProjectId(null); setSelectedTaskId(null); }
    setConfirmDeleteId(null);
  }
  function exportDailyReport() {
    const completedToday = tasks.filter(t => t.completedDate === TODAY);
    const startedToday = tasks.filter(t => t.status === 'inprogress' && t.start === TODAY);
    const delayed = tasks.filter(t => t.end < TODAY && t.status !== 'done');
    const projName = pid => (projects.find(p => p.id === pid) || {}).name || '';
    const fmt = list => list.length ? list.map(t => `- ${t.title}(${projName(t.projectId)}・${t.assignee})`).join('\n') : '- 無';
    const text = `# 今日工作彙整報告(${TODAY})\n\n## 今日完成\n${fmt(completedToday)}\n\n## 今日開始進行\n${fmt(startedToday)}\n\n## Delay 項目\n${delayed.length ? delayed.map(t => `- ${t.title}(${projName(t.projectId)}・${t.assignee}・原訂 ${t.end} 截止)`).join('\n') : '- 無'}`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `今日工作彙整_${TODAY}.md`;
    a.click();
    logActivity(null, '匯出了今日工作彙整報告');
  }

  const _delProj = projects.find(p => p.id === confirmDeleteId);
  const deleteModal = confirmDeleteId && _delProj ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)}></div>
      <div className={`relative w-full max-w-sm rounded-2xl ${theme.surface} ${theme.text} p-6 shadow-2xl`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <div className="font-semibold">刪除專案</div>
            <div className={`text-xs ${theme.sub}`}>此操作無法復原</div>
          </div>
        </div>
        <p className={`text-sm mb-5 ${theme.text}`}>確定要刪除「<b>{_delProj.name}</b>」嗎?所屬任務、筆記與會議紀錄將一併刪除。</p>
        <div className="flex gap-2">
          <button onClick={() => setConfirmDeleteId(null)} className={`flex-1 text-sm font-medium py-2 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}>取消</button>
          <button onClick={doDeleteProject} className="flex-1 text-sm font-medium py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">確定刪除</button>
        </div>
      </div>
    </div>
  ) : null;

  if (view === 'idea') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={null} />
        <div className="max-w-6xl mx-auto px-6 py-6"><IdeaMasterPage theme={theme} logActivity={logActivity} /></div>
      </div>
    );
  }
  if (view === 'meeting') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={null} />
        <div className="max-w-6xl mx-auto px-6 py-6"><MeetingRecorderPage theme={theme} projects={projects} setNotes={setNotes} logActivity={logActivity} /></div>
      </div>
    );
  }
  if (view === 'board') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={null} />
        <div className="max-w-6xl mx-auto px-6 py-6"><CreativeBoard theme={theme} /></div>
      </div>
    );
  }
  if (view === 'members') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={null} />
        <div className="max-w-6xl mx-auto px-6 py-6"><MembersPage theme={theme} projects={projects} tasks={tasks} /></div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={null} />
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Dashboard theme={theme} projects={projects} tasks={tasks} activity={activityLog} onOpenProject={openProject} onNewTask={() => setShowNewTaskModal(true)} onNewProject={() => setShowNewProjectModal(true)} onEditProject={p => setEditingProject(p)} onDeleteProject={deleteProject} onExportDaily={exportDailyReport} />
        </div>
        {showNewTaskModal && <NewTaskModal theme={theme} projects={projects} defaultProjectId={projects[0] && projects[0].id} onClose={() => setShowNewTaskModal(false)} onSubmit={handleNewTask} />}
        {showNewProjectModal && <ProjectModal theme={theme} onClose={() => setShowNewProjectModal(false)} onSubmit={handleNewProject} />}
        {editingProject && <ProjectModal theme={theme} initial={editingProject} onClose={() => setEditingProject(null)} onSubmit={handleEditProject} />}
        {deleteModal}
      </div>
    );
  }

  const tabs = [
    { key: 'kanban', label: '看板', icon: LayoutGrid },
    { key: 'list', label: '列表', icon: List },
    { key: 'gantt', label: '甘特圖', icon: BarChart3 },
    { key: 'calendar', label: '日曆', icon: Calendar },
    { key: 'files', label: '總目錄', icon: FolderOpen },
    { key: 'notes', label: '筆記', icon: FileText },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={project} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mt-5 mb-2 flex-wrap gap-2">
          <button onClick={() => setView('dashboard')} className={`text-xs font-medium ${theme.sub} ${theme.hover} px-2 py-1 rounded-lg`}>← 回到總覽</button>
          {project && (
            <div className="flex items-center gap-1">
              <button onClick={() => setEditingProject(project)} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${theme.hover} ${theme.sub}`}><Pencil size={12} />編輯專案</button>
              <button onClick={() => deleteProject(activeProjectId)} className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${theme.hover} text-red-500`}><Trash2 size={12} />刪除專案</button>
            </div>
          )}
        </div>
        <div className={`flex items-center gap-1 border-b ${theme.border} mb-4 overflow-x-auto`}>
          {tabs.map(tb => {
            const Icon = tb.icon;
            const active = activeTab === tb.key;
            const cls = active ? 'border-blue-600 text-blue-600' : `border-transparent ${theme.sub} ${theme.hover}`;
            return (
              <button key={tb.key} onClick={() => setActiveTab(tb.key)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${cls}`}>
                <Icon size={15} />{tb.label}
              </button>
            );
          })}
          <div className="flex-1"></div>
          <button onClick={() => setShowNewTaskModal(true)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 mb-1 mr-2 rounded-lg ${theme.hover} text-blue-600 whitespace-nowrap`}>
            <Plus size={13} />新增任務
          </button>
          <button onClick={() => setShowAddField(s => !s)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 mb-1 rounded-lg border ${theme.border} ${theme.hover} whitespace-nowrap`}>
            <Settings size={13} />自訂欄位
          </button>
        </div>
        {showAddField && (
          <div className={`mb-4 p-3 rounded-xl border ${theme.border} ${theme.surface}`}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <input value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="欄位名稱" className={`text-sm rounded-lg border px-3 py-1.5 ${theme.input}`} />
              <select value={newFieldType} onChange={e => setNewFieldType(e.target.value)} className={`text-sm rounded-lg border px-2 py-1.5 ${theme.input}`}>
                <option value="text">文字</option><option value="number">數字</option>
              </select>
              <button onClick={addCustomField} className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">新增欄位</button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {projectFields.length === 0 && <span className={`text-xs ${theme.sub}`}>此專案尚無自訂欄位</span>}
              {projectFields.map(f => (
                <span key={f.id} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1.5 ${theme.bg} ${theme.sub}`}>
                  {f.name}
                  <button onClick={() => deleteCustomField(f.id)} className="hover:text-red-500"><X size={11} /></button>
                </span>
              ))}
            </div>
          </div>
        )}
        {(activeTab !== 'files' && activeTab !== 'notes') && (
          <FilterBar theme={theme} projects={projects} filterProjectIds={filterProjectIds} setFilterProjectIds={setFilterProjectIds} filterAssignee={filterAssignee} setFilterAssignee={setFilterAssignee} assignees={assignees} />
        )}
        <div className="pb-10">
          {activeTab === 'kanban' && <KanbanBoard tasks={filteredTasks} theme={theme} onCardClick={setSelectedTaskId} onDrop={moveTask} onDelete={deleteTask} projects={projects} multiProject={multiProject} />}
          {activeTab === 'list' && <ListView tasks={filteredTasks} theme={theme} onRowClick={setSelectedTaskId} onDelete={deleteTask} customFields={projectFields} projects={projects} multiProject={multiProject} />}
          {activeTab === 'gantt' && <GanttChart tasks={filteredTasks} theme={theme} dark={dark} exportLabel={multiProject ? '篩選結果' : (project ? project.name : '篩選結果')} projects={projects} multiProject={multiProject} />}
          {activeTab === 'calendar' && <CalendarView theme={theme} tasks={filteredTasks} meetings={meetings} projects={projects} onAddMeeting={m => { setMeetings(prev => [...prev, m]); logActivity(m.projectId, `新增了會議「${m.title}」`); }} showTasks={showTasksCal} setShowTasks={setShowTasksCal} showMeetings={showMeetingsCal} setShowMeetings={setShowMeetingsCal} showMilestones={showMilestonesCal} setShowMilestones={setShowMilestonesCal} />}
          {activeTab === 'files' && <FilesView theme={theme} notes={projectNotes} attachments={projectAttachments} tasks={tasks.filter(t => t.projectId === activeProjectId)} onOpenNote={id => { setActiveTab('notes'); setSelectedNoteId(id); }} onOpenTask={setSelectedTaskId} onOpenAttachment={id => setPreviewAttachment(SEED_ATTACHMENTS.find(a => a.id === id))} />}
          {activeTab === 'notes' && <NotesView theme={theme} notes={projectNotes} selectedNoteId={selectedNoteId || (projectNotes[0] && projectNotes[0].id)} onSelectNote={setSelectedNoteId} onToggleTodo={toggleNoteTodo} onAddBlock={addBlock} onAddNote={addNote} />}
        </div>
      </div>
      {selectedTask && <TaskDetailPanel task={selectedTask} theme={theme} customFields={projectFields} onClose={() => setSelectedTaskId(null)} onChange={updateTask} onAddComment={addComment} onToggleSubtask={toggleSubtask} onDelete={deleteTask} />}
      {previewAttachment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPreviewAttachment(null)}></div>
          <div className={`relative w-full max-w-sm rounded-2xl ${theme.surface} ${theme.text} p-6 shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-medium ${theme.sub}`}>檔案預覽</span>
              <button onClick={() => setPreviewAttachment(null)} className={`p-1.5 rounded-lg ${theme.hover}`}><X size={16} /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.bg}`}><Paperclip size={20} className={theme.sub} /></div>
              <div>
                <div className="font-medium">{previewAttachment.name}</div>
                <div className={`text-xs ${theme.sub}`}>{previewAttachment.size}</div>
              </div>
            </div>
            <div className={`text-sm mb-4 ${theme.sub}`}>由 {previewAttachment.by} 於 {previewAttachment.date} 上傳</div>
            <button disabled className={`w-full text-sm font-medium px-3 py-2 rounded-lg cursor-not-allowed ${theme.bg} ${theme.sub}`}>下載(示範資料無實際檔案)</button>
          </div>
        </div>
      )}
      {showNewTaskModal && <NewTaskModal theme={theme} projects={projects} defaultProjectId={activeProjectId} onClose={() => setShowNewTaskModal(false)} onSubmit={handleNewTask} />}
      {editingProject && <ProjectModal theme={theme} initial={editingProject} onClose={() => setEditingProject(null)} onSubmit={handleEditProject} />}
    </div>
  );
}