import { useState, useRef, useMemo } from "react";

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
  { id: 't1', projectId: 'p1', title: '需求訪談與分析', status: 'done', assignee: '小美', start: '2026-06-01', end: '2026-06-05', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: [], desc: '彙整現有使用者回饋與業務需求，確認本次改版範圍。', subtasks: [{ id: 'st1', text: '整理使用者調查結果', done: true }, { id: 'st2', text: '確認改版範圍', done: true }], comments: [{ id: 'c1', user: '阿凱', text: '範圍確認沒問題，可以開始設計', time: '06-05' }], custom: { cf1: 12 } },
  { id: 't2', projectId: 'p1', title: 'UI/UX 視覺設計', status: 'inprogress', assignee: '阿凱', start: '2026-06-04', end: '2026-06-14', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: ['t1'], desc: '依據訪談結果產出線框圖與視覺稿。', subtasks: [{ id: 'st3', text: '線框圖', done: true }, { id: 'st4', text: '視覺稿', done: false }], comments: [{ id: 'c2', user: '小美', text: '記得對齊品牌色票', time: '06-06' }], custom: { cf1: 24 } },
  { id: 't3', projectId: 'p1', title: '前端開發 - 首頁', status: 'inprogress', assignee: 'Leo', start: '2026-06-12', end: '2026-06-25', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['t2'], desc: '依視覺稿實作首頁與導覽元件。', subtasks: [], comments: [], custom: { cf1: 30 } },
  { id: 't4', projectId: 'p1', title: '後端 API 開發', status: 'todo', assignee: 'Tina', start: '2026-06-15', end: '2026-06-28', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['t1'], desc: '提供帳戶設定與個人化資料相關端點。', subtasks: [], comments: [], custom: { cf1: 28 } },
  { id: 't5', projectId: 'p1', title: '內部測試', status: 'todo', assignee: '小美', start: '2026-06-26', end: '2026-07-03', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['t3', 't4'], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 't6', projectId: 'p1', title: '上線發布', status: 'todo', assignee: '阿凱', start: '2026-07-04', end: '2026-07-04', startTime: '14:00', endTime: '15:00', priority: 'high', milestone: true, deps: ['t5'], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 't7', projectId: 'p1', title: '客戶驗收會議', status: 'review', assignee: 'Tina', start: '2026-06-20', end: '2026-06-20', startTime: '10:00', endTime: '11:00', priority: 'low', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'u1', projectId: 'p2', title: '市場調查與受眾分析', status: 'done', assignee: 'Wendy', start: '2026-06-01', end: '2026-06-06', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: { cf2: 'CA-208' } },
  { id: 'u2', projectId: 'p2', title: '創意內容企劃', status: 'inprogress', assignee: '阿凱', start: '2026-06-05', end: '2026-06-16', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: ['u1'], desc: '', subtasks: [], comments: [], custom: { cf2: 'CA-208' } },
  { id: 'u3', projectId: 'p2', title: '社群廣告素材製作', status: 'todo', assignee: 'Tina', start: '2026-06-15', end: '2026-06-24', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['u2'], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'u4', projectId: 'p2', title: '廣告投放上線', status: 'todo', assignee: 'Wendy', start: '2026-06-25', end: '2026-06-25', startTime: '09:00', endTime: '10:00', priority: 'high', milestone: true, deps: ['u3'], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'u5', projectId: 'p2', title: '期中成效檢視會議', status: 'todo', assignee: '阿凱', start: '2026-06-30', end: '2026-06-30', startTime: '10:00', endTime: '11:00', priority: 'low', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'v1', projectId: 'p3', title: '系統效能盤點', status: 'done', assignee: 'Leo', start: '2026-06-01', end: '2026-06-04', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: [], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'v2', projectId: 'p3', title: '資料庫查詢優化', status: 'inprogress', assignee: 'Leo', start: '2026-06-05', end: '2026-06-18', startTime: '09:00', endTime: '18:00', priority: 'high', milestone: false, deps: ['v1'], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'v3', projectId: 'p3', title: '前端載入優化', status: 'todo', assignee: '小美', start: '2026-06-12', end: '2026-06-22', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['v1'], desc: '', subtasks: [], comments: [], custom: {} },
  { id: 'v4', projectId: 'p3', title: '上線驗證', status: 'todo', assignee: 'Leo', start: '2026-06-23', end: '2026-06-25', startTime: '09:00', endTime: '18:00', priority: 'medium', milestone: false, deps: ['v2', 'v3'], desc: '', subtasks: [], comments: [], custom: {} },
];

const SEED_NOTES = [
  { id: 'n1', projectId: 'p1', title: '需求訪談會議紀錄 6/2', blocks: [
    { id: 'b1', type: 'heading', text: '會議重點' },
    { id: 'b2', type: 'text', text: '與產品團隊確認本次改版主要聚焦在首頁瀏覽動線與帳戶設定流程簡化。' },
    { id: 'b3', type: 'todo', text: '整理現有使用者回饋報告', done: true },
    { id: 'b4', type: 'todo', text: '確認設計交付時程', done: false },
    { id: 'b5', type: 'text', text: '下次會議時間訂於 6/9，將 review 初版線框圖。' },
  ]},
  { id: 'n2', projectId: 'p1', title: '技術規格草稿', blocks: [
    { id: 'b6', type: 'heading', text: 'API 規劃' },
    { id: 'b7', type: 'text', text: '使用者驗證採用既有 OAuth 服務，新增個人化設定相關端點。' },
    { id: 'b8', type: 'todo', text: '撰寫 API 文件', done: false },
  ]},
  { id: 'n3', projectId: 'p2', title: 'Q3 行銷企劃摘要', blocks: [
    { id: 'b9', type: 'heading', text: '目標客群' },
    { id: 'b10', type: 'text', text: '本季聚焦 25-35 歲都市專業族群，主打社群口碑擴散與口碑推薦。' },
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
            {dark ? '☀️' : '🌙'}
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium" style={{ backgroundColor: '#4285F4' }}>我</div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ theme, projects, tasks, activity, onOpenProject, onNewTask, onNewProject }) {
  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <button onClick={onNewTask} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover} ${theme.text}`}>+ 新增任務</button>
        <button onClick={onNewProject} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">+ 新增專案</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {projects.map(p => {
          const pTasks = tasks.filter(t => t.projectId === p.id);
          const done = pTasks.filter(t => t.status === 'done').length;
          const overdue = pTasks.filter(t => t.end < TODAY && t.status !== 'done').length;
          const progress = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
          return (
            <div key={p.id} onClick={() => onOpenProject(p.id)} className={`rounded-2xl border ${theme.border} ${theme.surface} p-5 cursor-pointer hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
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
                {overdue > 0 && <span className="text-xs text-red-500">⚠ {overdue} 逾期</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className={`rounded-2xl border ${theme.border} ${theme.surface} p-5`}>
        <h3 className={`text-sm font-semibold mb-3 ${theme.text}`}>最近動態</h3>
        <div className="space-y-3">
          {activity.map(a => {
            const p = projects.find(pr => pr.id === a.projectId);
            return (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 mt-0.5" style={{ backgroundColor: avatarColor(a.user) }}>{initials(a.user)}</div>
                <div className="text-sm">
                  <span className={`font-medium ${theme.text}`}>{a.user}</span>
                  <span className={theme.sub}> {a.action}</span>
                  <span className={`text-xs ${theme.sub} block`}>{p ? p.name : ''} · {a.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
          {task.milestone && <span style={{ color: sc.color }}>⚑</span>}
          <button onClick={e => { e.stopPropagation(); onDelete(task.id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">🗑</button>
        </div>
      </div>
      <div className={`text-sm font-medium mb-1 ${theme.text}`}>{task.title}</div>
      {projectTag && <div className="flex items-center gap-1 mb-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: projectTag.color }}></span><span className={`text-xs ${theme.sub}`}>{projectTag.name}</span></div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium" style={{ backgroundColor: avatarColor(task.assignee) }}>{initials(task.assignee)}</div>
          <span className={`text-xs ${theme.sub}`}>{task.assignee}</span>
        </div>
        <span className={`text-xs ${theme.sub}`}>⏰ {task.end.slice(5)} {task.endTime}</span>
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
                <td className={`px-4 py-3 ${theme.sub}`}>{t.end} {t.endTime}</td>
                {customFields.map(cf => <td key={cf.id} className={`px-4 py-3 ${theme.sub}`}>{(t.custom && t.custom[cf.id]) || '—'}</td>)}
                <td className="px-4 py-3 text-right">
                  <button onClick={e => { e.stopPropagation(); onDelete(t.id); }} className="text-gray-400 hover:text-red-500">🗑</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GanttChart({ tasks, theme, dark }) {
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
    <div className={`rounded-2xl border ${theme.border} ${theme.surface} overflow-auto`} style={{ maxHeight: 600 }}>
      <svg ref={svgRef} width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
        <rect x="0" y="0" width={chartW} height={chartH} fill={dark ? '#1f2937' : '#ffffff'} />
        {dayList.map((d, i) => {
          const dow = new Date(d + 'T00:00:00').getDay();
          if (dow !== 0 && dow !== 6) return null;
          return <rect key={'we' + i} x={labelW + i * dayW + pad} y={headerH} width={dayW} height={rows.length * rowH} fill={dark ? '#111827' : '#f1f3f4'} />;
        })}
        {monthGroups.map((g, i) => (
          <text key={'m' + i} x={labelW + g.startIdx * dayW + pad + 4} y={20} fontSize="12" fontWeight="600" fill={dark ? '#d1d5db' : '#5f6368'}>{Number(g.key.slice(5, 7))}月</text>
        ))}
        {dayList.map((d, i) => (
          <text key={'d' + i} x={labelW + i * dayW + pad + dayW / 2} y={42} fontSize="10" textAnchor="middle" fill={dark ? '#9ca3af' : '#80868b'}>{Number(d.slice(8, 10))}</text>
        ))}
        <line x1={labelW + pad} y1={headerH} x2={labelW + pad} y2={chartH} stroke={dark ? '#374151' : '#e0e0e0'} />
        {rows.map((t, i) => (
          <g key={'row' + t.id}>
            <rect x={0} y={headerH + i * rowH} width={labelW + pad} height={rowH} fill={i % 2 === 0 ? (dark ? '#1f2937' : '#ffffff') : (dark ? '#1a2129' : '#fafafa')} />
            <line x1={0} y1={headerH + i * rowH} x2={chartW} y2={headerH + i * rowH} stroke={dark ? '#374151' : '#eeeeee'} />
            <text x={12} y={headerH + i * rowH + rowH / 2 + 4} fontSize="12" fill={dark ? '#e5e7eb' : '#202124'}>{t.title.length > 22 ? t.title.slice(0, 21) + '…' : t.title}</text>
          </g>
        ))}
        {todayIdx >= 0 && todayIdx < totalDays && (
          <g>
            <line x1={xFor(TODAY) + dayW / 2} y1={headerH} x2={xFor(TODAY) + dayW / 2} y2={chartH} stroke="#EA4335" strokeWidth="1.5" strokeDasharray="4,3" />
            <text x={xFor(TODAY) + dayW / 2 + 4} y={headerH - 6} fontSize="10" fill="#EA4335">今天</text>
          </g>
        )}
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
          return <path key={depId + '-' + t.id} d={`M${x1},${y1} H${midX} V${y2} H${x2}`} fill="none" stroke={dark ? '#6b7280' : '#9aa0a6'} strokeWidth="1.5" />;
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
  );
}

function CalendarView({ theme, tasks, meetings, projects, onAddMeeting }) {
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
  const dayTasks = d => tasks.filter(t => !t.milestone && t.start <= dateStr(d) && t.end >= dateStr(d));
  const dayMilestones = d => tasks.filter(t => t.milestone && t.end === dateStr(d));
  const dayMeetings = d => meetings.filter(m => m.date === dateStr(d));

  function submitMeeting() {
    if (!mTitle.trim()) return;
    onAddMeeting({ id: 'm' + Date.now(), projectId: mProject, title: mTitle, date: dateStr(sel), time: mTime });
    setMTitle(''); setShowForm(false);
  }

  return (
    <div>
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
                {has && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-1"></span>}
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
        {dayMeetings(sel).map(m => <div key={m.id} className={`text-sm py-1.5 ${theme.text}`}>🟣 {m.time} {m.title}</div>)}
        {dayMilestones(sel).map(t => <div key={t.id} className={`text-sm py-1.5 ${theme.text}`}>⚑ {t.title}（里程碑）</div>)}
        {dayTasks(sel).map(t => <div key={t.id} className={`text-sm py-1.5 ${theme.text}`}>● {t.title}</div>)}
        {dayMeetings(sel).length === 0 && dayMilestones(sel).length === 0 && dayTasks(sel).length === 0 && !showForm && <div className={`text-sm ${theme.sub}`}>當日無項目</div>}
      </div>
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
          <div key={n.id} onClick={() => onSelectNote(n.id)} className={`px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 ${note && n.id === note.id ? (theme.dark ? 'bg-gray-700' : 'bg-blue-50') : theme.hover} ${theme.text}`}>
            📄 {n.title}
          </div>
        ))}
        {addingNote ? (
          <div className="flex gap-1 mt-1 px-1">
            <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="筆記標題" className={`flex-1 text-xs rounded-lg border px-2 py-1.5 ${theme.input}`} />
            <button onClick={() => { if (!newTitle.trim()) return; onAddNote(newTitle); setNewTitle(''); setAddingNote(false); }} className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white">新增</button>
          </div>
        ) : (
          <button onClick={() => setAddingNote(true)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${theme.hover} ${theme.sub}`}>+ 新增筆記</button>
        )}
      </div>
      <div className={`flex-1 rounded-2xl border ${theme.border} ${theme.surface} p-6`}>
        {!note ? <div className={`text-sm ${theme.sub}`}>此專案尚無筆記文件。</div> : (
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
                return <p key={b.id} className={`text-sm leading-relaxed ${theme.text}`}>{b.text}</p>;
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
  if (!task) return null;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className={`relative w-full max-w-md h-full ${theme.surface} ${theme.text} overflow-y-auto shadow-2xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs font-medium ${theme.sub}`}>任務詳情</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hover}`}>✕</button>
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
            <label className={`text-xs ${theme.sub} block mb-1`}>截止日期</label>
            <input type="date" value={task.end} onChange={e => onChange('end', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>負責人</label>
            <input value={task.assignee} onChange={e => onChange('assignee', e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-1.5 ${theme.input}`} />
          </div>
        </div>
        {customFields.length > 0 && (
          <div className="mb-4">
            <label className={`text-xs ${theme.sub} block mb-2`}>自訂欄位</label>
            {customFields.map(cf => (
              <div key={cf.id} className="flex items-center gap-2 mb-2">
                <span className={`text-xs w-28 flex-shrink-0 ${theme.sub}`}>{cf.name}</span>
                <input type={cf.type === 'number' ? 'number' : 'text'} value={(task.custom && task.custom[cf.id]) || ''} onChange={e => onChange('custom', { ...task.custom, [cf.id]: e.target.value })} className={`flex-1 text-sm rounded-lg border px-2 py-1 ${theme.input}`} />
              </div>
            ))}
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
          <button onClick={() => onDelete(task.id)} className="text-sm font-medium text-red-500 hover:text-red-600">🗑 刪除任務</button>
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({ theme, projects, defaultProjectId, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0] && projects[0].id) || '');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('medium');
  const [startDate, setStartDate] = useState(TODAY);
  const [endDate, setEndDate] = useState(TODAY);
  const [milestone, setMilestone] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl ${theme.surface} ${theme.text} p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">新增任務</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hover}`}>✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>標題</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={`w-full text-sm rounded-lg border px-3 py-2 ${theme.input}`} />
          </div>
          <div>
            <label className={`text-xs ${theme.sub} block mb-1`}>所屬專案</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
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
              <label className={`text-xs ${theme.sub} block mb-1`}>截止日期</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`w-full text-sm rounded-lg border px-2 py-2 ${theme.input}`} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={milestone} onChange={e => setMilestone(e.target.checked)} className="rounded" />
            <span className={`text-sm ${theme.text}`}>標記為里程碑</span>
          </label>
        </div>
        <button onClick={() => { if (!title.trim()) return; onSubmit({ title, projectId, assignee: assignee || '未指派', priority, startDate, endDate, milestone }); }} className="w-full mt-5 text-sm font-medium px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">建立任務</button>
      </div>
    </div>
  );
}

function NewProjectModal({ theme, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className={`relative w-full max-w-sm rounded-2xl ${theme.surface} ${theme.text} p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold">新增專案</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${theme.hover}`}>✕</button>
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
        <button onClick={() => { if (!name.trim()) return; onSubmit({ name, desc, color }); }} className="w-full text-sm font-medium px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">建立專案</button>
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
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [customFields, setCustomFields] = useState(SEED_CUSTOM_FIELDS);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [filterProjectIds, setFilterProjectIds] = useState([]);
  const [filterAssignee, setFilterAssignee] = useState('all');

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
  const projectFields = customFields[activeProjectId] || [];
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const assignees = Array.from(new Set(tasks.map(t => t.assignee))).filter(Boolean);
  const filteredTasks = tasks.filter(t => filterProjectIds.includes(t.projectId) && (filterAssignee === 'all' || t.assignee === filterAssignee));
  const multiProject = filterProjectIds.length > 1;

  function openProject(id) {
    setActiveProjectId(id); setView('project'); setActiveTab('kanban');
    setFilterProjectIds([id]); setFilterAssignee('all');
  }
  function updateTask(field, value) { setTasks(prev => prev.map(t => t.id === selectedTaskId ? { ...t, [field]: value } : t)); }
  function moveTask(id, status) { setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t)); }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); setSelectedTaskId(null); }
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
  }
  function handleNewTask(data) {
    const id = 't' + Date.now();
    setTasks(prev => [...prev, { id, projectId: data.projectId, title: data.title, status: 'todo', assignee: data.assignee, start: data.startDate, end: data.endDate, startTime: '09:00', endTime: '18:00', priority: data.priority, milestone: data.milestone, deps: [], desc: '', subtasks: [], comments: [], custom: {} }]);
    setShowNewTaskModal(false);
  }
  function handleNewProject(data) {
    const id = 'p' + Date.now();
    setProjects(prev => [...prev, { id, name: data.name, color: data.color, desc: data.desc, members: [] }]);
    setCustomFields(prev => ({ ...prev, [id]: [] }));
    setShowNewProjectModal(false);
  }

  const tabs = [
    { key: 'kanban', label: '看板' },
    { key: 'list', label: '列表' },
    { key: 'gantt', label: '甘特圖' },
    { key: 'calendar', label: '日曆' },
    { key: 'notes', label: '筆記' },
  ];

  if (view === 'dashboard') {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
        <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={null} />
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Dashboard theme={theme} projects={projects} tasks={tasks} activity={SEED_ACTIVITY} onOpenProject={openProject} onNewTask={() => setShowNewTaskModal(true)} onNewProject={() => setShowNewProjectModal(true)} />
        </div>
        {showNewTaskModal && <NewTaskModal theme={theme} projects={projects} defaultProjectId={projects[0] && projects[0].id} onClose={() => setShowNewTaskModal(false)} onSubmit={handleNewTask} />}
        {showNewProjectModal && <NewProjectModal theme={theme} onClose={() => setShowNewProjectModal(false)} onSubmit={handleNewProject} />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`} style={{ fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      <TopNav theme={theme} dark={dark} setDark={setDark} view={view} setView={setView} project={project} />
      <div className="max-w-6xl mx-auto px-6">
        <div className="mt-4 mb-2">
          <button onClick={() => setView('dashboard')} className={`text-xs font-medium ${theme.sub} ${theme.hover} px-2 py-1 rounded-lg`}>← 回到總覽</button>
        </div>
        <div className={`flex items-center gap-1 border-b ${theme.border} mb-4 overflow-x-auto`}>
          {tabs.map(tb => {
            const active = activeTab === tb.key;
            return (
              <button key={tb.key} onClick={() => setActiveTab(tb.key)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600' : `border-transparent ${theme.sub} ${theme.hover}`}`}>
                {tb.label}
              </button>
            );
          })}
          <div className="flex-1"></div>
          <button onClick={() => setShowNewTaskModal(true)} className={`text-xs font-medium px-3 py-1.5 mb-1 mr-2 rounded-lg text-blue-600 ${theme.hover}`}>+ 新增任務</button>
        </div>
        <div className="pb-10">
          {activeTab === 'kanban' && <KanbanBoard tasks={filteredTasks} theme={theme} onCardClick={setSelectedTaskId} onDrop={moveTask} onDelete={deleteTask} projects={projects} multiProject={multiProject} />}
          {activeTab === 'list' && <ListView tasks={filteredTasks} theme={theme} onRowClick={setSelectedTaskId} onDelete={deleteTask} customFields={projectFields} projects={projects} multiProject={multiProject} />}
          {activeTab === 'gantt' && <GanttChart tasks={filteredTasks} theme={theme} dark={dark} />}
          {activeTab === 'calendar' && <CalendarView theme={theme} tasks={filteredTasks} meetings={meetings} projects={projects} onAddMeeting={m => setMeetings(prev => [...prev, m])} />}
          {activeTab === 'notes' && <NotesView theme={theme} notes={projectNotes} selectedNoteId={selectedNoteId || (projectNotes[0] && projectNotes[0].id)} onSelectNote={setSelectedNoteId} onToggleTodo={toggleNoteTodo} onAddBlock={addBlock} onAddNote={addNote} />}
        </div>
      </div>
      {selectedTask && <TaskDetailPanel task={selectedTask} theme={theme} customFields={projectFields} onClose={() => setSelectedTaskId(null)} onChange={updateTask} onAddComment={addComment} onToggleSubtask={toggleSubtask} onDelete={deleteTask} />}
      {showNewTaskModal && <NewTaskModal theme={theme} projects={projects} defaultProjectId={activeProjectId} onClose={() => setShowNewTaskModal(false)} onSubmit={handleNewTask} />}
    </div>
  );
}