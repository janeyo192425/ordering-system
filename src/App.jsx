import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Coffee, Sun, Moon,
  Briefcase, DollarSign, Settings, UserPlus, Download, X,
  Trash2, Database, Stars, LogOut, CheckCircle, Save, FileText,
  KeyRound, RefreshCcw, AlertTriangle
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, collection, doc, getDoc, setDoc, onSnapshot, deleteDoc, updateDoc
} from 'firebase/firestore';

// ==========================================
// ★★★ 1. Firebase 設定區 ★★★
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
// ★★★ 2. 預設員工資料 ★★★
// ==========================================
const INITIAL_STAFF_DATA = [
  // --- 管理員 ---
  { unit: '產品部', code: 'PD', id: 'L2500333', name: '張甄祐', role: 'ADMIN', password: '1234' },
  { unit: '製造四部', code: 'M4', id: 'L2300106', name: '周勁宏', role: 'ADMIN', password: '1234' },
  // --- 特殊權限 ---
  { unit: '製造四部', code: 'M4', id: 'L2503391', name: '李紹箕', role: 'SUPPORT', password: '1234' },
  { unit: '人資部', code: 'HR', id: 'L2501282', name: '李迎菁', role: 'HR', password: '1234' },
  // --- 員工 ---
  { unit: '事業處', code: 'BU', id: 'L2403888', name: '劉景寛', role: 'USER', password: '1234' },
  { unit: '事業處', code: 'BU', id: 'L2300020', name: '吳政誼', role: 'USER', password: '1234' },
  { unit: '製造處', code: 'ME', id: 'L2300036', name: '陳彥麟', role: 'USER', password: '1234' },
  { unit: '研發工程部', code: '研發', id: 'L2300037', name: '陳璽翔', role: 'USER', password: '1234' },
  { unit: '研發工程部', code: '研發', id: 'L2503538', name: '蘇元岑', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2300150', name: '葉宗霖', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2501287', name: '黃懋庭', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2501665', name: '張心瑜', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2502668', name: '魏雨任', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2503052', name: '許紹謙', role: 'USER', password: '1234' },
  { unit: '工程一課', code: 'E1', id: 'L2503273', name: '顏晟哲', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2300052', name: '莊孟榕', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2300114', name: '石安哲', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2300153', name: '李大維', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2500719', name: '鍾繼謙', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2500996', name: '蔡謨楷', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2502492', name: '張立欣', role: 'USER', password: '1234' },
  { unit: '工程二課', code: 'E2', id: 'L2502654', name: '林俞萱', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2300102', name: '鄧博仰', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2300115', name: '陳喜雍', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2300056', name: '簡嘉良', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2500934', name: '王靖侖', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2501051', name: '鄒承樺', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2503139', name: '丁永政', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2503235', name: '羅士涵', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2503272', name: '李偉銘', role: 'USER', password: '1234' },
  { unit: '工程三課', code: 'E3', id: 'L2503539', name: '張柏森', role: 'USER', password: '1234' },
  { unit: '工程四課', code: 'E4', id: 'L2300055', name: '金萬祥', role: 'USER', password: '1234' },
  { unit: '工程四課', code: 'E4', id: 'L2300100', name: '梁騰云', role: 'USER', password: '1234' },
  { unit: '工程四課', code: 'E4', id: 'L2501335', name: '曾裕凱', role: 'USER', password: '1234' },
  { unit: '工程四課', code: 'E4', id: 'L2501508', name: '林健喬', role: 'USER', password: '1234' },
  { unit: '工程四課', code: 'E4', id: 'L2501910', name: '吳政寰', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2300057', name: '李科科', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2300113', name: '莊詠智', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2500479', name: '黃宗彬', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2500997', name: '林君炫', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2501510', name: '張尹奕', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2502348', name: '李懿珊', role: 'USER', password: '1234' },
  { unit: '工程五部', code: 'E5', id: 'L2501937', name: '姚瑞鴻', role: 'USER', password: '1234' },
  { unit: '製造一部', code: 'M1', id: 'L2300098', name: '陳智君', role: 'USER', password: '1234' },
  { unit: '製造一部', code: 'M1', id: 'L2500335', name: '林炳順', role: 'USER', password: '1234' },
  { unit: '製造一部', code: 'M1', id: 'L2502870', name: '楊穎恩', role: 'USER', password: '1234' },
  { unit: '製造一部', code: 'M1', id: 'L2502871', name: '洪鈞彬', role: 'USER', password: '1234' },
  { unit: '製造一部', code: 'M1', id: 'L2503053', name: '譚世偉', role: 'USER', password: '1234' },
  { unit: '製造一部', code: 'M1', id: 'L2503527', name: '林侑誱', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2300094', name: '林啟榮', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2500331', name: '黃小珊', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2502243', name: '曾紹瑜', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2502076', name: '方明凱', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2502795', name: '王聖賀', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2502917', name: '郭育銓', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2503143', name: '盧文偉', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2503137', name: '朱俊億', role: 'USER', password: '1234' },
  { unit: '製造二部', code: 'M2', id: 'L2503236', name: '鄒威琦', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2500871', name: '董世雄', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2502771', name: '黃彥博', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2502794', name: '徐子荃', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2502727', name: '翁韜惟', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2502792', name: '劉子誠', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2502869', name: '程昱翰', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2503059', name: '陳宜佑', role: 'USER', password: '1234' },
  { unit: '製造三部', code: 'M3', id: 'L2503176', name: '謝仕峯', role: 'USER', password: '1234' },
  { unit: '製造四部', code: 'M4', id: 'L2501336', name: '葉貞成', role: 'USER', password: '1234' },
  { unit: '製造四部', code: 'M4', id: 'L2502176', name: '凌賜恩', role: 'USER', password: '1234' },
  { unit: '製造四部', code: 'M4', id: 'L2502729', name: '黃韋綸', role: 'USER', password: '1234' },
  { unit: '製造四部', code: 'M4', id: 'L2503058', name: '林健業', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2300105', name: '陳仁杰', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2500478', name: '薛嘉雯', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2501289', name: '李勁頤', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2502125', name: '邱建嘉', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2502261', name: '黃靖允', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2502915', name: '梁家樺', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2503057', name: '卓志修', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2503060', name: '張正翰', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2503392', name: '曾文', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2503393', name: '蔡東昕', role: 'USER', password: '1234' },
  { unit: '製造五部', code: 'M5', id: 'L2503526', name: '鄭佑良', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'PD', id: 'L2300075', name: '莊瑞檳', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'PD', id: 'L2300160', name: '邱渝靜', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'PD', id: 'L2300071', name: '廖子欽', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'PD', id: 'L2501406', name: '郭君豪', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'CAM', id: 'L2300149', name: '許閔渝', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'CAM', id: 'L2502075', name: '李誌剛', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'CAM', id: 'L2502122', name: '蘇家倫', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'PD', id: 'L2503233', name: '陳建宏', role: 'USER', password: '1234' },
  { unit: '產品部', code: 'CAM', id: 'L2503234', name: '林冠言', role: 'USER', password: '1234' },
  { unit: 'PM部', code: 'PM', id: 'L2300111', name: '陳伯恩', role: 'USER', password: '1234' },
  { unit: 'PM部', code: 'PM', id: 'L2500586', name: '李靜慧', role: 'USER', password: '1234' },
  { unit: 'PM部', code: 'PM', id: 'L2500723', name: '賴佩榆', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2300053', name: '徐瑞華', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2300107', name: '黃麗玉', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2501592', name: '蕭宇翔', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2500234', name: '林寬洲', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2500313', name: '郭弘毅', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2501288', name: '姚博文', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2502172', name: '吳姿霖', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2502587', name: '王渘珺', role: 'USER', password: '1234' },
  { unit: '生管部', code: '生管', id: 'L2502728', name: '黃聰元', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2300035', name: '陳永財', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'A2442492', name: '曹易彰', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2300109', name: '蔡佩霓', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2500064', name: '戴吟玲', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2300092', name: '黃家緯', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2503232', name: '何易軒', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2503395', name: '鄭郁', role: 'USER', password: '1234' },
  { unit: '品保部', code: '品保', id: 'L2403169', name: '全葛珈妤', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2500793', name: '鄭靖群', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2500911', name: '黃詠盛', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2500872', name: '陳逸豐', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501147', name: '陳信宏', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501664', name: '鍾承勳', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501938', name: '鄧祐昇', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501956', name: '林鴻德', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501957', name: '黃啟盛', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501955', name: '范家芯', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2501958', name: '張丞佑', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2502124', name: '張耀元', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2502126', name: '顏丞諒', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2502175', name: '張智辰', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2502524', name: '陳冠瑋', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2502586', name: '施詠智', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2503056', name: '劉坤峰', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2503055', name: '林華瀧', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2503054', name: '楊依燈', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2503135', name: '蔡亞軒', role: 'USER', password: '1234' },
  { unit: '設備部', code: '設備', id: 'L2503444', name: '黃琮傑', role: 'USER', password: '1234' },
  { unit: '業務部', code: '業務', id: 'L2502766', name: '陳榆榛', role: 'USER', password: '1234' },
  { unit: '業務部', code: '業務', id: 'L2503061', name: '林妤倩', role: 'USER', password: '1234' },
  { unit: 'CSD部', code: 'CSD', id: 'L2502200', name: '李映萱', role: 'USER', password: '1234' },
  { unit: 'CSD部', code: 'CSD', id: 'L2502201', name: '黃鈺舜', role: 'USER', password: '1234' },
  { unit: 'CSD部', code: 'CSD', id: 'L2502202', name: '柯泊如', role: 'USER', password: '1234' },
  { unit: '物流應用部', code: '智能物流', id: 'A2300008', name: '邵世軒', role: 'USER', password: '1234' },
  { unit: '物流應用部', code: '智能物流', id: '32390052', name: '朱宏寬', role: 'USER', password: '1234' },
  { unit: '物流應用部', code: '智能物流', id: '32291615', name: '董文輝', role: 'USER', password: '1234' },
  { unit: '物流應用部', code: '智能物流', id: 'A2300009', name: '楊明傑', role: 'USER', password: '1234' },
  { unit: '自動化部', code: '自動化', id: '82280708', name: '盧幫旺', role: 'USER', password: '1234' },
  { unit: '自動化部', code: '自動化', id: '82290277', name: '駱宇', role: 'USER', password: '1234' },
];

const MEAL_PRICE = 20;

// ==========================================
// ★★★ 3. 主程式入口 ★★★
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!db) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-gray-50">Firebase 連線失敗</div>;
  
  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

  // ★★★ 強制修改密碼檢查 ★★★
  // 如果密碼還是預設的 '1234'，就顯示強制修改畫面
  if (currentUser.password === '1234') {
    return <ForcePasswordChange user={currentUser} onPasswordChanged={(newPwd) => setCurrentUser({...currentUser, password: newPwd})} />;
  }

  return <MainSystem currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
}

// ------------------------------------------------------------------
// ★★★ 強制修改密碼元件 ★★★
// ------------------------------------------------------------------
const ForcePasswordChange = ({ user, onPasswordChanged }) => {
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPwd.length < 4) return setError('密碼至少需要 4 個字元');
    if (newPwd === '1234') return setError('不能使用預設密碼，請設定新的');
    if (newPwd !== confirmPwd) return setError('兩次密碼輸入不一致');

    setLoading(true);
    try {
      // 更新資料庫
      await updateDoc(doc(db, 'users', user.id), { password: newPwd });
      alert('密碼修改成功！請牢記新密碼。');
      onPasswordChanged(newPwd); // 更新本地狀態，進入系統
    } catch (e) {
      setError('修改失敗: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border-l-4 border-yellow-500">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <KeyRound size={32} className="text-yellow-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2 text-center">請設定新密碼</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">為了安全，首次登入或重置後<br/>必須修改預設密碼 (1234)。</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">新密碼</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none" 
              placeholder="請輸入新密碼" 
              value={newPwd} 
              onChange={e => setNewPwd(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">確認新密碼</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none" 
              placeholder="再次輸入新密碼" 
              value={confirmPwd} 
              onChange={e => setConfirmPwd(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded text-center">{error}</div>}
          
          <button 
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold hover:bg-yellow-600 transition shadow-lg disabled:opacity-50"
          >
            {loading ? '更新中...' : '確認修改並進入系統'}
          </button>
        </form>
      </div>
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

      // ★★★ 救援模式 ★★★
      if ((inputId === 'L2500333' || inputId === 'L2300106') && pwd === '1234') {
        const adminUser = INITIAL_STAFF_DATA.find(u => u.id === inputId) || { id: inputId, name: '救援管理員', role: 'ADMIN', unit: '系統', password: '1234' };
        onLogin(adminUser);
        setLoading(false);
        return; 
      }

      // 正常登入
      const docSnap = await getDoc(doc(db, 'users', inputId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.password === pwd) onLogin(data);
        else setError('密碼錯誤 (預設 1234，若忘記請找管理員重置)');
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
        <div className="mt-6 text-xs text-center text-gray-400">首次使用請用管理員帳號 (L2500333 或 L2300106) 登入並初始化</div>
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
      <div className="max-w-6xl mx-auto p-4">
        {currentView === 'ORDER' && <EmployeeApp user={currentUser} dbOrders={dbOrders} />}
        {currentView === 'SUPPORT' && <SupportDashboard dbOrders={dbOrders} users={users} exportToCSV={exportToCSV} />}
        {currentView === 'HR' && <HRReportDashboard dbOrders={dbOrders} users={users} exportToCSV={exportToCSV} />}
        {currentView === 'ADMIN' && <AdminPanel users={users} />}
      </div>
    </div>
  );
};

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

const EmployeeApp = ({ user, dbOrders }) => {
  const [date, setDate] = useState(new Date());
  const dateStr = date.toISOString().split('T')[0];
  const [loading, setLoading] = useState(false);
  const [localOrder, setLocalOrder] = useState({ breakfast: false, lunch: false, dinner: false, lateNight: false });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const dbData = dbOrders.find(o => o.userId === user.id && o.date === dateStr) || { breakfast: false, lunch: false, dinner: false, lateNight: false };
    setLocalOrder({
      breakfast: dbData.breakfast || false,
      lunch: dbData.lunch || false,
      dinner: dbData.dinner || false,
      lateNight: dbData.lateNight || false
    });
    setHasUnsavedChanges(false);
  }, [dateStr, dbOrders, user.id]);

  const isLocked = (type) => {
    const now = new Date();
    const isToday = dateStr === now.toISOString().split('T')[0];
    const isPast = dateStr < now.toISOString().split('T')[0];
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

  const toggleMeal = (type) => {
    if (isLocked(type)) return;
    setLocalOrder(prev => {
      const newState = { ...prev, [type]: !prev[type] };
      setHasUnsavedChanges(true);
      return newState;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const newData = { ...localOrder, userId: user.id, date: dateStr, updatedAt: new Date().toISOString() };
    try { 
      await setDoc(doc(db, 'orders', `${user.id}_${dateStr}`), newData); 
      alert('✅ 儲存成功！');
      setHasUnsavedChanges(false);
    } catch (e) { 
      alert('連線失敗'); 
    }
    setLoading(false);
  };

  const mealConfig = [
    { id: 'breakfast', label: '早餐', sub: '(限隔日)', icon: <Coffee /> },
    { id: 'lunch', label: '午餐', sub: '', icon: <Sun /> },
    { id: 'dinner', label: '晚餐', sub: '', icon: <Moon /> },
    { id: 'lateNight', label: '宵夜', sub: '', icon: <Stars /> },
  ];

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-gray-100">
        <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(d); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft /></button>
        <div className="text-center"><div className="font-bold text-xl text-blue-600">{dateStr}</div><div className="text-xs text-gray-400">每日 08:30 截單</div></div>
        <button onClick={() => { const d = new Date(date); d.setDate(d.getDate() + 1); setDate(d); }} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight /></button>
      </div>
      
      <div className="space-y-3">
        {mealConfig.map((item) => {
          const locked = isLocked(item.id);
          const active = localOrder[item.id];
          return (
            <button key={item.id} onClick={() => toggleMeal(item.id)} disabled={locked || loading} className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${locked ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : active ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white hover:border-blue-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{item.icon}</div>
                <div className="text-left"><div className={`font-bold text-lg ${active ? 'text-blue-700' : 'text-gray-700'}`}>{item.label} <span className="text-sm font-normal text-gray-400">{item.sub}</span></div><div className="text-xs text-gray-400 font-medium">{locked ? '已截單' : '開放預訂中'}</div></div>
              </div>
              {active && <CheckCircle className="text-blue-500" size={24} />}
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-4 left-0 right-0 px-4 max-w-md mx-auto z-50">
        <button 
          onClick={handleSave} 
          disabled={!hasUnsavedChanges || loading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
            hasUnsavedChanges 
              ? 'bg-blue-600 text-white hover:bg-blue-700 scale-100' 
              : 'bg-gray-200 text-gray-400 scale-95'
          }`}
        >
          {loading ? '處理中...' : hasUnsavedChanges ? <><Save /> 確認送出</> : '已儲存'}
        </button>
      </div>
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
          <div key={m.id} onClick={() => setDetail(m.id)} className="bg-white p-6 rounded-2xl border cursor-pointer hover:shadow-md transition text-center group">
            <div className="text-gray-500 font-bold mb-2">{m.label}</div>
            <div className="text-4xl font-black text-gray-800 group-hover:scale-110 transition-transform">{getList(m.id).length}</div>
            <div className="text-xs text-blue-500 mt-2 font-bold">點擊查看詳情</div>
          </div>
        ))}
      </div>
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl flex flex-col max-h-[80vh] shadow-2xl">
            <div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-lg">{dateStr} {meals.find((m) => m.id === detail)?.label}名單</h3><button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button></div>
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 gap-2">
              {getList(detail).map((u) => <div key={u.id} className="text-sm p-2 bg-gray-50 border rounded flex justify-between"><span className="font-mono text-gray-600">{u.id}</span><span className="font-bold">{u.name}</span></div>)}
              {getList(detail).length === 0 && <div className="col-span-2 text-center text-gray-400 py-4">無人預訂</div>}
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => exportToCSV(getList(detail).map((u) => [u.id, u.name, u.unit, u.code, dateStr, detail]), ['工號', '姓名', '部門', '代號', '日期', '餐別'], `支援課_${detail}`)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex justify-center gap-2 hover:bg-green-700 shadow-lg shadow-green-200"><Download /> 匯出 Excel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HRReportDashboard = ({ dbOrders, users, exportToCSV }) => {
  const [start, setStart] = useState('2025-05-01');
  const [end, setEnd] = useState('2025-05-31');
  const report = useMemo(() => users.map((u) => {
    const orders = dbOrders.filter((o) => o.userId === u.id && o.date >= start && o.date <= end);
    const b = orders.filter((o) => o.breakfast).length;
    const l = orders.filter((o) => o.lunch).length;
    const d = orders.filter((o) => o.dinner).length;
    const n = orders.filter((o) => o.lateNight).length;
    const total = b + l + d + n;
    return { ...u, b, l, d, n, total, cost: total * MEAL_PRICE };
  }).filter((r) => r.total > 0), [dbOrders, users, start, end]);

  const handleExport = () => {
    exportToCSV(report.map((r) => [r.id, r.name, r.unit, r.b, r.l, r.d, r.n, r.total, r.cost]), ['工號', '姓名', '部門', '早餐', '午餐', '晚餐', '宵夜', '總餐數', '金額'], `HR報表_${start}_${end}`);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold flex gap-2 items-center"><DollarSign className="text-green-600" /> 人資扣款報表</h2>
        <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 hover:bg-green-700 shadow-md"><Download size={16} /> 匯出報表</button>
      </div>
      <div className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg w-fit">
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border p-2 rounded-md" />
        <span className="text-gray-400">至</span>
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border p-2 rounded-md" />
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 font-bold"><tr><th className="p-3">工號</th><th className="p-3">姓名</th><th className="p-3 text-center">早</th><th className="p-3 text-center">午</th><th className="p-3 text-center">晚</th><th className="p-3 text-center">宵</th><th className="p-3 text-right">總餐數</th><th className="p-3 text-right">金額</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {report.map((r) => (<tr key={r.id} className="hover:bg-gray-50 transition"><td className="p-3 font-mono">{r.id}</td><td className="p-3 font-bold">{r.name}</td><td className="p-3 text-center text-gray-500">{r.b}</td><td className="p-3 text-center text-gray-500">{r.l}</td><td className="p-3 text-center text-gray-500">{r.d}</td><td className="p-3 text-center text-gray-500">{r.n}</td><td className="p-3 text-right font-medium">{r.total}</td><td className="p-3 text-right text-green-600 font-bold">${r.cost}</td></tr>))}
            {report.length === 0 && <tr><td colSpan="8" className="p-6 text-center text-gray-400">區間內無訂餐資料</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminPanel = ({ users }) => {
  const [newUser, setNewUser] = useState({ id: '', name: '', unit: '', role: 'USER', password: '1234' });
  const [loading, setLoading] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  // 1. 單一新增
  const addUser = async () => { if (!newUser.id) return; await setDoc(doc(db, 'users', newUser.id.toUpperCase()), newUser); alert('新增成功'); setNewUser({ id: '', name: '', unit: '', role: 'USER', password: '1234' }); };
  
  // 2. 刪除
  const deleteUser = async (id) => { if (confirm('確定刪除?')) await deleteDoc(doc(db, 'users', id)); };
  
  // 3. ★★★ 重置密碼 (忘記密碼用) ★★★
  const resetPassword = async (id, name) => {
    if (!confirm(`確定要重置 ${name} (${id}) 的密碼嗎？\n密碼將變回 1234，並強制他在下次登入時修改。`)) return;
    try {
      await updateDoc(doc(db, 'users', id), { password: '1234' });
      alert('密碼重置成功！');
    } catch(e) {
      alert('重置失敗: ' + e.message);
    }
  };
  
  // 4. 系統初始化
  const initDB = async () => { 
    if (!confirm('【警告】確定要還原成預設名單？這將會覆蓋現有資料！')) return; 
    setLoading(true); 
    try { 
      let count = 0;
      for (const s of INITIAL_STAFF_DATA) { 
        await setDoc(doc(db, 'users', s.id), s); 
        count++;
      } 
      alert(`成功還原 ${count} 筆預設資料`); 
    } catch (e) { alert('失敗: ' + e.message); } 
    setLoading(false); 
  };

  // 5. 批量匯入
  const handleBulkImport = async () => {
    if (!bulkText) return alert('請先貼上資料');
    if (!confirm('確定匯入？重複的工號將會被更新。')) return;
    
    setLoading(true);
    try {
      const rows = bulkText.trim().split('\n');
      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        const cols = row.split('\t').map(c => c.trim());
        if (cols.length >= 3) {
          const unit = cols[0];
          const id = cols[1]?.toUpperCase();
          const name = cols[2];
          
          if (id && name) {
            const userData = { unit: unit, id: id, name: name, role: 'USER', password: '1234' };
            await setDoc(doc(db, 'users', id), userData);
            successCount++;
          } else { errorCount++; }
        } else { errorCount++; }
      }
      alert(`匯入完成！\n成功: ${successCount} 筆\n忽略/格式錯誤: ${errorCount} 筆`);
      setBulkText('');
    } catch (e) { alert('匯入發生錯誤: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 批量匯入區塊 */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex gap-2 items-center text-blue-800">
          <FileText /> 批量匯入員工 (Excel 複製貼上)
        </h2>
        <textarea 
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder={`範例格式：\n製造部\tL123456\t王小明\n產品部\tL654321\t李小華`}
          className="w-full h-40 p-3 border rounded-lg font-mono text-sm mb-3 bg-gray-50 focus:bg-white transition"
        />
        <button onClick={handleBulkImport} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md w-full md:w-auto">
          {loading ? '匯入處理中...' : '開始匯入資料'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex gap-2 items-center"><UserPlus /> 人員管理</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
          <input placeholder="工號" value={newUser.id} onChange={(e) => setNewUser({ ...newUser, id: e.target.value.toUpperCase() })} className="border p-2 rounded" />
          <input placeholder="姓名" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="border p-2 rounded" />
          <input placeholder="部門" value={newUser.unit} onChange={(e) => setNewUser({ ...newUser, unit: e.target.value })} className="border p-2 rounded" />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="border p-2 rounded"><option value="USER">員工</option><option value="SUPPORT">支援課</option><option value="HR">人資</option><option value="ADMIN">管理</option></select>
          <button onClick={addUser} className="bg-green-600 text-white rounded font-bold hover:bg-green-700">單筆新增</button>
        </div>
        <div className="h-96 overflow-y-auto border rounded divide-y">
          {users.map((u) => (
            <div key={u.id} className="flex justify-between p-3 hover:bg-gray-50 items-center">
              <span className="w-24 font-mono">{u.id}</span>
              <span className="w-20 font-bold">{u.name}</span>
              <span className="w-24 text-xs text-gray-500">{u.unit}</span>
              <span className="w-20 text-xs bg-gray-200 px-2 py-1 rounded text-center">{u.role}</span>
              <div className="flex gap-2">
                {/* 重置密碼按鈕 */}
                <button onClick={() => resetPassword(u.id, u.name)} className="text-gray-400 hover:text-orange-500" title="重置密碼為 1234">
                  <RefreshCcw size={16} />
                </button>
                {/* 刪除按鈕 */}
                <button onClick={() => deleteUser(u.id)} className="text-gray-400 hover:text-red-500" title="刪除員工">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm opacity-70 hover:opacity-100 transition">
        <h2 className="font-bold text-lg mb-4 flex gap-2 items-center text-gray-500"><AlertTriangle /> 危險區域</h2>
        <button onClick={initDB} disabled={loading} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition flex items-center gap-2 text-sm">{loading ? '處理中...' : '還原預設名單 (會覆蓋資料)'}</button>
      </div>
    </div>
  );
};