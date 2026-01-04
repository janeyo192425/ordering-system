import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Coffee, Sun, Moon, Stars,
  Briefcase, DollarSign, Settings, UserPlus, Download, X,
  Trash2, Database, LogOut, User, Megaphone, Calendar as CalendarIcon,
  CheckCircle2, Search, FileUp, FileDown, Upload
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, deleteDoc, writeBatch
} from 'firebase/firestore';
import * as XLSX from 'xlsx'; // 引入 Excel 處理套件

// ==========================================
// ★★★ 1. Firebase 設定區 (已填入你的金鑰) ★★★
// ==========================================
const firebaseConfig = {
  apiKey: 'AIzaSyBqfmLMeTdDbMrHs1ZFYWOcO4V3WDez5TY',
  authDomain: 'order-data-bae05.firebaseapp.com',
  projectId: 'order-data-bae05',
  storageBucket: 'order-data-bae05.firebasestorage.app',
  messagingSenderId: '839689352288',
  appId: '1:839689352288:web:86473cf1e7b4682c36ff05',
};

// ★ 防止 Hot Reload 重複初始化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// ==========================================
// ★★★ 2. 初始員工資料 ★★★
// ==========================================
const INITIAL_STAFF_DATA = [
  { unit: '產品部', code: 'PD', id: 'L2500333', name: '張甄祐', role: 'ADMIN', password: '1234' },
  { unit: '事業處', code: 'BU', id: 'L2403888', name: '劉景寛', role: 'SUPPORT', password: '1234' },
  { unit: '事業處', code: 'BU', id: 'L2300020', name: '吳政誼', role: 'HR', password: '1234' },
  { unit: '製造處', code: 'ME', id: 'L2300036', name: '陳彥麟', role: 'USER', password: '1234' },
  { unit: '研發工程部', code: '研發', id: 'L2300037', name: '陳璽翔', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2300150', name: '葉宗霖', role: 'USER', password: '1234' },
];

const MEAL_PRICE = 20;

// 假日設定 (包含 2025 與 2026)
const HOLIDAYS_LIST = [
  // --- 2025 ---
  '2025-01-01', 
  '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', 
  '2025-02-28', 
  '2025-04-04', '2025-04-05', 
  '2025-05-01', '2025-05-31', '2025-10-10',
  // --- 2026 ---
  '2026-01-01',
  '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22',
  '2026-02-27', '2026-02-28', '2026-03-01',
  '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06',
  '2026-05-01', '2026-05-02', '2026-05-03',
  '2026-06-19', '2026-06-20', '2026-06-21',
  '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28',
  '2026-10-09', '2026-10-10', '2026-10-11',
  '2026-10-24', '2026-10-25', '2026-10-26',
  '2026-12-25', '2026-12-26', '2026-12-27'
];

// ==========================================
// ★★★ 3. 主程式入口 ★★★
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!db) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-gray-50">Firebase 連線失敗</div>;
  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

  return <MainSystem currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
}

// ------------------------------------------------------------------
// 跑馬燈元件 (文字已更新)
// ------------------------------------------------------------------
const Marquee = () => {
  return (
    <div className="bg-yellow-100 border-b border-yellow-200 text-yellow-800 overflow-hidden py-2 relative">
      <div className="flex items-center gap-2 px-4 absolute left-0 bg-yellow-100 z-10 font-bold text-sm">
        <Megaphone size={16} className="animate-bounce" /> 公告
      </div>
      <div className="whitespace-nowrap animate-marquee pl-24 text-sm font-medium">
        🔔 系統公告：假日及國定假日請於「前一個工作天」完成預訂！早餐為預訂「隔日」餐點，請特別留意。 🔔
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

// ------------------------------------------------------------------
// 登入頁面元件
// ------------------------------------------------------------------
const LoginScreen = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const inputId = id.toUpperCase().trim();
      if (inputId === 'L2500333' && pwd === '1234') {
        const adminUser = INITIAL_STAFF_DATA.find(u => u.id === 'L2500333');
        onLogin(adminUser);
        setLoading(false);
        return; 
      }
      const docSnap = await getDoc(doc(db, 'users', inputId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.password === pwd) onLogin(data);
        else setError('密碼錯誤 (預設 1234)');
      } else {
        setError('找不到此工號，請先請管理員新增');
      }
    } catch (err) {
      console.error(err);
      setError('連線錯誤: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">企業訂餐系統</h1>
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 mb-1">工號</label>
          <input className="w-full p-3 border rounded-lg uppercase" placeholder="例: L2500333" value={id} onChange={(e) => setId(e.target.value)} />
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 mb-1">密碼</label>
          <input className="w-full p-3 border rounded-lg" type="password" placeholder="預設: 1234" value={pwd} onChange={(e) => setPwd(e.target.value)} />
        </div>
        {error && <div className="text-red-500 text-sm mb-4 text-center font-bold bg-red-50 p-2 rounded">{error}</div>}
        <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-lg shadow-blue-200">
          {loading ? '登入中...' : '登入系統'}
        </button>
        <div className="mt-6 text-xs text-center text-gray-400">首次使用請用管理員帳號 (L2500333) 登入並初始化</div>
      </form>
    </div>
  );
};

// ------------------------------------------------------------------
// 主系統
// ------------------------------------------------------------------
const MainSystem = ({ currentUser, onLogout }) => {
  const [currentView, setCurrentView] = useState('ORDER');
  const [users, setUsers] = useState([]);
  const [dbOrders, setDbOrders] = useState([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => setDbOrders(snap.docs.map((d) => d.data())));
    return () => { unsubUsers(); unsubOrders(); };
  }, []);

  const exportToCSV = (data, headers, filename) => {
    const csv = [headers.join(','), ...data.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-10">
      <NavBar user={currentUser} currentView={currentView} onChangeView={setCurrentView} onLogout={onLogout} />
      <Marquee />
      <div className="max-w-6xl mx-auto p-4">
        {currentView === 'ORDER' && <EmployeeApp user={currentUser} dbOrders={dbOrders} />}
        {currentView === 'SUPPORT' && <SupportDashboard dbOrders={dbOrders} users={users} exportToCSV={exportToCSV} />}
        {currentView === 'HR' && <HRReportDashboard dbOrders={dbOrders} users={users} exportToCSV={exportToCSV} />}
        {currentView === 'ADMIN' && <AdminPanel users={users} />}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// 導航列
// ------------------------------------------------------------------
const NavBar = ({ user, currentView, onChangeView, onLogout }) => {
  const tabs = {
    ADMIN: ['ORDER', 'SUPPORT', 'HR', 'ADMIN'],
    HR: ['ORDER', 'HR'],
    SUPPORT: ['ORDER', 'SUPPORT'],
    USER: ['ORDER'],
  }[user.role] || ['ORDER'];

  const labels = { ORDER: '點餐', SUPPORT: '支援看板', HR: '人資報表', ADMIN: '管理' };
  const icons = { ORDER: <Coffee size={16} />, SUPPORT: <Briefcase size={16} />, HR: <DollarSign size={16} />, ADMIN: <Settings size={16} /> };
  const roleColors = { ADMIN: 'bg-red-600', HR: 'bg-green-600', SUPPORT: 'bg-purple-600', USER: 'bg-blue-600' };

  return (
    <nav className="bg-white border-b px-4 py-3 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded text-white font-bold text-xs ${roleColors[user.role] || 'bg-gray-500'}`}>{user.role}</div>
          <div className="font-bold text-gray-800">{user.name} <span className="text-xs text-gray-400">({user.unit})</span></div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => onChangeView(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${currentView === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {icons[tab]} {labels[tab]}
            </button>
          ))}
        </div>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-500 p-2"><LogOut size={20} /></button>
      </div>
    </nav>
  );
};

// ------------------------------------------------------------------
// 員工點餐與月曆功能
// ------------------------------------------------------------------
const EmployeeApp = ({ user, dbOrders }) => {
  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDateStr, setSelectedDateStr] = useState(null); 
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  const [statsStart, setStatsStart] = useState(firstDay);
  const [statsEnd, setStatsEnd] = useState(lastDay);

  const myRangeOrders = useMemo(() => {
    return dbOrders.filter(o => o.userId === user.id && o.date >= statsStart && o.date <= statsEnd);
  }, [dbOrders, user.id, statsStart, statsEnd]);

  const stats = useMemo(() => {
    let b = 0, l = 0, d = 0, n = 0;
    myRangeOrders.forEach(o => {
      if(o.breakfast) b++; if(o.lunch) l++; if(o.dinner) d++; if(o.lateNight) n++;
    });
    return { b, l, d, n, total: b+l+d+n, cost: (b+l+d+n)*MEAL_PRICE };
  }, [myRangeOrders]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const order = dbOrders.find(o => o.userId === user.id && o.date === dStr);
      const hasOrder = order && (order.breakfast || order.lunch || order.dinner || order.lateNight);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isHoliday = HOLIDAYS_LIST.includes(dStr);
      days.push({ date: d, dateStr: dStr, dayNum: i, hasOrder, isWeekend, isHoliday, orderData: order });
    }
    return days;
  }, [viewDate, dbOrders, user.id]);

  const changeMonth = (delta) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <User className="text-blue-600" size={20} /> 個人點餐統計
          </h3>
          <div className="flex items-center gap-2 text-sm bg-gray-50 p-1.5 rounded-lg border">
            <input type="date" value={statsStart} onChange={e => setStatsStart(e.target.value)} className="bg-transparent border-none outline-none text-gray-600 w-32" />
            <span className="text-gray-400">至</span>
            <input type="date" value={statsEnd} onChange={e => setStatsEnd(e.target.value)} className="bg-transparent border-none outline-none text-gray-600 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <StatBox label="早餐" count={stats.b} icon={<Coffee size={14}/>} />
          <StatBox label="午餐" count={stats.l} icon={<Sun size={14}/>} />
          <StatBox label="晚餐" count={stats.d} icon={<Moon size={14}/>} />
          <StatBox label="宵夜" count={stats.n} icon={<Stars size={14}/>} />
          <div className="bg-blue-50 p-3 rounded-xl col-span-2 flex justify-between items-center border border-blue-200">
             <div className="text-xs text-gray-500">期間總額</div>
             <div className="text-xl font-black text-blue-600">${stats.cost}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft /></button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="text-gray-500" />
              {viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月
            </h2>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight /></button>
          </div>
          <BulkOrderButton user={user} year={viewDate.getFullYear()} month={viewDate.getMonth()} dbOrders={dbOrders} />
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
          {['日','一','二','三','四','五','六'].map(d => (
            <div key={d} className={`font-bold ${d==='日'||d==='六' ? 'text-red-400' : 'text-gray-500'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            return (
              <div 
                key={day.dateStr}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`
                  h-20 border rounded-xl p-2 relative cursor-pointer transition-all hover:shadow-md hover:border-blue-400 flex flex-col justify-between
                  ${day.isHoliday ? 'bg-red-50 border-red-200' : day.isWeekend ? 'bg-gray-100 text-gray-400' : 'bg-white'}
                  ${day.dateStr === new Date().toISOString().split('T')[0] ? 'ring-2 ring-blue-500' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-bold ${day.isHoliday ? 'text-red-600' : ''}`}>{day.dayNum}</span>
                  {day.hasOrder && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                </div>
                <div className="text-[10px] flex flex-wrap gap-0.5 content-end">
                   {day.orderData?.breakfast && <span className="bg-orange-100 text-orange-600 px-1 rounded">早</span>}
                   {day.orderData?.lunch && <span className="bg-yellow-100 text-yellow-600 px-1 rounded">午</span>}
                   {day.orderData?.dinner && <span className="bg-indigo-100 text-indigo-600 px-1 rounded">晚</span>}
                   {day.orderData?.lateNight && <span className="bg-purple-100 text-purple-600 px-1 rounded">宵</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDateStr && (
        <OrderModal user={user} dateStr={selectedDateStr} onClose={() => setSelectedDateStr(null)} myOrder={dbOrders.find(o => o.userId === user.id && o.date === selectedDateStr)}/>
      )}
    </div>
  );
};

const StatBox = ({ label, count, icon }) => (
  <div className="bg-gray-50 p-3 rounded-xl border flex flex-col items-center justify-center">
    <div className="text-gray-400 text-xs flex items-center gap-1 mb-1">{icon} {label}</div>
    <div className="font-black text-lg text-gray-800">{count}</div>
  </div>
);

const OrderModal = ({ user, dateStr, onClose, myOrder }) => {
  const [loading, setLoading] = useState(false);
  const [tempOrder, setTempOrder] = useState(
    myOrder ? { ...myOrder } : { breakfast: false, lunch: false, dinner: false, lateNight: false }
  );

  const isLocked = (type) => {
    const now = new Date();
    const isPast = dateStr < now.toISOString().split('T')[0];
    const isToday = dateStr === now.toISOString().split('T')[0];
    const isPastCutoff = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() >= 30);
    if (isPast) return true;
    if (type === 'breakfast') {
       const diffDays = Math.ceil((new Date(dateStr).getTime() - new Date(now.toISOString().split('T')[0]).getTime()) / 86400000);
       if (diffDays <= 0) return true; 
       if (diffDays === 1 && isPastCutoff) return true; 
       return false;
    }
    return isToday && isPastCutoff;
  };

  const toggleSelection = (type) => {
    if (isLocked(type)) return;
    setTempOrder(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleConfirm = async () => {
    setLoading(true);
    const newData = { ...tempOrder, userId: user.id, date: dateStr, updatedAt: new Date().toISOString() };
    try { await setDoc(doc(db, 'orders', `${user.id}_${dateStr}`), newData); onClose(); } catch (e) { alert('送出失敗'); }
    setLoading(false);
  };

  const mealConfig = [
    { id: 'breakfast', label: '早餐', sub: '(限隔日)', icon: <Coffee /> },
    { id: 'lunch', label: '午餐', sub: '', icon: <Sun /> },
    { id: 'dinner', label: '晚餐', sub: '', icon: <Moon /> },
    { id: 'lateNight', label: '宵夜', sub: '', icon: <Stars /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2"><CalendarIcon size={18} /> {dateStr} 點餐</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="text-center text-xs text-gray-500 mb-2">點擊選項進行勾選，最後按下確認送出</div>
          {mealConfig.map((item) => {
            const locked = isLocked(item.id);
            const active = tempOrder[item.id]; 
            return (
              <button key={item.id} onClick={() => toggleSelection(item.id)} disabled={locked || loading} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${locked ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' : active ? 'bg-blue-50 border-blue-500 shadow-inner' : 'bg-white hover:border-blue-200 shadow-sm'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{item.icon}</div>
                  <div className="text-left">
                    <div className={`font-bold ${active ? 'text-blue-700' : 'text-gray-700'}`}>{item.label}</div>
                    <div className="text-xs text-gray-400">{locked ? '已截止' : item.sub}</div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                  {active && <CheckCircle2 size={16} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t bg-gray-50 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition">取消</button>
          <button onClick={handleConfirm} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition disabled:bg-gray-400">{loading ? '處理中...' : '確認送出'}</button>
        </div>
      </div>
    </div>
  );
};

const BulkOrderButton = ({ user, year, month, dbOrders }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleBulkOrder = async (mealType) => {
    const mealLabel = mealType === 'lunch' ? '午餐' : mealType === 'dinner' ? '晚餐' : mealType === 'lateNight' ? '宵夜' : '早餐';
    if(!confirm(`確定要一次預訂本月所有「平日」的【${mealLabel}】嗎？\n(已截止或假日的日期會自動跳過)`)) return;
    setProcessing(true);
    const batch = writeBatch(db);
    const lastDay = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for(let i = 1; i <= lastDay; i++) {
      const d = new Date(year, month, i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6 || HOLIDAYS_LIST.includes(dStr)) continue;
      const now = new Date();
      const isPast = dStr < now.toISOString().split('T')[0];
      const isToday = dStr === now.toISOString().split('T')[0];
      const isPastCutoff = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() >= 30);
      let isLocked = false;
      if (isPast) isLocked = true;
      if (mealType === 'breakfast') {
         const diffDays = Math.ceil((d.getTime() - new Date(now.toISOString().split('T')[0]).getTime()) / 86400000);
         if (diffDays <= 1 && isPastCutoff) isLocked = true;
      } else {
         if (isToday && isPastCutoff) isLocked = true;
      }
      if (isLocked) continue;
      const existing = dbOrders.find(o => o.userId === user.id && o.date === dStr) || {};
      const ref = doc(db, 'orders', `${user.id}_${dStr}`);
      batch.set(ref, { ...existing, userId: user.id, date: dStr, [mealType]: true, updatedAt: new Date().toISOString() }, { merge: true });
      count++;
    }
    try { await batch.commit(); alert(`成功預訂了 ${count} 天的餐點！`); } catch(e) { alert('批量處理失敗'); }
    setProcessing(false); setShowMenu(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setShowMenu(!showMenu)} disabled={processing} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition">
        <CalendarIcon size={16} /> {processing ? '處理中...' : '一鍵預訂平日'}
      </button>
      {showMenu && (
        <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border w-48 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
          <div className="p-2 text-xs text-gray-400 bg-gray-50 border-b">選擇要批量預訂的餐點</div>
          <button onClick={() => handleBulkOrder('lunch')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-gray-700 flex items-center gap-2"><Sun size={14} className="text-orange-500"/> 平日午餐</button>
          <button onClick={() => handleBulkOrder('dinner')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-gray-700 flex items-center gap-2"><Moon size={14} className="text-indigo-500"/> 平日晚餐</button>
          <button onClick={() => handleBulkOrder('lateNight')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-gray-700 flex items-center gap-2"><Stars size={14} className="text-purple-500"/> 平日宵夜</button>
          <button onClick={() => handleBulkOrder('breakfast')} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-gray-700 flex items-center gap-2 border-t"><Coffee size={14} className="text-brown-500"/> 平日早餐</button>
        </div>
      )}
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
    </div>
  );
};

const SupportDashboard = ({ dbOrders, users, exportToCSV }) => {
  const [date, setDate] = useState(new Date());
  const dateStr = date.toISOString().split('T')[0];
  const [detail, setDetail] = useState(null);
  const getList = (type) => dbOrders.filter((o) => o.date === dateStr && o[type]).map((o) => users.find((u) => u.id === o.userId) || { name: '未知', id: o.userId, unit: '?', code: '?' });
  const meals = [{ id: 'breakfast', label: '早餐' }, { id: 'lunch', label: '午餐' }, { id: 'dinner', label: '晚餐' }, { id: 'lateNight', label: '宵夜' }];
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-bold flex gap-2 items-center"><Briefcase className="text-purple-600" /> 支援看板</h2>
        <div className="flex gap-2 items-center">
          <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); }} className="p-2 bg-gray-100 rounded"><ChevronLeft size={16} /></button>
          <span className="font-mono font-bold text-lg">{dateStr}</span>
          <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); }} className="p-2 bg-gray-100 rounded"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {meals.map((m) => (
          <div key={m.id} onClick={() => setDetail(m.id)} className="bg-white p-6 rounded-2xl border cursor-pointer hover:shadow-md transition text-center group"><div className="text-gray-500 font-bold mb-2">{m.label}</div><div className="text-4xl font-black text-gray-800 group-hover:scale-110 transition-transform">{getList(m.id).length}</div><div className="text-xs text-blue-500 mt-2 font-bold">點擊查看詳情</div></div>
        ))}
      </div>
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl flex flex-col max-h-[80vh] shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">{dateStr} {meals.find((m) => m.id === detail)?.label}名單</h3><button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button></div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 gap-2">{getList(detail).map((u) => <div key={u.id} className="text-sm p-2 bg-gray-50 border rounded flex justify-between"><span className="font-mono text-gray-600">{u.id}</span><span className="font-bold">{u.name}</span></div>)}{getList(detail).length === 0 && <div className="col-span-2 text-center text-gray-400 py-4">無人預訂</div>}</div>
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl"><button onClick={() => exportToCSV(getList(detail).map((u) => [u.id, u.name, u.unit, u.code, dateStr, detail]), ['工號', '姓名', '部門', '代號', '日期', '餐別'], `支援課_${detail}`)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200"><Download /> 匯出 Excel</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const HRReportDashboard = ({ dbOrders, users, exportToCSV }) => {
  const [start, setStart] = useState('2025-05-01');
  const [end, setEnd] = useState('2025-05-31');
  const [filterId, setFilterId] = useState('');
  const report = useMemo(() => users.map((u) => {
    if (filterId && !u.id.includes(filterId.toUpperCase())) return null;
    const orders = dbOrders.filter((o) => o.userId === u.id && o.date >= start && o.date <= end);
    const b = orders.filter((o) => o.breakfast).length;
    const l = orders.filter((o) => o.lunch).length;
    const d = orders.filter((o) => o.dinner).length;
    const n = orders.filter((o) => o.lateNight).length;
    const total = b + l + d + n;
    return { ...u, b, l, d, n, total, cost: total * MEAL_PRICE };
  }).filter((r) => r !== null && r.total > 0), [dbOrders, users, start, end, filterId]);
  const handleExport = () => { exportToCSV(report.map((r) => [r.id, r.name, r.unit, r.b, r.l, r.d, r.n, r.total, r.cost]), ['工號', '姓名', '部門', '早餐', '午餐', '晚餐', '宵夜', '總餐數', '金額'], `HR報表_${start}_${end}`); };
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><h2 className="text-xl font-bold flex gap-2 items-center"><DollarSign className="text-green-600" /> 人資扣款報表</h2><button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 hover:bg-green-700 shadow-md"><Download size={16} /> 匯出報表</button></div>
      <div className="flex flex-wrap gap-4 items-center"><div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border"><input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="bg-transparent outline-none text-gray-700" /><span className="text-gray-400">至</span><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="bg-transparent outline-none text-gray-700" /></div><div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border px-3"><Search size={16} className="text-gray-400"/><input placeholder="篩選工號 (例如 L25)" value={filterId} onChange={(e) => setFilterId(e.target.value)} className="bg-transparent outline-none text-gray-700 w-40 uppercase placeholder:text-gray-400 text-sm font-bold" />{filterId && <button onClick={() => setFilterId('')} className="text-gray-400 hover:text-red-500"><X size={14}/></button>}</div></div>
      <div className="overflow-x-auto border rounded-lg"><table className="w-full text-sm text-left"><thead className="bg-gray-100 text-gray-600 font-bold"><tr><th className="p-3">工號</th><th className="p-3">姓名</th><th className="p-3 text-center">早</th><th className="p-3 text-center">午</th><th className="p-3 text-center">晚</th><th className="p-3 text-center">宵</th><th className="p-3 text-right">總餐數</th><th className="p-3 text-right">金額</th></tr></thead><tbody className="divide-y divide-gray-100">{report.map((r) => (<tr key={r.id} className="hover:bg-gray-50 transition"><td className="p-3 font-mono">{r.id}</td><td className="p-3 font-bold">{r.name}</td><td className="p-3 text-center text-gray-500">{r.b}</td><td className="p-3 text-center text-gray-500">{r.l}</td><td className="p-3 text-center text-gray-500">{r.d}</td><td className="p-3 text-center text-gray-500">{r.n}</td><td className="p-3 text-right font-medium">{r.total}</td><td className="p-3 text-right text-green-600 font-bold">${r.cost}</td></tr>))}{report.length === 0 && <tr><td colSpan="8" className="p-6 text-center text-gray-400">區間內無訂餐資料</td></tr>}</tbody></table></div>
    </div>
  );
};

// ------------------------------------------------------------------
// ★ 功能 4: 管理後台 (含 Excel 匯入、搜尋、權限切換)
// ------------------------------------------------------------------
const AdminPanel = ({ users }) => {
  const [newUser, setNewUser] = useState({ id: '', name: '', unit: '', role: 'USER', password: '1234' });
  const [loading, setLoading] = useState(false);
  const [bulkText, setBulkText] = useState(''); 
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  // 1. 初始化資料庫
  const initDB = async () => { 
    if (!confirm('確定初始化？')) return; 
    setLoading(true); 
    try { for (const s of INITIAL_STAFF_DATA) { await setDoc(doc(db, 'users', s.id), s); } alert('成功寫入'); } catch (e) { alert('失敗: ' + e.message); } 
    setLoading(false); 
  };

  // 2. 單筆新增
  const addUser = async () => { 
    if (!newUser.id) return; 
    await setDoc(doc(db, 'users', newUser.id.toUpperCase()), newUser); 
    alert('新增成功'); 
    setNewUser({ id: '', name: '', unit: '', role: 'USER', password: '1234' }); 
  };

  // 3. 刪除
  const deleteUser = async (id) => { 
    if (confirm('確定刪除?')) await deleteDoc(doc(db, 'users', id)); 
  };

  // 4. 更新權限
  const updateUserRole = async (id, newRole) => {
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
    } catch (e) {
      alert('更新失敗');
    }
  };

  // 5. 下載 Excel 範本
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { id: 'L26001', name: '王小明', unit: '研發部', role: 'USER' },
      { id: 'L26002', name: '李大華', unit: '業務部', role: 'USER' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "員工資料匯入範本");
    XLSX.writeFile(wb, "員工匯入範本.xlsx");
  };

  // 6. 處理 Excel 上傳
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      setLoading(true);
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        const batch = writeBatch(db);
        
        // 批次寫入 (Firebase Batch 上限 500 筆，這裡做簡單處理)
        data.forEach((row) => {
          // 支援中文欄位名或英文欄位名
          const uid = row['id'] || row['工號'] || row['ID'];
          const uname = row['name'] || row['姓名'] || row['NAME'];
          const uunit = row['unit'] || row['部門'] || row['UNIT'];
          const urole = row['role'] || row['權限'] || 'USER';

          if (uid && uname) {
            const idStr = String(uid).trim().toUpperCase();
            const docRef = doc(db, 'users', idStr);
            batch.set(docRef, {
              id: idStr,
              name: String(uname).trim(),
              unit: String(uunit || '').trim(),
              role: String(urole).trim().toUpperCase(),
              password: '1234'
            });
            successCount++;
          }
        });

        await batch.commit();
        alert(`成功匯入 ${successCount} 筆資料！`);
      } catch (err) {
        console.error(err);
        alert('匯入失敗，請確認檔案格式');
      }
      setLoading(false);
      // 清空 input 讓同個檔案可以再選一次
      if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  // 7. 處理純文字批量匯入
  const handleTextBulkImport = async () => {
    if (!bulkText) return;
    const rows = bulkText.split('\n').filter(r => r.trim());
    if (!confirm(`確定要新增這 ${rows.length} 筆資料嗎？`)) return;
    setLoading(true);
    let successCount = 0;
    try {
      for (const row of rows) {
        const cols = row.split(/,|，| /); 
        if (cols.length < 3) continue;
        const [uid, uname, uunit] = cols;
        const id = uid.trim().toUpperCase();
        if(!id) continue;
        await setDoc(doc(db, 'users', id), { id, name: uname.trim(), unit: uunit.trim(), role: 'USER', password: '1234' });
        successCount++;
      }
      alert(`成功匯入 ${successCount} 筆資料`);
      setBulkText('');
    } catch(e) { alert('匯入失敗: ' + e.message); }
    setLoading(false);
  };

  // 篩選顯示的使用者
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.id.includes(searchTerm.toUpperCase()) || 
      u.name.includes(searchTerm) ||
      u.unit.includes(searchTerm)
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 批量匯入區塊 */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex gap-2 items-center"><FileUp /> 批量匯入員工</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 左邊：Excel 上傳 */}
          <div className="border p-4 rounded-xl bg-gray-50 space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">方式一：Excel 檔案上傳</h3>
            <div className="flex gap-2">
              <button onClick={handleDownloadTemplate} className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-100">
                <FileDown size={12}/> 下載範本
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-blue-50 transition relative cursor-pointer">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv"
                ref={fileInputRef}
                onChange={handleExcelUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center text-gray-400">
                <Upload size={32} className="mb-2"/>
                <span className="text-sm">點擊或拖曳 Excel 檔案至此</span>
              </div>
            </div>
          </div>

          {/* 右邊：純文字貼上 */}
          <div className="border p-4 rounded-xl bg-gray-50 space-y-4">
            <h3 className="font-bold text-gray-700">方式二：純文字貼上</h3>
            <textarea 
              placeholder="格式：工號,姓名,部門&#10;L25001,王大明,研發部"
              className="w-full border p-3 rounded-lg h-32 text-sm font-mono"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <button 
              onClick={handleTextBulkImport}
              disabled={loading || !bulkText}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {loading ? '處理中...' : '確認匯入文字'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg flex gap-2 items-center"><UserPlus /> 人員管理</h2>
          {/* 搜尋框 */}
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
            <Search size={16} className="text-gray-400"/>
            <input 
              placeholder="搜尋工號或姓名..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-40"
            />
          </div>
        </div>

        {/* 單筆新增 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 bg-gray-50 p-3 rounded-xl border">
          <input placeholder="工號" value={newUser.id} onChange={(e) => setNewUser({ ...newUser, id: e.target.value.toUpperCase() })} className="border p-2 rounded" />
          <input placeholder="姓名" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="border p-2 rounded" />
          <input placeholder="部門" value={newUser.unit} onChange={(e) => setNewUser({ ...newUser, unit: e.target.value })} className="border p-2 rounded" />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="border p-2 rounded"><option value="USER">員工</option><option value="SUPPORT">支援課</option><option value="HR">人資</option><option value="ADMIN">管理</option></select>
          <button onClick={addUser} className="bg-blue-600 text-white rounded font-bold hover:bg-blue-700">單筆新增</button>
        </div>

        {/* 人員列表 */}
        <div className="h-96 overflow-y-auto border rounded divide-y">
          <div className="flex justify-between p-3 bg-gray-100 font-bold text-xs text-gray-500 sticky top-0">
            <span className="w-24">工號</span>
            <span className="w-20">姓名</span>
            <span className="w-24">部門</span>
            <span className="w-28 text-center">權限 (點選切換)</span>
            <span className="w-10">刪除</span>
          </div>
          {filteredUsers.map((u) => (
            <div key={u.id} className="flex justify-between p-3 hover:bg-gray-50 items-center text-sm">
              <span className="w-24 font-mono font-bold text-blue-600">{u.id}</span>
              <span className="w-20 font-bold">{u.name}</span>
              <span className="w-24 text-gray-500">{u.unit}</span>
              <div className="w-28 text-center">
                <select 
                  value={u.role} 
                  onChange={(e) => updateUserRole(u.id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded cursor-pointer border-none outline-none font-bold
                    ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 
                      u.role === 'HR' ? 'bg-green-100 text-green-600' :
                      u.role === 'SUPPORT' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  <option value="USER">USER</option>
                  <option value="SUPPORT">SUPPORT</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button onClick={() => deleteUser(u.id)} className="w-10 text-gray-400 hover:text-red-500 flex justify-center"><Trash2 size={16} /></button>
            </div>
          ))}
          {filteredUsers.length === 0 && <div className="p-4 text-center text-gray-400">查無資料</div>}
        </div>
      </div>
    </div>
  );
};