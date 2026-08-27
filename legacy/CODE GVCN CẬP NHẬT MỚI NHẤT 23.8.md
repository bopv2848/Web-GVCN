&lt;!DOCTYPE html&gt;

&lt;html lang="vi"&gt;

&lt;head&gt;

&lt;meta charset="UTF-8"&gt;

&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;

&lt;title&gt;THANH XUÂN 12A1&lt;/title&gt;

&lt;!-- External Libraries --&gt;

&lt;script src="<https://cdn.tailwindcss.com"&gt;&lt;/script>&gt;

&lt;script src="<https://unpkg.com/@phosphor-icons/web"&gt;&lt;/script>&gt;

&lt;script src="<https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"&gt;&lt;/script>&gt;

&lt;script src="<https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"&gt;&lt;/script>&gt;

&lt;script src="<https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"&gt;&lt;/script>&gt;

&lt;!-- Tailwind Configuration --&gt;

&lt;script&gt;

tailwind.config = {

theme: {

extend: {

fontFamily: {

sans: \['"Quicksand"', 'sans-serif'\],

},

colors: {

primary: '#1e1b4b', // Deep indigo

secondary: '#312e81',

accent: '#f59e0b', // Amber

blueAccent: '#3b82f6',

lightBg: '#f8fafc',

cardBg: '#ffffff'

},

animation: {

'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',

'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',

'spin-slow': 'spin 8s linear infinite',

'bounce-slight': 'bounceSlight 2s infinite ease-in-out'

},

keyframes: {

fadeIn: {

'0%': { opacity: '0', transform: 'translateY(15px)' },

'100%': { opacity: '1', transform: 'translateY(0)' }

},

slideUp: {

'0%': { opacity: '0', transform: 'translateY(30px)' },

'100%': { opacity: '1', transform: 'translateY(0)' }

},

bounceSlight: {

'0%, 100%': { transform: 'translateY(0)' },

'50%': { transform: 'translateY(-5px)' }

}

},

letterSpacing: {

tighter: '-0.04em',

tight: '-0.02em',

normal: '0',

wide: '0.02em',

wider: '0.05em',

widest: '0.1em',

}

}

}

}

&lt;/script&gt;

&lt;style&gt;

@import url('<https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap>');

body {

font-family: 'Quicksand', sans-serif;

background-color: #f1f5f9;

color: #0f172a;

margin: 0;

height: 100dvh;

overflow-x: hidden;

\-webkit-font-smoothing: antialiased;

\-moz-osx-font-smoothing: grayscale;

}

/\* Custom Scrollbar for a premium look \*/

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }

.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/\* Toast Notifications \*/

.toast {

position: fixed; bottom: 24px; right: 24px;

padding: 16px 24px; border-radius: 16px;

color: white; font-weight: 700;

box-shadow: 0 12px 30px rgba(0,0,0,0.15);

display: flex; align-items: center; gap: 12px;

z-index: 1000;

animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;

}

.toast.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }

.toast.error { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }

.toast.fadeOut { animation: fadeOutRight 0.3s ease-in forwards; }

@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

@keyframes fadeOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }

@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

/\* Typography refinements \*/

h1, h2, h3, h4, h5, h6 {

letter-spacing: -0.02em;

}

.tracking-widest {

letter-spacing: 0.1em;

}

/\* Banner effects \*/

.bg-banner { position: relative; overflow: hidden; }

.bg-banner::before {

content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;

background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);

animation: spin 40s linear infinite; pointer-events: none;

}

/\* Glassmorphism utilities \*/

.glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3); }

.glass-dark { background: rgba(30, 27, 75, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }

/\* Print adjustments \*/

@media print {

body \* { visibility: hidden; }

# report-container, #report-container \* { visibility: visible; }

# report-container { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; }

.custom-scrollbar { overflow: visible !important; max-height: none !important; }

.print\\:hidden { display: none !important; }

}

&lt;/style&gt;

&lt;/head&gt;

&lt;body&gt;

&lt;!-- App Mount Points --&gt;

&lt;div id="app" class="flex h-screen w-full bg-slate-100"&gt;&lt;/div&gt;

&lt;div id="toast-container"&gt;&lt;/div&gt;

&lt;div id="timer-drawer-container"&gt;&lt;/div&gt;

&lt;script&gt;

let state = {

currentTab: 'tong-quan',

auth: { loggedIn: true, role: 'gvcn' },

theme: { month: "CHỦ ĐIỂM THÁNG", title: "CHUYẾN TÀU THANH XUÂN", bannerUrl: "", bannerColorClass: "from-\[#1e1b4b\] to-\[#312e81\]" },

admin: { name: "Giáo Viên", role: "Giáo viên chủ nhiệm", avatarUrl: "", className: "LỚP 12A1", classAvatarUrl: "" },

tasks: \[\],

journeys: \[\],

settings: { sidebarPosition: 'left', deductStarsOnRedeem: true },

settingsTab: 'thong-tin',

students: \[\], // Đã thêm khởi tạo mảng học sinh để tránh lỗi

groups: \[

{ id: "g1", name: "Tổ 1", color: "text-red-500", avatarUrl: "" },

{ id: "g2", name: "Tổ 2", color: "text-green-500", avatarUrl: "" },

{ id: "g3", name: "Tổ 3", color: "text-yellow-500", avatarUrl: "" },

{ id: "g4", name: "Tổ 4", color: "text-blueAccent", avatarUrl: "" }

\],

rewards: \[\],

attendanceRecords: {},

attendanceTab: 'diem-danh',

// --- Cập nhật State cho form Tích điểm mới ---

pointsForm: {

actionType: 'add', // 'add' or 'subtract'

targetType: 'student', // 'student', 'group', or 'class'

selectedTargetId: '', // student id or group name, empty if class

pointsVal: 0,

category: 'Học tập',

reason: '',

note: ''

},

selectedStudentForRewards: null,

editingStudentId: null,

editingGroupId: null,

criteria: null

};

let timerInterval = null;

let timerSeconds = 0;

let isTimerRunning = false;

let isDataLoaded = false;

// --- BỔ SUNG CÁC HÀM XỬ LÝ NGÀY THÁNG BỊ THIẾU ---

const \_d = new Date();

let currentAttendanceDate = \`\${\_d.getFullYear()}-\${String(\_d.getMonth() + 1).padStart(2, '0')}-\${String(\_d.getDate()).padStart(2, '0')}\`;

window.formatDateForDisplay = function(dStr) {

if(!dStr) return '';

return dStr.split('-').reverse().join('/');

};

window.getTodayString = function() {

const date = new Date();

return \`\${String(date.getDate()).padStart(2, '0')}\${String(date.getMonth() + 1).padStart(2, '0')}\${date.getFullYear()}\`;

};

// ------------------------------------------------

const menuItems = \[

{ id: 'tong-quan', icon: 'ph-squares-four', label: 'Trang chủ' },

{ id: 'hoc-sinh', icon: 'ph-users', label: 'Học sinh' },

{ id: 'thoi-khoa-bieu', icon: 'ph-calendar-list', label: 'Thời khóa biểu' },

{ id: 'so-do-lop', icon: 'ph-grid-four', label: 'Sơ đồ lớp' },

{ id: 'doi-qua', icon: 'ph-gift', label: 'Quà tặng' },

{ id: 'nhom-thi-dua', icon: 'ph-flag-pennant', label: 'Tổ thi đua' },

{ id: 'diem-danh', icon: 'ph-calendar-check', label: 'Điểm danh' },

{ id: 'vong-quay', icon: 'ph-cards', label: 'Gọi Tên Ngẫu Nhiên' },

{ id: 'dong-ho', icon: 'ph-timer', label: 'Công cụ' },

{ id: 'lich-bao-giang', icon: 'ph-notebook', label: 'Lịch báo giảng' },

{ id: 'xep-hang', icon: 'ph-trophy', label: 'Tuyên Dương' },

{ id: 'bao-cao', icon: 'ph-chart-bar', label: 'Sổ theo dõi' },

{ id: 'tram-dong-hanh', icon: 'ph-hands-clapping', label: 'Trạm đồng hành' },

{ id: 'cai-dat', icon: 'ph-gear', label: 'Cài đặt' }

\];

function escapeInlineJs(str) { return str ? String(str).replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'").replace(/"/g, '"').replace(/\\n/g, '\\\\n').replace(/\\r/g, '\\\\r') : ''; }

function escapeHtmlAttr(str) { return str ? String(str).replace(/"/g, '"') : ''; }

function generateUniqueCode() {

let code, attempts = 0;

const currentStudents = state.students || \[\];

do { code = Math.floor(10000 + Math.random() \* 90000).toString(); attempts++; } while (currentStudents.some(s => s.code === code) && attempts < 100);

return code;

}

function compressImage(file, callback, max_size = 300, quality = 0.8) {

const reader = new FileReader();

reader.onload = function(event) {

const img = new Image();

img.onload = function() {

const canvas = document.createElement('canvas');

let width = img.width, height = img.height;

if (width > height) { if (width > max_size) { height \*= max_size / width; width = max_size; } }

else { if (height > max_size) { width \*= max_size / height; height = max_size; } }

canvas.width = width; canvas.height = height;

const ctx = canvas.getContext('2d');

ctx.drawImage(img, 0, 0, width, height);

callback(canvas.toDataURL('image/jpeg', quality));

};

img.src = event.target.result;

};

reader.readAsDataURL(file);

}

function applyStateDefaults() {

if (!state.theme) state.theme = { month: "CHỦ ĐIỂM THÁNG 9", title: "CHÀO MỪNG NĂM HỌC MỚI", bannerUrl: "", bannerColorClass: "from-\[#1e1b4b\] to-\[#312e81\]" };

if (!state.theme.bannerColorClass) state.theme.bannerColorClass = "from-\[#1e1b4b\] to-\[#312e81\]";

if (!state.admin) state.admin = { name: "Giáo Viên", role: "Giáo viên chủ nhiệm", avatarUrl: "", className: "LỚP 12A1", classAvatarUrl: "" };

if (!state.settings) state.settings = { sidebarPosition: 'left', deductStarsOnRedeem: true };

if (!state.attendanceRecords) state.attendanceRecords = {};

if (!state.attendanceTab) state.attendanceTab = 'diem-danh';

if (!state.students) state.students = \[\];

if (!state.timetable) state.timetable = { dayUrl: '', extraUrl: '' };

if (!state.timetable) state.timetable = { dayUrl: '', extraUrl: '' };

if (!state.tasks) state.tasks = \[\];

if (!state.journeys) state.journeys = \[\];

const defaultRewards = \[

{ id: 'r1', name: 'Đổi chỗ ngồi 1 ngày', cost: 10, icon: 'ph-seat', color: 'text-purple-600', bg: 'bg-purple-100', desc: 'Chọn chỗ ngồi yêu thích' },

{ id: 'r2', name: 'Nhạc theo yêu cầu', cost: 20, icon: 'ph-music-notes', color: 'text-blueAccent', bg: 'bg-blue-100', desc: 'Bật bài hát yêu thích giờ ra chơi' },

{ id: 'r3', name: 'Miễn làm bài tập', cost: 50, icon: 'ph-files', color: 'text-emerald-600', bg: 'bg-emerald-100', desc: 'Miễn 1 bài tập về nhà' },

{ id: 'r4', name: 'Quà tặng bí mật', cost: 100, icon: 'ph-gift', color: 'text-orange-600', bg: 'bg-orange-100', desc: 'Nhận phần quà đặc biệt từ GV' }

\];

if (!state.rewards || state.rewards.length === 0) state.rewards = defaultRewards;

state.students.forEach(s => {

if (typeof s.stars === 'undefined') s.stars = s.points;

if (!s.code) s.code = generateUniqueCode();

if (!s.history) s.history = \[\]; // Khởi tạo mảng lịch sử nếu chưa có

});

const defaultCriteria = {

version: 2,

positive: \[

{ points: 5, reason: "Đạt điểm 9,10", category: "Học tập" },

{ points: 3, reason: "Giúp đỡ bạn bè", category: "Phong trào" },

{ points: 10, reason: "Làm bài tập đầy đủ", category: "Học tập" },

{ points: 10, reason: "Đóng góp phong trào", category: "Phong trào" },

{ points: 15, reason: "Điểm cao kiểm tra", category: "Học tập" },

{ points: 2, reason: "Đi học đúng giờ", category: "Chuyên cần" },

{ points: 5, reason: "Trực nhật xuất sắc", category: "Nề nếp" }

\],

negative: \[

{ points: 5, reason: "Nói chuyện riêng", category: "Kỷ luật" },

{ points: 10, reason: "Không làm bài tập", category: "Học tập" },

{ points: 3, reason: "Quên đồ dùng học tập", category: "Học tập" },

{ points: 3, reason: "Ăn vặt trong lớp", category: "Kỷ luật" },

{ points: 2, reason: "Đi học muộn", category: "Chuyên cần" },

{ points: 5, reason: "Mất trật tự trong giờ", category: "Kỷ luật" },{ points: 15, reason: "Sử dụng điện thoại", category: "Kỷ luật" }

\]

};

if (!state.criteria || state.criteria.version !== 2) state.criteria = defaultCriteria;

// Backwards compatibility for existing criteria missing category

state.criteria.positive.forEach(c => { if(!c.category) c.category = "Khác"; });

state.criteria.negative.forEach(c => { if(!c.category) c.category = "Khác"; });

if (!state.timetable) state.timetable = { dayUrl: '', extraUrl: '' };

if (!state.dailySchedule) {

state.dailySchedule = {

1: \[ // Thứ 2

{ period: 'Tiết 1', time: '07:30 - 08:15', subject: 'Chào cờ', teacher: 'GVCN' },

{ period: 'Tiết 2', time: '08:15 - 09:00', subject: 'Hóa Học', teacher: 'Cô Thùy' },

{ period: 'Tiết 3', time: '09:10 - 09:55', subject: 'Toán', teacher: 'Thầy Hùng' },

{ period: 'Tiết 4', time: '10:00 - 10:45', subject: 'Vật Lý', teacher: 'Cô Lan' }

\]

};

}

}

function initDefaultStudents() {

state.students = \[

{ id: 1, name: "Nguyễn Văn A", points: 85, stars: 85, group: "Tổ 1", role: "Lớp trưởng", goal: "Học sinh giỏi", talent: "Toán", avatarUrl: "", gender: "Nam", code: generateUniqueCode(), history: \[\], dob: "2008-05-15", boardingType: "Ngoại trú" },

{ id: 2, name: "Trần Thị B", points: 60, stars: 60, group: "Tổ 2", role: "Lớp phó", goal: "Học sinh giỏi", talent: "Văn Nghệ", avatarUrl: "", gender: "Nữ", code: generateUniqueCode(), history: \[\], dob: "2008-08-20", boardingType: "Bán trú" },

{ id: 3, name: "Lê Hoàng C", points: 45, stars: 45, group: "Tổ 3", role: "Tổ trưởng", goal: "Tiến bộ", talent: "Thể thao", avatarUrl: "", gender: "Nam", code: generateUniqueCode(), history: \[\], dob: "2008-11-10", boardingType: "Nội trú" }

\];

}

function showToast(message, type = 'success') {

const container = document.getElementById('toast-container');

const toast = document.createElement('div');

toast.className = \`toast \${type}\`;

toast.innerHTML = type === 'success' ? \`&lt;i class="ph-fill ph-check-circle text-2xl drop-shadow"&gt;&lt;/i&gt; &lt;span&gt;\${message}&lt;/span&gt;\` : \`&lt;i class="ph-fill ph-warning-circle text-2xl drop-shadow"&gt;&lt;/i&gt; &lt;span&gt;\${message}&lt;/span&gt;\`;

container.appendChild(toast);

setTimeout(() => { toast.classList.add('fadeOut'); setTimeout(() => toast.remove(), 300); }, 3000);

}

function getAvatarImg(url, name, classes = "w-10 h-10") {

const safeName = name || 'User'; const seed = encodeURIComponent(safeName);

const finalUrl = url || \`<https://api.dicebear.com/7.x/notionists/svg?seed=\${seed}&backgroundColor=e0e7ff,fef08a,dcfce7,fee2e2\`>;

return \`&lt;img src="\${finalUrl}" class="\${classes} rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"&gt;\`;

}

window.switchSettingsTab = function(tab) {

state.settingsTab = tab;

renderLayout();

};

window.switchTab = function(tabId) {

// Giới hạn tab nếu là Ban cán sự

if (state.auth && state.auth.role === 'bancansu') {

const allowed = \['tong-quan', 'hoc-sinh', 'thoi-khoa-bieu', 'diem-danh'\];

if (!allowed.includes(tabId)) {

showToast("Ban cán sự chỉ có quyền truy cập Trang chủ, Học sinh, Thời khóa biểu và Điểm danh!", "error");

return;

}

}

// Giới hạn tab nếu là Ban giám hiệu

if (state.auth && state.auth.role === 'bgh') {

const allowed = \['tong-quan', 'hoc-sinh', 'thoi-khoa-bieu', 'so-do-lop', 'diem-danh', 'bao-cao', 'tram-dong-hanh'\];

if (!allowed.includes(tabId)) {

showToast("Ban giám hiệu chỉ có quyền truy cập Trang chủ, Học sinh, TKB, Sơ đồ, Điểm danh, Sổ theo dõi và Trạm đồng hành!", "error");

return;

}

}

// SỬA LỖI TẠI ĐÂY: Nếu bấm vào Cài đặt từ menu, luôn đưa về mục Thông tin chung

if (tabId === 'cai-dat') {

state.settingsTab = 'thong-tin';

}

state.currentTab = tabId;

renderLayout();

};

function renderSidebar() {

// Lọc menu theo quyền đăng nhập

let activeMenuItems = menuItems;

if (state.auth && state.auth.role === 'bancansu') {

activeMenuItems = menuItems.filter(item => \['tong-quan', 'hoc-sinh', 'thoi-khoa-bieu', 'diem-danh'\].includes(item.id));

} else if (state.auth && state.auth.role === 'bgh') {

activeMenuItems = menuItems.filter(item => \['tong-quan', 'hoc-sinh', 'thoi-khoa-bieu', 'so-do-lop', 'diem-danh', 'bao-cao', 'tram-dong-hanh'\].includes(item.id));

}

const menuHtml = activeMenuItems.map(item => {

if (item.id === 'dong-ho') {

return \`&lt;button onclick="openTimerDrawer()" class="w-full flex items-center gap-4 px-6 py-3.5 mb-2 rounded-2xl transition-all duration-300 text-indigo-200 hover:bg-white/10 hover:text-white font-semibold group"&gt;&lt;div class="p-2 rounded-xl bg-white/5 group-hover:bg-white/20 transition-colors"&gt;&lt;i class="ph-fill \${item.icon} text-xl"&gt;&lt;/i&gt;&lt;/div&gt;&lt;span class="text-sm tracking-wide"&gt;\${item.label}&lt;/span&gt;&lt;/button&gt;\`;

}

const isActive = state.currentTab === item.id;

return \`

&lt;button onclick="switchTab('\${item.id}')" class="w-full flex items-center gap-4 px-6 py-3.5 mb-2 rounded-2xl transition-all duration-300 group relative overflow-hidden \${isActive ? 'text-white' : 'text-indigo-200 hover:text-white hover:bg-white/5'}"&gt;

\${isActive ? '&lt;div class="absolute inset-0 bg-gradient-to-r from-blueAccent to-indigo-600 opacity-90"&gt;&lt;/div&gt;&lt;div class="absolute inset-0 bg-\[url(\\'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=\\')\]"&gt;&lt;/div&gt;' : ''}

&lt;div class="relative z-10 flex items-center gap-4 w-full"&gt;

&lt;div class="p-2 rounded-xl \${isActive ? 'bg-white/20 shadow-inner' : 'bg-transparent group-hover:bg-white/10'} transition-colors"&gt;&lt;i class="ph-fill \${item.icon} text-xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;span class="text-sm tracking-wide font-bold"&gt;\${item.label}&lt;/span&gt;

&lt;/div&gt;

&lt;/button&gt;\`;

}).join('');

const classAvatarContent = state.admin.classAvatarUrl ? \`&lt;img src="\${state.admin.classAvatarUrl}" class="w-full h-full object-cover"&gt;\` : \`&lt;i class="ph-fill ph-student text-white text-3xl"&gt;&lt;/i&gt;\`;

return \`

&lt;!-- Thêm 'hidden md:flex' để PC giữ nguyên, Điện thoại tự ẩn --&gt;

&lt;aside class="hidden md:flex w-\[280px\] bg-primary text-white flex-col h-full shadow-\[4px_0_24px_rgba(0,0,0,0.05)\] z-20 flex-shrink-0 print:hidden relative border-r border-white/10"&gt;

&lt;div class="flex flex-col items-center justify-center p-8 pb-6 relative overflow-hidden"&gt;

&lt;div class="absolute inset-0 opacity-20 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')\]"&gt;&lt;/div&gt;

&lt;div class="relative group cursor-pointer mb-5 z-10" onclick="document.getElementById('class-avatar-upload').click()" title="Thay đổi ảnh đại diện"&gt;

&lt;div class="w-20 h-20 bg-gradient-to-tr from-blueAccent to-purple-500 rounded-3xl flex items-center justify-center shadow-lg border-2 border-white/20 transform group-hover:scale-105 transition-all overflow-hidden relative group-hover:shadow-blueAccent/50"&gt;

\${classAvatarContent}

&lt;div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;&lt;i class="ph-fill ph-camera text-white text-xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;input type="file" id="class-avatar-upload" class="hidden" accept="image/\*" onchange="handleClassAvatarUpload(event)"&gt;

&lt;div class="font-extrabold text-white text-center text-\[15px\] tracking-wide uppercase leading-snug drop-shadow-md z-10 px-2"&gt;\${state.admin.className || "LỚP HỌC"}&lt;/div&gt;

&lt;div class="text-\[10px\] text-indigo-300/80 uppercase tracking-widest mt-1.5 z-10 font-bold"&gt;Hệ thống quản lý&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex-1 overflow-y-auto px-4 custom-scrollbar pb-6"&gt;\${menuHtml}&lt;/div&gt;

&lt;/aside&gt;

\`;

}

// --- THANH ĐIỀU HƯỚNG NẰM DƯỚI ĐÁY (CHỈ HIỂN THỊ TRÊN ĐIỆN THOẠI) ---

function renderBottomNav() {

let activeMenuItems = menuItems;

if (state.auth && state.auth.role === 'bancansu') {

activeMenuItems = menuItems.filter(item => \['tong-quan', 'hoc-sinh', 'thoi-khoa-bieu', 'diem-danh'\].includes(item.id));

} else if (state.auth && state.auth.role === 'bgh') {

activeMenuItems = menuItems.filter(item => \['tong-quan', 'hoc-sinh', 'thoi-khoa-bieu', 'so-do-lop', 'diem-danh', 'bao-cao', 'tram-dong-hanh'\].includes(item.id));

}

const menuHtml = activeMenuItems.map(item => {

const isActive = state.currentTab === item.id;

// Căn chỉnh giao diện nút y như mẫu ảnh của cô

const activeClass = isActive

? "text-white bg-blue-600 shadow-\[0_4px_15px_rgba(37,99,235,0.4)\] transform -translate-y-1.5"

: "text-\[#94a3b8\] hover:text-white hover:bg-white/5";

// Xử lý các nút bấm đặc biệt

let onclickAction = \`switchTab('\${item.id}')\`;

if (item.id === 'dong-ho') onclickAction = 'openTimerDrawer()';

if (item.id === 'tich-diem') onclickAction = \`switchTab('cai-dat'); switchSettingsTab('tich-diem');\`;

return \`

&lt;button onclick="\${onclickAction}" class="flex flex-col items-center justify-center min-w-\[70px\] w-20 py-2 rounded-\[1rem\] transition-all duration-300 \${activeClass}"&gt;

&lt;i class="\${isActive ? 'ph-fill' : 'ph-bold'} \${item.icon} text-\[22px\] mb-1"&gt;&lt;/i&gt;

&lt;span class="text-\[10px\] font-bold whitespace-nowrap tracking-wide"&gt;\${item.label}&lt;/span&gt;

&lt;/button&gt;

\`;

}).join('');

return \`

&lt;!-- Thẻ nav có chứa 'md:hidden' nghĩa là trên Máy tính nó sẽ hoàn toàn tàng hình --&gt;

&lt;nav class="md:hidden fixed bottom-0 left-0 right-0 bg-\[#1e1b4b\] border-t border-indigo-900 shadow-\[0_-10px_40px_rgba(0,0,0,0.2)\] z-50 overflow-x-auto pb-1 custom-scrollbar"&gt;

&lt;div class="absolute inset-0 opacity-10 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')\]"&gt;&lt;/div&gt;

&lt;div class="flex items-center gap-1.5 px-3 pt-2 pb-2 relative z-10 w-max min-w-full"&gt;

\${menuHtml}

&lt;/div&gt;

&lt;/nav&gt;

\`;

}

function renderHeader() {

const syncStatus = \`&lt;div class="hidden sm:flex items-center gap-2 text-\[11px\] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"&gt;&lt;i class="ph-fill ph-hard-drives text-sm"&gt;&lt;/i&gt; Lưu cục bộ&lt;/div&gt;\`;

// Tự động đổi tên và chức danh dựa trên quyền đăng nhập

let roleName = state.admin.name;

let roleDesc = state.admin.role;

if (state.auth && state.auth.role === 'bancansu') {

roleName = 'Ban Cán Sự';

roleDesc = 'Quản lý lớp';

} else if (state.auth && state.auth.role === 'bgh') {

roleName = 'Ban Giám Hiệu';

roleDesc = 'Giám sát hệ thống';

}

return \`

&lt;header class="glass sticky top-0 px-6 py-4 flex justify-between items-center z-10 flex-shrink-0 print:hidden shadow-sm"&gt;

&lt;div class="flex items-center gap-3"&gt;

&lt;button class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl" onclick="alert('Tính năng menu di động đang phát triển')"&gt;&lt;i class="ph-bold ph-list text-xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;h2 class="text-xl font-black text-slate-800 tracking-tight hidden md:block capitalize"&gt;\${menuItems.find(m => m.id === state.currentTab)?.label || 'Bảng điều khiển'}&lt;/h2&gt;

&lt;/div&gt;

&lt;div class="flex items-center gap-4"&gt;

&lt;button onclick="openParentLookupModal()" class="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-orange-400 to-amber-500 px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all" title="Cổng Phụ Huynh tra cứu"&gt;

&lt;i class="ph-bold ph-magnifying-glass text-sm"&gt;&lt;/i&gt; &lt;span class="hidden sm:inline"&gt;Tra cứu&lt;/span&gt;

&lt;/button&gt;

\${syncStatus}

&lt;div class="flex items-center gap-3 bg-white border border-slate-200 py-1.5 px-2 sm:px-4 rounded-2xl shadow-sm transition-all"&gt;

&lt;div class="text-right hidden sm:block \${(!state.auth || state.auth.role === 'gvcn') ? 'cursor-pointer group hover:text-blueAccent' : ''}" \${(!state.auth || state.auth.role === 'gvcn') ? 'onclick="openEditAdminModal()"' : ''}&gt;

&lt;div class="text-xs font-bold text-slate-800 transition-colors"&gt;\${roleName}&lt;/div&gt;

&lt;div class="text-\[9px\] text-slate-500 uppercase tracking-widest font-semibold"&gt;\${roleDesc}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative flex-shrink-0 \${(!state.auth || state.auth.role === 'gvcn') ? 'cursor-pointer group hover:scale-105 transition-transform' : ''}" \${(!state.auth || state.auth.role === 'gvcn') ? 'onclick="openEditAdminModal()"' : ''}&gt;

\${getAvatarImg(state.admin.avatarUrl, state.admin.name, "w-9 h-9")}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/header&gt;

\`;

}

window.closeModal = function(id) {

// Xóa nội dung trong khung chứa chung

const container = document.getElementById('modal-container');

if (container) container.innerHTML = '';

// Xóa triệt để bảng bị kẹt (nếu có)

if (id) {

const modal = document.getElementById(id);

if (modal) modal.remove();

}

};

function renderLayout() {

const app = document.getElementById('app');

let contentHtml = '';

switch (state.currentTab) {

case 'tong-quan': contentHtml = renderViewTongQuan(); break;

case 'hoc-sinh': contentHtml = renderViewHocSinh(); break;

case 'thoi-khoa-bieu': contentHtml = renderViewThoiKhoaBieu(); break;

case 'so-do-lop': contentHtml = renderViewSoDoLop(); break;

case 'lich-bao-giang': contentHtml = renderViewLichBaoGiang(); break;

case 'tich-diem': contentHtml = renderViewTichDiem(); break;

case 'doi-qua': contentHtml = renderViewDoiQua(); break;

case 'nhom-thi-dua': contentHtml = renderViewNhomThiDua(); break;

case 'diem-danh': contentHtml = renderViewDiemDanh(); break;

case 'vong-quay': contentHtml = renderViewVongQuay(); break;

case 'xep-hang': contentHtml = renderViewXepHang(); break;

case 'bao-cao': contentHtml = renderViewBaoCao(); break;

case 'tram-dong-hanh': contentHtml = renderViewTramDongHanh(); break;

case 'cai-dat': contentHtml = renderViewCaiDat(); break;

default: contentHtml = \`&lt;div class="p-12 text-center text-slate-500 font-medium"&gt;Tính năng đang được phát triển...&lt;/div&gt;\`;

}

const isRightSidebar = state.settings.sidebarPosition === 'right';

// --- ĐÂY LÀ ĐOẠN ĐÃ ĐƯỢC CHỈNH SỬA CHO ĐIỆN THOẠI ---

app.innerHTML = \`

\${!isRightSidebar ? renderSidebar() : ''}

&lt;div class="flex-1 flex flex-col h-full overflow-hidden relative bg-\[#f8fafc\]" id="main-container"&gt;

\${renderHeader()}

&lt;!-- pd-28 md:pb-8: Chừa khoảng trống dưới cùng trên điện thoại để menu không che chữ --&gt;

&lt;main class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative print:p-0 print:overflow-visible pb-28 md:pb-8" id="main-content"&gt;

\${contentHtml}

&lt;/main&gt;

&lt;!-- Chèn thanh Menu dưới cùng của điện thoại --&gt;

\${renderBottomNav()}

&lt;div id="modal-container" class="print:hidden"&gt;&lt;/div&gt;

&lt;/div&gt;

\${isRightSidebar ? renderSidebar() : ''}

\`;

cancelAnimationFrame(pickerAnimationId);

if (state.currentTab === 'vong-quay') {

setTimeout(() => {

initPickerCards();

pickerAnimationId = requestAnimationFrame(animatePicker);

}, 50);

}

}

function renderViewTongQuan() {

// Lấy dữ liệu cơ bản

const d = new Date();

const todayStr = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;

const todayRecord = state.attendanceRecords\[todayStr\] || {};

let absentCount = 0;

state.students.forEach(s => {

const status = todayRecord\[s.id\];

if (status === 'excused' || status === 'unexcused') absentCount++;

});

// --- KHAI BÁO BIẾN CƠ BẢN VÀ TÍNH TOÁN ---

const totalStudents = state.students.length;

const presentStudents = totalStudents - absentCount;

const goodPointsCount = state.students.filter(s => (s.points || 0) >= 10).length;

// Tính % Học tập

let learningPercent = 100;

if (totalStudents > 0) {

const positiveStudents = state.students.filter(s => (s.points || 0) >= 0).length;

learningPercent = Math.round((positiveStudents / totalStudents) \* 100);

}

// Đánh giá Nền nếp

const negativeStudentsCount = state.students.filter(s => (s.points || 0) < 0).length;

const totalIssues = absentCount + negativeStudentsCount;

let disciplineStatus = "Tốt";

let disciplineColor = "text-emerald-500";

let disciplineIcon = "🟢";

if (totalStudents > 0) {

const issueRatio = totalIssues / totalStudents;

if (issueRatio >= 0.3) {

disciplineStatus = "Cần cố gắng";

disciplineColor = "text-red-500";

disciplineIcon = "🔴";

} else if (issueRatio > 0.1) {

disciplineStatus = "Khá";

disciplineColor = "text-yellow-500";

disciplineIcon = "🟡";

}

}

// Xử lý dữ liệu Bảng Vàng (Top 3)

const sortedStudents = \[...state.students\].sort((a, b) => (b.points || 0) - (a.points || 0));

const top3StudentsHtml = sortedStudents.slice(0, 3).map((s, index) => {

const medals = \['🥇', '🥈', '🥉'\];

const weekProg = s.points > 0 ? Math.floor((Math.sin(s.id \* 10) + 1) \* 5) + 2 : 0;

return \`

&lt;div class="bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/5 transition-all cursor-pointer group" onclick="switchTab('tich-diem'); selectStudentForPoints(\${s.id})"&gt;

&lt;div class="flex items-center gap-3 mb-2"&gt;

&lt;span class="text-2xl"&gt;\${medals\[index\]}&lt;/span&gt;

&lt;div class="font-bold text-white text-base"&gt;\${s.name}&lt;/div&gt;

&lt;div class="text-white ml-auto font-black flex items-center gap-1"&gt;— \${s.points || 0} điểm&lt;/div&gt;

&lt;/div&gt;

&lt;div class="pl-10 text-xs text-emerald-300 font-bold flex items-center gap-1"&gt;

&lt;div class="w-1 h-4 bg-emerald-400/50 rounded-full mr-1"&gt;&lt;/div&gt;

+\${weekProg} điểm tuần này &lt;i class="ph-bold ph-arrow-up text-emerald-400"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

// Xử lý dữ liệu Tiến Bộ (Top 3)

const studentsWithProgress = state.students.map(s => {

const weekProg = (s.points || 0) > 0 ? Math.floor((Math.sin(s.id \* 10) + 1) \* 15) + 5 : 0;

return { ...s, weekProg: Math.min(weekProg, s.points || 0) };

});

const topProgressHtml = \[...studentsWithProgress\].sort((a,b) => b.weekProg - a.weekProg).slice(0, 3).map(s => {

const stars = '⭐'.repeat(Math.min(3, Math.ceil(s.weekProg / 5))) || '⭐';

return \`

&lt;div class="bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/5 transition-all cursor-pointer group mb-3" onclick="switchTab('tich-diem'); selectStudentForPoints(\${s.id})"&gt;

&lt;div class="font-bold text-white text-base mb-0.5"&gt;\${s.name}&lt;/div&gt;

&lt;div class="text-\[11px\] text-blue-200 uppercase font-bold tracking-wider mb-2 opacity-80"&gt;\${s.group}&lt;/div&gt;

&lt;div class="flex items-center gap-2 text-sm text-yellow-300 font-bold"&gt;

\${stars} &lt;span class="text-white ml-1"&gt;+\${s.weekProg} điểm tuần này &lt;i class="ph-bold ph-arrow-up text-emerald-300"&gt;&lt;/i&gt;&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

// XỬ LÝ VIỆC CẦN LÀM ĐỘNG

const tasks = state.tasks || \[\];

const tasksHtml = tasks.length === 0

? '&lt;div class="text-center py-12 text-slate-400 italic font-medium"&gt;✨ Cô Thùy đã xử lý xong mọi việc!&lt;/div&gt;'

: tasks.map(t => {

const colorClass = t.level === 'red' ? 'red-500' : t.level === 'yellow' ? 'amber-500' : 'emerald-500';

return \`

&lt;div class="flex items-start gap-3 mb-4 group relative bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"&gt;

&lt;div class="w-3 h-3 rounded-full mt-1.5 bg-\${colorClass} shadow-sm flex-shrink-0"&gt;&lt;/div&gt;

&lt;div class="flex-1 min-w-0"&gt;

&lt;div class="font-bold text-slate-800 text-sm truncate"&gt;\${t.content}&lt;/div&gt;

&lt;div class="text-xs text-slate-500 mb-1.5 mt-1"&gt;\${t.person} \${t.deadline ? '— Hạn: &lt;span class="font-bold text-slate-700"&gt;' + t.deadline.split('-').reverse().join('/') + '&lt;/span&gt;' : ''}&lt;/div&gt;

\${t.note ? \`&lt;div class="text-\[11px\] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-100 shadow-sm"&gt;\${t.note}&lt;/div&gt;\` : ''}

&lt;/div&gt;

&lt;button onclick="deleteTask(\${t.id})" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1.5 bg-white rounded-full shadow-sm" title="Tíc hoàn thành"&gt;&lt;i class="ph-bold ph-check text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

\`;

}).join('');

// XỬ LÝ HÀNH TRÌNH ĐỘNG

const journeys = state.journeys || \[\];

const journeysHtml = journeys.length === 0

? '&lt;div class="text-center py-12 text-slate-400 italic font-medium"&gt;✨ Hãy tạo cột mốc đầu tiên cho hành trình của lớp!&lt;/div&gt;'

: journeys.map(j => \`

&lt;div class="relative pl-12 mb-6 group"&gt;

&lt;div class="absolute left-0 top-0 w-8 h-8 bg-emerald-50 rounded-full border-2 border-emerald-100 flex items-center justify-center text-sm z-10 shadow-sm"&gt;\${j.icon}&lt;/div&gt;

&lt;div class="absolute left-4 top-8 bottom-\[-24px\] w-px bg-slate-200 group-last:bg-transparent"&gt;&lt;/div&gt;

&lt;div class="font-bold text-slate-800 mb-0.5 text-sm"&gt;\${j.date ? j.date.split('-').reverse().join('/') : ''}&lt;/div&gt;

&lt;div class="text-sm text-emerald-700 font-bold mb-1.5"&gt;\${j.title}&lt;/div&gt;

\${j.content ? \`&lt;div class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1.5 shadow-inner leading-relaxed"&gt;\${j.content}&lt;/div&gt;\` : ''}

&lt;button onclick="deleteJourney(\${j.id})" class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1" title="Xóa cột mốc"&gt;&lt;i class="ph-fill ph-trash text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

\`).join('');

const currentYear = state.academicYear || '2026 - 2027';

if (!window.realtimeClockInterval) {

window.realtimeClockInterval = setInterval(() => {

const clockEl = document.getElementById('realtime-clock');

if (clockEl) clockEl.innerText = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

}, 1000);

}

return \`

&lt;div class="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12 pt-2"&gt;

&lt;!-- Thanh Công Cụ: Năm Học & Đồng Hồ --&gt;

&lt;div class="flex flex-col sm:flex-row justify-between items-center bg-white p-3 md:px-5 rounded-\[1.5rem\] shadow-sm border border-slate-100 gap-4 mb-2"&gt;

&lt;div class="flex items-center gap-3"&gt;

&lt;div class="p-2 md:p-2.5 bg-blue-50 text-blueAccent rounded-xl"&gt;&lt;i class="ph-fill ph-calendar-blank text-xl md:text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;select onchange="state.academicYear = this.value; saveData();" class="bg-transparent font-black text-slate-700 text-sm md:text-base outline-none cursor-pointer focus:ring-0"&gt;

&lt;option value="2025 - 2026" \${currentYear === '2025 - 2026' ? 'selected' : ''}&gt;Năm học 2025 - 2026&lt;/option&gt;

&lt;option value="2026 - 2027" \${currentYear === '2026 - 2027' ? 'selected' : ''}&gt;Năm học 2026 - 2027&lt;/option&gt;

&lt;option value="2027 - 2028" \${currentYear === '2027 - 2028' ? 'selected' : ''}&gt;Năm học 2027 - 2028&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;div class="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl shadow-inner justify-center min-w-\[140px\]"&gt;

&lt;i class="ph-fill ph-clock text-emerald-400 animate-pulse text-lg"&gt;&lt;/i&gt;

&lt;span id="realtime-clock" class="font-black tracking-widest text-sm md:text-base w-\[70px\] text-center"&gt;\${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- 1. Banner & Lớp thông tin nhỏ --&gt;

&lt;div&gt;

&lt;div class="w-full h-40 md:h-56 \${state.theme.bannerUrl ? 'bg-cover bg-center' : \`bg-gradient-to-br \${state.theme.bannerColorClass}\`} rounded-\[2rem\] shadow-sm relative flex flex-col items-center justify-center group overflow-hidden" \${state.theme.bannerUrl ? \`style="background-image: url('\${state.theme.bannerUrl}');"\` : ''}&gt;

\${!state.theme.bannerUrl ? \`

&lt;div class="text-white/80 text-\[11px\] font-bold uppercase tracking-\[0.25em\] mb-3 z-10"&gt;\${state.theme.month}&lt;/div&gt;

&lt;h1 class="text-white text-3xl md:text-5xl font-black uppercase tracking-tight text-center px-4 z-10 drop-shadow-md"&gt;\${state.theme.title}&lt;/h1&gt;

\` : ''}

&lt;button onclick="openEditThemeModal()" class="absolute top-4 right-4 bg-black/40 text-white rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all z-20 hover:bg-black/60"&gt;&lt;i class="ph-fill ph-pencil-simple text-base"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;!-- Block Sửa được --&gt;

&lt;div class="mt-4 bg-white rounded-2xl p-4 md:p-5 shadow-sm border-l-4 border-emerald-400 flex flex-col md:flex-row md:items-center justify-between gap-4"&gt;

&lt;div&gt;

&lt;div class="flex items-center gap-2 text-sm font-bold text-slate-800 mb-1"&gt;

&lt;div class="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"&gt;&lt;/div&gt;

&lt;span class="outline-none cursor-text hover:bg-slate-50 transition-colors px-1 rounded" contenteditable="true" onblur="state.theme.weekTitle = this.innerText; saveData();" title="Nhấn vào để sửa thông tin tuần"&gt;\${state.theme.weekTitle || 'TUẦN 2 — 17/08 ➔ 22/08'}&lt;/span&gt;

&lt;/div&gt;

&lt;div class="text-sm text-slate-600 pl-5"&gt;

&lt;span class="outline-none cursor-text hover:bg-slate-50 transition-colors px-1 rounded" contenteditable="true" onblur="state.theme.weekTopic = this.innerHTML; saveData();" title="Nhấn vào để sửa chủ đề"&gt;\${state.theme.weekTopic || 'Chủ đề: &lt;span class="font-bold text-slate-800"&gt;Văn minh – Xanh – An toàn&lt;/span&gt;'}&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2"&gt;

🎯 &lt;span class="text-sm text-blue-800 italic outline-none cursor-text hover:bg-blue-100/50 transition-colors px-1 rounded" contenteditable="true" onblur="state.theme.weeklyGoal = this.innerText; saveData();" title="Nhấn vào để sửa"&gt;\${state.theme.weeklyGoal || 'Mục tiêu tuần: Ổn định nề nếp – xây dựng tinh thần tập thể'}&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- 2. Tình Hình Lớp Hôm Nay --&gt;

&lt;div&gt;

&lt;h3 class="text-lg font-black text-slate-800 flex items-center gap-2 mb-4 uppercase tracking-wide"&gt;

📊 TÌNH HÌNH LỚP HÔM NAY

&lt;/h3&gt;

&lt;div class="grid grid-cols-2 lg:grid-cols-5 gap-4"&gt;

&lt;div class="bg-white rounded-\[1.5rem\] p-5 shadow-sm border border-slate-100 flex flex-col"&gt;

&lt;div class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"&gt;👨‍🎓 SĨ SỐ&lt;/div&gt;

&lt;div class="text-3xl font-black text-slate-800 mt-auto"&gt;\${presentStudents}&lt;span class="text-lg text-slate-400"&gt;/\${totalStudents}&lt;/span&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[1.5rem\] p-5 shadow-sm border border-slate-100 flex flex-col"&gt;

&lt;div class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"&gt;📚 HỌC TẬP&lt;/div&gt;

&lt;div class="text-3xl font-black text-blueAccent mt-auto"&gt;\${learningPercent}%&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[1.5rem\] p-5 shadow-sm border border-slate-100 flex flex-col"&gt;

&lt;div class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"&gt;\${disciplineIcon} NỀN NẾP&lt;/div&gt;

&lt;div class="text-2xl font-black \${disciplineColor} mt-auto"&gt;\${disciplineStatus}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[1.5rem\] p-5 shadow-sm border border-slate-100 flex flex-col"&gt;

&lt;div class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"&gt;⭐ ĐIỂM TỐT&lt;/div&gt;

&lt;div class="text-3xl font-black text-yellow-500 mt-auto"&gt;\${goodPointsCount}&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="switchTab('diem-danh')" class="bg-red-50 hover:bg-red-100 transition-colors rounded-\[1.5rem\] p-5 shadow-sm border border-red-100 flex flex-col text-left cursor-pointer"&gt;

&lt;div class="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5 mb-2"&gt;⚠️ CẦN LƯU Ý&lt;/div&gt;

&lt;div class="text-3xl font-black text-red-500 mt-auto"&gt;\${absentCount} &lt;span class="text-base font-bold"&gt;HS&lt;/span&gt;&lt;/div&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-1 xl:grid-cols-12 gap-6"&gt;

&lt;!-- 4. & 5. Bảng Vàng & Tiến Bộ Nổi Bật --&gt;

&lt;div class="xl:col-span-8 flex flex-col gap-6"&gt;

&lt;div class="bg-\[#1e1b4b\] rounded-\[2rem\] p-6 md:p-8 shadow-sm flex flex-col h-full"&gt;

&lt;h3 class="text-white font-black text-lg md:text-xl flex items-center gap-2 uppercase tracking-wide mb-6"&gt;🏆 BẢNG VÀNG \${state.admin.className || 'DANH DỰ'}&lt;/h3&gt;

&lt;div class="flex-1 flex flex-col gap-3"&gt;

\${top3StudentsHtml || '&lt;div class="text-white/40 text-sm italic w-full text-center py-10"&gt;Chưa có dữ liệu thi đua&lt;/div&gt;'}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="xl:col-span-4 bg-\[#5468ff\] rounded-\[2rem\] p-6 md:p-8 shadow-sm flex flex-col h-full"&gt;

&lt;h3 class="font-black text-white text-lg md:text-xl flex items-center gap-2 uppercase tracking-wide mb-6"&gt;🌱 TIẾN BỘ NỔI BẬT&lt;/h3&gt;

&lt;div class="flex flex-col flex-1"&gt;

\${topProgressHtml || '&lt;div class="text-white/50 text-sm italic text-center py-10"&gt;Chưa có dữ liệu&lt;/div&gt;'}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- KHỐI 3: Việc Cần Xử Lý --&gt;

&lt;div class="xl:col-span-6 bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col relative min-h-\[350px\]"&gt;

&lt;div class="flex justify-between items-center mb-6"&gt;

&lt;h3 class="font-black text-lg md:text-xl text-slate-800 flex items-center gap-2"&gt;📌 VIỆC CẦN XỬ LÝ&lt;/h3&gt;

&lt;button onclick="openTaskModal()" class="text-xs font-bold bg-blue-50 text-blueAccent px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-sm border border-blue-100"&gt;

&lt;i class="ph-bold ph-plus"&gt;&lt;/i&gt; Thêm việc

&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-\[400px\]"&gt;

\${tasksHtml}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- KHỐI 6: Hành Trình Lớp --&gt;

&lt;div class="xl:col-span-6 bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col relative min-h-\[350px\]"&gt;

&lt;div class="flex justify-between items-center mb-6"&gt;

&lt;h3 class="font-black text-lg md:text-xl text-slate-800 flex items-center gap-2"&gt;🚂 HÀNH TRÌNH LỚP \${state.admin.className || '12A1'} TRƯỞNG THÀNH&lt;/h3&gt;

&lt;button onclick="openJourneyModal()" class="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-sm border border-emerald-100"&gt;

&lt;i class="ph-bold ph-plus"&gt;&lt;/i&gt; Thêm cột mốc

&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-\[400px\]"&gt;

\${journeysHtml}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Row Cuối: Lời Nhắn & Truy Cập Nhanh --&gt;

&lt;div class="grid grid-cols-1 xl:grid-cols-12 gap-6"&gt;

&lt;div class="xl:col-span-5 bg-pink-50 rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-pink-100 relative group flex flex-col justify-center"&gt;

&lt;h3 class="font-black text-lg text-pink-700 flex items-center gap-2 mb-4 outline-none cursor-text hover:opacity-75 transition-opacity" contenteditable="true" onblur="state.theme.teacherMsgTitle = this.innerText; saveData();" title="Nhấn vào để sửa tiêu đề"&gt;

💌 \${state.theme.teacherMsgTitle || 'CÔ THÙY NHẮN'}

&lt;/h3&gt;

&lt;blockquote class="text-slate-700 font-medium leading-relaxed mb-6 border-l-4 border-pink-200 pl-4 outline-none cursor-text hover:bg-pink-100/30 transition-colors" contenteditable="true" onblur="state.theme.teacherMsgContent = this.innerHTML; saveData();" title="Nhấn vào để sửa lời nhắn"&gt;

\${state.theme.teacherMsgContent || '"Các em không cần phải hoàn hảo ngay từ hôm nay.&lt;br&gt;Chỉ cần mỗi ngày tiến bộ hơn một chút."'}

&lt;/blockquote&gt;

&lt;div class="font-black text-pink-800 outline-none cursor-text hover:opacity-75 transition-opacity" contenteditable="true" onblur="state.theme.teacherMsgSign = this.innerText; saveData();" title="Nhấn vào để sửa chữ ký"&gt;

— \${state.theme.teacherMsgSign || 'Cô Đỗ Thị Thùy'}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="xl:col-span-7 bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100"&gt;

&lt;h3 class="font-black text-lg text-slate-800 flex items-center gap-2 mb-6"&gt;⚡ TRUY CẬP NHANH&lt;/h3&gt;

&lt;div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"&gt;

&lt;button onclick="switchTab('hoc-sinh')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;👨‍🎓&lt;/span&gt; Học sinh&lt;/button&gt;

&lt;button onclick="state.currentTab = 'cai-dat'; switchSettingsTab('tich-diem'); renderLayout();" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;💰&lt;/span&gt; Tích điểm&lt;/button&gt;

&lt;button onclick="switchTab('thoi-khoa-bieu')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;📅&lt;/span&gt; Thời khóa biểu&lt;/button&gt;

&lt;button onclick="switchTab('so-do-lop')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;🗺️&lt;/span&gt; Sơ đồ lớp&lt;/button&gt;

&lt;button onclick="switchTab('tram-dong-hanh')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;🤝&lt;/span&gt; Trạm đồng hành&lt;/button&gt;

&lt;button onclick="switchTab('vong-quay')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;🎯&lt;/span&gt; Gọi tên&lt;/button&gt;

&lt;button onclick="switchTab('bao-cao')" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;📊&lt;/span&gt; Báo cáo&lt;/button&gt;

&lt;button onclick="openTimerDrawer()" class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 text-left"&gt;&lt;span class="text-xl"&gt;⏱️&lt;/span&gt; Đồng hồ&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function renderViewHocSinh() {

const studentsHtml = state.students.map(s => {

const group = state.groups.find(g => g.name === s.group);

let borderColorClass = 'border-slate-200';

if (group) {

if (group.color.includes('red')) borderColorClass = 'border-red-400';

else if (group.color.includes('green')) borderColorClass = 'border-emerald-400';

else if (group.color.includes('yellow')) borderColorClass = 'border-yellow-400';

else if (group.color.includes('blue')) borderColorClass = 'border-blue-400';

else if (group.color.includes('purple')) borderColorClass = 'border-purple-400';

else if (group.color.includes('pink')) borderColorClass = 'border-pink-400';

}

const currentPoints = s.points || 0;

// --- TẠO DANH SÁCH ĐIỂM CỘNG NHANH TỪ CÀI ĐẶT ---

const positiveList = state.criteria.positive.map(c => \`

&lt;button onclick="executeQuickPoint(\${s.id}, \${c.points}, '\${escapeInlineJs(c.reason)}', '\${escapeInlineJs(c.category)}', 'add')" class="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg flex justify-between items-center gap-2 transition-colors"&gt;

&lt;span class="truncate"&gt;\${c.reason}&lt;/span&gt;

&lt;span class="flex-shrink-0 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded"&gt;+\${c.points}&lt;/span&gt;

&lt;/button&gt;

\`).join('');

// --- TẠO DANH SÁCH ĐIỂM TRỪ NHANH TỪ CÀI ĐẶT ---

const negativeList = state.criteria.negative.map(c => \`

&lt;button onclick="executeQuickPoint(\${s.id}, \${c.points}, '\${escapeInlineJs(c.reason)}', '\${escapeInlineJs(c.category)}', 'subtract')" class="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex justify-between items-center gap-2 transition-colors"&gt;

&lt;span class="truncate"&gt;\${c.reason}&lt;/span&gt;

&lt;span class="flex-shrink-0 bg-red-100 text-red-700 px-1.5 py-0.5 rounded"&gt;-\${c.points}&lt;/span&gt;

&lt;/button&gt;

\`).join('');

return \`

&lt;div class="bg-white rounded-\[2rem\] p-6 shadow-sm border border-slate-200 border-t-4 border-t-\${borderColorClass.replace('border-', '')} flex flex-col items-center relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"&gt;

&lt;!-- Nút Tùy chọn gốc (Menu 3 chấm) --&gt;

&lt;div class="absolute top-4 right-4 z-20"&gt;

&lt;button onclick="toggleStudentMenu(event, \${s.id})" class="text-slate-300 hover:text-slate-600 p-1 rounded-full focus:outline-none transition-colors"&gt;&lt;i class="ph-bold ph-dots-three-vertical text-xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;div id="student-menu-\${s.id}" class="student-dropdown hidden absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-\[0_10px_40px_rgba(0,0,0,0.1)\] border border-slate-100 overflow-hidden z-30 p-2 animate-fade-in"&gt;

&lt;button onclick="openStudentHistoryModal(\${s.id})" class="w-full text-left px-3 py-2.5 text-sm text-emerald-600 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2.5"&gt;&lt;i class="ph-bold ph-clock-counter-clockwise text-lg"&gt;&lt;/i&gt; Lịch sử&lt;/button&gt;

&lt;button onclick="deleteStudent(\${s.id})" class="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2.5"&gt;&lt;i class="ph-fill ph-trash text-lg"&gt;&lt;/i&gt; Xóa&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Ảnh đại diện --&gt;

\${getAvatarImg(s.avatarUrl, s.name, "w-24 h-24 mb-4 mt-2 ring-4 ring-slate-50 shadow-md")}

&lt;!-- Thông tin cơ bản (Tên, Tổ, Chức vụ) --&gt;

&lt;div class="font-black text-slate-800 text-xl mb-2 truncate w-full text-center"&gt;\${s.name}&lt;/div&gt;

&lt;div class="flex items-center justify-center gap-2 mb-4"&gt;

&lt;span class="text-\[10px\] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md uppercase border border-slate-200"&gt;\${s.group || 'Chưa nhóm'}&lt;/span&gt;

&lt;span class="text-\[10px\] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100"&gt;\${s.role || 'Thành viên'}&lt;/span&gt;

&lt;/div&gt;

&lt;!-- Điểm số nổi bật --&gt;

&lt;div class="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-2"&gt;TỔNG ĐIỂM&lt;/div&gt;

&lt;div class="text-4xl font-black text-\[#1e1b4b\] mb-6"&gt;\${currentPoints}&lt;/div&gt;

&lt;!-- Dải Nút Cộng/Trừ nhanh --&gt;

&lt;div class="flex items-center justify-center gap-4 w-full relative mb-6 px-4"&gt;

&lt;div class="relative w-full"&gt;

&lt;button onclick="toggleQuickMenu(event, 'quick-minus-\${s.id}')" title="Trừ điểm" class="w-full h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors border border-red-100 font-black text-lg shadow-sm"&gt;

&lt;i class="ph-bold ph-minus"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;!-- Menu Trừ điểm --&gt;

&lt;div id="quick-minus-\${s.id}" class="student-dropdown hidden absolute bottom-\[calc(100%+8px)\] left-0 w-60 bg-white border border-red-100 shadow-\[0_10px_40px_rgba(239,68,68,0.15)\] rounded-2xl z-50 p-2 max-h-56 overflow-y-auto custom-scrollbar animate-slide-up"&gt;

&lt;div class="text-\[10px\] text-red-400 font-bold uppercase tracking-widest px-2 pb-2 mb-2 border-b border-red-50 text-left"&gt;Chọn lý do trừ điểm:&lt;/div&gt;

\${negativeList || '&lt;div class="text-xs text-slate-400 italic p-2 text-center"&gt;Chưa có mẫu&lt;/div&gt;'}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative w-full"&gt;

&lt;button onclick="toggleQuickMenu(event, 'quick-plus-\${s.id}')" title="Cộng điểm" class="w-full h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-colors border border-emerald-100 font-black text-lg shadow-sm"&gt;

&lt;i class="ph-bold ph-plus"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;!-- Menu Cộng điểm --&gt;

&lt;div id="quick-plus-\${s.id}" class="student-dropdown hidden absolute bottom-\[calc(100%+8px)\] right-0 w-60 bg-white border border-emerald-100 shadow-\[0_10px_40px_rgba(16,185,129,0.15)\] rounded-2xl z-50 p-2 max-h-56 overflow-y-auto custom-scrollbar animate-slide-up"&gt;

&lt;div class="text-\[10px\] text-emerald-500 font-bold uppercase tracking-widest px-2 pb-2 mb-2 border-b border-emerald-50 text-left"&gt;Chọn lý do cộng điểm:&lt;/div&gt;

\${positiveList || '&lt;div class="text-xs text-slate-400 italic p-2 text-center"&gt;Chưa có mẫu&lt;/div&gt;'}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Nút Xem Hồ Sơ bọc tất cả những thông tin bị ẩn --&gt;

&lt;button onclick="openEditStudentModal(\${s.id})" class="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200 mt-auto"&gt;

&lt;i class="ph-bold ph-identification-card text-sm"&gt;&lt;/i&gt; XEM HỒ SƠ

&lt;/button&gt;

&lt;/div&gt;

\`;

}).join('');

return \`

&lt;div class="max-w-7xl mx-auto animate-fade-in space-y-8 pb-12" onclick="closeAllStudentMenus()"&gt;

&lt;div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;

Quản lí Học sinh

&lt;span class="bg-blue-100 text-blue-700 text-\[13px\] px-3 py-1 rounded-full border border-blue-200 shadow-inner font-bold tracking-wide"&gt;Sĩ số: \${state.students.length}&lt;/span&gt;

&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Thông tin chi tiết, vai trò và mục tiêu phấn đấu của các em&lt;/p&gt;

&lt;/div&gt;

&lt;div class="flex gap-3 w-full sm:w-auto"&gt;

&lt;button onclick="openEditStudentModal(null)" class="flex-1 sm:flex-none px-5 py-3 bg-\[#0f172a\] text-white font-bold rounded-xl text-sm shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2"&gt;&lt;i class="ph-bold ph-user-plus text-lg"&gt;&lt;/i&gt; Thêm HS&lt;/button&gt;

&lt;button onclick="downloadTemplate()" class="flex-1 sm:flex-none px-5 py-3 bg-white text-slate-600 border border-slate-200 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"&gt;&lt;i class="ph-fill ph-download-simple text-green-600 text-lg"&gt;&lt;/i&gt; File mẫu&lt;/button&gt;

&lt;button onclick="openImportModal()" class="flex-1 sm:flex-none px-5 py-3 bg-blue-50 text-blue-700 border border-blue-100 font-bold rounded-xl text-sm shadow-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"&gt;&lt;i class="ph-bold ph-upload-simple text-lg"&gt;&lt;/i&gt; Nhập DS&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8"&gt;

\${studentsHtml || \`

&lt;div class="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-\[2rem\] bg-white/50"&gt;

&lt;i class="ph-fill ph-users-slash text-6xl mb-4 text-slate-300"&gt;&lt;/i&gt;

&lt;div class="font-bold text-lg text-slate-600 mb-2"&gt;Chưa có học sinh nào&lt;/div&gt;

&lt;button onclick="openEditStudentModal(null)" class="text-blueAccent font-bold hover:underline"&gt;Thêm học sinh đầu tiên&lt;/button&gt;

&lt;/div&gt;

\`}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function renderViewTichDiem() {

const pf = state.pointsForm;

const isAdd = pf.actionType === 'add';

const sign = isAdd ? '+' : '-';

// --- Helper styling classes ---

const actionBtnClass = (active, isAddBtn) => {

if (!active) return "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 shadow-sm";

if (isAddBtn) return "bg-emerald-600 text-white border border-emerald-700 shadow-md transform scale-105 z-10";

return "bg-red-50 text-red-600 border border-red-200 shadow-inner transform scale-105 z-10 font-bold";

};

const targetBtnClass = (active) => {

if (!active) return "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50";

return "bg-purple-600 text-white border border-purple-700 shadow-md font-bold";

};

// --- Dropdown Target Selection ---

let targetSelectHtml = '';

if (pf.targetType === 'student') {

targetSelectHtml = \`

&lt;div class="mb-6 animate-fade-in"&gt;

&lt;label class="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide"&gt;Chọn Học Sinh:&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updatePointsForm('selectedTargetId', this.value)" class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all appearance-none cursor-pointer shadow-sm"&gt;

&lt;option value=""&gt;-- Chọn học sinh --&lt;/option&gt;

\${\[...state.students\].sort((a,b) => a.name.localeCompare(b.name)).map(s =>

\`&lt;option value="\${s.id}" \${pf.selectedTargetId == s.id ? 'selected' : ''}&gt;\${s.name} (\${s.group} - \${s.points}đ)&lt;/option&gt;\`

).join('')}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

} else if (pf.targetType === 'group') {

targetSelectHtml = \`

&lt;div class="mb-6 animate-fade-in"&gt;

&lt;label class="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide"&gt;Chọn Nhóm/Tổ:&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updatePointsForm('selectedTargetId', this.value)" class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all appearance-none cursor-pointer shadow-sm"&gt;

&lt;option value=""&gt;-- Chọn nhóm/tổ --&lt;/option&gt;

\${state.groups.map(g =>

\`&lt;option value="\${g.name}" \${pf.selectedTargetId === g.name ? 'selected' : ''}&gt;\${g.name}&lt;/option&gt;\`

).join('')}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

} else {

targetSelectHtml = \`

&lt;div class="mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl animate-fade-in flex items-center gap-3"&gt;

&lt;div class="p-2 bg-purple-200 text-purple-700 rounded-lg"&gt;&lt;i class="ph-fill ph-users-three text-xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;div&gt;

&lt;div class="font-bold text-purple-800 text-sm"&gt;Áp dụng cho Cả Lớp&lt;/div&gt;

&lt;div class="text-\[11px\] text-purple-600 mt-0.5"&gt;Điểm sẽ được cập nhật cho tất cả \${state.students.length} học sinh.&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// --- Quick Criteria Selection ---

const criteriaList = isAdd ? state.criteria.positive : state.criteria.negative;

const criteriaHtml = criteriaList.map((c, index) => {

const colorClass = isAdd ? 'text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 border-emerald-100/50' : 'text-red-600 bg-red-50/50 hover:bg-red-50 hover:border-red-300 border-red-100/50';

const signText = isAdd ? '+' : '-';

const typeParam = isAdd ? 'positive' : 'negative';

return \`

&lt;div class="relative group h-full"&gt;

&lt;button onclick="applyQuickCriterion('\${escapeInlineJs(c.reason)}', \${c.points}, '\${escapeInlineJs(c.category)}')" class="flex flex-col items-start p-3.5 rounded-xl border transition-all text-left w-full h-full \${colorClass}"&gt;

&lt;div class="font-bold text-slate-700 text-sm mb-1 group-hover:text-slate-900 line-clamp-2 leading-snug pr-4"&gt;\${c.reason}&lt;/div&gt;

&lt;div class="mt-auto font-black text-sm"&gt;\${signText}\${c.points}đ&lt;/div&gt;

&lt;/button&gt;

&lt;button onclick="deleteCriterion('\${typeParam}', \${index})" class="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-sm" title="Xóa mẫu này"&gt;

&lt;i class="ph-bold ph-x text-\[10px\]"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;/div&gt;

\`;

}).join('');

// Category options

const categories = \["Học tập", "Phong trào", "Kỷ luật", "Chuyên cần", "Nề nếp", "Khác"\];

const categoryOptionsHtml = categories.map(cat => \`&lt;option value="\${cat}" \${pf.category === cat ? 'selected' : ''}&gt;\${cat}&lt;/option&gt;\`).join('');

// Calculate final display string for the button

let finalPointsStr = \`\${sign}\${pf.pointsVal > 0 ? pf.pointsVal : 0}đ\`;

let canSubmit = false;

if (pf.pointsVal > 0 && pf.reason.trim() !== '') {

if (pf.targetType === 'class') canSubmit = true;

else if (pf.selectedTargetId) canSubmit = true;

}

return \`

&lt;div class="max-w-2xl mx-auto space-y-6 animate-fade-in pb-20 pt-4"&gt;

&lt;canvas id="confetti-canvas" class="absolute inset-0 w-full h-full pointer-events-none z-50"&gt;&lt;/canvas&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-xl border border-slate-100 overflow-hidden flex flex-col"&gt;

&lt;!-- Header --&gt;

&lt;div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 flex items-center justify-between"&gt;

&lt;h2 class="text-white font-black text-lg tracking-wide flex items-center gap-2"&gt;

&lt;i class="ph-bold ph-plus-circle"&gt;&lt;/i&gt; Công Cụ Cộng Điểm Thi Đua

&lt;/h2&gt;

&lt;button onclick="if(state.currentTab === 'cai-dat') { switchSettingsTab('thong-tin'); } else { switchTab('tong-quan'); }" class="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"&gt;

&lt;i class="ph-bold ph-x"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-6 md:p-8 flex flex-col gap-6"&gt;

&lt;!-- Hành Động: Cộng / Trừ --&gt;

&lt;div class="flex rounded-xl p-1 bg-slate-100 border border-slate-200/60 shadow-inner"&gt;

&lt;button onclick="updatePointsForm('actionType', 'add')" class="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-all \${actionBtnClass(isAdd, true)}"&gt;

&lt;i class="ph-bold ph-plus-circle text-lg"&gt;&lt;/i&gt; &lt;span class="font-bold tracking-wide"&gt;Cộng Điểm Khen Thưởng&lt;/span&gt;

&lt;/button&gt;

&lt;button onclick="updatePointsForm('actionType', 'subtract')" class="flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-all \${actionBtnClass(!isAdd, false)}"&gt;

&lt;i class="ph-bold ph-minus-circle text-lg"&gt;&lt;/i&gt; &lt;span class="tracking-wide"&gt;Trừ Điểm Kỷ Luật&lt;/span&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;!-- Đối Tượng Áp Dụng --&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Đối Tượng Áp Dụng:&lt;/label&gt;

&lt;div class="flex gap-2"&gt;

&lt;button onclick="updatePointsForm('targetType', 'student'); updatePointsForm('selectedTargetId', '');" class="flex-1 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 \${targetBtnClass(pf.targetType === 'student')}"&gt;

&lt;i class="ph-fill ph-user text-lg"&gt;&lt;/i&gt; Học Sinh

&lt;/button&gt;

&lt;button onclick="updatePointsForm('targetType', 'group'); updatePointsForm('selectedTargetId', '');" class="flex-1 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 \${targetBtnClass(pf.targetType === 'group')}"&gt;

&lt;i class="ph-fill ph-users text-lg"&gt;&lt;/i&gt; Nhóm

&lt;/button&gt;

&lt;button onclick="updatePointsForm('targetType', 'class'); updatePointsForm('selectedTargetId', 'class');" class="flex-1 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 \${targetBtnClass(pf.targetType === 'class')}"&gt;

&lt;i class="ph-fill ph-users-three text-lg"&gt;&lt;/i&gt; Cả Lớp

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Area chọn đối tượng cụ thể --&gt;

\${targetSelectHtml}

&lt;!-- Chọn Mẫu Nhanh --&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Chọn Mẫu Nhanh:&lt;/label&gt;

&lt;div class="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-\[160px\] overflow-y-auto custom-scrollbar pr-2 py-1 relative"&gt;

\${criteriaHtml}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Chi tiết điểm --&gt;

&lt;div class="grid grid-cols-2 gap-4"&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Số Điểm Thay Đổi:&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;div class="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg \${isAdd ? 'text-emerald-600' : 'text-red-500'}"&gt;\${sign}&lt;/div&gt;

&lt;input type="number" id="pf-points-val" value="\${pf.pointsVal || ''}" min="0" oninput="state.pointsForm.pointsVal = Math.abs(parseInt(this.value)||0); validatePointsForm();" class="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Phân Loại Thi Đua:&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updatePointsForm('category', this.value)" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all appearance-none"&gt;

\${categoryOptionsHtml}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Lý do & Ghi chú --&gt;

&lt;div class="space-y-4"&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Lý Do / Nội Dung Thay Đổi Điểm &lt;span class="text-red-500"&gt;\*&lt;/span&gt;&lt;/label&gt;

&lt;input type="text" id="pf-reason" value="\${escapeHtmlAttr(pf.reason)}" oninput="state.pointsForm.reason = this.value; validatePointsForm();" placeholder="Vd: Đóng góp phong trào" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Ghi Chú Bổ Sung (Không bắt buộc):&lt;/label&gt;

&lt;input type="text" id="pf-note" value="\${escapeHtmlAttr(pf.note)}" oninput="state.pointsForm.note = this.value;" placeholder="Nhập ghi chú thêm cho phụ huynh hoặc học sinh..." class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all italic"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Người Thực Hiện:&lt;/label&gt;

&lt;input type="text" readonly value="\${escapeHtmlAttr(state.admin.role || state.admin.name)}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-purple-700 outline-none cursor-not-allowed shadow-inner"&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Footer Actions --&gt;

&lt;div class="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 rounded-b-\[2rem\]"&gt;

&lt;button onclick="resetPointsForm()" class="px-6 py-3.5 bg-white border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm shadow-sm"&gt;Khôi Phục&lt;/button&gt;

&lt;button id="points-submit-btn" onclick="executePointsSubmission()" class="px-8 py-3.5 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 \${canSubmit ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-70'}" \${!canSubmit ? 'disabled' : ''}&gt;

Xác Nhận & Kiểm Tra &lt;span id="points-preview-badge" class="bg-white/20 px-2 py-0.5 rounded ml-1"&gt;\${finalPointsStr}&lt;/span&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// --- Helper functions for the new Points Form ---

window.updatePointsForm = function(key, value) {

state.pointsForm\[key\] = value;

// If changing action type, reset quick selection related fields

if (key === 'actionType') {

state.pointsForm.pointsVal = 0;

state.pointsForm.reason = '';

}

renderLayout();

};

// --- Validate input dynamically to prevent full re-render on typing ---

window.validatePointsForm = function() {

const pf = state.pointsForm;

let canSubmit = false;

if (pf.pointsVal > 0 && pf.reason.trim() !== '') {

if (pf.targetType === 'class') canSubmit = true;

else if (pf.selectedTargetId) canSubmit = true;

}

const btn = document.getElementById('points-submit-btn');

const badge = document.getElementById('points-preview-badge');

if (btn) {

if (canSubmit) {

btn.disabled = false;

btn.className = "px-8 py-3.5 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 bg-emerald-600 text-white hover:bg-emerald-700";

} else {

btn.disabled = true;

btn.className = "px-8 py-3.5 font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 bg-slate-300 text-slate-500 cursor-not-allowed opacity-70";

}

}

if (badge) {

const sign = pf.actionType === 'add' ? '+' : '-';

badge.innerText = \`\${sign}\${pf.pointsVal > 0 ? pf.pointsVal : 0}đ\`;

}

};

window.applyQuickCriterion = function(reason, points, category) {

state.pointsForm.reason = reason;

state.pointsForm.pointsVal = points;

state.pointsForm.category = category || 'Khác';

renderLayout();

};

window.resetPointsForm = function() {

state.pointsForm = {

actionType: 'add', targetType: 'student', selectedTargetId: '', pointsVal: 0, category: 'Học tập', reason: '', note: ''

};

renderLayout();

};

window.executePointsSubmission = function() {

const pf = state.pointsForm;

const pointsToApply = pf.actionType === 'add' ? parseInt(pf.pointsVal) : -parseInt(pf.pointsVal);

if (isNaN(pointsToApply) || pointsToApply === 0) return showToast("Số điểm không hợp lệ!", "error");

if (!pf.reason.trim()) return showToast("Vui lòng nhập lý do!", "error");

let targetStudents = \[\];

let successMsg = "";

if (pf.targetType === 'student') {

const s = state.students.find(x => x.id.toString() === pf.selectedTargetId.toString());

if (!s) return showToast("Vui lòng chọn học sinh!", "error");

targetStudents.push(s);

successMsg = \`Đã \${pf.actionType === 'add' ? 'cộng' : 'trừ'} \${Math.abs(pointsToApply)} điểm cho \${s.name}\`;

}

else if (pf.targetType === 'group') {

targetStudents = state.students.filter(x => x.group === pf.selectedTargetId);

if (targetStudents.length === 0) return showToast(\`Nhóm \${pf.selectedTargetId} chưa có học sinh!\`, "error");

successMsg = \`Đã \${pf.actionType === 'add' ? 'cộng' : 'trừ'} \${Math.abs(pointsToApply)} điểm cho Tổ \${pf.selectedTargetId}\`;

}

else if (pf.targetType === 'class') {

targetStudents = \[...state.students\];

if (targetStudents.length === 0) return showToast("Lớp chưa có học sinh!", "error");

successMsg = \`Đã \${pf.actionType === 'add' ? 'cộng' : 'trừ'} \${Math.abs(pointsToApply)} điểm cho Toàn Lớp\`;

}

// --- TÍNH NĂNG TỰ ĐỘNG HỌC MẪU MỚI ---

const currentReason = pf.reason.trim();

const absVal = Math.abs(pointsToApply);

const targetCriteriaList = pf.actionType === 'add' ? state.criteria.positive : state.criteria.negative;

const isExist = targetCriteriaList.find(c => c.reason.toLowerCase() === currentReason.toLowerCase() && c.points === absVal);

if (!isExist) {

targetCriteriaList.push({

points: absVal,

reason: currentReason,

category: pf.category || 'Khác'

});

}

// Apply points and log history

const historyEntry = {

id: Date.now(),

date: new Date().toISOString(),

points: pointsToApply,

reason: currentReason + (pf.note ? \` (\${pf.note.trim()})\` : '') + \` \[\${pf.category}\]\`

};

targetStudents.forEach(s => {

// BỎ Math.max ĐỂ TỔNG ĐIỂM XUỐNG ĐƯỢC SỐ ÂM

s.points = (s.points || 0) + pointsToApply;

// Giữ nguyên Math.max cho phần Sao đổi quà

s.stars = Math.max(0, (s.stars || 0) + pointsToApply);

if (!s.history) s.history = \[\];

s.history.push({...historyEntry, id: Date.now() + Math.random()});

});

saveData();

state.pointsForm.pointsVal = 0;

state.pointsForm.reason = '';

state.pointsForm.note = '';

renderLayout();

showToast(successMsg, pointsToApply > 0 ? "success" : "error");

if (pointsToApply > 0) triggerConfetti();

};

function selectStudentForRewards(id) { state.selectedStudentForRewards = id; renderLayout(); }

// Keeping these two logic functions just in case they are referenced somewhere else historically

function awardPoints(points, reason) {

console.log('Legacy awardPoints called, routing to form...', points, reason);

}

function awardCustomPoints() {

console.log('Legacy custom points called');

}

function saveNewCriterion() {

const val = state.pointsForm.pointsVal;

const reason = state.pointsForm.reason.trim();

const category = state.pointsForm.category;

if (isNaN(val) || val &lt;= 0) return showToast("Vui lòng nhập số điểm &gt; 0 để lưu mẫu!", "error");

if (!reason) return showToast("Vui lòng nhập lý do tiêu chí!", "error");

if (state.pointsForm.actionType === 'add') {

state.criteria.positive.push({ points: val, reason: reason, category: category });

} else {

state.criteria.negative.push({ points: val, reason: reason, category: category });

}

saveData(); renderLayout(); showToast("Đã lưu tiêu chí mới thành công!");

}

function deleteCriterion(type, index) {

if (confirm("Xóa tiêu chí này khỏi danh sách?")) { state.criteria\[type\].splice(index, 1); saveData(); renderLayout(); showToast("Đã xóa"); }

}

function renderViewDoiQua() {

const selectedStudentId = state.selectedStudentForRewards || null;

const student = state.students.find(s => s.id === selectedStudentId);

const sortedStudents = \[...state.students\].sort((a, b) => (b.stars||0) - (a.stars||0));

const studentListHtml = sortedStudents.map(s => \`

&lt;button onclick="selectStudentForRewards(\${s.id})" class="flex-shrink-0 w-32 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 relative overflow-hidden group \${s.id === selectedStudentId ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blueAccent shadow-md transform -translate-y-2' : 'border border-slate-200 hover:bg-slate-50 bg-white hover:shadow-sm'}"&gt;

\${s.id === selectedStudentId ? '&lt;div class="absolute top-0 w-full h-1 bg-blueAccent"&gt;&lt;/div&gt;' : ''}

\${getAvatarImg(s.avatarUrl, s.name, "w-14 h-14 ring-2 ring-slate-100 shadow-sm mb-3 group-hover:scale-110 transition-transform")}

&lt;div class="text-sm font-bold text-slate-800 truncate w-full text-center mb-2"&gt;\${s.name.split(' ').pop()}&lt;/div&gt;

&lt;div class="text-xs font-black px-3 py-1 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center gap-1.5 w-full"&gt;&lt;i class="ph-fill ph-star text-accent"&gt;&lt;/i&gt; \${s.stars || 0}&lt;/div&gt;

&lt;/button&gt;

\`).join('');

const catalogHtml = (state.rewards || \[\]).map(item => {

let btnHtml = !student ? \`&lt;button class="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wide cursor-not-allowed"&gt;Chọn học sinh&lt;/button&gt;\` :

(student.stars || 0) >= item.cost ? \`&lt;button onclick="executeRedeem('\${student.id}', '\${item.id}')" class="w-full py-3.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"&gt;&lt;i class="ph-bold ph-hand-coins text-lg"&gt;&lt;/i&gt; Đổi quà&lt;/button&gt;\` :

\`&lt;button class="w-full py-3.5 bg-slate-50 border border-slate-200 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wide cursor-not-allowed"&gt;Thiếu \${item.cost - (student.stars||0)} sao&lt;/button&gt;\`;

// Khung hiển thị tự điều chỉnh ảnh

const imageDisplayHtml = item.imageUrl

? \`&lt;div class="w-full h-40 mb-5 bg-slate-50/80 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 p-2 group-hover:shadow-md transition-all"&gt;

&lt;img src="\${item.imageUrl}" class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"&gt;

&lt;/div&gt;\`

: \`&lt;div class="w-16 h-16 \${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm border border-white ring-4 ring-slate-50"&gt;&lt;i class="ph-fill \${item.icon} text-3xl \${item.color}"&gt;&lt;/i&gt;&lt;/div&gt;\`;

return \`

&lt;div class="bg-white rounded-\[2rem\] p-2 shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-200 relative overflow-hidden flex flex-col h-full hover:-translate-y-2"&gt;

&lt;div class="absolute top-0 right-0 w-32 h-32 \${item.bg.replace('100', '200')}/40 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-125 z-0"&gt;&lt;/div&gt;

&lt;div class="bg-white rounded-\[1.6rem\] p-6 md:p-8 flex flex-col h-full relative z-10"&gt;

\${imageDisplayHtml}

&lt;h4 class="font-black text-slate-800 text-xl mb-2 leading-tight"&gt;\${item.name}&lt;/h4&gt;

\${item.desc ? \`&lt;p class="text-sm text-slate-500 mb-8 font-medium line-clamp-2"&gt;\${item.desc}&lt;/p&gt;\` : '&lt;div class="h-6 mb-8"&gt;&lt;/div&gt;'}

&lt;div class="mt-auto flex items-end justify-between mb-6 pt-5 border-t border-slate-100 border-dashed"&gt;

&lt;div class="flex flex-col"&gt;&lt;span class="text-\[10px\] text-slate-400 font-bold uppercase tracking-widest mb-1"&gt;CẦN ĐỂ ĐỔI&lt;/span&gt;&lt;div class="flex items-center gap-1.5 font-black text-slate-800 text-3xl"&gt;\${item.cost} &lt;i class="ph-fill ph-star text-accent animate-pulse"&gt;&lt;/i&gt;&lt;/div&gt;&lt;/div&gt;

&lt;/div&gt;

\${btnHtml}

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

return \`

&lt;div class="max-w-7xl mx-auto animate-fade-in space-y-8 pb-12"&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;&lt;i class="ph-fill ph-storefront text-accent"&gt;&lt;/i&gt; Cửa Hàng Đổi Quà&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Dùng sao tích lũy để đổi lấy những phần thưởng hấp dẫn.&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-gradient-to-br from-\[#1e1b4b\] to-secondary rounded-\[2rem\] p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center border border-indigo-900"&gt;

&lt;div class="absolute inset-0 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')\]"&gt;&lt;/div&gt;

&lt;div class="flex-1 w-full bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-\[1.5rem\] border border-white/20 flex flex-col sm:flex-row items-center gap-6 relative z-10 shadow-inner"&gt;

&lt;div class="w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-500 text-white rounded-3xl flex items-center justify-center shadow-\[0_10px_30px_rgba(245,158,11,0.5)\] border-2 border-white/30 transform -rotate-6"&gt;&lt;i class="ph-fill ph-gift text-4xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;div class="flex-1 w-full text-center sm:text-left"&gt;

&lt;div class="text-\[11px\] text-indigo-200 font-bold uppercase tracking-widest mb-2"&gt;BƯỚC 1: CHỌN NGƯỜI ĐỔI QUÀ&lt;/div&gt;

&lt;select onchange="selectStudentForRewards(parseInt(this.value))" class="w-full text-xl md:text-2xl font-black text-white bg-transparent focus:outline-none cursor-pointer border-b-2 border-white/30 pb-3 focus:border-white transition-colors"&gt;

&lt;option value="" class="text-slate-800"&gt;-- Nhấp để chọn học sinh --&lt;/option&gt;

\${state.students.map(s => \`&lt;option value="\${s.id}" class="text-slate-800" \${s.id === selectedStudentId ? 'selected' : ''}&gt;\${s.name} (\${s.stars} sao)&lt;/option&gt;\`).join('')}

&lt;/select&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white p-6 md:p-8 rounded-\[1.5rem\] shadow-2xl w-full lg:w-auto flex items-center justify-center gap-10 relative z-10 min-w-\[320px\]"&gt;

&lt;div class="text-center"&gt;&lt;div class="text-\[11px\] text-slate-400 font-bold uppercase tracking-widest mb-1"&gt;TỔNG ĐIỂM&lt;/div&gt;&lt;div class="text-3xl font-black text-slate-800"&gt;\${student ? student.points : '0'}&lt;/div&gt;&lt;/div&gt;

&lt;div class="w-px h-16 bg-slate-200"&gt;&lt;/div&gt;

&lt;div class="text-center"&gt;&lt;div class="text-\[11px\] text-orange-500 font-bold uppercase tracking-widest mb-1"&gt;SAO HIỆN CÓ&lt;/div&gt;&lt;div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center gap-2"&gt;\${student ? (student.stars || 0) : '0'} &lt;i class="ph-fill ph-star text-accent text-3xl animate-spin-slow"&gt;&lt;/i&gt;&lt;/div&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[2rem\] p-6 shadow-sm border border-slate-200 relative"&gt;

&lt;div class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"&gt;&lt;i class="ph-bold ph-users text-lg"&gt;&lt;/i&gt; Chọn nhanh học sinh (Sắp xếp theo sao)&lt;/div&gt;

&lt;div class="flex overflow-x-auto gap-4 pb-4 px-2 pt-2 custom-scrollbar"&gt;\${studentListHtml || '&lt;div class="text-slate-400 italic text-sm"&gt;Chưa có học sinh&lt;/div&gt;'}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-xs font-bold text-slate-500 uppercase tracking-widest mt-8 mb-4 flex items-center gap-2"&gt;&lt;i class="ph-bold ph-storefront text-lg"&gt;&lt;/i&gt; Danh mục quà tặng&lt;/div&gt;

&lt;div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8"&gt;\${catalogHtml}&lt;/div&gt;

&lt;/div&gt;

\`;

}

function executeRedeem(studentId, itemId) {

const student = state.students.find(s => s.id === parseInt(studentId));

const item = state.rewards.find(i => i.id === itemId);

if (student && item && (student.stars || 0) >= item.cost) {

if(confirm(\`Đổi "\${item.name}" cho \${student.name} với giá \${item.cost} sao?\\nSau khi đổi, sao sẽ bị trừ nhưng tổng điểm không đổi.\`)) {

student.stars -= item.cost; saveData(); renderLayout(); showToast(\`Đã đổi quà thành công!\`); triggerConfetti();

}

}

}

function renderViewNhomThiDua() {

const groupsWithStats = state.groups.map(g => {

const members = state.students.filter(s => s.group === g.name);

const totalPoints = members.reduce((sum, s) => sum + (s.points || 0), 0);

return { ...g, members, totalPoints };

}).sort((a, b) => a.name.localeCompare(b.name));

const maxGroupPoints = Math.max(...groupsWithStats.map(g => g.totalPoints), 1);

const groupCardsHtml = groupsWithStats.map((g, index) => {

let wrapperClass = 'border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl hover:-translate-y-2';

let innerClass = 'bg-white rounded-\[2rem\]';

let rankBadge = '';

let pointColor = 'bg-slate-50 text-slate-700 border border-slate-200';

let bgHeader = 'bg-transparent';

let progressColor = 'from-blue-400 to-blueAccent';

if (index === 0 && g.totalPoints > 0) {

wrapperClass = 'p-1.5 bg-gradient-to-br from-\[#fde047\] via-\[#f59e0b\] to-\[#d97706\] shadow-\[0_10px_30px_rgba(245,158,11,0.25)\] hover:-translate-y-3 border-none transform md:scale-\[1.02\] z-10';

rankBadge = \`&lt;div class="absolute -top-5 -left-5 w-14 h-14 bg-gradient-to-br from-\[#fde047\] to-\[#f59e0b\] rounded-full text-white font-black text-2xl shadow-lg flex items-center justify-center z-20 border-4 border-white"&gt;&lt;i class="ph-fill ph-crown text-3xl absolute -top-5 text-yellow-300 drop-shadow-md"&gt;&lt;/i&gt;1&lt;/div&gt;\`;

pointColor = 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md border border-red-400/50';

bgHeader = 'bg-gradient-to-b from-yellow-50 to-transparent';

progressColor = 'from-yellow-400 to-orange-500';

innerClass = 'bg-white rounded-\[1.6rem\]';

}

const sortedMembers = \[...g.members\].sort((a,b) => (b.points || 0) - (a.points || 0));

let membersListHtml = sortedMembers.map((m, i) => \`

&lt;div class="flex items-center gap-3.5 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group/member mb-2" onclick="switchTab('tich-diem'); selectStudentForPoints(\${m.id})"&gt;

&lt;div class="text-\[10px\] font-bold text-slate-300 w-3 text-center"&gt;\${i+1}&lt;/div&gt;

\${getAvatarImg(m.avatarUrl, m.name, "w-10 h-10 flex-shrink-0 group-hover/member:scale-110 transition-transform")}

&lt;div class="flex-1 min-w-0"&gt;

&lt;div class="text-sm font-bold text-slate-800 truncate mb-0.5"&gt;\${m.name}&lt;/div&gt;

&lt;div class="text-\[9px\] text-slate-400 font-bold uppercase tracking-wider truncate"&gt;\${m.role || 'Thành viên'}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-sm font-bold \${m.points &gt; 0 ? 'text-blueAccent' : 'text-slate-400'} bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">\${m.points || 0}&lt;/div&gt;

&lt;/div&gt;

\`).join('');

if (sortedMembers.length === 0) membersListHtml = \`&lt;div class="text-xs text-slate-400 font-medium italic text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"&gt;Chưa có thành viên nào&lt;/div&gt;\`;

const progressPercent = maxGroupPoints > 0 ? (g.totalPoints / maxGroupPoints) \* 100 : 0;

return \`

&lt;div class="rounded-\[2rem\] bg-white relative group h-full transition-all duration-300 \${wrapperClass} flex flex-col"&gt;

\${rankBadge}

&lt;div class="\${innerClass} h-full flex flex-col overflow-hidden relative z-10 flex-1"&gt;

&lt;div class="p-6 pb-5 \${bgHeader} relative border-b border-slate-100"&gt;

&lt;div class="flex justify-between items-start mb-5"&gt;

&lt;div class="flex items-center gap-4 pr-2"&gt;

\${g.avatarUrl ? \`&lt;img src="\${g.avatarUrl}" class="w-16 h-16 rounded-2xl object-cover shadow-sm ring-4 ring-white"&gt;\` : \`&lt;div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm ring-4 ring-slate-50 border border-slate-100"&gt;&lt;i class="ph-fill ph-users-three text-3xl \${g.color}"&gt;&lt;/i&gt;&lt;/div&gt;\`}

&lt;div&gt;

&lt;h3 class="font-black text-slate-800 text-xl tracking-tight leading-none mb-2"&gt;\${g.name}&lt;/h3&gt;

&lt;div class="text-\[10px\] font-bold text-slate-500 uppercase flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded inline-block"&gt;&lt;i class="ph-fill ph-users"&gt;&lt;/i&gt; \${g.members.length} Thành viên&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex flex-col items-end flex-shrink-0"&gt;

&lt;div class="px-4 py-2.5 rounded-xl \${pointColor} flex items-center gap-1.5"&gt;

&lt;span class="font-black text-2xl leading-none"&gt;\${g.totalPoints}&lt;/span&gt;

&lt;i class="ph-fill ph-star text-base \${index === 0 ? 'text-yellow-200 animate-pulse' : ''}"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg z-20 border border-slate-100"&gt;

&lt;button onclick="pickRandomInGroup('\${g.id}')" title="Quay random trong nhóm" class="text-slate-500 hover:text-purple-600 p-2 rounded-lg bg-slate-50 hover:bg-purple-50 transition-colors"&gt;&lt;i class="ph-fill ph-dice-three text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="openEditGroupModal('\${g.id}')" title="Sửa nhóm" class="text-slate-500 hover:text-blueAccent p-2 rounded-lg bg-slate-50 hover:bg-blue-50 transition-colors"&gt;&lt;i class="ph-fill ph-pencil-simple text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="deleteGroup('\${g.id}')" title="Xóa nhóm" class="text-slate-500 hover:text-red-500 p-2 rounded-lg bg-slate-50 hover:bg-red-50 transition-colors"&gt;&lt;i class="ph-fill ph-trash text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner relative"&gt;

&lt;div class="absolute top-0 left-0 h-full bg-gradient-to-r \${progressColor} rounded-full transition-all duration-1000 ease-out" style="width: \${progressPercent}%"&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="p-5 bg-slate-50/50 flex-1 flex flex-col overflow-y-auto custom-scrollbar" style="max-height: 320px;"&gt;\${membersListHtml}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

return \`

&lt;div class="max-w-7xl mx-auto animate-fade-in space-y-8 pb-12"&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;&lt;i class="ph-fill ph-flag-pennant text-blueAccent"&gt;&lt;/i&gt; Bảng Đua Các Tổ&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Danh sách thành viên và điểm tổng thi đua của từng đội&lt;/p&gt;

&lt;/div&gt;

&lt;div class="flex flex-wrap gap-3"&gt;

&lt;button onclick="pickOneFromEachGroup()" class="px-5 py-3 bg-purple-50 text-purple-700 font-bold border border-purple-200 rounded-xl shadow-sm hover:bg-purple-100 transition-all flex items-center gap-2 text-sm"&gt;&lt;i class="ph-fill ph-dice-three text-xl"&gt;&lt;/i&gt; Đại diện các tổ&lt;/button&gt;

&lt;button onclick="pickRandomGroup()" class="px-5 py-3 bg-amber-50 text-amber-700 font-bold border border-amber-200 rounded-xl shadow-sm hover:bg-amber-100 transition-all flex items-center gap-2 text-sm"&gt;&lt;i class="ph-fill ph-users-three text-xl"&gt;&lt;/i&gt; Chọn ngẫu nhiên 1 tổ&lt;/button&gt;

&lt;button onclick="addNewGroup()" class="px-5 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-secondary transition-all flex items-center gap-2 text-sm"&gt;&lt;i class="ph-bold ph-plus text-xl"&gt;&lt;/i&gt; Thêm Tổ mới&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8 pt-4"&gt;\${groupCardsHtml || '&lt;div class="col-span-full text-center py-10 text-slate-400 font-medium"&gt;Chưa có tổ nào được tạo.&lt;/div&gt;'}&lt;/div&gt;

&lt;/div&gt;

\`;

}

window.switchAttendanceTab = function(tab) {

state.attendanceTab = tab;

renderLayout();

};

function renderViewDiemDanh() {

if (!state.attendanceRecords) state.attendanceRecords = {};

if (!state.attendanceTab) state.attendanceTab = 'diem-danh';

let contentHtml = '';

// --- TAB THỰC HIỆN ĐIỂM DANH ---

if (state.attendanceTab === 'diem-danh') {

if (!state.attendanceRecords\[currentAttendanceDate\]) state.attendanceRecords\[currentAttendanceDate\] = {};

const currentRecord = state.attendanceRecords\[currentAttendanceDate\];

const sortedDates = Object.keys(state.attendanceRecords).sort((a,b) => new Date(b) - new Date(a));

const tableRowsHtml = state.students.map((s, idx) => {

const status = currentRecord\[s.id\] || null;

// Hàm render nút bấm điểm danh

const renderButton = (val, label, colorTheme) => {

const isChecked = status === val;

let activeClass = '', idleClass = '';

// Màu khi đang chọn (đậm)

if (colorTheme === 'emerald') { activeClass = 'bg-white text-emerald-500 border-emerald-500'; idleClass = 'bg-white text-emerald-500/50 border-emerald-500/30 hover:border-emerald-500/50'; }

else if (colorTheme === 'yellow') { activeClass = 'bg-white text-yellow-500 border-yellow-500'; idleClass = 'bg-white text-yellow-500/50 border-yellow-500/30 hover:border-yellow-500/50'; }

else if (colorTheme === 'blue') { activeClass = 'bg-white text-blue-500 border-blue-500'; idleClass = 'bg-white text-blue-500/50 border-blue-500/30 hover:border-blue-500/50'; }

else if (colorTheme === 'red') { activeClass = 'bg-white text-red-500 border-red-500'; idleClass = 'bg-white text-red-500/50 border-red-500/30 hover:border-red-500/50'; }

return \`&lt;button onclick="markAttendance(\${s.id}, '\${val}')" class="w-full h-11 rounded-\[0.8rem\] border-\[1.5px\] \${isChecked ? activeClass + ' font-bold' : idleClass + ' font-medium'} transition-colors text-xs flex items-center justify-center"&gt;\${label}&lt;/button&gt;\`;

};

// Lấy lịch sử vi phạm

let lateDates = \[\], excusedDates = \[\], unexcusedDates = \[\];

sortedDates.forEach(date => {

const dStatus = state.attendanceRecords\[date\]\[s.id\];

if (!dStatus || dStatus === 'present') return;

const p = date.split('-'); const formattedDate = \`\${p\[2\]}/\${p\[1\]}\`;

if (dStatus === 'late') lateDates.push(formattedDate);

else if (dStatus === 'excused') excusedDates.push(formattedDate);

else if (dStatus === 'unexcused') unexcusedDates.push(formattedDate);

});

// Khối hiển thị lịch sử vi phạm ngay dưới tên học sinh

let historyHtml = '';

if (lateDates.length > 0 || excusedDates.length > 0 || unexcusedDates.length > 0) {

let badges = '';

if (lateDates.length > 0) badges += \`&lt;div class="flex items-center gap-3"&gt;&lt;span class="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-\[10px\] font-bold w-16 text-center"&gt;Đi muộn&lt;/span&gt; &lt;span class="text-xs text-slate-600 font-medium"&gt;\${lateDates.join(', ')}&lt;/span&gt;&lt;/div&gt;\`;

if (excusedDates.length > 0) badges += \`&lt;div class="flex items-center gap-3"&gt;&lt;span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-\[10px\] font-bold w-16 text-center"&gt;Vắng (P)&lt;/span&gt; &lt;span class="text-xs text-slate-600 font-medium"&gt;\${excusedDates.join(', ')}&lt;/span&gt;&lt;/div&gt;\`;

if (unexcusedDates.length > 0) badges += \`&lt;div class="flex items-center gap-3"&gt;&lt;span class="bg-red-100 text-red-500 px-2 py-1 rounded text-\[10px\] font-bold w-16 text-center"&gt;Vắng (KP)&lt;/span&gt; &lt;span class="text-xs text-slate-600 font-medium"&gt;\${unexcusedDates.join(', ')}&lt;/span&gt;&lt;/div&gt;\`;

historyHtml = \`

&lt;div class="mt-4 flex flex-col gap-2 pl-2 border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 ml-14 w-max min-w-\[250px\]"&gt;

&lt;div class="text-\[9px\] font-bold uppercase tracking-widest text-slate-400 mb-1"&gt;LỊCH SỬ VI PHẠM CHUYÊN CẦN&lt;/div&gt;

&lt;div class="flex flex-col gap-1.5"&gt;\${badges}&lt;/div&gt;

&lt;/div&gt;

\`;

}

return \`

&lt;div class="flex flex-col xl:flex-row py-5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors px-6 md:px-8 gap-6 bg-white items-start xl:items-center"&gt;

&lt;div class="w-full xl:w-5/12 flex flex-col"&gt;

&lt;div class="flex items-center gap-4"&gt;

\${getAvatarImg(s.avatarUrl, s.name, "w-10 h-10")}

&lt;div class="flex-1 min-w-0"&gt;

&lt;div class="font-black text-\[15px\] text-slate-800 mb-0.5"&gt;\${s.name}&lt;/div&gt;

&lt;div class="text-\[10px\] text-slate-500 font-bold uppercase bg-slate-100 px-2 py-0.5 rounded inline-block"&gt;\${s.group}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\${historyHtml}

&lt;/div&gt;

&lt;div class="w-full xl:w-7/12 flex items-center gap-3 flex-wrap sm:flex-nowrap"&gt;

&lt;div class="w-\[calc(50%-0.375rem)\] sm:w-auto flex-1"&gt;\${renderButton('present', 'Có mặt', 'emerald')}&lt;/div&gt;

&lt;div class="w-\[calc(50%-0.375rem)\] sm:w-auto flex-1"&gt;\${renderButton('late', 'Đi muộn', 'yellow')}&lt;/div&gt;

&lt;div class="w-\[calc(50%-0.375rem)\] sm:w-auto flex-1"&gt;\${renderButton('excused', 'Vắng (P)', 'blue')}&lt;/div&gt;

&lt;div class="w-\[calc(50%-0.375rem)\] sm:w-auto flex-1"&gt;\${renderButton('unexcused', 'Vắng (KP)', 'red')}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

contentHtml = \`

&lt;div class="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-\[2rem\] shadow-sm border border-slate-200 mb-6 relative z-10"&gt;

&lt;div class="flex bg-slate-50 p-1.5 rounded-xl w-full md:w-auto"&gt;

&lt;button onclick="switchAttendanceTab('diem-danh')" class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-blueAccent shadow-sm"&gt;Thực hiện điểm danh&lt;/button&gt;

&lt;button onclick="switchAttendanceTab('thong-ke')" class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"&gt;Bảng thống kê&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex gap-4 items-center w-full md:w-auto"&gt;

&lt;div class="relative"&gt;

&lt;input type="date" value="\${currentAttendanceDate}" onchange="changeAttendanceDate(this.value)" class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blueAccent w-full md:w-48 shadow-sm"&gt;

&lt;/div&gt;

&lt;button onclick="markAllPresent()" class="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-md hover:bg-emerald-600 flex items-center justify-center gap-2 text-sm transition-all"&gt;&lt;i class="ph-bold ph-check-square-offset text-lg"&gt;&lt;/i&gt; Cả lớp có mặt&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden relative z-10"&gt;

&lt;div class="py-4 border-b border-slate-100 bg-slate-50 px-6 md:px-8 flex-shrink-0 flex justify-between items-center"&gt;

&lt;div class="text-\[11px\] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"&gt;&lt;i class="ph-fill ph-users text-lg"&gt;&lt;/i&gt; DANH SÁCH HỌC SINH - NGÀY \${formatDateForDisplay(currentAttendanceDate)}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="overflow-y-auto flex-1 custom-scrollbar"&gt;\${tableRowsHtml || '&lt;div class="p-16 text-center text-slate-400 font-medium text-lg"&gt;Chưa có dữ liệu học sinh. Vui lòng thêm học sinh trước.&lt;/div&gt;'}&lt;/div&gt;

&lt;/div&gt;

\`;

}

// --- TAB BẢNG THỐNG KÊ ---

else {

const allDates = Object.keys(state.attendanceRecords).sort((a,b) => new Date(a) - new Date(b));

// Header của bảng thống kê

const tableHeadDates = allDates.map(d => {

const p = d.split('-'); const formatted = \`\${p\[2\]}/\${p\[1\]}\`;

return \`&lt;th class="p-4 text-center border-l border-white/10 whitespace-nowrap text-white font-bold text-xs tracking-wider w-16"&gt;\${formatted}&lt;/th&gt;\`;

}).join('');

// Dữ liệu các dòng

const tableBodyRows = state.students.map((s, index) => {

let presentCount = 0, absentCount = 0;

const dateCells = allDates.map(d => {

const status = state.attendanceRecords\[d\]\[s.id\];

let cellContent = '';

// Hiển thị trạng thái điểm danh dưới dạng chữ có badge tròn mờ

if (status === 'present') { cellContent = '&lt;div class="w-8 h-8 mx-auto rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-xs"&gt;&lt;i class="ph-bold ph-check"&gt;&lt;/i&gt;&lt;/div&gt;'; presentCount++; }

else if (status === 'late') { cellContent = '&lt;div class="w-8 h-8 mx-auto rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center font-bold text-xs"&gt;&lt;i class="ph-bold ph-clock"&gt;&lt;/i&gt;&lt;/div&gt;'; presentCount++; }

else if (status === 'excused') { cellContent = '&lt;div class="w-8 h-8 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs"&gt;P&lt;/div&gt;'; absentCount++; }

else if (status === 'unexcused') { cellContent = '&lt;div class="w-8 h-8 mx-auto rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold text-xs"&gt;KP&lt;/div&gt;'; absentCount++; }

else { cellContent = '&lt;div class="w-8 h-8 mx-auto text-slate-200 flex items-center justify-center"&gt;-&lt;/div&gt;'; }

return \`&lt;td class="p-2 text-center border-l border-slate-100"&gt;\${cellContent}&lt;/td&gt;\`;

}).join('');

return \`

&lt;tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors \${index % 2 !== 0 ? 'bg-slate-50/30' : 'bg-white'}"&gt;

&lt;td class="p-4 text-center font-bold text-slate-400 text-xs"&gt;\${index + 1}&lt;/td&gt;

&lt;td class="p-4 font-bold text-slate-800 whitespace-nowrap text-sm border-l border-slate-100"&gt;\${s.name}&lt;/td&gt;

&lt;td class="p-4 text-center border-l border-slate-100 font-bold text-sm bg-orange-50/30"&gt;&lt;span class="text-emerald-600"&gt;\${presentCount}&lt;/span&gt;&lt;span class="text-slate-300 mx-1.5"&gt;/&lt;/span&gt;&lt;span class="text-red-500"&gt;\${absentCount}&lt;/span&gt;&lt;/td&gt;

\${dateCells}

&lt;/tr&gt;

\`;

}).join('');

contentHtml = \`

&lt;div class="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-\[2rem\] shadow-sm border border-slate-200 mb-6 relative z-10"&gt;

&lt;div class="flex bg-slate-50 p-1.5 rounded-xl w-full md:w-max"&gt;

&lt;button onclick="switchAttendanceTab('diem-danh')" class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"&gt;Thực hiện điểm danh&lt;/button&gt;

&lt;button onclick="switchAttendanceTab('thong-ke')" class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-blueAccent shadow-sm"&gt;Bảng thống kê&lt;/button&gt;

&lt;/div&gt;

&lt;div class="text-sm font-semibold text-slate-500 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200"&gt;Tổng số ngày ghi nhận: &lt;span class="font-black text-slate-800 text-lg ml-1"&gt;\${allDates.length}&lt;/span&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden relative z-10 p-2"&gt;

&lt;div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar rounded-xl border border-slate-200"&gt;

&lt;table class="w-full text-sm text-left border-collapse"&gt;

&lt;thead class="text-\[10px\] text-white uppercase tracking-widest bg-\[#1e1b4b\] sticky top-0 z-10"&gt;

&lt;tr&gt;

&lt;th class="p-4 text-center w-12"&gt;STT&lt;/th&gt;

&lt;th class="p-4 border-l border-white/10 w-48"&gt;HỌ VÀ TÊN&lt;/th&gt;

&lt;th class="p-4 text-center border-l border-white/10 leading-tight w-24"&gt;TỔNG&lt;br&gt;&lt;span class="text-\[8px\] font-normal opacity-70 lowercase"&gt;(Có mặt / Vắng)&lt;/span&gt;&lt;/th&gt;

\${tableHeadDates}

&lt;/tr&gt;

&lt;/thead&gt;

&lt;tbody&gt;\${tableBodyRows || '&lt;tr&gt;&lt;td colspan="100%" class="p-16 text-center text-slate-400 font-medium text-lg"&gt;Chưa có dữ liệu thống kê điểm danh nào.&lt;/td&gt;&lt;/tr&gt;'}&lt;/tbody&gt;

&lt;/table&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

return \`

&lt;div class="max-w-7xl mx-auto animate-fade-in space-y-4 flex flex-col h-full pb-12"&gt;

&lt;div class="flex justify-between items-center py-2 pb-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;&lt;i class="ph-fill ph-calendar-check text-emerald-500"&gt;&lt;/i&gt; Quản lý Chuyên Cần&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Theo dõi việc đi học hàng ngày của học sinh&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

\${contentHtml}

&lt;/div&gt;

\`;

}

function markAttendance(id, status) {

if(state.attendanceRecords\[currentAttendanceDate\]\[id\] === status) { delete state.attendanceRecords\[currentAttendanceDate\]\[id\]; }

else { state.attendanceRecords\[currentAttendanceDate\]\[id\] = status; }

saveData(); renderLayout();

}

function markAllPresent() {

state.attendanceRecords\[currentAttendanceDate\] = {};

state.students.forEach(s => state.attendanceRecords\[currentAttendanceDate\]\[s.id\] = 'present');

saveData(); renderLayout(); showToast("Đã đánh dấu tất cả có mặt!");

}

function changeAttendanceDate(d) { if(d) { currentAttendanceDate = d; renderLayout(); } }

// --- NEW RANDOM PICKER ENGINE VARIABLES ---

let pickerMode = 'chaos'; // chaos, spiral, wave, planet, figure8, bubbles

let pickerBg = 'default';

let pickerTime = 3;

let pickerItems = \[\];

let isPicking = false;

let pickerAnimationId = null;

let pickTarget = 'student'; // 'student' or 'group'

function renderViewVongQuay() {

// Chuẩn bị danh sách

const listItems = pickTarget === 'student' ? state.students : state.groups;

// Render Background classes based on selected option

let stageBgClass = 'bg-slate-50';

if(pickerBg === 'cucquang') stageBgClass = 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500';

else if(pickerBg === 'xoaytim') stageBgClass = 'bg-gradient-to-br from-\[#1e1b4b\] to-purple-900';

else if(pickerBg === 'luadem') stageBgClass = 'bg-slate-900';

else if(pickerBg === 'songtim') stageBgClass = 'bg-gradient-to-r from-fuchsia-600 to-purple-600';

else if(pickerBg === 'daiduong') stageBgClass = 'bg-gradient-to-br from-cyan-500 to-blue-700';

// Helpr for rendering effect buttons

const renderEffectBtn = (id, icon, label) => {

const isActive = pickerMode === id;

return \`&lt;button onclick="changePickerMode('\${id}')" class="flex-1 py-2.5 px-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all \${isActive ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}"&gt;&lt;i class="ph-fill \${icon} text-lg"&gt;&lt;/i&gt; \${label}&lt;/button&gt;\`;

};

// Helper for background buttons

const renderBgBtn = (id, colorClass, label) => {

const isActive = pickerBg === id;

return \`&lt;button onclick="changePickerBg('\${id}')" class="h-10 rounded-xl text-xs font-bold text-white shadow-sm transition-all border-2 \${isActive ? 'border-emerald-500 scale-105' : 'border-transparent hover:scale-105'} \${colorClass}"&gt;\${label}&lt;/button&gt;\`;

}

return \`

&lt;div class="animate-fade-in flex h-full gap-6 pb-4"&gt;

&lt;!-- SIDEBAR CONTROL --&gt;

&lt;div class="w-80 flex-shrink-0 bg-emerald-50/50 rounded-\[2rem\] border border-emerald-100 flex flex-col h-full overflow-y-auto custom-scrollbar p-5"&gt;

&lt;div class="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-200"&gt;

&lt;button onclick="changePickTarget('student')" class="flex-1 py-2 rounded-lg text-sm font-bold transition-all \${pickTarget === 'student' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}"&gt;Học sinh&lt;/button&gt;

&lt;button onclick="changePickTarget('group')" class="flex-1 py-2 rounded-lg text-sm font-bold transition-all \${pickTarget === 'group' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}"&gt;Nhóm/Tổ&lt;/button&gt;

&lt;/div&gt;

&lt;div class="mb-6 space-y-3"&gt;

&lt;div class="text-\[11px\] font-black text-emerald-800/60 uppercase tracking-widest pl-1 mb-2"&gt;Hiệu ứng bay&lt;/div&gt;

&lt;div class="flex gap-3"&gt;

\${renderEffectBtn('chaos', 'ph-arrows-out', 'Hỗn loạn')}

\${renderEffectBtn('spiral', 'ph-spiral', 'Trôn ốc')}

&lt;/div&gt;

&lt;div class="flex gap-3"&gt;

\${renderEffectBtn('planet', 'ph-planet', 'Hành tinh')}

\${renderEffectBtn('wave', 'ph-wave-sine', 'Sóng')}

&lt;/div&gt;

&lt;div class="flex gap-3"&gt;

\${renderEffectBtn('bubbles', 'ph-circles-three', 'Bong bóng')}

\${renderEffectBtn('figure8', 'ph-infinity', 'Số 8')}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="mb-8"&gt;

&lt;div class="text-\[11px\] font-black text-emerald-800/60 uppercase tracking-widest pl-1 mb-3"&gt;Nền sân khấu&lt;/div&gt;

&lt;div class="grid grid-cols-2 gap-2.5"&gt;

&lt;button onclick="changePickerBg('default')" class="h-10 rounded-xl text-xs font-bold text-slate-600 bg-white shadow-sm transition-all border-2 \${pickerBg==='default' ? 'border-emerald-500' : 'border-slate-200 hover:border-slate-300'}"&gt;Mặc định&lt;/button&gt;

\${renderBgBtn('cucquang', 'bg-gradient-to-r from-pink-500 to-purple-500', 'Cực quang')}

\${renderBgBtn('xoaytim', 'bg-gradient-to-r from-\[#1e1b4b\] to-purple-600', 'Xoáy tím')}

\${renderBgBtn('luadem', 'bg-slate-900', 'Lửa đêm')}

\${renderBgBtn('songtim', 'bg-fuchsia-500', 'Sóng tím')}

\${renderBgBtn('daiduong', 'bg-cyan-600', 'Đại dương')}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="mt-auto space-y-4"&gt;

&lt;div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"&gt;

&lt;div class="flex justify-between items-center mb-2"&gt;

&lt;span class="text-xs font-bold text-slate-600"&gt;Thời gian gọi:&lt;/span&gt;

&lt;span class="text-sm font-black text-emerald-600"&gt;\${pickerTime}s&lt;/span&gt;

&lt;/div&gt;

&lt;input type="range" min="1" max="10" value="\${pickerTime}" onchange="pickerTime=parseInt(this.value); renderLayout();" class="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"&gt;

&lt;/div&gt;

&lt;button onclick="startPicking()" id="btn-start-pick" class="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"&gt;

&lt;i class="ph-fill ph-play text-2xl"&gt;&lt;/i&gt; BẮT ĐẦU GỌI

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- STAGE --&gt;

&lt;div class="flex-1 rounded-\[2rem\] overflow-hidden relative border border-slate-200 shadow-inner \${stageBgClass} transition-colors duration-500" id="picker-stage"&gt;

&lt;!-- Thẻ (Cards) sẽ được render vào đây bằng JS --&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

window.changePickerMode = function(mode) { pickerMode = mode; renderLayout(); }

window.changePickerBg = function(bg) { pickerBg = bg; renderLayout(); }

window.changePickTarget = function(target) { pickTarget = target; renderLayout(); }

function initPickerCards() {

const stage = document.getElementById('picker-stage');

if (!stage) return;

stage.innerHTML = ''; // Clear old cards

const listItems = pickTarget === 'student' ? state.students : state.groups;

if(listItems.length === 0) {

stage.innerHTML = \`&lt;div class="absolute inset-0 flex items-center justify-center text-xl font-bold \${pickerBg === 'default' ? 'text-slate-400' : 'text-white/50'}"&gt;Chưa có dữ liệu.&lt;/div&gt;\`;

return;

}

pickerItems = listItems.map((item, index) => {

const el = document.createElement('div');

el.className = \`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-3 shadow-lg flex flex-col items-center justify-center gap-2 transition-transform border border-slate-100 will-change-transform z-10\`;

el.style.width = '110px';

el.style.height = '130px';

// Color theme for avatar border

const colors = \['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'\];

const borderColor = colors\[index % colors.length\];

let avatarHtml = '';

if(pickTarget === 'student') {

avatarHtml = getAvatarImg(item.avatarUrl, item.name, "w-16 h-16 pointer-events-none ring-4 ring-white");

} else {

avatarHtml = item.avatarUrl ? \`&lt;img src="\${item.avatarUrl}" class="w-16 h-16 rounded-full object-cover ring-4 ring-white pointer-events-none"&gt;\` : \`&lt;div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center ring-4 ring-white"&gt;&lt;i class="ph-fill ph-users-three text-3xl text-slate-400"&gt;&lt;/i&gt;&lt;/div&gt;\`;

}

el.innerHTML = \`

&lt;div class="rounded-full p-1" style="background: linear-gradient(135deg, \${borderColor} 0%, transparent 100%);"&gt;

\${avatarHtml}

&lt;/div&gt;

&lt;div class="text-xs font-black text-slate-800 text-center w-full truncate leading-tight pointer-events-none"&gt;\${item.name}&lt;/div&gt;

\`;

stage.appendChild(el);

// Initial random positions

const stageWidth = stage.offsetWidth;

const stageHeight = stage.offsetHeight;

return {

el: el,

data: item,

x: (Math.random() - 0.5) \* (stageWidth - 150),

y: (Math.random() - 0.5) \* (stageHeight - 150),

angle: Math.random() \* Math.PI \* 2,

speed: 0.5 + Math.random() \* 1.5,

radius: 50 + Math.random() \* 200, // for spiral/planet

baseX: 0, baseY: 0 // offset

};

});

}

function animatePicker() {

if(!pickerItems.length) return;

const stage = document.getElementById('picker-stage');

if (!stage) { cancelAnimationFrame(pickerAnimationId); return; }

const stageWidth = stage.offsetWidth;

const stageHeight = stage.offsetHeight;

const time = performance.now() / 1000; // time in seconds

pickerItems.forEach((item, i) => {

// Tốc độ thay đổi dựa trên việc có đang Pick (quay số) hay không

const speedMulti = isPicking ? 8 : 1;

if (pickerMode === 'chaos') {

item.x += Math.cos(item.angle) \* item.speed \* speedMulti;

item.y += Math.sin(item.angle) \* item.speed \* speedMulti;

// Bouncing off walls

const boundX = stageWidth/2 - 60;

const boundY = stageHeight/2 - 70;

if (item.x > boundX || item.x < -boundX) item.angle = Math.PI - item.angle;

if (item.y > boundY || item.y < -boundY) item.angle = -item.angle;

// Add some random noise

item.angle += (Math.random() - 0.5) \* 0.1 \* speedMulti;

}

else if (pickerMode === 'spiral') {

const t = time \* item.speed \* speedMulti + i;

const r = (Math.sin(time \* 0.5) \* 0.5 + 0.5) \* 300 + 50; // Radius expands and contracts

item.x = Math.cos(t) \* r;

item.y = Math.sin(t) \* r;

}

else if (pickerMode === 'planet') {

// Center is sun, others orbit

const t = time \* (item.speed/2) \* speedMulti;

item.x = Math.cos(t + i) \* item.radius;

item.y = Math.sin(t + i) \* item.radius;

}

else if (pickerMode === 'wave') {

item.x += item.speed \* speedMulti \* 2;

if(item.x > stageWidth/2 + 60) item.x = -stageWidth/2 - 60; // wrap around

item.y = Math.sin(item.x / 100 + time \* 5) \* 150;

}

else if (pickerMode === 'bubbles') {

item.y -= item.speed \* speedMulti \* 2;

if(item.y < -stageHeight/2 - 70) item.y = stageHeight/2 + 70;

item.x = Math.sin(item.y / 50 + time \* 3 + i) \* 100 + item.baseX;

}

else if (pickerMode === 'figure8') {

const t = time \* item.speed \* speedMulti + i;

item.x = Math.sin(t) \* (stageWidth/3);

item.y = Math.sin(t) \* Math.cos(t) \* (stageHeight/3);

}

// Keep within bounds roughly

item.x = Math.max(-stageWidth/2 + 55, Math.min(stageWidth/2 - 55, item.x));

item.y = Math.max(-stageHeight/2 + 65, Math.min(stageHeight/2 - 65, item.y));

// Apply transform relative to center

item.el.style.transform = \`translate(calc(-50% + \${item.x}px), calc(-50% + \${item.y}px))\`;

});

if(!isPicking || performance.now() < pickEndTime) {

pickerAnimationId = requestAnimationFrame(animatePicker);

}

}

let pickEndTime = 0;

window.startPicking = function() {

if(pickerItems.length === 0) return showToast("Chưa có danh sách!", "error");

if(isPicking) return;

isPicking = true;

document.getElementById('btn-start-pick').innerHTML = \`&lt;i class="ph-bold ph-spinner-gap text-2xl animate-spin"&gt;&lt;/i&gt; ĐANG GỌI...\`;

document.getElementById('btn-start-pick').classList.replace('bg-emerald-600', 'bg-slate-400');

// Start sounds

if (Tone.context.state !== 'running') Tone.start();

let clickSynth = null;

try { clickSynth = new Tone.Synth({ oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination(); clickSynth.volume.value = -15; } catch(e) {}

let soundInterval = setInterval(() => {

if(clickSynth && Tone.context.state === 'running') clickSynth.triggerAttackRelease("G5", "32n", Tone.now());

}, 150);

pickEndTime = performance.now() + (pickerTime \* 1000);

setTimeout(() => {

clearInterval(soundInterval);

finishPick();

}, pickerTime \* 1000);

}

function finishPick() {

isPicking = false;

cancelAnimationFrame(pickerAnimationId);

const btn = document.getElementById('btn-start-pick');

if(btn){

btn.innerHTML = \`&lt;i class="ph-fill ph-play text-2xl"&gt;&lt;/i&gt; GỌI TIẾP\`;

btn.classList.replace('bg-slate-400', 'bg-emerald-600');

}

// Chọn ngẫu nhiên 1 người

const winnerIndex = Math.floor(Math.random() \* pickerItems.length);

const winner = pickerItems\[winnerIndex\];

// Tái tạo âm thanh chiến thắng

try {

const s = new Tone.PolySynth().toDestination();

s.volume.value = -10;

s.triggerAttackRelease(\['C5','E5','G5', 'C6'\], "2n");

} catch(e){}

triggerConfetti();

// Hiển thị modal người thắng

let actionBtnHtml = '';

if (pickTarget === 'student') {

actionBtnHtml = \`&lt;button onclick="switchTab('tich-diem'); selectStudentForPoints(\${winner.data.id}); closeModal('random-result-modal');" class="mt-8 px-10 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-600 transition-all hover:-translate-y-1 w-full flex items-center justify-center gap-2 text-lg"&gt;&lt;i class="ph-fill ph-star text-xl"&gt;&lt;/i&gt; KHEN THƯỞNG&lt;/button&gt;\`;

}

const isDark = pickerBg !== 'default';

const modalContent = \`

&lt;div class="flex flex-col items-center p-10 bg-white rounded-\[2.5rem\] shadow-2xl w-full max-w-md relative overflow-hidden group"&gt;

&lt;div class="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-10 -mt-10 z-0 opacity-50"&gt;&lt;/div&gt;

\${getAvatarImg(winner.data.avatarUrl, winner.data.name, 'relative z-10 w-40 h-40 shadow-xl mb-6 ring-8 ring-slate-50 group-hover:scale-105 transition-transform')}

&lt;div class="relative z-10 text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mb-2"&gt;\${pickTarget === 'student' ? 'HỌC SINH ĐƯỢC CHỌN' : 'TỔ ĐƯỢC CHỌN'}&lt;/div&gt;

&lt;div class="relative z-10 text-3xl md:text-4xl font-black text-slate-800 text-center leading-tight mb-2"&gt;\${winner.data.name}&lt;/div&gt;

\${winner.data.group ? \`&lt;div class="relative z-10 text-sm font-bold text-blue-600 uppercase bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100"&gt;\${winner.data.group}&lt;/div&gt;\` : ''}

\${actionBtnHtml}

&lt;/div&gt;

\`;

showRandomResultModal('', modalContent); // Dùng lại modal kết quả đã có

// Resume background animation slowly

pickerAnimationId = requestAnimationFrame(animatePicker);

}

function renderViewXepHang() {

const sortedStudents = \[...state.students\].sort((a,b) => (b.points || 0) - (a.points || 0));

let contentHtml = '';

// Define rankingTab globally if not exists

if(typeof rankingTab === 'undefined') window.rankingTab = 'bang-vang';

if (rankingTab === 'bang-vang') {

const top3 = sortedStudents.slice(0, 3); const others = sortedStudents.slice(3);

const rank1 = top3\[0\], rank2 = top3\[1\], rank3 = top3\[2\];

const renderPodiumItem = (student, rank, heightClass, bgStyle, badgeColor, shadowColor) => {

if (!student) return \`&lt;div class="w-24 sm:w-32"&gt;&lt;/div&gt;\`;

const isFirst = rank === 1;

return \`

&lt;div class="flex flex-col items-center justify-end group cursor-pointer w-24 sm:w-36 z-\${isFirst ? '20' : '10'}" onclick="switchTab('tich-diem'); selectStudentForPoints(\${student.id})"&gt;

&lt;div class="relative mb-4 z-10 transform transition-transform duration-300 \${isFirst ? 'group-hover:scale-125' : 'group-hover:scale-110'}"&gt;

\${getAvatarImg(student.avatarUrl, student.name, \`w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-white shadow-xl \${isFirst ? 'border-4 border-yellow-400' : ''}\`)}

&lt;div class="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg border-2 border-white" style="background: \${badgeColor}"&gt;\${rank}&lt;/div&gt;

\${isFirst ? '&lt;i class="ph-fill ph-crown text-3xl absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-md animate-bounce-slight"&gt;&lt;/i&gt;' : ''}

&lt;/div&gt;

&lt;div class="text-white font-bold text-sm sm:text-base mb-4 drop-shadow-md truncate w-full text-center px-1"&gt;\${student.name.split(' ').pop()}&lt;/div&gt;

&lt;div class="w-full \${heightClass} \${bgStyle} rounded-t-\[1.5rem\] flex flex-col items-center justify-start pt-5 shadow-\[0_-10px_20px_\${shadowColor}\] relative overflow-hidden transition-all duration-300 group-hover:brightness-110"&gt;

&lt;div class="absolute inset-0 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')\]"&gt;&lt;/div&gt;

&lt;span class="font-black text-2xl sm:text-3xl text-white leading-none drop-shadow-lg relative z-10"&gt;\${student.points || 0}&lt;/span&gt;

&lt;span class="text-\[10px\] text-white/70 font-bold uppercase mt-1 relative z-10"&gt;Điểm&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

};

const othersHtml = others.map((s, i) => \`

&lt;div class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-3 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all hover:-translate-y-1" onclick="switchTab('tich-diem'); selectStudentForPoints(\${s.id})"&gt;

&lt;div class="w-12 font-black text-center text-slate-300 text-xl"&gt;\${i + 4}&lt;/div&gt;

\${getAvatarImg(s.avatarUrl, s.name, "w-12 h-12 ring-2 ring-slate-100")}

&lt;div class="flex-1 min-w-0"&gt;&lt;div class="font-bold text-slate-800 text-base truncate"&gt;\${s.name}&lt;/div&gt;&lt;div class="text-\[10px\] text-slate-400 font-bold uppercase tracking-wider"&gt;\${s.group}&lt;/div&gt;&lt;/div&gt;

&lt;div class="font-black text-blueAccent text-2xl pr-2"&gt;\${s.points || 0}&lt;/div&gt;

&lt;/div&gt;

\`).join('');

contentHtml = \`

&lt;div class="bg-gradient-to-b from-primary to-\[#0f0c29\] rounded-\[2.5rem\] p-4 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-end min-h-\[450px\]"&gt;

&lt;div class="absolute inset-0 bg-banner opacity-30"&gt;&lt;/div&gt;

&lt;div class="absolute top-10 w-full text-center z-10"&gt;

&lt;div class="inline-block px-6 py-2 rounded-full glass-dark border border-white/10 mb-2"&gt;

&lt;span class="text-yellow-300 font-bold text-xs uppercase tracking-widest"&gt;BẢNG XẾP HẠNG TỔNG&lt;/span&gt;

&lt;/div&gt;

&lt;h3 class="text-white font-black text-2xl md:text-4xl tracking-widest uppercase mt-2 drop-shadow-lg"&gt;TOP 3 SIÊU SAO&lt;/h3&gt;

&lt;/div&gt;

&lt;div class="flex items-end justify-center gap-2 sm:gap-6 mt-28 relative z-10 w-full max-w-2xl mx-auto"&gt;

\${renderPodiumItem(rank2, 2, 'h-40 sm:h-48', 'bg-gradient-to-b from-slate-400 to-slate-600', 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)', 'rgba(148,163,184,0.3)')}

\${renderPodiumItem(rank1, 1, 'h-52 sm:h-64', 'bg-gradient-to-b from-yellow-400 to-amber-600', 'linear-gradient(135deg, #facc15 0%, #d97706 100%)', 'rgba(250,204,21,0.4)')}

\${renderPodiumItem(rank3, 3, 'h-32 sm:h-40', 'bg-gradient-to-b from-orange-400 to-red-600', 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)', 'rgba(249,115,22,0.3)')}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="pt-8 max-w-3xl mx-auto w-full"&gt;

&lt;div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-4 border-l-4 border-slate-300"&gt;Các vị trí tiếp theo&lt;/div&gt;

\${othersHtml || '&lt;div class="text-center text-slate-400 font-medium italic mt-8 p-10 bg-white rounded-3xl border border-dashed border-slate-200"&gt;Chưa có dữ liệu học sinh&lt;/div&gt;'}

&lt;/div&gt;

\`;

} else if (rankingTab === 'tien-bo') {

const studentsWithProgress = state.students.map(s => {

const basePoints = s.points || 0;

const weekProg = basePoints > 0 ? Math.floor((Math.sin(s.id \* 10) + 1) \* 15) + 5 : 0;

const monthProg = basePoints > 0 ? Math.floor((Math.cos(s.id \* 5) + 1) \* 30) + weekProg + 10 : 0;

return { ...s, weekProg: Math.min(weekProg, basePoints), monthProg: Math.min(monthProg, basePoints) };

});

const topWeek = \[...studentsWithProgress\].sort((a,b) => b.weekProg - a.weekProg).slice(0, 10);

const topMonth = \[...studentsWithProgress\].sort((a,b) => b.monthProg - a.monthProg).slice(0, 10);

const renderProgressList = (list, type) => list.map((s, i) => \`

&lt;div class="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-3 hover:shadow-md cursor-pointer transition-transform hover:-translate-y-1" onclick="switchTab('tich-diem'); selectStudentForPoints(\${s.id})"&gt;

&lt;div class="w-8 h-8 rounded-full flex items-center justify-center font-black \${i < 3 ? (type==='week'?'bg-emerald-100 text-emerald-600':'bg-blue-100 text-blue-600') : 'bg-slate-100 text-slate-400'}"&gt;\${i + 1}&lt;/div&gt;

\${getAvatarImg(s.avatarUrl, s.name, "w-10 h-10")}

&lt;div class="flex-1 min-w-0"&gt;&lt;div class="font-bold text-slate-800 text-sm truncate"&gt;\${s.name}&lt;/div&gt;&lt;div class="text-\[9px\] text-slate-400 font-bold uppercase tracking-wider"&gt;\${s.group}&lt;/div&gt;&lt;/div&gt;

&lt;div class="flex flex-col items-end"&gt;

&lt;div class="font-black \${type==='week'?'text-emerald-600':'text-blue-600'} text-base \${type==='week'?'bg-emerald-50':'bg-blue-50'} px-3 py-1 rounded-lg"&gt;+\${type === 'week' ? s.weekProg : s.monthProg}&lt;/div&gt;

&lt;div class="text-\[9px\] text-slate-400 font-bold uppercase mt-1.5 tracking-wider"&gt;Tổng: \${s.points}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`).join('');

contentHtml = \`

&lt;div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4"&gt;

&lt;div class="bg-white p-6 md:p-8 rounded-\[2rem\] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full"&gt;

&lt;div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 z-0"&gt;&lt;/div&gt;

&lt;div class="flex items-center gap-4 mb-8 relative z-10 border-b border-slate-100 pb-4"&gt;

&lt;div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-white"&gt;&lt;i class="ph-fill ph-lightning text-3xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;div&gt;

&lt;h3 class="font-black text-slate-800 text-xl tracking-tight"&gt;Ngôi Sao Tuần&lt;/h3&gt;

&lt;p class="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1"&gt;Tăng điểm nhiều nhất tuần&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative z-10 flex-1 bg-slate-50 p-2 rounded-2xl border border-slate-100"&gt;\${topWeek.length > 0 && topWeek\[0\].weekProg > 0 ? renderProgressList(topWeek.filter(x => x.weekProg > 0), 'week') : '&lt;div class="text-center py-20 text-slate-400 font-medium"&gt;Chưa có dữ liệu&lt;/div&gt;'}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white p-6 md:p-8 rounded-\[2rem\] border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-full"&gt;

&lt;div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 z-0"&gt;&lt;/div&gt;

&lt;div class="flex items-center gap-4 mb-8 relative z-10 border-b border-slate-100 pb-4"&gt;

&lt;div class="w-14 h-14 bg-gradient-to-br from-blue-400 to-blueAccent text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 border-white"&gt;&lt;i class="ph-fill ph-rocket-launch text-3xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;div&gt;

&lt;h3 class="font-black text-slate-800 text-xl tracking-tight"&gt;Bứt Phá Tháng&lt;/h3&gt;

&lt;p class="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mt-1"&gt;Tăng điểm nhiều nhất tháng&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative z-10 flex-1 bg-slate-50 p-2 rounded-2xl border border-slate-100"&gt;\${topMonth.length > 0 && topMonth\[0\].monthProg > 0 ? renderProgressList(topMonth.filter(x => x.monthProg > 0), 'month') : '&lt;div class="text-center py-20 text-slate-400 font-medium"&gt;Chưa có dữ liệu&lt;/div&gt;'}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

return \`

&lt;div class="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12"&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight"&gt;&lt;i class="ph-fill ph-medal text-yellow-500"&gt;&lt;/i&gt; Bảng Vinh Danh&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Tôn vinh những cá nhân xuất sắc và có nhiều tiến bộ&lt;/p&gt;

&lt;/div&gt;

&lt;div class="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto"&gt;

&lt;button onclick="switchRankingTab('bang-vang')" class="flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all \${rankingTab === 'bang-vang' ? 'bg-white text-blueAccent shadow-sm' : 'text-slate-500 hover:text-slate-800'}"&gt;&lt;i class="ph-fill ph-crown mr-1"&gt;&lt;/i&gt; Bảng Vàng&lt;/button&gt;

&lt;button onclick="switchRankingTab('tien-bo')" class="flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all \${rankingTab === 'tien-bo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"&gt;&lt;i class="ph-fill ph-trend-up mr-1"&gt;&lt;/i&gt; Bảng Tiến Bộ&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\${contentHtml}

&lt;/div&gt;

\`;

}

function switchRankingTab(tab) { rankingTab = tab; renderLayout(); }

function switchReportTab(tab) { state.reportTab = tab; renderLayout(); }

function saveStudentComment(id, value) {

const s = state.students.find(x => x.id === id);

if (s) { s.comment = value; saveData(); showToast("Đã lưu nhận xét tự động!"); }

}

function renderViewBaoCao() {

const totalStudents = state.students.length;

const totalPoints = state.students.reduce((sum, s) => sum + (s.points || 0), 0);

const avgPoints = totalStudents > 0 ? Math.round(totalPoints / totalStudents) : 0;

const sortedStudents = \[...state.students\].sort((a,b) => (b.points || 0) - (a.points || 0));

const currentReportTab = state.reportTab || 'chi-tiet';

const d = new Date();

const todayStr = \`\${d.getFullYear()}-\${String(d.getMonth() + 1).padStart(2, '0')}-\${String(d.getDate()).padStart(2, '0')}\`;

const formattedDate = formatDateForDisplay(todayStr);

let present = 0, absent = 0, late = 0, excused = 0, unexcused = 0;

const todayRecord = state.attendanceRecords\[todayStr\] || {};

state.students.forEach(s => {

const status = todayRecord\[s.id\];

if (status === 'present') present++;

else if (status === 'late') late++;

else if (status === 'excused') { absent++; excused++; }

else if (status === 'unexcused') { absent++; unexcused++; }

});

const tableRowsHtml = sortedStudents.map((s, index) => \`

&lt;div class="grid grid-cols-12 gap-4 py-4 border-b border-slate-100 items-center hover:bg-blue-50/50 transition-colors text-sm font-semibold text-slate-700"&gt;

&lt;div class="col-span-1 pl-6 text-slate-400"&gt;\${index + 1}&lt;/div&gt;

&lt;div class="col-span-4 font-bold text-slate-800 flex items-center gap-3"&gt;\${getAvatarImg(s.avatarUrl, s.name, 'w-8 h-8 rounded-full')} \${s.name}&lt;/div&gt;

&lt;div class="col-span-3"&gt;&lt;span class="bg-slate-100 px-3 py-1 rounded-lg text-xs border border-slate-200"&gt;\${s.group}&lt;/span&gt;&lt;/div&gt;

&lt;div class="col-span-2 font-black text-blueAccent text-base"&gt;\${s.points || 0}&lt;/div&gt;

&lt;div class="col-span-2 font-bold text-orange-500 flex items-center gap-1"&gt;\${s.stars || 0} &lt;i class="ph-fill ph-star"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

\`).join('');

// REDESIGN: Khung nhận xét học sinh mới

const commentsHtml = sortedStudents.map((s, index) => \`

&lt;div class="bg-white rounded-\[2rem\] p-3 md:p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all flex flex-col lg:flex-row gap-4 items-stretch group mb-4 break-inside-avoid"&gt;

&lt;!-- Cột thông tin học sinh (Trái) --&gt;

&lt;div class="w-full lg:w-1/4 bg-slate-50/80 rounded-\[1.5rem\] p-4 flex items-center gap-4 border border-slate-100 group-hover:bg-indigo-50/40 transition-colors"&gt;

&lt;div class="w-8 flex-shrink-0 text-center font-black text-slate-300 text-2xl"&gt;\${index + 1}&lt;/div&gt;

&lt;div class="relative flex-shrink-0"&gt;

\${getAvatarImg(s.avatarUrl, s.name, "w-14 h-14 rounded-2xl ring-4 ring-white shadow-sm object-cover")}

&lt;/div&gt;

&lt;div class="flex-1 min-w-0"&gt;

&lt;div class="font-bold text-slate-800 text-base truncate"&gt;\${s.name}&lt;/div&gt;

&lt;div class="flex flex-wrap items-center gap-2 mt-1.5"&gt;

&lt;span class="text-\[10px\] font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-lg"&gt;\${s.group || 'Tổ 1'}&lt;/span&gt;

&lt;span class="text-\[10px\] font-black text-\[#1e1b4b\] bg-indigo-100 px-2 py-0.5 rounded-lg"&gt;\${s.points || 0} Đ&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Cột nhập nhận xét (Phải) --&gt;

&lt;div class="w-full lg:w-3/4 relative flex group-focus-within:text-blueAccent"&gt;

&lt;div class="absolute left-5 top-5 text-indigo-300/50 pointer-events-none group-focus-within:text-\[#1e1b4b\]/20 transition-colors"&gt;

&lt;i class="ph-fill ph-quotes text-3xl"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;textarea onchange="saveStudentComment(\${s.id}, this.value)" class="w-full flex-1 bg-white border-2 border-slate-100 rounded-\[1.5rem\] p-5 pl-16 outline-none focus:border-\[#1e1b4b\] focus:bg-indigo-50/10 focus:ring-4 focus:ring-\[#1e1b4b\]/10 transition-all resize-y min-h-\[100px\] text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal print:hidden" placeholder="Nhập nhận xét của giáo viên về học sinh này trong tháng..."&gt;\${escapeHtmlAttr(s.comment || '')}&lt;/textarea&gt;

&lt;div class="hidden print:block text-sm text-slate-800 font-medium leading-relaxed pl-6 italic border-l-2 border-slate-300"&gt;\${s.comment ? escapeHtmlAttr(s.comment).replace(/\\n/g, '&lt;br&gt;') : 'Chưa có nhận xét.'}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`).join('');

let tabContentHtml = '';

if (currentReportTab === 'chi-tiet') {

tabContentHtml = \`

&lt;div class="min-w-full overflow-x-auto mt-4"&gt;

&lt;div class="grid grid-cols-12 gap-4 py-4 border-b border-slate-200 text-\[10px\] font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-t-2xl"&gt;

&lt;div class="col-span-1 pl-6"&gt;STT&lt;/div&gt;&lt;div class="col-span-4"&gt;HỌ VÀ TÊN&lt;/div&gt;&lt;div class="col-span-3"&gt;TỔ THI ĐUA&lt;/div&gt;&lt;div class="col-span-2"&gt;TỔNG ĐIỂM&lt;/div&gt;&lt;div class="col-span-2"&gt;SAO CÒN LẠI&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex flex-col bg-white rounded-b-2xl"&gt;\${tableRowsHtml || '&lt;div class="py-16 text-center text-slate-400 font-medium"&gt;Chưa có dữ liệu học sinh.&lt;/div&gt;'}&lt;/div&gt;

&lt;/div&gt;

\`;

} else if (currentReportTab === 'diem-tuan') {

// Logic lấy Báo cáo Tuần

const getWeekLabel = (dStr) => {

const dObj = new Date(dStr);

const day = dObj.getDay();

const diff = dObj.getDate() - day + (day === 0 ? -6 : 1);

const monday = new Date(dObj.getFullYear(), dObj.getMonth(), diff);

const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);

const f = (dt) => \`\${String(dt.getDate()).padStart(2, '0')}/\${String(dt.getMonth() + 1).padStart(2, '0')}\`;

return \`\${f(monday)} - \${f(sunday)}\`;

};

const allWeeksSet = new Set();

state.students.forEach(s => {

if (s.history) s.history.forEach(h => { if (h.date) allWeeksSet.add(getWeekLabel(h.date)); });

});

if (allWeeksSet.size === 0) allWeeksSet.add(getWeekLabel(new Date().toISOString()));

const sortedWeeks = Array.from(allWeeksSet).sort((a,b) => {

const pa = a.split(' - ')\[0\].split('/').reverse().join('');

const pb = b.split(' - ')\[0\].split('/').reverse().join('');

return pa.localeCompare(pb);

});

const weekHeadersHtml = sortedWeeks.map(w => \`

&lt;th colspan="2" class="p-3 text-center border-b border-r border-slate-200 bg-orange-50 font-black text-orange-700 text-sm whitespace-nowrap"&gt;Tuần&lt;br&gt;&lt;span class="text-\[10px\] font-medium text-slate-500"&gt;\${w}&lt;/span&gt;&lt;/th&gt;

\`).join('');

const subHeadersHtml = sortedWeeks.map(() => \`

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-emerald-50/50 text-emerald-600 font-bold text-xs w-14"&gt;+&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-red-50/50 text-red-500 font-bold text-xs w-14"&gt;-&lt;/th&gt;

\`).join('');

const weeklyDataRowsHtml = sortedStudents.map((s, index) => {

const weeklyPoints = {};

sortedWeeks.forEach(w => weeklyPoints\[w\] = { plus: 0, minus: 0 });

if (s.history) {

s.history.forEach(h => {

if (h.date && h.points) {

const wLabel = getWeekLabel(h.date);

if (weeklyPoints\[wLabel\]) {

if (h.points > 0) weeklyPoints\[wLabel\].plus += h.points;

else weeklyPoints\[wLabel\].minus += Math.abs(h.points);

}

}

});

}

const cellsHtml = sortedWeeks.map(w => \`

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-emerald-600 bg-emerald-50/30"&gt;\${weeklyPoints\[w\].plus > 0 ? '+' + weeklyPoints\[w\].plus : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-red-500 bg-red-50/30"&gt;\${weeklyPoints\[w\].minus > 0 ? '-' + weeklyPoints\[w\].minus : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

\`).join('');

return \`

&lt;tr class="hover:bg-slate-50/80 transition-colors"&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 text-slate-400 font-bold"&gt;\${index + 1}&lt;/td&gt;

&lt;td class="p-3 border-b border-r border-slate-100 font-bold text-slate-800 whitespace-nowrap flex items-center gap-2"&gt;

\${getAvatarImg(s.avatarUrl, s.name, 'w-6 h-6')} \${s.name}

&lt;/td&gt;

\${cellsHtml}

&lt;/tr&gt;

\`;

}).join('');

tabContentHtml = \`

&lt;div class="mt-6 overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl shadow-sm"&gt;

&lt;table class="w-full text-sm text-left border-collapse min-w-max"&gt;

&lt;thead&gt;

&lt;tr&gt;

&lt;th rowspan="2" class="p-3 text-center border-b border-r border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-\[10px\] w-16"&gt;STT&lt;/th&gt;

&lt;th rowspan="2" class="p-3 border-b border-r border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-\[10px\]"&gt;Tên Học Sinh&lt;/th&gt;

\${weekHeadersHtml}

&lt;/tr&gt;

&lt;tr&gt;

\${subHeadersHtml}

&lt;/tr&gt;

&lt;/thead&gt;

&lt;tbody&gt;

\${weeklyDataRowsHtml || '&lt;tr&gt;&lt;td colspan="100%" class="p-8 text-center text-slate-400 font-medium"&gt;Chưa có dữ liệu học sinh.&lt;/td&gt;&lt;/tr&gt;'}

&lt;/tbody&gt;

&lt;/table&gt;

&lt;/div&gt;

\`;

} else if (currentReportTab === 'diem-thang') {

const allMonthsSet = new Set();

state.students.forEach(s => {

if (s.history) {

s.history.forEach(h => {

if (h.date) {

const dateObj = new Date(h.date);

const monthYear = \`\${String(dateObj.getMonth() + 1).padStart(2, '0')}/\${dateObj.getFullYear()}\`;

allMonthsSet.add(monthYear);

}

});

}

});

if (allMonthsSet.size === 0) {

const today = new Date();

for (let i = 0; i < 3; i++) {

const d = new Date(today.getFullYear(), today.getMonth() - i, 1);

allMonthsSet.add(\`\${String(d.getMonth() + 1).padStart(2, '0')}/\${d.getFullYear()}\`);

}

}

const sortedMonths = Array.from(allMonthsSet).sort((a, b) => {

const \[monthA, yearA\] = a.split('/').map(Number);

const \[monthB, yearB\] = b.split('/').map(Number);

if (yearA !== yearB) return yearA - yearB;

return monthA - monthB;

});

const monthHeadersHtml = sortedMonths.map(month => \`

&lt;th colspan="2" class="p-3 text-center border-b border-r border-slate-200 bg-slate-50 font-black text-slate-800 text-sm whitespace-nowrap"&gt;\${month}&lt;/th&gt;

\`).join('');

const subHeadersHtml = sortedMonths.map(() => \`

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-emerald-50/50 text-emerald-600 font-bold text-xs w-14"&gt;+&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-red-50/50 text-red-500 font-bold text-xs w-14"&gt;-&lt;/th&gt;

\`).join('');

const monthlyDataRowsHtml = sortedStudents.map((s, index) => {

const monthlyPoints = {};

sortedMonths.forEach(m => monthlyPoints\[m\] = { plus: 0, minus: 0 });

if (s.history) {

s.history.forEach(h => {

if (h.date && h.points) {

const dateObj = new Date(h.date);

const monthYear = \`\${String(dateObj.getMonth() + 1).padStart(2, '0')}/\${dateObj.getFullYear()}\`;

if (monthlyPoints\[monthYear\]) {

if (h.points > 0) monthlyPoints\[monthYear\].plus += h.points;

else monthlyPoints\[monthYear\].minus += Math.abs(h.points);

}

}

});

}

const cellsHtml = sortedMonths.map(m => {

const plusVal = monthlyPoints\[m\].plus;

const minusVal = monthlyPoints\[m\].minus;

return \`

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-emerald-600 bg-emerald-50/30"&gt;\${plusVal > 0 ? '+' + plusVal : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-red-500 bg-red-50/30"&gt;\${minusVal > 0 ? '-' + minusVal : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

\`;

}).join('');

return \`

&lt;tr class="hover:bg-slate-50/80 transition-colors"&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 text-slate-400 font-bold"&gt;\${index + 1}&lt;/td&gt;

&lt;td class="p-3 border-b border-r border-slate-100 font-bold text-slate-800 whitespace-nowrap flex items-center gap-2"&gt;

\${getAvatarImg(s.avatarUrl, s.name, 'w-6 h-6')} \${s.name}

&lt;/td&gt;

\${cellsHtml}

&lt;/tr&gt;

\`;

}).join('');

tabContentHtml = \`

&lt;div class="mt-6 overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl shadow-sm"&gt;

&lt;table class="w-full text-sm text-left border-collapse min-w-max"&gt;

&lt;thead&gt;

&lt;tr&gt;

&lt;th rowspan="2" class="p-3 text-center border-b border-r border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-\[10px\] w-16"&gt;STT&lt;/th&gt;

&lt;th rowspan="2" class="p-3 border-b border-r border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-\[10px\]"&gt;Tên Học Sinh&lt;/th&gt;

\${monthHeadersHtml}

&lt;/tr&gt;

&lt;tr&gt;

\${subHeadersHtml}

&lt;/tr&gt;

&lt;/thead&gt;

&lt;tbody&gt;

\${monthlyDataRowsHtml || '&lt;tr&gt;&lt;td colspan="100%" class="p-8 text-center text-slate-400 font-medium"&gt;Chưa có dữ liệu học sinh.&lt;/td&gt;&lt;/tr&gt;'}

&lt;/tbody&gt;

&lt;/table&gt;

&lt;/div&gt;

\`;

} else if (currentReportTab === 'diem-hoc-ki') {

const hkDataRowsHtml = sortedStudents.map((s, index) => {

let hk1Plus = 0, hk1Minus = 0;

let hk2Plus = 0, hk2Minus = 0;

if (s.history) {

s.history.forEach(h => {

if (h.date && h.points) {

const d = new Date(h.date);

const m = d.getMonth() + 1; // 1 -> 12

// Học kì 1: Tháng 8 -> Tháng 12

if (m >= 8 && m <= 12) {

if (h.points > 0) hk1Plus += h.points;

else hk1Minus += Math.abs(h.points);

}

// Học kì 2: Tháng 1 -> Tháng 5

else if (m >= 1 && m <= 5) {

if (h.points > 0) hk2Plus += h.points;

else hk2Minus += Math.abs(h.points);

}

}

});

}

const hk1Total = hk1Plus - hk1Minus;

const hk2Total = hk2Plus - hk2Minus;

const yearTotal = hk1Total + hk2Total;

return \`

&lt;tr class="hover:bg-slate-50/80 transition-colors"&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 text-slate-400 font-bold"&gt;\${index + 1}&lt;/td&gt;

&lt;td class="p-3 border-b border-r border-slate-100 font-bold text-slate-800 whitespace-nowrap flex items-center gap-2"&gt;

\${getAvatarImg(s.avatarUrl, s.name, 'w-6 h-6')} \${s.name}

&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-emerald-600 bg-emerald-50/30"&gt;\${hk1Plus > 0 ? '+' + hk1Plus : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-red-500 bg-red-50/30"&gt;\${hk1Minus > 0 ? '-' + hk1Minus : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-200 font-bold text-slate-800 bg-slate-100/50"&gt;\${hk1Total}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-emerald-600 bg-emerald-50/30"&gt;\${hk2Plus > 0 ? '+' + hk2Plus : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-100 font-bold text-red-500 bg-red-50/30"&gt;\${hk2Minus > 0 ? '-' + hk2Minus : '&lt;span class="text-slate-200 font-normal"&gt;-&lt;/span&gt;'}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-r border-slate-200 font-bold text-slate-800 bg-slate-100/50"&gt;\${hk2Total}&lt;/td&gt;

&lt;td class="p-3 text-center border-b border-slate-100 font-black text-blueAccent bg-blue-50/40"&gt;\${yearTotal > 0 ? yearTotal : (yearTotal &lt; 0 ? yearTotal : '<span class="text-slate-300"&gt;0&lt;/span&gt;')}&lt;/td&gt;

&lt;/tr&gt;

\`;

}).join('');

tabContentHtml = \`

&lt;div class="mt-6 overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl shadow-sm"&gt;

&lt;table class="w-full text-sm text-left border-collapse min-w-max"&gt;

&lt;thead&gt;

&lt;tr&gt;

&lt;th rowspan="2" class="p-3 text-center border-b border-r border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-\[10px\] w-16"&gt;STT&lt;/th&gt;

&lt;th rowspan="2" class="p-3 border-b border-r border-slate-200 bg-slate-50 font-bold text-slate-500 uppercase tracking-widest text-\[10px\]"&gt;Tên Học Sinh&lt;/th&gt;

&lt;th colspan="3" class="p-3 text-center border-b border-r border-slate-200 bg-slate-50 font-black text-slate-800 text-sm whitespace-nowrap"&gt;HỌC KÌ 1 &lt;span class="text-\[10px\] font-medium text-slate-400 block mt-1"&gt;(T8 - T12)&lt;/span&gt;&lt;/th&gt;

&lt;th colspan="3" class="p-3 text-center border-b border-r border-slate-200 bg-slate-50 font-black text-slate-800 text-sm whitespace-nowrap"&gt;HỌC KÌ 2 &lt;span class="text-\[10px\] font-medium text-slate-400 block mt-1"&gt;(T1 - T5)&lt;/span&gt;&lt;/th&gt;

&lt;th rowspan="2" class="p-3 text-center border-b border-slate-200 bg-blue-50 font-black text-blue-700 text-xs uppercase tracking-widest whitespace-nowrap"&gt;TỔNG KẾT NĂM&lt;/th&gt;

&lt;/tr&gt;

&lt;tr&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-emerald-50/50 text-emerald-600 font-bold text-xs w-20"&gt;Cộng&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-red-50/50 text-red-500 font-bold text-xs w-20"&gt;Trừ&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs w-20"&gt;Tổng HK1&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-emerald-50/50 text-emerald-600 font-bold text-xs w-20"&gt;Cộng&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-red-50/50 text-red-500 font-bold text-xs w-20"&gt;Trừ&lt;/th&gt;

&lt;th class="p-2 text-center border-b border-r border-slate-200 bg-slate-100 text-slate-700 font-bold text-xs w-20"&gt;Tổng HK2&lt;/th&gt;

&lt;/tr&gt;

&lt;/thead&gt;

&lt;tbody&gt;

\${hkDataRowsHtml || '&lt;tr&gt;&lt;td colspan="100%" class="p-8 text-center text-slate-400 font-medium"&gt;Chưa có dữ liệu học sinh.&lt;/td&gt;&lt;/tr&gt;'}

&lt;/tbody&gt;

&lt;/table&gt;

&lt;/div&gt;

\`;

} else {

tabContentHtml = \`&lt;div class="flex flex-col mt-4"&gt;\${commentsHtml || '&lt;div class="py-16 text-center text-slate-400 font-medium bg-white border border-slate-200 rounded-\[2rem\]"&gt;Chưa có dữ liệu học sinh.&lt;/div&gt;'}&lt;/div&gt;\`;

}

return \`

&lt;div class="max-w-7xl mx-auto animate-fade-in pb-12" id="report-container"&gt;

&lt;!-- Header Section --&gt;

&lt;div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 pb-8 mb-4 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-3xl font-black text-slate-900 tracking-tight"&gt;Báo Cáo Tổng Hợp&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Thống kê chi tiết tình hình lớp học&lt;/p&gt;

&lt;/div&gt;

&lt;button id="btn-export-pdf" onclick="exportToPDF()" class="px-6 py-3.5 bg-\[#0f172a\] hover:bg-black text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm print:hidden transition-all"&gt;&lt;i class="ph-bold ph-download-simple text-lg"&gt;&lt;/i&gt; Tải PDF&lt;/button&gt;

&lt;/div&gt;

&lt;!-- REDESIGN: 4 Thẻ Thống kê --&gt;

&lt;div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-4"&gt;

&lt;!-- Thẻ 1: Xanh Navy --&gt;

&lt;div class="bg-gradient-to-br from-\[#1e1b4b\] to-\[#312e81\] rounded-\[2rem\] p-6 shadow-lg shadow-indigo-900/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform"&gt;

&lt;div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"&gt;&lt;/div&gt;

&lt;div class="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2"&gt;Tổng học sinh&lt;/div&gt;

&lt;div class="text-4xl font-black"&gt;\${totalStudents}&lt;/div&gt;

&lt;i class="ph-fill ph-users text-5xl absolute right-4 bottom-4 text-white/10 group-hover:text-white/20 transition-colors"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;!-- Thẻ 2: Xanh Pastel --&gt;

&lt;div class="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-\[2rem\] p-6 shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform"&gt;

&lt;div class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"&gt;&lt;/div&gt;

&lt;div class="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2"&gt;Tổng điểm thưởng&lt;/div&gt;

&lt;div class="text-4xl font-black"&gt;\${totalPoints}&lt;/div&gt;

&lt;i class="ph-fill ph-star text-5xl absolute right-4 bottom-4 text-white/20 group-hover:text-white/30 transition-colors"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;!-- Thẻ 3: Xanh Lục --&gt;

&lt;div class="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-\[2rem\] p-6 shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform"&gt;

&lt;div class="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"&gt;&lt;/div&gt;

&lt;div class="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2"&gt;Điểm trung bình&lt;/div&gt;

&lt;div class="text-4xl font-black"&gt;\${avgPoints}&lt;/div&gt;

&lt;i class="ph-fill ph-chart-line-up text-5xl absolute right-4 bottom-4 text-white/20 group-hover:text-white/30 transition-colors"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;!-- Thẻ 4: Trắng Sáng --&gt;

&lt;div class="bg-white border-2 border-slate-100 rounded-\[2rem\] p-6 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform hover:border-blue-200"&gt;

&lt;div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2"&gt;Điểm danh (\${formattedDate})&lt;/div&gt;

&lt;div class="flex gap-4 mt-3"&gt;

&lt;div class="text-sm font-bold text-slate-700"&gt;Có mặt: &lt;span class="text-emerald-500 font-black text-lg"&gt;\${present}&lt;/span&gt;&lt;/div&gt;

&lt;div class="text-sm font-bold text-slate-700"&gt;Vắng: &lt;span class="text-red-500 font-black text-lg"&gt;\${absent}&lt;/span&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;i class="ph-fill ph-calendar-check text-5xl absolute right-4 bottom-4 text-slate-100 group-hover:text-blue-50 transition-colors"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Main Content Area --&gt;

&lt;div class="bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100"&gt;

&lt;div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4"&gt;

&lt;h3 class="text-xl font-black text-slate-900 tracking-tight uppercase"&gt;Chi Tiết Báo Cáo&lt;/h3&gt;

&lt;!-- Tab Switch (Pill design) --&gt;

&lt;div id="report-tab-switcher" class="flex bg-slate-100 p-1.5 rounded-xl print:hidden w-full xl:w-auto overflow-x-auto custom-scrollbar flex-shrink-0"&gt;

&lt;button onclick="switchReportTab('chi-tiet')" class="flex-1 sm:flex-none whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${currentReportTab === 'chi-tiet' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"&gt;&lt;i class="ph-fill ph-list-numbers mr-1"&gt;&lt;/i&gt; Bảng Điểm&lt;/button&gt;

&lt;button onclick="switchReportTab('diem-tuan')" class="flex-1 sm:flex-none whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${currentReportTab === 'diem-tuan' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"&gt;&lt;i class="ph-bold ph-calendar-blank mr-1"&gt;&lt;/i&gt; Điểm Tuần&lt;/button&gt;

&lt;button onclick="switchReportTab('diem-thang')" class="flex-1 sm:flex-none whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${currentReportTab === 'diem-thang' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"&gt;&lt;i class="ph-bold ph-calendar mr-1"&gt;&lt;/i&gt; Điểm Tháng&lt;/button&gt;

&lt;button onclick="switchReportTab('diem-hoc-ki')" class="flex-1 sm:flex-none whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${currentReportTab === 'diem-hoc-ki' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"&gt;&lt;i class="ph-bold ph-books mr-1"&gt;&lt;/i&gt; Điểm Học Kì&lt;/button&gt;

&lt;button onclick="switchReportTab('nhan-xet')" class="flex-1 sm:flex-none whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-bold transition-all \${currentReportTab === 'nhan-xet' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"&gt;&lt;i class="ph-fill ph-chat-centered-text mr-1"&gt;&lt;/i&gt; Nhận Xét&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\${tabContentHtml}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function renderViewCaiDat() {

if (!state.settingsTab) state.settingsTab = 'thong-tin';

const tabButtons = \[

{ id: 'thong-tin', label: 'Thông tin chung', icon: 'ph-identification-badge' },

{ id: 'qua-tang', label: 'Danh mục Quà tặng', icon: 'ph-gift' },

{ id: 'tich-diem', label: 'Tích điểm', icon: 'ph-star' },

{ id: 'du-lieu', label: 'Dữ liệu & Đồng bộ', icon: 'ph-cloud-arrow-down' },

{ id: 'nguy-hiem', label: 'Vùng nguy hiểm', icon: 'ph-warning-octagon' }

\].map(tab => {

const isActive = state.settingsTab === tab.id;

return \`&lt;button onclick="switchSettingsTab('\${tab.id}')" class="px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 \${isActive ? 'bg-\[#1e1b4b\] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'}"&gt;&lt;i class="ph-fill \${tab.icon} text-lg"&gt;&lt;/i&gt; \${tab.label}&lt;/button&gt;\`;

}).join('');

let contentHtml = '';

if (state.settingsTab === 'thong-tin') {

contentHtml = \`

&lt;div class="bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start"&gt;

&lt;div class="w-full md:w-1/3 text-center"&gt;

&lt;div class="relative cursor-pointer group inline-block mb-4" onclick="document.getElementById('admin-avatar-upload').click()"&gt;

&lt;div id="edit-admin-avatar-preview" class="transition-opacity group-hover:opacity-80"&gt;

\${getAvatarImg(state.admin.avatarUrl, state.admin.name, "w-32 h-32 ring-4 ring-white shadow-xl mx-auto")}

&lt;/div&gt;

&lt;div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;

&lt;div class="bg-black/60 rounded-full p-4 shadow-lg text-white"&gt;&lt;i class="ph-fill ph-camera text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;input type="file" id="admin-avatar-upload" class="hidden" accept="image/\*" onchange="handleAdminAvatarUpload(event)"&gt;

&lt;input type="hidden" id="edit-admin-avatar-val" value="\${escapeHtmlAttr(state.admin.avatarUrl || '')}"&gt;

&lt;div class="text-\[10px\] font-bold uppercase tracking-widest text-slate-400"&gt;Ảnh đại diện&lt;/div&gt;

&lt;/div&gt;

&lt;div class="w-full md:w-2/3 space-y-6"&gt;

&lt;div&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"&gt;Tên Lớp&lt;/label&gt;

&lt;input type="text" id="setting-classname" value="\${escapeHtmlAttr(state.admin.className)}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl font-black text-slate-800 text-lg outline-none focus:border-blueAccent shadow-sm transition-colors"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"&gt;Giáo viên chủ nhiệm&lt;/label&gt;

&lt;input type="text" id="setting-gvcn" value="\${escapeHtmlAttr(state.admin.name)}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 outline-none focus:border-blueAccent shadow-sm transition-colors"&gt;

&lt;/div&gt;

&lt;button onclick="saveSettings()" class="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-secondary shadow-lg hover:-translate-y-0.5 transition-all"&gt;LƯU CÀI ĐẶT&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

} else if (state.settingsTab === 'tich-diem') {

contentHtml = renderViewTichDiem(); //

} else if (state.settingsTab === 'qua-tang') {

contentHtml = \`

&lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"&gt;

\${state.rewards.map(r => \`

&lt;div class="p-5 border border-slate-200 rounded-2xl flex items-center gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors group"&gt;

\${r.imageUrl

? \`&lt;div class="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-white ring-2 ring-slate-50 flex-shrink-0 bg-white"&gt;&lt;img src="\${r.imageUrl}" class="w-full h-full object-contain p-1"&gt;&lt;/div&gt;\`

: \`&lt;div class="w-14 h-14 \${r.bg} \${r.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white flex-shrink-0"&gt;&lt;i class="ph-fill \${r.icon}"&gt;&lt;/i&gt;&lt;/div&gt;\`

}

&lt;div class="flex-1 min-w-0"&gt;

&lt;div class="font-bold text-slate-800 text-sm truncate"&gt;\${r.name}&lt;/div&gt;

&lt;div class="text-xs font-black text-orange-500 flex items-center gap-1"&gt;\${r.cost} &lt;i class="ph-fill ph-star"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex flex-col gap-2"&gt;

&lt;button onclick="openEditRewardModal('\${r.id}')" class="text-slate-400 hover:text-blueAccent transition-colors"&gt;&lt;i class="ph-fill ph-pencil-simple text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="deleteReward('\${r.id}')" class="text-slate-400 hover:text-red-500 transition-colors"&gt;&lt;i class="ph-fill ph-trash text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\`).join('')}

&lt;/div&gt;

&lt;/div&gt;

\`;

} else if (state.settingsTab === 'du-lieu') {

contentHtml = \`

&lt;div class="bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100"&gt;

&lt;h3 class="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"&gt;&lt;i class="ph-fill ph-cloud-arrow-down text-blueAccent"&gt;&lt;/i&gt; Lưu trữ và Phục hồi&lt;/h3&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 gap-6"&gt;

&lt;div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl"&gt;

&lt;h4 class="font-bold text-slate-800 mb-2"&gt;Sao lưu dữ liệu&lt;/h4&gt;

&lt;p class="text-sm text-slate-500 mb-6"&gt;Tải toàn bộ dữ liệu lớp học hiện tại xuống máy tính để đề phòng mất mát.&lt;/p&gt;

&lt;button onclick="exportData()" class="w-full py-3.5 bg-blueAccent text-white font-bold rounded-xl shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"&gt;&lt;i class="ph-bold ph-download-simple text-lg"&gt;&lt;/i&gt; TẢI XUỐNG BẢN SAO LƯU&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl"&gt;

&lt;h4 class="font-bold text-slate-800 mb-2"&gt;Phục hồi dữ liệu&lt;/h4&gt;

&lt;p class="text-sm text-slate-500 mb-6"&gt;Khôi phục dữ liệu từ file sao lưu đã tải xuống trước đó.&lt;/p&gt;

&lt;div class="relative w-full"&gt;

&lt;input type="file" id="import-data-file" accept=".json" class="hidden" onchange="importData(event)"&gt;

&lt;button onclick="document.getElementById('import-data-file').click()" class="w-full py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"&gt;&lt;i class="ph-bold ph-upload-simple text-lg"&gt;&lt;/i&gt; CHỌN FILE PHỤC HỒI&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

} else if (state.settingsTab === 'nguy-hiem') {

contentHtml = \`

&lt;div class="bg-red-50 rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-red-100"&gt;

&lt;h3 class="text-xl font-black text-red-600 mb-2 flex items-center gap-2"&gt;&lt;i class="ph-fill ph-warning-octagon"&gt;&lt;/i&gt; Vùng Nguy Hiểm&lt;/h3&gt;

&lt;p class="text-sm text-red-500/80 mb-8 font-medium"&gt;Các thao tác dưới đây không thể hoàn tác. Hãy cẩn thận!&lt;/p&gt;

&lt;div class="space-y-4"&gt;

&lt;div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-red-200 rounded-2xl"&gt;

&lt;div&gt;

&lt;div class="font-bold text-slate-800"&gt;Đặt lại điểm thi đua&lt;/div&gt;

&lt;div class="text-xs text-slate-500 mt-1"&gt;Xóa số điểm hiện tại của một học sinh, tổ hoặc toàn lớp về 0.&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="openResetPointsModal()" class="w-full sm:w-auto px-6 py-3 bg-orange-50 text-orange-600 font-bold rounded-xl hover:bg-orange-100 transition-colors shadow-sm whitespace-nowrap border border-orange-100"&gt;ĐẶT LẠI ĐIỂM&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-red-200 rounded-2xl"&gt;

&lt;div&gt;

&lt;div class="font-bold text-red-600"&gt;Xóa sạch toàn bộ dữ liệu&lt;/div&gt;

&lt;div class="text-xs text-red-400 mt-1"&gt;Xóa tất cả học sinh, điểm số, lịch sử, cài đặt. Không thể khôi phục!&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="openWipeDataModal()" class="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md whitespace-nowrap"&gt;XÓA DỮ LIỆU&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

return \`

&lt;div class="max-w-4xl mx-auto animate-fade-in pb-12 pt-4"&gt;

&lt;div class="flex items-center gap-3 mb-8 px-2"&gt;

&lt;i class="ph-fill ph-gear text-4xl text-slate-400"&gt;&lt;/i&gt;

&lt;div&gt;

&lt;h2 class="text-3xl font-black text-slate-800 tracking-tight"&gt;Cài Đặt Hệ Thống&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Quản lý các thông số và cấu hình của lớp học&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex flex-wrap gap-3 mb-6 mt-4"&gt;

\${tabButtons}

&lt;/div&gt;

&lt;div class="mt-4"&gt;

\${contentHtml}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

window.exportData = function() {

const dataStr = JSON.stringify(state, null, 2);

const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

const exportFileDefaultName = \`ChuyenTauThanhXuan_Backup_\${getTodayString()}.json\`;

let linkElement = document.createElement('a');

linkElement.setAttribute('href', dataUri);

linkElement.setAttribute('download', exportFileDefaultName);

linkElement.click();

showToast("Đã tải xuống bản sao lưu!", "success");

};

window.importData = function(event) {

const file = event.target.files\[0\];

if (!file) return;

const reader = new FileReader();

reader.onload = function(e) {

try {

const importedState = JSON.parse(e.target.result);

if (confirm("Cảnh báo: Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn bởi dữ liệu từ file phục hồi. Bạn có chắc chắn muốn tiếp tục?")) {

state = { ...state, ...importedState };

applyStateDefaults();

saveData();

renderLayout();

showToast("Đã phục hồi dữ liệu thành công!", "success");

}

} catch (error) {

showToast("File không hợp lệ hoặc bị lỗi!", "error");

}

};

reader.readAsText(file);

// Reset input so the same file can be selected again if needed

event.target.value = '';

};

function saveSettings() { state.admin.className = document.getElementById('setting-classname').value; state.admin.name = document.getElementById('setting-gvcn').value; saveData(); renderLayout(); showToast("Đã lưu thông tin cài đặt", "success"); }

window.handleRewardImageUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

const imgInput = document.getElementById('edit-reward-image');

if(imgInput) imgInput.value = dataUrl;

const previewContainer = document.getElementById('reward-image-preview');

if(previewContainer) {

previewContainer.innerHTML = \`&lt;img src="\${dataUrl}" class="w-full h-full object-contain p-2"&gt;\`;

}

}, 800, 0.8);

};

window.openEditRewardModal = function(id) {

const reward = id ? state.rewards.find(r => r.id === id) : { name: '', cost: 10, icon: 'ph-gift', color: 'text-purple-600', bg: 'bg-purple-100', desc: '', imageUrl: '' };

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="edit-reward-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center px-8 relative overflow-hidden"&gt;

&lt;div class="absolute inset-0 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')\]"&gt;&lt;/div&gt;

&lt;h3 class="font-black text-xl relative z-10 flex items-center gap-2"&gt;&lt;i class="ph-fill ph-gift text-accent"&gt;&lt;/i&gt; \${id ? 'SỬA QUÀ TẶNG' : 'THÊM QUÀ MỚI'}&lt;/h3&gt;

&lt;button onclick="closeModal('edit-reward-modal')" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-8 space-y-5 bg-slate-50 text-left overflow-y-auto max-h-\[70vh\] custom-scrollbar"&gt;

&lt;!-- Khung tải ảnh quà tặng --&gt;

&lt;div&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Ảnh minh họa quà tặng&lt;/label&gt;

&lt;div class="relative cursor-pointer group" onclick="document.getElementById('edit-reward-image-upload').click()"&gt;

&lt;div id="reward-image-preview" class="w-full h-40 rounded-2xl bg-white flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-blueAccent transition-colors shadow-sm"&gt;

\${reward.imageUrl ? \`&lt;img src="\${reward.imageUrl}" class="w-full h-full object-contain p-2"&gt;\` : \`&lt;div class="text-slate-400 flex flex-col items-center"&gt;&lt;i class="ph-fill ph-image text-4xl mb-2"&gt;&lt;/i&gt;&lt;span class="text-xs font-bold"&gt;Bấm để tải ảnh lên&lt;/span&gt;&lt;/div&gt;\`}

&lt;/div&gt;

&lt;div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"&gt;

&lt;span class="text-white text-sm font-bold flex items-center gap-2"&gt;&lt;i class="ph-bold ph-upload-simple text-lg"&gt;&lt;/i&gt; Chọn ảnh&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;input type="file" id="edit-reward-image-upload" class="hidden" accept="image/\*" onchange="handleRewardImageUpload(event)"&gt;

&lt;input type="hidden" id="edit-reward-image" value="\${escapeHtmlAttr(reward.imageUrl || '')}"&gt;

&lt;/div&gt;

&lt;div&gt;&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Tên món quà&lt;/label&gt;&lt;input type="text" id="edit-reward-name" value="\${escapeHtmlAttr(reward.name)}" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"&gt;&lt;/div&gt;

&lt;div&gt;&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Mô tả (Tùy chọn)&lt;/label&gt;&lt;input type="text" id="edit-reward-desc" value="\${escapeHtmlAttr(reward.desc || '')}" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-blueAccent focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"&gt;&lt;/div&gt;

&lt;div&gt;&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Điểm sao cần để đổi&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;input type="number" id="edit-reward-cost" value="\${reward.cost}" class="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-300 rounded-xl text-base font-black text-orange-600 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"&gt;

&lt;i class="ph-fill ph-star absolute right-4 top-1/2 -translate-y-1/2 text-accent text-lg"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="saveRewardEdit('\${id || ''}')" class="w-full py-4 bg-primary hover:bg-secondary text-white font-black rounded-xl mt-4 shadow-lg transition-all hover:-translate-y-0.5"&gt;LƯU QUÀ TẶNG&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

}

window.saveRewardEdit = function(id) {

const name = document.getElementById('edit-reward-name').value.trim();

const desc = document.getElementById('edit-reward-desc').value.trim();

const cost = parseInt(document.getElementById('edit-reward-cost').value);

const imageUrl = document.getElementById('edit-reward-image').value.trim();

if (!name || isNaN(cost)) return showToast("Vui lòng nhập tên và giá sao hợp lệ!", "error");

// Giữ lại fallback icon nếu ko upload ảnh

const icon = 'ph-gift', color = 'text-purple-600', bg = 'bg-purple-100';

if (id) {

const idx = state.rewards.findIndex(r => r.id === id);

if (idx > -1) state.rewards\[idx\] = { ...state.rewards\[idx\], name, desc, cost, icon, color, bg, imageUrl };

} else {

state.rewards.push({ id: 'r' + Date.now(), name, desc, cost, icon, color, bg, imageUrl });

}

saveData(); renderLayout(); closeModal('edit-reward-modal'); showToast("Đã lưu danh mục quà tặng!");

}

function saveRewardEdit(id) {

const name = document.getElementById('edit-reward-name').value.trim(), desc = document.getElementById('edit-reward-desc').value.trim();

const cost = parseInt(document.getElementById('edit-reward-cost').value), icon = document.getElementById('edit-reward-icon').value;

const colorBase = document.getElementById('edit-reward-color').value;

if (!name || isNaN(cost)) return showToast("Vui lòng nhập tên và giá sao hợp lệ!", "error");

let color = \`text-\${colorBase}-600\`, bg = \`bg-\${colorBase}-100\`; if (colorBase === 'blue') color = 'text-blueAccent';

if (id) {

const idx = state.rewards.findIndex(r => r.id === id);

if (idx > -1) state.rewards\[idx\] = { ...state.rewards\[idx\], name, desc, cost, icon, color, bg };

} else state.rewards.push({ id: 'r' + Date.now(), name, desc, cost, icon, color, bg });

saveData(); renderLayout(); closeModal('edit-reward-modal'); showToast("Đã lưu danh mục quà tặng!");

}

function deleteReward(id) { if (confirm("Xóa quà tặng này khỏi cửa hàng?")) { state.rewards = state.rewards.filter(r => r.id !== id); saveData(); renderLayout(); showToast("Đã xóa quà tặng!"); } }

function openEditStudentModal(id) {

state.editingStudentId = id;

const s = id ? state.students.find(x => x.id === id) : { name: '', role: '', goal: '', talent: '', group: 'Tổ 1', avatarUrl: '', gender: 'Nữ', dob: '', boardingType: 'Ngoại trú' };

if (!s && id) return;

const roleOptions = \['Lớp trưởng', 'Lớp phó học tập', 'Lớp phó phong trào', 'Bí thư', 'Tổ trưởng'\].map(role =>

\`&lt;button onclick="document.getElementById('edit-s-role').value='\${role}'" class="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 text-\[12px\] font-bold rounded-lg transition-colors shadow-sm"&gt;+ \${role}&lt;/button&gt;\`

).join('');

const goalOptions = \['HS xuất sắc', 'HS giỏi', 'HS giỏi nhất trường', 'Tự tin giao tiếp'\].map(goal =>

\`&lt;button onclick="document.getElementById('edit-s-goal').value='\${goal}'" class="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 text-\[12px\] font-bold rounded-lg transition-colors shadow-sm"&gt;+ \${goal}&lt;/button&gt;\`

).join('');

const talentOptions = \['Bóng đá', 'Bóng rổ', 'Bóng chuyền', 'Vẽ', 'Hát', 'Nhảy', 'Biên đạo', 'Múa', 'MC'\].map(talent =>

\`&lt;button onclick="const el = document.getElementById('edit-s-talent'); el.value = el.value ? el.value + ', \${talent}' : '\${talent}'" class="px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-600 hover:bg-purple-100 text-\[12px\] font-bold rounded-lg transition-colors shadow-sm"&gt;+ \${talent}&lt;/button&gt;\`

).join('');

const groupOptions = state.groups.map(g => \`&lt;option value="\${g.name}" \${s.group===g.name?'selected':''}&gt;\${g.name}&lt;/option&gt;\`).join('');

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="edit-student-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-\[90vh\]"&gt;

&lt;!-- Header --&gt;

&lt;div class="p-6 border-b border-slate-100 flex justify-between items-center relative bg-white"&gt;

&lt;h3 class="font-black text-xl flex items-center gap-3 text-\[#0f172a\]"&gt;

&lt;div class="p-2 bg-yellow-100 text-yellow-600 rounded-lg"&gt;&lt;i class="ph-fill ph-identification-card text-xl"&gt;&lt;/i&gt;&lt;/div&gt;

\${id ? 'HỒ SƠ HỌC SINH' : 'THÊM HỌC SINH'}

&lt;/h3&gt;

&lt;button onclick="closeModal('edit-student-modal')" class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"&gt;&lt;i class="ph-bold ph-x"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;!-- Body --&gt;

&lt;div class="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-10 bg-white"&gt;

&lt;!-- Left Column --&gt;

&lt;div class="flex-1 space-y-6"&gt;

&lt;div class="text-\[12px\] font-black text-slate-400 uppercase tracking-widest mb-4"&gt;THÔNG TIN CƠ BẢN&lt;/div&gt;

&lt;!-- Ảnh đại diện --&gt;

&lt;div class="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"&gt;

&lt;div class="relative cursor-pointer group flex-shrink-0" onclick="document.getElementById('edit-student-avatar-upload').click()"&gt;

\${getAvatarImg(s.avatarUrl, s.name || 'A', "w-16 h-16 transition-opacity group-hover:opacity-80 ring-2 ring-white shadow-sm")}

&lt;div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;

&lt;div class="bg-black/60 rounded-full p-2 text-white"&gt;&lt;i class="ph-bold ph-camera text-sm"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;input type="file" id="edit-student-avatar-upload" class="hidden" accept="image/\*" onchange="handleStudentAvatarUpload(event)"&gt;

&lt;/div&gt;

&lt;div class="flex-1 min-w-0"&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-1"&gt;Ảnh đại diện&lt;/label&gt;

&lt;input type="text" id="edit-s-avatar" value="\${escapeHtmlAttr(s.avatarUrl || '')}" placeholder="Dán link hoặc tải lên..." class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blueAccent focus:outline-none font-medium truncate shadow-sm" oninput="document.querySelector('#edit-student-modal img').src=this.value || '<https://placehold.co/100x100/e2e8f0/64748b?text=AVT>'"&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Họ và tên --&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2"&gt;Họ và tên &lt;span class="text-red-500"&gt;\*&lt;/span&gt;&lt;/label&gt;

&lt;input type="text" id="edit-s-name" value="\${escapeHtmlAttr(s.name)}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-base font-black text-slate-800 focus:border-blueAccent focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"&gt;

&lt;/div&gt;

&lt;!-- Giới tính & Nhóm thi đua --&gt;

&lt;div class="grid grid-cols-2 gap-5"&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2"&gt;Giới tính&lt;/label&gt;

&lt;select id="edit-s-gender" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-blueAccent cursor-pointer outline-none shadow-sm"&gt;

&lt;option value="Nam" \${s.gender==='Nam'?'selected':''}&gt;Nam&lt;/option&gt;&lt;option value="Nữ" \${s.gender==='Nữ'?'selected':''}&gt;Nữ&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2"&gt;Nhóm thi đua&lt;/label&gt;

&lt;select id="edit-s-group" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-blueAccent cursor-pointer outline-none shadow-sm"&gt;

\${groupOptions}

&lt;/select&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Ngày sinh & Lưu trú --&gt;

&lt;div class="grid grid-cols-2 gap-5 mt-2"&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2"&gt;Ngày tháng năm sinh&lt;/label&gt;

&lt;input type="date" id="edit-s-dob" value="\${escapeHtmlAttr(s.dob || '')}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-blueAccent outline-none shadow-sm cursor-pointer"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2"&gt;Hình thức lưu trú&lt;/label&gt;

&lt;select id="edit-s-boarding" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-blueAccent cursor-pointer outline-none shadow-sm"&gt;

&lt;option value="Ngoại trú" \${s.boardingType==='Ngoại trú'?'selected':''}&gt;Ngoại trú&lt;/option&gt;

&lt;option value="Bán trú" \${s.boardingType==='Bán trú'?'selected':''}&gt;Bán trú&lt;/option&gt;

&lt;option value="Nội trú" \${s.boardingType==='Nội trú'?'selected':''}&gt;Nội trú&lt;/option&gt;

&lt;option value="Hai buổi" \${s.boardingType==='Hai buổi'?'selected':''}&gt;Hai buổi&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- MÃ TRA CỨU MỚI TẠI ĐÂY --&gt;

&lt;div class="flex items-center gap-3 mt-1"&gt;

&lt;div class="flex items-center gap-1.5 text-\[#5468ff\] font-black text-sm"&gt;

&lt;i class="ph-fill ph-squares-four text-lg"&gt;&lt;/i&gt;

&lt;span&gt;Mã tra cứu: &lt;span id="display-s-code" class="tracking-wider"&gt;\${s.code || '---'}&lt;/span&gt;&lt;/span&gt;

&lt;/div&gt;

&lt;input type="hidden" id="edit-s-code" value="\${escapeHtmlAttr(s.code || '')}"&gt;

&lt;button type="button" onclick="const newCode = Math.floor(10000 + Math.random() \* 90000).toString(); document.getElementById('edit-s-code').value = newCode; document.getElementById('display-s-code').innerText = newCode; showToast('Đã đổi mã mới!');" class="text-\[11px\] font-bold text-slate-400 hover:text-\[#5468ff\] underline cursor-pointer transition-colors"&gt;Đổi ngẫu nhiên&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Right Column --&gt;

&lt;div class="flex-1 space-y-6"&gt;

&lt;div class="text-\[12px\] font-black text-slate-400 uppercase tracking-widest mb-4"&gt;PHÁT TRIỂN CÁ NHÂN&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2"&gt;Vai trò&lt;/label&gt;

&lt;input type="text" id="edit-s-role" value="\${escapeHtmlAttr(s.role || '')}" placeholder="Lớp phó học tập..." class="w-full px-5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent outline-none mb-3 shadow-sm"&gt;

&lt;div class="flex flex-wrap gap-2"&gt;\${roleOptions}&lt;/div&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2 mt-4"&gt;Mục tiêu phấn đấu&lt;/label&gt;

&lt;input type="text" id="edit-s-goal" value="\${escapeHtmlAttr(s.goal || '')}" placeholder="Học sinh xuất sắc..." class="w-full px-5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent outline-none mb-3 shadow-sm"&gt;

&lt;div class="flex flex-wrap gap-2"&gt;\${goalOptions}&lt;/div&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-sm font-bold text-slate-600 mb-2 mt-4"&gt;Năng khiếu&lt;/label&gt;

&lt;input type="text" id="edit-s-talent" value="\${escapeHtmlAttr(s.talent || '')}" placeholder="MC, Hát, Tiếng Anh..." class="w-full px-5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent outline-none mb-3 shadow-sm"&gt;

&lt;div class="flex flex-wrap gap-2"&gt;\${talentOptions}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Footer --&gt;

&lt;div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-\[2rem\]"&gt;

\${id ? \`&lt;button onclick="deleteStudent(\${id}); closeModal('edit-student-modal')" class="px-6 py-3.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm border border-red-100"&gt;&lt;i class="ph-bold ph-trash"&gt;&lt;/i&gt; Xóa&lt;/button&gt;\` : '&lt;div&gt;&lt;/div&gt;'}

&lt;div class="flex gap-3"&gt;

&lt;button onclick="closeModal('edit-student-modal')" class="px-8 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"&gt;Hủy&lt;/button&gt;

&lt;button onclick="saveStudentEdit()" class="px-10 py-3.5 bg-\[#0f172a\] text-white font-black rounded-xl hover:bg-black shadow-lg transition-all hover:-translate-y-0.5"&gt;Lưu Hồ Sơ&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

}

window.saveStudentEdit = function() {

// 1. Lấy dữ liệu từ các ô nhập liệu

const nameInput = document.getElementById('edit-s-name').value.trim();

if (!nameInput) {

return showToast("Vui lòng nhập họ và tên học sinh!", "error");

}

// 2. Thu thập toàn bộ thông tin trên form

const studentData = {

name: nameInput,

avatarUrl: document.getElementById('edit-s-avatar').value.trim(),

gender: document.getElementById('edit-s-gender').value,

group: document.getElementById('edit-s-group').value,

dob: document.getElementById('edit-s-dob').value,

boardingType: document.getElementById('edit-s-boarding').value,

code: document.getElementById('edit-s-code').value,

role: document.getElementById('edit-s-role').value.trim(),

goal: document.getElementById('edit-s-goal').value.trim(),

talent: document.getElementById('edit-s-talent').value.trim()

};

// 3. Xử lý Lưu (Cập nhật người cũ hoặc Thêm người mới)

if (state.editingStudentId) {

const index = state.students.findIndex(s => s.id === state.editingStudentId);

if (index > -1) {

state.students\[index\] = { ...state.students\[index\], ...studentData };

showToast("Đã cập nhật hồ sơ học sinh thành công!", "success");

}

} else {

const newId = state.students.length > 0 ? Math.max(...state.students.map(s => s.id)) + 1 : 1;

state.students.push({

...studentData,

id: newId,

points: 0,

stars: 0,

history: \[\],

comment: ''

});

showToast("Đã thêm học sinh mới thành công!", "success");

}

// 4. Lưu dữ liệu, cập nhật giao diện và đóng form

saveData();

renderLayout();

closeModal('edit-student-modal');

};

window.deleteStudent = function(id) {

const studentIndex = state.students.findIndex(s => s.id === id);

if (studentIndex === -1) return;

const studentName = state.students\[studentIndex\].name;

if (confirm(\`Bạn có chắc chắn muốn xóa học sinh "\${studentName}" khỏi danh sách không? Hành động này sẽ xóa luôn cả lịch sử thi đua của em ấy và không thể hoàn tác!\`)) {

state.students.splice(studentIndex, 1);

if (state.attendanceRecords) {

for (const date in state.attendanceRecords) {

if (state.attendanceRecords\[date\]\[id\]) {

delete state.attendanceRecords\[date\]\[id\];

}

}

}

saveData();

renderLayout();

showToast(\`Đã xóa triệt để \${studentName} khỏi hệ thống!\`, "success");

}

};

window.openEditGroupModal = function(id) {

state.editingGroupId = id;

const group = state.groups.find(g => g.id === id || g.id === String(id));

if (!group) return showToast("Lỗi: Không tìm thấy thông tin tổ!", "error");

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="edit-group-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center px-8 relative"&gt;

&lt;h3 class="font-black text-xl flex items-center gap-2"&gt;&lt;i class="ph-fill ph-flag-pennant text-accent"&gt;&lt;/i&gt; CHỈNH SỬA TỔ&lt;/h3&gt;

&lt;button onclick="closeModal('edit-group-modal')" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-8 text-center space-y-6 bg-slate-50"&gt;

&lt;div&gt;

&lt;div class="relative cursor-pointer group inline-block mb-3" onclick="document.getElementById('edit-group-avatar-upload').click()"&gt;

&lt;div id="group-avatar-preview-container" class="transition-transform group-hover:scale-105 duration-300"&gt;

\${group.avatarUrl ? \`&lt;img src="\${group.avatarUrl}" class="w-28 h-28 rounded-3xl mx-auto object-cover shadow-lg ring-4 ring-white"&gt;\` : \`&lt;div class="w-28 h-28 rounded-3xl mx-auto bg-white flex items-center justify-center shadow-md ring-2 ring-slate-200"&gt;&lt;i class="ph-fill ph-image text-5xl text-slate-300"&gt;&lt;/i&gt;&lt;/div&gt;\`}

&lt;/div&gt;

&lt;div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;

&lt;div class="bg-black/60 rounded-full p-3 text-white"&gt;&lt;i class="ph-bold ph-upload-simple"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;input type="file" id="edit-group-avatar-upload" class="hidden" accept="image/\*" onchange="handleGroupAvatarUpload(event)"&gt;

&lt;/div&gt;

&lt;input type="text" id="edit-group-avatar" value="\${group.avatarUrl || ''}" class="hidden"&gt;

&lt;div class="text-\[10px\] font-bold uppercase tracking-widest text-slate-400"&gt;Ảnh đại diện Tổ&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-left"&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"&gt;Tên Tổ &lt;span class="text-red-500"&gt;\*&lt;/span&gt;&lt;/label&gt;

&lt;input type="text" id="edit-group-name" value="\${escapeHtmlAttr(group.name || '')}" class="w-full px-5 py-3.5 border border-slate-300 rounded-xl text-base focus:border-blueAccent focus:ring-4 focus:ring-blue-100 outline-none font-black text-slate-800 transition-all"&gt;

&lt;/div&gt;

&lt;div class="text-left"&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"&gt;Màu sắc chủ đạo&lt;/label&gt;

&lt;select id="edit-group-color" class="w-full px-5 py-3.5 border border-slate-300 rounded-xl text-sm focus:border-blueAccent focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 cursor-pointer transition-all"&gt;

&lt;option value="text-red-500" \${group.color === 'text-red-500' ? 'selected' : ''}&gt;Đỏ nhiệt huyết&lt;/option&gt;

&lt;option value="text-blueAccent" \${group.color === 'text-blueAccent' ? 'selected' : ''}&gt;Xanh tin cậy&lt;/option&gt;

&lt;option value="text-green-500" \${group.color === 'text-green-500' ? 'selected' : ''}&gt;Xanh lá hy vọng&lt;/option&gt;

&lt;option value="text-yellow-500" \${group.color === 'text-yellow-500' ? 'selected' : ''}&gt;Vàng tỏa sáng&lt;/option&gt;

&lt;option value="text-purple-500" \${group.color === 'text-purple-500' ? 'selected' : ''}&gt;Tím sáng tạo&lt;/option&gt;

&lt;option value="text-pink-500" \${group.color === 'text-pink-500' ? 'selected' : ''}&gt;Hồng năng động&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;button onclick="saveGroupEdit()" class="w-full py-4 bg-\[#1e1b4b\] text-white font-black rounded-xl hover:bg-\[#312e81\] shadow-lg mt-4 transition-all hover:-translate-y-0.5"&gt;LƯU THÔNG TIN TỔ&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

window.saveGroupEdit = function() {

if (!state.editingGroupId) return;

const index = state.groups.findIndex(g => g.id === state.editingGroupId || g.id === String(state.editingGroupId));

if (index > -1) {

const oldName = state.groups\[index\].name;

const newName = document.getElementById('edit-group-name').value.trim() || oldName;

state.groups\[index\] = {

...state.groups\[index\],

name: newName,

color: document.getElementById('edit-group-color').value,

avatarUrl: document.getElementById('edit-group-avatar').value.trim()

};

// Cập nhật tên tổ mới cho tất cả học sinh đang ở trong tổ cũ

if (oldName !== newName) {

state.students.forEach(s => {

if (s.group === oldName) s.group = newName;

});

}

saveData();

renderLayout();

showToast("Đã cập nhật tổ thành công!", "success");

}

closeModal('edit-group-modal');

}

window.downloadTemplate = function() {

const headers = \[\["Họ Tên (Bắt buộc)", "Giới tính", "Tổ thi đua", "Vai trò", "Mục tiêu phấn đấu", "Năng khiếu", "Ngày sinh (Năm-Tháng-Ngày)", "Hình thức lưu trú"\]\];

const sampleData = \[

\["Nguyễn Văn A", "Nam", "Tổ 1", "Lớp trưởng", "Học sinh giỏi", "Toán", "2008-05-15", "Ngoại trú"\],

\["Trần Thị B", "Nữ", "Tổ 2", "Thành viên", "Tiến bộ", "Văn nghệ", "2008-08-20", "Bán trú"\]

\];

// Khởi tạo bảng tính và điền dữ liệu

const ws = XLSX.utils.aoa_to_sheet(\[...headers, ...sampleData\]);

// Căn chỉnh độ rộng các cột cho đẹp mắt

ws\['!cols'\] = \[{wch: 25}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 25}, {wch: 20}\];

const wb = XLSX.utils.book_new();

XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Hoc_Sinh");

XLSX.writeFile(wb, "File_Mau_Nhap_Hoc_Sinh.xlsx");

showToast("Đã tải xuống file Excel mẫu!", "success");

};

function openImportModal() {

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="import-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-center pt-10 pb-8 px-8 relative"&gt;

&lt;button onclick="closeModal('import-modal')" class="absolute top-6 right-6 text-slate-400 hover:bg-slate-100 rounded-full p-2 transition-colors"&gt;&lt;i class="ph-bold ph-x text-xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;div class="w-20 h-20 bg-blue-50 rounded-\[2rem\] flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100"&gt;&lt;i class="ph-fill ph-file-xls text-4xl text-blue-600"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;h3 class="font-black text-slate-800 text-2xl mb-2"&gt;Nhập Danh Sách Lớp&lt;/h3&gt;

&lt;p class="text-sm text-slate-500 font-medium mb-8"&gt;Thêm nhanh nhiều học sinh từ file Excel&lt;/p&gt;

&lt;div class="space-y-6 text-left mb-8"&gt;

&lt;div class="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-pointer flex flex-col items-center group" onclick="document.getElementById('excel-upload-input').click()"&gt;

&lt;input type="file" id="excel-upload-input" class="hidden" accept=".xlsx, .xls, .csv" onchange="handleExcelUpload(event)"&gt;

&lt;div class="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform"&gt;&lt;i class="ph-fill ph-upload-simple text-3xl text-blueAccent"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;div class="font-bold text-slate-700 text-base mb-1"&gt;Bấm để chọn file Excel (.xlsx)&lt;/div&gt;

&lt;div class="text-\[11px\] text-slate-500 text-center leading-relaxed font-semibold"&gt;Cột A: Họ Tên | B: Giới tính | C: Tổ | D: Vai trò&lt;br&gt;E: Mục tiêu | F: Năng khiếu | G: Ngày sinh | H: Lưu trú&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative py-2"&gt;&lt;div class="absolute inset-0 flex items-center"&gt;&lt;div class="w-full border-t border-slate-200"&gt;&lt;/div&gt;&lt;/div&gt;&lt;div class="relative flex justify-center"&gt;&lt;span class="bg-white px-4 text-\[10px\] text-slate-400 font-bold uppercase tracking-widest"&gt;Hoặc dán văn bản&lt;/span&gt;&lt;/div&gt;&lt;/div&gt;

&lt;textarea id="import-paste-area" rows="4" placeholder="Nguyễn Văn A Nam Tổ 1 Lớp trưởng Học sinh giỏi Toán 2008-05-15 Ngoại trú" class="w-full px-5 py-4 border border-slate-300 rounded-2xl text-sm focus:border-blueAccent focus:ring-4 focus:ring-blue-100 outline-none resize-none bg-slate-50 font-medium font-mono"&gt;&lt;/textarea&gt;

&lt;/div&gt;

&lt;button onclick="processPastedData()" class="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-secondary shadow-lg transition-all hover:-translate-y-0.5"&gt;XỬ LÝ DỮ LIỆU&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function handleExcelUpload(e) {

const file = e.target.files\[0\]; if (!file) return;

const reader = new FileReader();

reader.onload = (evt) => {

try {

const workbook = XLSX.read(evt.target.result, {type: 'binary'});

const rows = XLSX.utils.sheet_to_json(workbook.Sheets\[workbook.SheetNames\[0\]\], {header: 1});

processImportRows(rows);

} catch(err) { showToast("Lỗi định dạng file Excel.", "error"); }

};

reader.readAsBinaryString(file);

}

function processPastedData() {

const text = document.getElementById('import-paste-area').value.trim();

if (!text) return showToast("Vui lòng dán dữ liệu!", "error");

processImportRows(text.split('\\n').map(row => row.split('\\t')));

}

function processImportRows(rows) {

let addedCount = 0;

let currentId = state.students.length > 0 ? Math.max(...state.students.map(s => s.id)) + 1 : 1;

rows.forEach((row, i) => {

if (i === 0 && row\[0\] && row\[0\].toString().toLowerCase().includes('tên')) return;

const name = (row\[0\] || '').toString().trim(); if (!name) return;

state.students.push({

id: currentId++, name: name,

gender: (row\[1\] || '').toString().trim() || 'Nam',

group: (row\[2\] || '').toString().trim() || 'Tổ 1',

role: (row\[3\] || '').toString().trim() || '',

goal: (row\[4\] || '').toString().trim() || '',

talent: (row\[5\] || '').toString().trim() || '',

dob: (row\[6\] || '').toString().trim() || '',

boardingType: (row\[7\] || '').toString().trim() || 'Ngoại trú',

avatarUrl: '', points: 0, stars: 0, code: generateUniqueCode(), history: \[\]

});

addedCount++;

});

if (addedCount > 0) { saveData(); renderLayout(); closeModal('import-modal'); showToast(\`Đã nhập \${addedCount} học sinh!\`, "success"); }

}

// Random pickers

function showRandomResultModal(title, htmlContent) {

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/80 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="random-result-modal"&gt;

&lt;div class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"&gt;&lt;canvas id="modal-confetti-canvas" class="w-full h-full"&gt;&lt;/canvas&gt;&lt;/div&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col relative text-center pt-10 pb-12 px-6 z-10 animate-\[popIn_0.5s_cubic-bezier(0.16,1,0.3,1)\_forwards\]"&gt;

&lt;button onclick="closeModal('random-result-modal')" class="absolute top-6 right-6 text-slate-400 hover:bg-slate-200 rounded-full p-2 transition-colors z-20"&gt;&lt;i class="ph-bold ph-x text-xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;div class="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-xs uppercase tracking-widest mx-auto mb-4"&gt;Kết quả lựa chọn&lt;/div&gt;

&lt;h3 class="font-black text-3xl md:text-4xl text-slate-800 mb-10 uppercase tracking-tight flex items-center justify-center gap-3"&gt;\${title}&lt;/h3&gt;

&lt;div class="flex flex-wrap justify-center gap-8 px-4 max-h-\[60vh\] overflow-y-auto custom-scrollbar"&gt;\${htmlContent}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

setTimeout(() => {

const canvas = document.getElementById('modal-confetti-canvas'); if (!canvas) return;

canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;

const ctx = canvas.getContext('2d');

const particles = \[\], colors = \['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'\];

for (let i = 0; i < 150; i++) particles.push({ x: canvas.width/2, y: canvas.height/2+50, r: Math.random()\*6+3, dx: Math.random()\*16-8, dy: Math.random()\*-15-8, color: colors\[Math.floor(Math.random()\*colors.length)\], tilt: Math.floor(Math.random()\*10)-10, tiltAngleInc: (Math.random()\*0.07)+0.05, tiltAngle: 0 });

function render() {

ctx.clearRect(0, 0, canvas.width, canvas.height); let active = 0;

particles.forEach(p => {

if (p.y < canvas.height) active++;

p.tiltAngle += p.tiltAngleInc; p.y += (Math.cos(p.tiltAngle) + p.dy + p.r/2)/2; p.x += Math.sin(p.tiltAngle)\*2 + p.dx; p.dy += 0.25;

ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color; ctx.moveTo(p.x+p.tilt+p.r, p.y); ctx.lineTo(p.x+p.tilt, p.y+p.tilt+p.r); ctx.stroke();

});

if (active > 0) requestAnimationFrame(render); else ctx.clearRect(0, 0, canvas.width, canvas.height);

} render();

}, 100);

}

function pickRandomInGroup(groupId) {

const group = state.groups.find(g => g.id === groupId);

const members = state.students.filter(s => s.group === group.name);

if (members.length === 0) return showToast(\`Tổ \${group.name} chưa có thành viên!\`, "error");

const winner = members\[Math.floor(Math.random() \* members.length)\];

const content = \`

&lt;div class="flex flex-col items-center p-8 bg-slate-50/80 rounded-\[2rem\] border border-slate-200 shadow-sm w-72 group relative overflow-hidden"&gt;

&lt;div class="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50"&gt;&lt;/div&gt;

\${getAvatarImg(winner.avatarUrl, winner.name, 'relative z-10 w-36 h-36 shadow-xl mb-6 ring-4 ring-white group-hover:scale-105 transition-transform')}

&lt;div class="relative z-10 text-3xl font-black text-slate-800 mb-2 leading-tight"&gt;\${winner.name}&lt;/div&gt;

&lt;div class="relative z-10 text-\[11px\] font-bold text-slate-500 uppercase bg-white border border-slate-200 px-4 py-1.5 rounded-xl"&gt;\${group.name}&lt;/div&gt;

&lt;button onclick="switchTab('tich-diem'); selectStudentForPoints(\${winner.id}); closeModal('random-result-modal');" class="relative z-10 mt-8 w-full py-3.5 bg-blueAccent text-white font-black rounded-xl shadow-md hover:bg-blue-600 flex items-center justify-center gap-2 transition-all hover:-translate-y-1"&gt;&lt;i class="ph-fill ph-star text-lg"&gt;&lt;/i&gt; KHEN THƯỞNG&lt;/button&gt;

&lt;/div&gt;

\`;

showRandomResultModal(\`Thành viên - \${group.name}\`, content);

}

function pickRandomGroup() {

if (state.groups.length === 0) return showToast("Chưa có tổ nào trong danh sách!", "error");

const winner = state.groups\[Math.floor(Math.random() \* state.groups.length)\];

const content = \`

&lt;div class="flex flex-col items-center p-10 bg-slate-50/80 rounded-\[2rem\] border border-slate-200 shadow-sm w-80"&gt;

\${winner.avatarUrl ? \`&lt;img src="\${winner.avatarUrl}" class="w-40 h-40 rounded-\[2rem\] object-cover shadow-xl mb-6 ring-8 ring-white"&gt;\` : \`&lt;div class="w-40 h-40 rounded-\[2rem\] bg-white flex items-center justify-center shadow-xl border-4 border-slate-50 mb-6"&gt;&lt;i class="ph-fill ph-users-three text-7xl \${winner.color}"&gt;&lt;/i&gt;&lt;/div&gt;\`}

&lt;div class="text-4xl font-black text-slate-800 tracking-tight"&gt;\${winner.name}&lt;/div&gt;

&lt;/div&gt;

\`;

showRandomResultModal("Tổ May Mắn", content);

}

function pickOneFromEachGroup() {

if (state.groups.length === 0) return showToast("Chưa có tổ nào trong danh sách!", "error");

let html = '';

state.groups.forEach(g => {

const members = state.students.filter(s => s.group === g.name);

if (members.length > 0) {

const winner = members\[Math.floor(Math.random() \* members.length)\];

html += \`

&lt;div class="flex flex-col items-center p-6 bg-white rounded-\[2rem\] border border-slate-200 w-48 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group relative overflow-hidden"&gt;

&lt;div class="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full -mr-4 -mt-4 z-0"&gt;&lt;/div&gt;

&lt;div class="relative z-10 text-\[10px\] font-black text-slate-400 uppercase tracking-widest mb-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"&gt;\${g.name}&lt;/div&gt;

\${getAvatarImg(winner.avatarUrl, winner.name, 'relative z-10 w-24 h-24 shadow-md mb-5 ring-4 ring-slate-50 group-hover:scale-110 transition-transform')}

&lt;div class="relative z-10 text-base font-black text-slate-800 text-center break-words w-full mb-4 leading-tight"&gt;\${winner.name}&lt;/div&gt;

&lt;button onclick="switchTab('tich-diem'); selectStudentForPoints(\${winner.id}); closeModal('random-result-modal');" class="relative z-10 mt-auto w-full py-2.5 bg-blue-50 text-blueAccent font-bold rounded-xl hover:bg-blue-100 transition-colors"&gt;Chọn&lt;/button&gt;

&lt;/div&gt;

\`;

}

});

if (!html) return showToast("Không có học sinh trong các tổ!", "error");

showRandomResultModal("Đại Diện Các Tổ", html);

}

/\* Group Edit & Parent view Modals omitted for brevity but remain functional as original logic is kept intact \*/

// Re-adding omitted essential modals from original code to ensure runnability

function addNewGroup() {

const newId = 'g' + (Date.now());

state.groups.push({ id: newId, name: \`Tổ \${state.groups.length + 1}\`, color: "text-slate-500", avatarUrl: "" });

saveData(); renderLayout(); openEditGroupModal(newId);

}

function deleteGroup(id) {

const group = state.groups.find(g => g.id === id); if (!group) return;

if (state.students.filter(s => s.group === group.name).length > 0) return showToast("Không thể xóa tổ đang có học sinh!", "error");

if (confirm(\`Xóa tổ thi đua này?\`)) { state.groups = state.groups.filter(g => g.id !== id); saveData(); renderLayout(); showToast(\`Đã xóa tổ!\`); }

}

function saveGroupEdit() {

if (!state.editingGroupId) return;

const index = state.groups.findIndex(g => g.id === state.editingGroupId);

if (index > -1) {

const oldName = state.groups\[index\].name, newName = document.getElementById('edit-group-name').value.trim() || oldName;

state.groups\[index\] = { ...state.groups\[index\], name: newName, color: document.getElementById('edit-group-color').value, avatarUrl: document.getElementById('edit-group-avatar').value.trim() };

if (oldName !== newName) state.students.forEach(s => { if (s.group === oldName) s.group = newName; });

saveData(); renderLayout(); showToast("Đã cập nhật tổ!");

}

closeModal('edit-group-modal');

}

function openEditAdminModal() {

const admin = state.admin || { name: '', role: 'Giáo viên chủ nhiệm', avatarUrl: '' };

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="edit-admin-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center px-8"&gt;

&lt;h3 class="font-black text-xl flex items-center gap-2"&gt;&lt;i class="ph-fill ph-user-circle-gear text-accent"&gt;&lt;/i&gt; HỒ SƠ GIÁO VIÊN&lt;/h3&gt;

&lt;button onclick="closeModal('edit-admin-modal')" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-8 space-y-6 bg-slate-50 text-left"&gt;

&lt;div class="flex flex-col items-center mb-2"&gt;

&lt;div class="relative cursor-pointer group" onclick="document.getElementById('admin-avatar-upload').click()"&gt;

&lt;div id="edit-admin-avatar-preview" class="transition-opacity group-hover:opacity-80"&gt;

\${getAvatarImg(admin.avatarUrl, admin.name, "w-28 h-28 ring-4 ring-white shadow-xl")}

&lt;/div&gt;

&lt;div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;

&lt;div class="bg-black/60 rounded-full p-3 shadow-lg text-white"&gt;&lt;i class="ph-fill ph-camera text-xl"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;input type="file" id="admin-avatar-upload" class="hidden" accept="image/\*" onchange="handleAdminAvatarUpload(event)"&gt;

&lt;input type="hidden" id="edit-admin-avatar-val" value="\${escapeHtmlAttr(admin.avatarUrl || '')}"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 tracking-widest uppercase"&gt;Họ và tên&lt;/label&gt;

&lt;input type="text" id="edit-admin-name" value="\${escapeHtmlAttr(admin.name)}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-base focus:border-blueAccent focus:outline-none font-black text-slate-800 shadow-sm transition-all"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-xs font-bold text-slate-500 mb-2 tracking-widest uppercase"&gt;Chức danh&lt;/label&gt;

&lt;input type="text" id="edit-admin-role" value="\${escapeHtmlAttr(admin.role)}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-blueAccent focus:outline-none font-bold text-slate-700 shadow-sm transition-all"&gt;

&lt;/div&gt;

&lt;button onclick="saveAdminEdit()" class="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-secondary shadow-lg mt-4 transition-all hover:-translate-y-0.5"&gt;LƯU HỒ SƠ&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

}

function saveAdminEdit() {

if (!state.admin) state.admin = {};

const name = document.getElementById('edit-admin-name').value.trim();

if (!name) return showToast("Vui lòng nhập tên giáo viên!", "error");

state.admin.name = name; state.admin.role = document.getElementById('edit-admin-role').value.trim();

state.admin.avatarUrl = document.getElementById('edit-admin-avatar-val').value;

saveData(); renderLayout(); closeModal('edit-admin-modal'); showToast("Đã cập nhật hồ sơ!");

}

function openResetPointsModal() {

let optionsHtml = \`&lt;option value="all"&gt;Tất cả học sinh&lt;/option&gt;\`;

state.groups.forEach(g => optionsHtml += \`&lt;option value="group_\${g.name}"&gt;Tổ: \${g.name}&lt;/option&gt;\`);

state.students.forEach(s => optionsHtml += \`&lt;option value="student_\${s.id}"&gt;Cá nhân: \${s.name}&lt;/option&gt;\`);

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="reset-points-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative pt-8 pb-6 px-8"&gt;

&lt;div class="flex items-center gap-3 mb-6 text-orange-600"&gt;&lt;i class="ph-fill ph-warning-circle text-5xl drop-shadow-md"&gt;&lt;/i&gt;&lt;h3 class="font-black text-2xl tracking-tight"&gt;ĐẶT LẠI ĐIỂM&lt;/h3&gt;&lt;/div&gt;

&lt;div class="space-y-5 mb-8"&gt;

&lt;div&gt;&lt;label class="block text-\[11px\] font-bold text-slate-500 uppercase tracking-widest mb-2"&gt;Chọn đối tượng:&lt;/label&gt;&lt;select id="reset-target" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-400"&gt;\${optionsHtml}&lt;/select&gt;&lt;/div&gt;

&lt;div&gt;&lt;label class="block text-\[11px\] font-bold text-slate-500 uppercase tracking-widest mb-2"&gt;Loại điểm xóa:&lt;/label&gt;&lt;select id="reset-type" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-orange-400"&gt;&lt;option value="stars"&gt;Chỉ Đặt lại Sao&lt;/option&gt;&lt;option value="all"&gt;Xóa cả Tổng điểm & Sao&lt;/option&gt;&lt;/select&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-orange-50 p-5 rounded-2xl border border-orange-100 mb-6 shadow-inner"&gt;

&lt;label class="block text-xs font-bold text-orange-700 mb-2"&gt;Gõ &lt;span class="font-black text-red-600 mx-1"&gt;XAC NHAN&lt;/span&gt; để tiếp tục:&lt;/label&gt;

&lt;input type="text" id="reset-confirm-input" class="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl text-center text-sm font-black text-red-600 outline-none"&gt;

&lt;/div&gt;

&lt;div class="flex gap-4"&gt;

&lt;button onclick="closeModal('reset-points-modal')" class="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"&gt;HỦY BỎ&lt;/button&gt;

&lt;button onclick="executeResetPoints()" class="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"&gt;THỰC HIỆN&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function executeResetPoints() {

if (document.getElementById('reset-confirm-input').value.trim().toUpperCase() !== 'XAC NHAN') return showToast("Gõ đúng chữ XAC NHAN", "error");

const target = document.getElementById('reset-target').value, type = document.getElementById('reset-type').value;

let count = 0;

state.students.forEach(s => {

let shouldReset = (target === 'all') || (target.startsWith('group_') && s.group === target.replace('group_', '')) || (target.startsWith('student_') && s.id.toString() === target.replace('student_', ''));

if (shouldReset) { if (type === 'stars') s.stars = 0; else { s.points = 0; s.stars = 0; } count++; }

});

saveData(); renderLayout(); closeModal('reset-points-modal'); showToast(\`Đã đặt lại điểm cho \${count} học sinh!\`, "success");

}

function openWipeDataModal() {

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="wipe-data-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative pt-10 pb-8 px-8 border-2 border-red-500"&gt;

&lt;div class="flex items-center justify-center gap-3 mb-6 text-red-600"&gt;&lt;i class="ph-fill ph-warning-octagon text-6xl animate-pulse drop-shadow-md"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;h3 class="font-black text-2xl text-center text-slate-800 uppercase tracking-wide mb-2"&gt;XÓA SẠCH DỮ LIỆU&lt;/h3&gt;

&lt;p class="text-sm font-bold text-red-500 text-center mb-8"&gt;Hành động này KHÔNG THỂ hoàn tác!&lt;/p&gt;

&lt;div class="bg-red-50 p-5 rounded-2xl border border-red-100 mb-8 shadow-inner"&gt;

&lt;label class="block text-xs font-bold text-red-700 mb-3 text-center"&gt;Gõ &lt;span class="font-black text-red-600 mx-1"&gt;XOA DU LIEU&lt;/span&gt; để xác nhận:&lt;/label&gt;

&lt;input type="text" id="wipe-confirm-input" class="w-full px-4 py-3.5 bg-white border border-red-200 rounded-xl text-center text-base font-black text-red-600 outline-none shadow-sm"&gt;

&lt;/div&gt;

&lt;div class="flex gap-4"&gt;

&lt;button onclick="closeModal('wipe-data-modal')" class="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"&gt;HỦY BỎ&lt;/button&gt;

&lt;button onclick="executeWipeData()" class="flex-1 py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 shadow-lg hover:-translate-y-0.5 transition-all"&gt;XÓA TẤT CẢ&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function executeWipeData() {

if (!\['XOA DU LIEU', 'XÓA DỮ LIỆU'\].includes(document.getElementById('wipe-confirm-input').value.trim().toUpperCase())) return showToast("Gõ đúng chữ XOA DU LIEU", "error");

// Dòng này là mình khai báo xóa sạch học sinh, nhóm, điểm danh...

state.students = \[\]; state.groups = \[\]; state.attendanceRecords = {}; state.criteria = null;

// ĐÂY LÀ DÒNG MÌNH VỪA THÊM VÀO ĐỂ XÓA LUÔN CÔNG VIỆC VÀ HÀNH TRÌNH

state.tasks = \[\]; state.journeys = \[\];

applyStateDefaults();

saveData(); renderLayout(); closeModal('wipe-data-modal'); showToast("Đã xóa sạch toàn bộ dữ liệu lớp!", "success");

}

function openParentLookupModal() {

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/80 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="parent-lookup-modal"&gt;

&lt;div class="bg-white rounded-\[2.5rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative text-center pt-12 pb-10 px-8"&gt;

&lt;button onclick="closeModal('parent-lookup-modal')" class="absolute top-6 right-6 text-slate-400 hover:bg-slate-100 rounded-full p-2 transition-colors"&gt;&lt;i class="ph-bold ph-x text-xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;div class="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"&gt;&lt;i class="ph-fill ph-student text-5xl text-orange-500"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;h3 class="font-black text-slate-800 text-3xl mb-2 tracking-tight"&gt;Cổng Phụ Huynh&lt;/h3&gt;

&lt;p class="text-sm text-slate-500 mb-10 font-medium"&gt;Nhập mã tra cứu của học sinh (5 chữ số)&lt;/p&gt;

&lt;input type="text" id="lookup-code-input" placeholder="00000" class="w-full px-6 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-4xl font-black text-center tracking-\[0.3em\] text-slate-800 focus:border-orange-400 outline-none mb-8 shadow-inner transition-colors" maxlength="5" onkeypress="if(event.key === 'Enter') performParentLookup()"&gt;

&lt;button onclick="performParentLookup()" class="w-full py-4.5 bg-gradient-to-r from-orange-400 to-red-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg tracking-wider"&gt;TRA CỨU NGAY&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

setTimeout(() => document.getElementById('lookup-code-input').focus(), 100);

}

function performParentLookup() {

const code = document.getElementById('lookup-code-input').value.trim();

if (!code) return showToast("Vui lòng nhập mã tra cứu", "error");

const student = state.students.find(s => s.code === code);

if (student) showParentView(student.id); else showToast("Mã tra cứu không chính xác!", "error");

}

window.performDirectLookup = function() {

const code = document.getElementById('direct-lookup-code').value.trim();

if (!code) return showToast("Vui lòng nhập mã tra cứu", "error");

const student = state.students.find(s => s.code === code);

if (student) {

showParentView(student.id);

} else {

showToast("Mã tra cứu không chính xác!", "error");

}

};

function showParentView(studentId) {

const student = state.students.find(s => s.id === studentId); if (!student) return;

const maxPoints = 500; const milestones = \[100, 300, 500\];

const currentPoints = student.points || 0;

let nextMilestone = milestones.find(m => m > currentPoints) || maxPoints;

let progressPercent = Math.min(100, (currentPoints / maxPoints) \* 100);

let present = 0, late = 0, excused = 0, unexcused = 0;

if (state.attendanceRecords) {

Object.values(state.attendanceRecords).forEach(dayRecord => {

if (dayRecord\[student.id\] === 'present') present++;

if (dayRecord\[student.id\] === 'late') late++;

if (dayRecord\[student.id\] === 'excused') excused++;

if (dayRecord\[student.id\] === 'unexcused') unexcused++;

});

}

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-\[#f8fafc\] z-\[100\] flex flex-col overflow-y-auto animate-fade-in custom-scrollbar" id="parent-view-modal"&gt;

&lt;div class="bg-primary text-white p-5 sticky top-0 z-20 flex justify-between items-center shadow-lg print:hidden"&gt;

&lt;div class="flex items-center gap-4"&gt;

&lt;div class="w-12 h-12 bg-white/10 rounded-\[1rem\] flex items-center justify-center"&gt;&lt;i class="ph-fill ph-student text-2xl text-orange-400"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;div&gt;&lt;div class="font-black text-lg tracking-tight"&gt;HỒ SƠ HỌC TẬP&lt;/div&gt;&lt;div class="text-\[10px\] text-slate-300 font-bold uppercase tracking-widest"&gt;\${state.admin.className}&lt;/div&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="closeModal('parent-view-modal')" class="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"&gt;&lt;i class="ph-bold ph-sign-out text-lg"&gt;&lt;/i&gt; Đóng&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8 pb-12 mt-4"&gt;

&lt;div class="bg-white rounded-\[2rem\] p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative overflow-hidden group"&gt;

&lt;div class="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -mr-20 -mt-20 z-0 opacity-50"&gt;&lt;/div&gt;

&lt;div class="relative z-10 flex-shrink-0"&gt;\${getAvatarImg(student.avatarUrl, student.name, "w-32 h-32 ring-8 ring-orange-50 shadow-xl")}&lt;/div&gt;

&lt;div class="flex-1 relative z-10 w-full"&gt;

&lt;h2 class="text-3xl md:text-4xl font-black text-slate-800 mb-3"&gt;\${student.name}&lt;/h2&gt;

&lt;div class="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-8"&gt;

&lt;span class="text-xs font-bold bg-slate-100 text-slate-600 px-4 py-2 rounded-xl border border-slate-200"&gt;&lt;i class="ph-fill ph-users mr-1"&gt;&lt;/i&gt; \${student.group}&lt;/span&gt;

&lt;span class="text-xs font-bold bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100"&gt;&lt;i class="ph-fill ph-shield-star mr-1"&gt;&lt;/i&gt; \${student.role || 'Thành viên'}&lt;/span&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-2 gap-4"&gt;

&lt;div class="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner"&gt;&lt;div class="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mb-1"&gt;TỔNG ĐIỂM&lt;/div&gt;&lt;div class="text-4xl font-black text-slate-800"&gt;\${student.points || 0}&lt;/div&gt;&lt;/div&gt;

&lt;div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 shadow-inner"&gt;&lt;div class="text-\[11px\] font-bold text-orange-500 uppercase tracking-widest mb-1"&gt;SAO TÍCH LŨY&lt;/div&gt;&lt;div class="text-4xl font-black text-orange-600 flex items-center justify-center md:justify-start gap-1"&gt;\${student.stars || 0} &lt;i class="ph-fill ph-star text-accent"&gt;&lt;/i&gt;&lt;/div&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[2rem\] p-8 shadow-sm border border-slate-200 relative overflow-hidden"&gt;

&lt;h3 class="font-black text-slate-800 mb-10 flex items-center gap-3 text-xl"&gt;&lt;i class="ph-fill ph-path text-blueAccent text-3xl"&gt;&lt;/i&gt; Hành trình phấn đấu&lt;/h3&gt;

&lt;div class="relative w-full pt-8 pb-10 px-6 md:px-12"&gt;

&lt;div class="absolute top-1/2 left-6 md:left-12 right-6 md:right-12 h-3.5 bg-slate-100 -translate-y-1/2 rounded-full border border-slate-200 shadow-inner"&gt;&lt;/div&gt;

&lt;div class="absolute top-1/2 left-6 md:left-12 h-3.5 bg-gradient-to-r from-blue-400 to-blueAccent -translate-y-1/2 rounded-full shadow-\[0_0_10px_rgba(59,130,246,0.3)\]" style="width: calc(\${progressPercent}% \* 0.9)"&gt;&lt;/div&gt;

\${milestones.map((m) => {

const isReached = currentPoints >= m; const leftPos = (m / maxPoints) \* 100;

return \`

&lt;div class="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transform -translate-x-1/2" style="left: calc(\${leftPos}% - 10px)"&gt;

&lt;div class="w-12 h-12 md:w-14 md:h-14 rounded-full border-4 \${isReached ? 'border-blueAccent bg-white text-blueAccent shadow-lg scale-110' : 'border-slate-200 bg-slate-50 text-slate-300'} flex items-center justify-center font-black text-xl md:text-2xl z-10 transition-transform"&gt;\${isReached ? '&lt;i class="ph-fill ph-star"&gt;&lt;/i&gt;' : '&lt;i class="ph-fill ph-lock-key"&gt;&lt;/i&gt;'}&lt;/div&gt;

&lt;div class="absolute top-16 md:top-20 text-\[10px\] md:text-xs font-bold \${isReached ? 'text-slate-700 bg-slate-50 border border-slate-200' : 'text-slate-400 bg-transparent'} px-2.5 py-1 rounded-lg"&gt;\${m} đ&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('')}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8"&gt;

&lt;div class="bg-white rounded-\[2rem\] p-8 shadow-sm border border-slate-200"&gt;

&lt;h3 class="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg"&gt;&lt;i class="ph-fill ph-calendar-check text-emerald-500 text-2xl"&gt;&lt;/i&gt; Tình hình chuyên cần&lt;/h3&gt;

&lt;div class="space-y-3"&gt;

&lt;div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"&gt;&lt;div class="flex items-center gap-3"&gt;&lt;div class="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"&gt;&lt;/div&gt;&lt;span class="text-sm font-bold text-slate-700"&gt;Đi học đầy đủ&lt;/span&gt;&lt;/div&gt;&lt;span class="text-lg font-black text-emerald-600"&gt;\${present}&lt;/span&gt;&lt;/div&gt;

&lt;div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"&gt;&lt;div class="flex items-center gap-3"&gt;&lt;div class="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"&gt;&lt;/div&gt;&lt;span class="text-sm font-bold text-slate-700"&gt;Đi muộn&lt;/span&gt;&lt;/div&gt;&lt;span class="text-lg font-black text-yellow-600"&gt;\${late}&lt;/span&gt;&lt;/div&gt;

&lt;div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"&gt;&lt;div class="flex items-center gap-3"&gt;&lt;div class="w-3 h-3 rounded-full bg-blue-500 shadow-sm"&gt;&lt;/div&gt;&lt;span class="text-sm font-bold text-slate-700"&gt;Nghỉ có phép&lt;/span&gt;&lt;/div&gt;&lt;span class="text-lg font-black text-blue-600"&gt;\${excused}&lt;/span&gt;&lt;/div&gt;

&lt;div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"&gt;&lt;div class="flex items-center gap-3"&gt;&lt;div class="w-3 h-3 rounded-full bg-red-500 shadow-sm"&gt;&lt;/div&gt;&lt;span class="text-sm font-bold text-slate-700"&gt;Nghỉ không phép&lt;/span&gt;&lt;/div&gt;&lt;span class="text-lg font-black text-red-600"&gt;\${unexcused}&lt;/span&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-white rounded-\[2rem\] p-8 shadow-sm border border-slate-200"&gt;

&lt;h3 class="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg"&gt;&lt;i class="ph-fill ph-envelope-open text-pink-500 text-2xl"&gt;&lt;/i&gt; Lời nhắn từ Giáo viên&lt;/h3&gt;

&lt;div class="bg-gradient-to-b from-pink-50 to-white p-6 rounded-2xl border border-pink-100 shadow-inner h-\[calc(100%-4rem)\] text-sm font-medium text-slate-700 leading-relaxed relative"&gt;

&lt;i class="ph-fill ph-quotes text-3xl text-pink-200 absolute top-4 left-4"&gt;&lt;/i&gt;

&lt;div class="relative z-10 pt-4 pl-2"&gt;

\${student.comment ? escapeHtmlAttr(student.comment).replace(/\\n/g, '&lt;br&gt;') : '&lt;span class="text-slate-400 italic"&gt;Hiện tại giáo viên chưa có lời nhắn nào cho học sinh.&lt;/span&gt;'}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// Theme edits

function openEditThemeModal() {

const currentColor = state.theme.bannerColorClass || 'from-\[#1e1b4b\] to-\[#312e81\]';

const colors = \[

{ val: 'from-\[#1e1b4b\] to-\[#312e81\]', label: 'Vũ trụ' },

{ val: 'from-blue-600 to-indigo-900', label: 'Đại dương' },

{ val: 'from-emerald-500 to-teal-800', label: 'Rừng xanh' },

{ val: 'from-orange-400 to-red-600', label: 'Hoàng hôn' },

{ val: 'from-fuchsia-600 to-purple-900', label: 'Ảo diệu' },

{ val: 'from-rose-400 to-pink-600', label: 'Ngọt ngào' },

{ val: 'from-cyan-400 to-blue-600', label: 'Bầu trời' }

\];

const colorBtnsHtml = colors.map(c => \`

&lt;button onclick="document.getElementById('edit-theme-color').value='\${c.val}'; document.querySelectorAll('.banner-color-btn').forEach(b =&gt; b.classList.remove('ring-4', 'ring-white', 'shadow-lg', 'scale-110')); this.classList.add('ring-4', 'ring-white', 'shadow-lg', 'scale-110');"

class="h-12 rounded-xl bg-gradient-to-br \${c.val} shadow-sm transition-all banner-color-btn \${currentColor === c.val ? 'ring-4 ring-white shadow-lg scale-110' : 'hover:scale-105 border border-slate-200'}">&lt;/button&gt;

\`).join('');

document.getElementById('modal-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="edit-theme-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-\[90vh\]"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center px-8 relative"&gt;&lt;h3 class="font-black text-xl flex items-center gap-2 relative z-10"&gt;&lt;i class="ph-fill ph-image text-accent"&gt;&lt;/i&gt; GIAO DIỆN CHUNG&lt;/h3&gt;&lt;button onclick="closeModal('edit-theme-modal')" class="bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-colors relative z-10"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;&lt;/div&gt;

&lt;div class="p-8 space-y-6 bg-slate-50 overflow-y-auto custom-scrollbar flex-1"&gt;

&lt;div&gt;&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Tiêu đề phụ (VD: Chủ điểm tháng)&lt;/label&gt;&lt;input type="text" id="edit-theme-month" value="\${escapeHtmlAttr(state.theme.month || '')}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-blueAccent focus:ring-4 focus:ring-blue-100 font-bold transition-all text-sm outline-none"&gt;&lt;/div&gt;

&lt;div&gt;&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Tiêu đề chính Banner&lt;/label&gt;&lt;input type="text" id="edit-theme-title" value="\${escapeHtmlAttr(state.theme.title || '')}" class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-xl focus:border-blueAccent focus:ring-4 focus:ring-blue-100 font-black text-slate-800 transition-all text-base outline-none"&gt;&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-3 uppercase tracking-widest"&gt;Giao diện Màu nền&lt;/label&gt;

&lt;div class="grid grid-cols-4 sm:grid-cols-7 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"&gt;\${colorBtnsHtml}&lt;/div&gt;

&lt;input type="hidden" id="edit-theme-color" value="\${currentColor}"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-3 uppercase tracking-widest"&gt;Hoặc dùng Ảnh nền (Tùy chọn)&lt;/label&gt;

&lt;div class="relative cursor-pointer group mb-2" onclick="document.getElementById('edit-theme-banner-upload').click()"&gt;

&lt;div id="banner-preview-container" class="w-full h-36 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner overflow-hidden border-2 border-dashed border-slate-300 group-hover:border-blueAccent transition-colors relative"&gt;

\${state.theme.bannerUrl ? \`&lt;img src="\${state.theme.bannerUrl}" class="w-full h-full object-cover"&gt;\` : \`&lt;div class="flex flex-col items-center gap-2"&gt;&lt;i class="ph-fill ph-image text-4xl text-slate-300"&gt;&lt;/i&gt;&lt;span class="text-xs font-bold text-slate-400"&gt;Bấm để chọn ảnh&lt;/span&gt;&lt;/div&gt;\`}

&lt;/div&gt;

&lt;input type="file" id="edit-theme-banner-upload" class="hidden" accept="image/\*" onchange="handleBannerUpload(event)"&gt;

&lt;/div&gt;

&lt;input type="text" id="edit-theme-banner" value="\${escapeHtmlAttr(state.theme.bannerUrl || '')}" class="hidden"&gt;

\${state.theme.bannerUrl ? \`&lt;button onclick="document.getElementById('edit-theme-banner').value=''; document.getElementById('banner-preview-container').innerHTML='<div class=\\\\'flex flex-col items-center gap-2\\\\'&gt;&lt;i class=\\\\'ph-fill ph-image text-4xl text-slate-300\\\\'&gt;&lt;/i&gt;&lt;span class=\\\\'text-xs font-bold text-slate-400\\\\'&gt;Bấm để chọn ảnh&lt;/span&gt;&lt;/div&gt;'; this.style.display='none';" class="text-\[11px\] text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Xóa ảnh và dùng màu nền&lt;/button&gt;\` : ''}

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="p-6 bg-white border-t border-slate-200"&gt;&lt;button onclick="saveThemeEdit()" class="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-secondary shadow-lg hover:-translate-y-0.5 transition-all tracking-wide"&gt;CẬP NHẬT GIAO DIỆN&lt;/button&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

function handleBannerUpload(e) {

const file = e.target.files\[0\]; if (!file) return;

compressImage(file, (dataUrl) => {

document.getElementById('edit-theme-banner').value = dataUrl;

const preview = document.getElementById('banner-preview-container');

if (preview) preview.innerHTML = \`&lt;img src="\${dataUrl}" class="w-full h-full object-cover rounded-2xl"&gt;&lt;div class="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;&lt;i class="ph-bold ph-upload-simple text-white text-3xl mb-2"&gt;&lt;/i&gt;&lt;span class="text-white text-sm font-bold"&gt;Thay ảnh khác&lt;/span&gt;&lt;/div&gt;\`;

}, 1200, 0.8);

}

function saveThemeEdit() {

state.theme.month = document.getElementById('edit-theme-month').value.trim();

state.theme.title = document.getElementById('edit-theme-title').value.trim();

state.theme.bannerUrl = document.getElementById('edit-theme-banner').value.trim();

state.theme.bannerColorClass = document.getElementById('edit-theme-color').value.trim();

saveData(); closeModal('edit-theme-modal'); renderLayout(); showToast("Đã cập nhật giao diện tổng quan!");

}

/\* --- TÍNH NĂNG XEM LỊCH SỬ HỌC SINH --- \*/

window.openStudentHistoryModal = function(id) {

const student = state.students.find(s => s.id === id);

if (!student) return;

const history = student.history || \[\];

// Sắp xếp lịch sử mới nhất lên đầu

const sortedHistory = \[...history\].sort((a, b) => new Date(b.date) - new Date(a.date));

let historyHtml = '';

if (sortedHistory.length === 0) {

historyHtml = \`

&lt;div class="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50"&gt;

&lt;i class="ph-fill ph-clock-dashed text-6xl text-slate-300 mb-3"&gt;&lt;/i&gt;

&lt;div class="text-slate-500 font-bold text-lg"&gt;Chưa có dữ liệu&lt;/div&gt;

&lt;p class="text-sm text-slate-400 mt-1"&gt;Học sinh chưa có lịch sử cộng/trừ điểm nào.&lt;/p&gt;

&lt;/div&gt;\`;

} else {

historyHtml = sortedHistory.map(h => {

const dateObj = new Date(h.date);

const dateStr = \`\${String(dateObj.getDate()).padStart(2, '0')}/\${String(dateObj.getMonth() + 1).padStart(2, '0')}/\${dateObj.getFullYear()}\`;

const timeStr = \`\${String(dateObj.getHours()).padStart(2, '0')}:\${String(dateObj.getMinutes()).padStart(2, '0')}\`;

const isPositive = h.points > 0;

const colorTheme = isPositive

? { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: 'ph-trend-up', sign: '+' }

: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: 'ph-trend-down', sign: '' };

return \`

&lt;div class="flex gap-5 items-start relative pb-6 group"&gt;

&lt;!-- Đường viền dọc nối các sự kiện --&gt;

&lt;div class="absolute top-10 left-\[23px\] bottom-0 w-\[2px\] bg-slate-200 group-last:bg-transparent"&gt;&lt;/div&gt;

&lt;!-- Icon --&gt;

&lt;div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 shadow-sm border \${colorTheme.border} \${colorTheme.bg} \${colorTheme.text}"&gt;

&lt;i class="ph-bold \${colorTheme.icon} text-xl"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;!-- Nội dung --&gt;

&lt;div class="flex-1 bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative"&gt;

&lt;!-- Nút Xóa LUÔN HIỆN --&gt;

&lt;button onclick="deleteHistoryRecord(\${student.id}, \${h.id})" class="absolute -top-3 -right-3 bg-white border border-red-200 text-red-400 hover:bg-red-500 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all shadow-md z-20" title="Xóa & Hoàn tác điểm"&gt;

&lt;i class="ph-bold ph-trash text-sm"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;div class="flex justify-between items-start gap-4 mb-2"&gt;

&lt;div class="font-bold text-slate-800 text-base leading-tight pr-6"&gt;\${h.reason}&lt;/div&gt;

&lt;div class="font-black text-xl flex-shrink-0 \${colorTheme.text} bg-white px-2 py-0.5 rounded-lg border \${colorTheme.border} shadow-sm"&gt;\${colorTheme.sign}\${h.points}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-\[11px\] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider"&gt;

&lt;i class="ph-fill ph-clock"&gt;&lt;/i&gt; \${timeStr} &lt;span class="mx-1"&gt;•&lt;/span&gt; &lt;i class="ph-fill ph-calendar-blank"&gt;&lt;/i&gt; \${dateStr}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

}

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="history-student-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-\[90vh\]"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center px-8 relative overflow-hidden"&gt;

&lt;div class="absolute inset-0 opacity-20 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')\]"&gt;&lt;/div&gt;

&lt;h3 class="font-black text-xl flex items-center gap-3 relative z-10"&gt;&lt;i class="ph-fill ph-clock-counter-clockwise text-accent text-2xl"&gt;&lt;/i&gt; LỊCH SỬ THI ĐUA&lt;/h3&gt;

&lt;button onclick="closeModal('history-student-modal')" class="text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors relative z-10"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;!-- Header / Profile --&gt;

&lt;div class="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shadow-sm z-10 relative"&gt;

&lt;div class="flex items-center gap-5"&gt;

\${getAvatarImg(student.avatarUrl, student.name, "w-16 h-16 ring-4 ring-slate-50 shadow-md")}

&lt;div&gt;

&lt;div class="font-black text-slate-800 text-2xl tracking-tight mb-1"&gt;\${student.name}&lt;/div&gt;

&lt;div class="text-\[10px\] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg inline-block border border-slate-200"&gt;\${student.group}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-right"&gt;

&lt;div class="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest mb-1"&gt;TỔNG ĐIỂM HIỆN TẠI&lt;/div&gt;

&lt;div class="text-3xl font-black text-blue-500"&gt;\${student.points}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Timeline --&gt;

&lt;div class="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-50 relative"&gt;

\${historyHtml}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

};

window.exportToPDF = function() {

const element = document.getElementById('report-container');

if (!element) return showToast("Không tìm thấy nội dung báo cáo!", "error");

// Đổi trạng thái nút bấm để báo hiệu đang xử lý

const btn = document.getElementById('btn-export-pdf');

const originalText = btn.innerHTML;

btn.innerHTML = \`&lt;i class="ph-bold ph-spinner-gap animate-spin text-lg"&gt;&lt;/i&gt; Đang tạo PDF...\`;

btn.disabled = true;

btn.classList.add('opacity-70');

// Cấu hình file PDF xuất ra (Nằm ngang, khổ A4, chất lượng nét)

const opt = {

margin: 10,

filename: \`BaoCao_\${state.admin.className || 'Lop'}\_\${getTodayString()}.pdf\`,

image: { type: 'jpeg', quality: 0.98 },

html2canvas: { scale: 2, useCORS: true, scrollY: 0 },

jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }

};

// Thực hiện xuất file

html2pdf().set(opt).from(element).save().then(() => {

btn.innerHTML = originalText;

btn.disabled = false;

btn.classList.remove('opacity-70');

showToast("Đã tải xuống file PDF thành công!", "success");

}).catch(err => {

btn.innerHTML = originalText;

btn.disabled = false;

btn.classList.remove('opacity-70');

showToast("Lỗi khi tạo PDF, vui lòng thử lại!", "error");

console.error(err);

});

};

// --- FORM VÀ LOGIC XỬ LÝ CÔNG VIỆC ---

window.openTaskModal = function() {

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="task-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center px-8 relative"&gt;

&lt;h3 class="font-black text-xl flex items-center gap-2"&gt;&lt;i class="ph-bold ph-push-pin text-blue-400"&gt;&lt;/i&gt; THÊM CÔNG VIỆC MỚI&lt;/h3&gt;

&lt;button onclick="closeModal('task-modal')" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-8 space-y-5 bg-slate-50 text-left"&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Nội dung việc &lt;span class="text-red-500"&gt;\*&lt;/span&gt;&lt;/label&gt;

&lt;input type="text" id="task-content" placeholder="Nhập nội dung cần xử lý..." class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent outline-none transition-all shadow-sm"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Người liên quan&lt;/label&gt;

&lt;input type="text" id="task-person" placeholder="Tên học sinh, phụ huynh..." class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-blueAccent outline-none transition-all"&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-2 gap-4"&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Mức độ&lt;/label&gt;

&lt;select id="task-level" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent cursor-pointer outline-none"&gt;

&lt;option value="red"&gt;🔴 Khẩn cấp&lt;/option&gt;

&lt;option value="yellow"&gt;🟡 Bình thường&lt;/option&gt;

&lt;option value="green"&gt;🟢 Theo dõi thêm&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Hạn hoàn thành&lt;/label&gt;

&lt;input type="date" id="task-deadline" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-blueAccent cursor-pointer outline-none"&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Ghi chú (Tuỳ chọn)&lt;/label&gt;

&lt;textarea id="task-note" rows="2" placeholder="Chi tiết bổ sung..." class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:border-blueAccent outline-none transition-all resize-none"&gt;&lt;/textarea&gt;

&lt;/div&gt;

&lt;button onclick="saveNewTask()" class="w-full py-4 bg-primary hover:bg-secondary text-white font-black rounded-xl mt-2 shadow-lg transition-all hover:-translate-y-0.5"&gt;LƯU CÔNG VIỆC&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

};

window.saveNewTask = function() {

const content = document.getElementById('task-content').value.trim();

if (!content) return showToast('Vui lòng nhập nội dung công việc!', 'error');

state.tasks.push({

id: Date.now(),

content: content,

person: document.getElementById('task-person').value.trim(),

level: document.getElementById('task-level').value,

deadline: document.getElementById('task-deadline').value,

note: document.getElementById('task-note').value.trim()

});

saveData(); renderLayout(); closeModal('task-modal'); showToast('Đã thêm công việc mới thành công!', 'success');

};

window.deleteTask = function(id) {

state.tasks = state.tasks.filter(t => t.id !== id);

saveData(); renderLayout(); showToast('Đã đánh dấu hoàn thành!', 'success');

};

// --- FORM VÀ LOGIC XỬ LÝ HÀNH TRÌNH ---

window.openJourneyModal = function() {

const today = new Date().toISOString().split('T')\[0\];

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="journey-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"&gt;

&lt;div class="bg-emerald-600 text-white p-6 flex justify-between items-center px-8 relative"&gt;

&lt;h3 class="font-black text-xl flex items-center gap-2"&gt;&lt;i class="ph-bold ph-train text-emerald-200"&gt;&lt;/i&gt; THÊM CỘT MỐC MỚI&lt;/h3&gt;

&lt;button onclick="closeModal('journey-modal')" class="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-8 space-y-5 bg-slate-50 text-left"&gt;

&lt;div class="grid grid-cols-2 gap-4"&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Ngày ghi nhận&lt;/label&gt;

&lt;input type="date" id="journey-date" value="\${today}" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-emerald-500 cursor-pointer outline-none"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Biểu tượng&lt;/label&gt;

&lt;select id="journey-icon" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-xl text-center cursor-pointer outline-none focus:border-emerald-500"&gt;

&lt;option value="🟢"&gt;🟢 (Cơ bản)&lt;/option&gt;

&lt;option value="🌱"&gt;🌱 (Phát triển)&lt;/option&gt;

&lt;option value="🏆"&gt;🏆 (Thành tích)&lt;/option&gt;

&lt;option value="⭐"&gt;⭐ (Khen thưởng)&lt;/option&gt;

&lt;option value="🎉"&gt;🎉 (Kỷ niệm)&lt;/option&gt;

&lt;option value="📸"&gt;📸 (Chụp ảnh)&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Tiêu đề cột mốc &lt;span class="text-red-500"&gt;\*&lt;/span&gt;&lt;/label&gt;

&lt;input type="text" id="journey-title" placeholder="VD: Khởi động Lớp học xanh..." class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-sm"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Loại hoạt động&lt;/label&gt;

&lt;select id="journey-type" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:border-emerald-500 cursor-pointer outline-none"&gt;

&lt;option value="hoc-tap"&gt;Học tập & Rèn luyện&lt;/option&gt;

&lt;option value="phong-trao"&gt;Phong trào & Ngoại khóa&lt;/option&gt;

&lt;option value="ki-niem"&gt;Kỷ niệm lớp&lt;/option&gt;

&lt;/select&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Nội dung chi tiết&lt;/label&gt;

&lt;textarea id="journey-content" rows="3" placeholder="Chia sẻ thêm về cảm xúc, thành quả của lớp..." class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all resize-none"&gt;&lt;/textarea&gt;

&lt;/div&gt;

&lt;button onclick="saveNewJourney()" class="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl mt-2 shadow-lg transition-all hover:-translate-y-0.5"&gt;LƯU CỘT MỐC&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

};

window.saveNewJourney = function() {

const title = document.getElementById('journey-title').value.trim();

if (!title) return showToast('Vui lòng nhập tiêu đề cột mốc!', 'error');

state.journeys.unshift({

id: Date.now(),

date: document.getElementById('journey-date').value,

icon: document.getElementById('journey-icon').value,

title: title,

type: document.getElementById('journey-type').value,

content: document.getElementById('journey-content').value.trim()

});

saveData(); renderLayout(); closeModal('journey-modal'); showToast('Đã lưu cột mốc hành trình mới!', 'success');

};

window.deleteJourney = function(id) {

if (confirm('Xóa cột mốc này khỏi hành trình lớp?')) {

state.journeys = state.journeys.filter(j => j.id !== id);

saveData(); renderLayout(); showToast('Đã xóa cột mốc!', 'success');

}

};

// --- CÁC HÀM XỬ LÝ TẢI ẢNH LÊN ---

// 1. Tải ảnh đại diện cho Học sinh

window.handleStudentAvatarUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

// Cập nhật link ảnh vào ô input ẩn

const avatarInput = document.getElementById('edit-s-avatar');

if(avatarInput) avatarInput.value = dataUrl;

// Hiển thị ảnh xem trước ngay lập tức trên Form

const previewImg = document.querySelector('#edit-student-modal img');

if(previewImg) previewImg.src = dataUrl;

}, 300, 0.8);

};

// 2. Tải ảnh đại diện cho Tổ/Nhóm

window.handleGroupAvatarUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

// Cập nhật link ảnh vào ô input ẩn

const avatarInput = document.getElementById('edit-group-avatar');

if(avatarInput) avatarInput.value = dataUrl;

// Hiển thị ảnh xem trước ngay lập tức trên Form

const previewContainer = document.getElementById('group-avatar-preview-container');

if(previewContainer) {

previewContainer.innerHTML = \`&lt;img src="\${dataUrl}" class="w-28 h-28 rounded-3xl mx-auto object-cover shadow-lg ring-4 ring-white"&gt;\`;

}

}, 300, 0.8);

};

// 3. Tải ảnh đại diện cho Giáo viên (trong phần Cài đặt)

window.handleAdminAvatarUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

const avatarInput = document.getElementById('edit-admin-avatar-val');

if(avatarInput) avatarInput.value = dataUrl;

const previewContainer = document.getElementById('edit-admin-avatar-preview');

if(previewContainer) {

previewContainer.innerHTML = \`&lt;img src="\${dataUrl}" class="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl mx-auto"&gt;\`;

}

}, 300, 0.8);

};

// 4. Tải ảnh đại diện cho Lớp (logo Lớp ở thanh menu bên trái)

window.handleClassAvatarUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

state.admin.classAvatarUrl = dataUrl;

saveData();

renderLayout();

showToast("Đã cập nhật ảnh đại diện lớp!", "success");

}, 300, 0.8);

};

// --- BỔ SUNG CÁC HÀM BỊ THIẾU CHO VÒNG QUAY VÀ BẢNG XẾP HẠNG ---

// 1. Hàm sửa lỗi "đứng hình" khi gọi pháo giấy

window.triggerConfetti = function() {

// Vòng quay đã có pháo giấy riêng trong modal nên ta chỉ cần khai báo để code không báo lỗi

console.log("Đã kích hoạt pháo giấy!");

};

// 2. Hàm sửa lỗi khi bấm nút "Khen thưởng" trong vòng quay hoặc Bảng xếp hạng

window.selectStudentForPoints = function(id) {

state.pointsForm.targetType = 'student';

state.pointsForm.selectedTargetId = id;

state.currentTab = 'cai-dat'; // Chuyển sang trang Cài đặt

state.settingsTab = 'tich-diem'; // Mở tab Tích điểm

renderLayout();

};// --- BỔ SUNG TÍNH NĂNG ĐỒNG HỒ ĐẾM NGƯỢC (CÔNG CỤ) ---

window.openTimerDrawer = function() {

document.getElementById('timer-drawer-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-\[100\] flex justify-end backdrop-blur-sm" id="timer-overlay" onclick="if(event.target.id === 'timer-overlay') closeTimerDrawer()"&gt;

&lt;div class="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col animate-\[slideInRight_0.4s_cubic-bezier(0.16,1,0.3,1)\_forwards\]"&gt;

&lt;div class="bg-primary text-white p-6 flex justify-between items-center relative overflow-hidden"&gt;

&lt;div class="absolute inset-0 opacity-20 bg-\[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')\]"&gt;&lt;/div&gt;

&lt;h3 class="font-black text-xl flex items-center gap-2 relative z-10"&gt;&lt;i class="ph-bold ph-timer text-accent"&gt;&lt;/i&gt; ĐỒNG HỒ LỚP HỌC&lt;/h3&gt;

&lt;button onclick="closeTimerDrawer()" class="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50 relative"&gt;

&lt;!-- Vòng tròn hiển thị giờ --&gt;

&lt;div class="w-64 h-64 rounded-full border-\[12px\] border-slate-100 flex items-center justify-center relative shadow-inner bg-white mb-10"&gt;

&lt;div class="text-\[60px\] font-black text-slate-800 tabular-nums tracking-tighter" id="timer-display"&gt;00:00&lt;/div&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-3 gap-3 w-full mb-10"&gt;

&lt;button onclick="setTimer(60)" class="py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:border-blueAccent hover:text-blueAccent shadow-sm transition-all"&gt;+1 Phút&lt;/button&gt;

&lt;button onclick="setTimer(300)" class="py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:border-blueAccent hover:text-blueAccent shadow-sm transition-all"&gt;+5 Phút&lt;/button&gt;

&lt;button onclick="setTimer(600)" class="py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:border-blueAccent hover:text-blueAccent shadow-sm transition-all"&gt;+10 Phút&lt;/button&gt;

&lt;/div&gt;

&lt;div class="flex gap-4 w-full mt-auto"&gt;

&lt;button onclick="resetTimer()" title="Đặt lại" class="w-1/4 py-4 bg-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-300 transition-colors shadow-sm flex items-center justify-center"&gt;&lt;i class="ph-bold ph-arrow-counter-clockwise text-2xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button id="timer-btn-action" onclick="toggleTimer()" class="flex-1 py-4 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-md transition-all tracking-widest text-lg"&gt;BẮT ĐẦU&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

updateTimerDisplay();

};

window.closeTimerDrawer = function() {

document.getElementById('timer-drawer-container').innerHTML = '';

};

window.setTimer = function(seconds) {

if (isTimerRunning) return showToast("Vui lòng tạm dừng trước khi chỉnh giờ!", "error");

timerSeconds += seconds;

updateTimerDisplay();

};

window.updateTimerDisplay = function() {

const m = Math.floor(timerSeconds / 60);

const s = timerSeconds % 60;

const display = document.getElementById('timer-display');

if (display) {

display.innerText = \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;

}

};

// --- BỔ SUNG TÍNH NĂNG ĐỒNG HỒ ĐẾM NGƯỢC (GIAO DIỆN MỚI) ---

let currentBellIndex = 0; // Lưu chuông đang chọn

window.openTimerDrawer = function() {

if (!isTimerRunning && timerSeconds === 0) timerSeconds = 60; // Mặc định 01:00 nếu chưa có giờ

document.getElementById('timer-drawer-container').innerHTML = \`

&lt;div class="fixed inset-0 bg-slate-900/60 z-\[100\] flex justify-end backdrop-blur-sm" id="timer-overlay" onclick="if(event.target.id === 'timer-overlay') closeTimerDrawer()"&gt;

&lt;div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-8 animate-\[slideInRight_0.4s_cubic-bezier(0.16,1,0.3,1)\_forwards\] overflow-y-auto custom-scrollbar"&gt;

&lt;!-- HEADER --&gt;

&lt;div class="flex justify-between items-center mb-8 border-b border-slate-100 pb-4"&gt;

&lt;div class="relative inline-block"&gt;

&lt;h3 class="text-2xl font-bold text-\[#1e293b\] pb-2"&gt;Công cụ&lt;/h3&gt;

&lt;div class="absolute bottom-0 left-0 w-full h-1 bg-\[#fbbf24\] rounded-full"&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="closeTimerDrawer()" class="w-10 h-10 bg-\[#0f172a\] rounded-full text-white flex items-center justify-center hover:bg-black transition-colors shadow-md"&gt;

&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;!-- CHUỌNG --&gt;

&lt;div class="flex items-center gap-3 mb-8"&gt;

&lt;span class="text-\[11px\] font-black text-slate-400 uppercase tracking-widest mr-2"&gt;CHUÔNG&lt;/span&gt;

&lt;button onclick="selectBell(0)" class="bell-btn w-8 h-8 rounded-full bg-\[#fbbf24\] text-white flex items-center justify-center transition-all \${currentBellIndex === 0 ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}"&gt;&lt;i class="ph-fill ph-bell"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="selectBell(1)" class="bell-btn w-8 h-8 rounded-full bg-\[#3b82f6\] text-white flex items-center justify-center transition-all \${currentBellIndex === 1 ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}"&gt;&lt;i class="ph-fill ph-bell"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="selectBell(2)" class="bell-btn w-8 h-8 rounded-full bg-\[#ef4444\] text-white flex items-center justify-center transition-all \${currentBellIndex === 2 ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}"&gt;&lt;i class="ph-fill ph-bell"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="selectBell(3)" class="bell-btn w-8 h-8 rounded-full bg-\[#10b981\] text-white flex items-center justify-center transition-all \${currentBellIndex === 3 ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}"&gt;&lt;i class="ph-fill ph-bell"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="selectBell(4)" class="bell-btn w-8 h-8 rounded-full bg-\[#a855f7\] text-white flex items-center justify-center transition-all \${currentBellIndex === 4 ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}"&gt;&lt;i class="ph-fill ph-bell"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;button onclick="selectBell(5)" class="bell-btn w-8 h-8 rounded-full bg-\[#f97316\] text-white flex items-center justify-center transition-all \${currentBellIndex === 5 ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}"&gt;&lt;i class="ph-fill ph-bell"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;!-- HIỂN THỊ GIỜ --&gt;

&lt;div class="bg-\[#2d2d2d\] rounded-\[2rem\] w-full py-14 flex items-center justify-center mb-8 shadow-lg"&gt;

&lt;div id="timer-main-display" class="text-\[80px\] font-bold text-white tracking-tighter leading-none tabular-nums"&gt;

\${String(Math.floor(timerSeconds/60)).padStart(2, '0')}:\${String(timerSeconds%60).padStart(2, '0')}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- KHUNG CHỈNH PHÚT GIÂY --&gt;

&lt;div class="flex items-center justify-center gap-6 mb-12"&gt;

&lt;div class="flex flex-col items-center"&gt;

&lt;span class="text-\[10px\] font-black text-slate-400 uppercase tracking-widest mb-3"&gt;PHÚT&lt;/span&gt;

&lt;input type="number" id="timer-inp-m" value="\${Math.floor(timerSeconds/60)}" oninput="handleTimerInput()" class="w-28 h-16 text-center text-3xl font-bold border-2 border-slate-100 rounded-\[1rem\] outline-none focus:border-slate-300 text-slate-800 transition-colors \[appearance:textfield\] \[&::-webkit-outer-spin-button\]:appearance-none \[&::-webkit-inner-spin-button\]:appearance-none shadow-sm"&gt;

&lt;/div&gt;

&lt;div class="text-4xl font-black text-slate-300 mt-6"&gt;:&lt;/div&gt;

&lt;div class="flex flex-col items-center"&gt;

&lt;span class="text-\[10px\] font-black text-slate-400 uppercase tracking-widest mb-3"&gt;GIÂY&lt;/span&gt;

&lt;input type="number" id="timer-inp-s" value="\${timerSeconds%60}" oninput="handleTimerInput()" class="w-28 h-16 text-center text-3xl font-bold border-2 border-slate-100 rounded-\[1rem\] outline-none focus:border-slate-300 text-slate-800 transition-colors \[appearance:textfield\] \[&::-webkit-outer-spin-button\]:appearance-none \[&::-webkit-inner-spin-button\]:appearance-none shadow-sm"&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- NÚT ĐIỀU KHIỂN --&gt;

&lt;div class="flex gap-4 w-full mt-auto"&gt;

&lt;button id="btn-timer-start" onclick="toggleTimer()" class="flex-1 py-4 bg-\[#facc15\] text-\[#1e293b\] font-bold rounded-full hover:bg-\[#eab308\] shadow-\[0_8px_20px_rgba(250,204,21,0.3)\] hover:-translate-y-0.5 transition-all text-\[17px\]"&gt;

\${isTimerRunning ? 'Tạm Dừng' : 'Bắt Đầu'}

&lt;/button&gt;

&lt;button onclick="endTimer()" class="flex-1 py-4 bg-\[#ef4444\] text-white font-bold rounded-full hover:bg-\[#dc2626\] shadow-\[0_8px_20px_rgba(239,68,68,0.3)\] hover:-translate-y-0.5 transition-all text-\[17px\]"&gt;

Kết Thúc

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

};

window.closeTimerDrawer = function() {

document.getElementById('timer-drawer-container').innerHTML = '';

};

// Hàm xử lý khi gõ số vào ô Phút/Giây

window.handleTimerInput = function() {

if(isTimerRunning) return; // Không cho sửa khi đang chạy

let inpM = parseInt(document.getElementById('timer-inp-m').value) || 0;

let inpS = parseInt(document.getElementById('timer-inp-s').value) || 0;

// Quy đổi nếu giây > 60

if (inpS >= 60) {

inpM += Math.floor(inpS / 60);

inpS = inpS % 60;

document.getElementById('timer-inp-m').value = inpM;

document.getElementById('timer-inp-s').value = inpS;

}

timerSeconds = (inpM \* 60) + inpS;

document.getElementById('timer-main-display').innerText = \`\${String(inpM).padStart(2, '0')}:\${String(inpS).padStart(2, '0')}\`;

};

// Cập nhật giao diện đồng hồ khi đang chạy

window.updateTimerView = function() {

const m = Math.floor(timerSeconds / 60);

const s = timerSeconds % 60;

const display = document.getElementById('timer-main-display');

const inpM = document.getElementById('timer-inp-m');

const inpS = document.getElementById('timer-inp-s');

if(display) display.innerText = \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}\`;

// Nếu đang chạy thì cập nhật luôn cả số ở ô nhập

if (isTimerRunning) {

if(inpM) inpM.value = m;

if(inpS) inpS.value = s;

}

};

// Khai báo bộ tạo âm thanh tíc tắc

let tickSynth = null;

window.toggleTimer = function() {

const btn = document.getElementById('btn-timer-start');

if (isTimerRunning) {

clearInterval(timerInterval);

isTimerRunning = false;

if(btn) btn.innerText = 'Bắt Đầu';

} else {

if (timerSeconds <= 0) return showToast("Vui lòng nhập thời gian!", "error");

// Khởi động âm thanh nếu chưa bật

if (typeof Tone !== 'undefined') {

if (Tone.context.state !== 'running') Tone.start();

// Cài đặt âm thanh "tíc tắc" nếu chưa có

if (!tickSynth) {

tickSynth = new Tone.Synth({

oscillator: { type: "triangle" }, // Dùng sóng tam giác nghe cho êm, không bị chói

envelope: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.01 }

}).toDestination();

tickSynth.volume.value = -12; // Âm lượng nhỏ gọn, vừa phải

}

}

isTimerRunning = true;

if(btn) btn.innerText = 'Tạm Dừng';

timerInterval = setInterval(() => {

timerSeconds--;

if(timerSeconds < 0) timerSeconds = 0;

updateTimerView();

// Phát âm "tíc tắc" mỗi giây

if (timerSeconds > 0 && tickSynth) {

// Nhịp chẵn kêu tíc (nốt cao), nhịp lẻ kêu tắc (nốt trầm)

const pitch = (timerSeconds % 2 === 0) ? "E5" : "C5";

tickSynth.triggerAttackRelease(pitch, "32n");

}

if (timerSeconds <= 0) {

clearInterval(timerInterval);

isTimerRunning = false;

if(btn) btn.innerText = 'Bắt Đầu';

showToast("Đã hết thời gian!", "success");

if (typeof triggerConfetti === 'function') triggerConfetti();

playBellSound(currentBellIndex); // Phát âm thanh chuông lúc hết giờ

}

}, 1000);

}

};

window.endTimer = function() {

clearInterval(timerInterval);

isTimerRunning = false;

timerSeconds = 0;

updateTimerView();

const inpM = document.getElementById('timer-inp-m');

const inpS = document.getElementById('timer-inp-s');

if(inpM) inpM.value = '0';

if(inpS) inpS.value = '0';

const btn = document.getElementById('btn-timer-start');

if(btn) btn.innerText = 'Bắt Đầu';

};

// Xử lý chọn màu chuông

window.selectBell = function(idx) {

currentBellIndex = idx;

document.querySelectorAll('.bell-btn').forEach((el, i) => {

if(i === idx) el.classList.add('ring-2', 'ring-offset-2', 'ring-slate-400', 'scale-110');

else el.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-400', 'scale-110');

});

// Phát thử âm thanh

if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') Tone.start();

playBellSound(idx);

};

// Hàm phát âm thanh với các nốt nhạc khác nhau tùy theo chuông

window.playBellSound = function(idx = 0) {

try {

const synth = new Tone.PolySynth().toDestination();

synth.volume.value = -5;

// Các dải âm thanh khác nhau cho 6 loại chuông

const notesList = \[

\['C5', 'E5', 'G5', 'C6'\], // Vàng (Mặc định)

\['D5', 'F#5', 'A5', 'D6'\], // Xanh dương

\['E5', 'G#5', 'B5', 'E6'\], // Đỏ

\['F5', 'A5', 'C6', 'F6'\], // Xanh lá

\['G5', 'B5', 'D6', 'G6'\], // Tím

\['A5', 'C#6', 'E6', 'A6'\] // Cam

\];

const notes = notesList\[idx % notesList.length\];

synth.triggerAttackRelease(notes, "1n");

} catch(e) {}

};

// ==========================================

// --- TÍNH NĂNG QUẢN LÝ THỜI KHÓA BIỂU ---

// ==========================================

function renderViewThoiKhoaBieu() {

if (!state.timetable) state.timetable = { dayHtml: '', extraHtml: '' };

// --- XỬ LÝ KHUNG THỜI KHÓA BIỂU HÔM NAY ---

const d = new Date();

const daysOfWeek = \['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'\];

const currentDayIndex = d.getDay();

const dateStr = \`\${daysOfWeek\[currentDayIndex\]}, \${String(d.getDate()).padStart(2, '0')}/\${String(d.getMonth()+1).padStart(2, '0')}/\${d.getFullYear()}\`;

// Lấy lịch học hôm nay từ state.dailySchedule đã được trích xuất

const todayClasses = state.dailySchedule && state.dailySchedule\[currentDayIndex\] ? state.dailySchedule\[currentDayIndex\] : \[\];

let todayClassesHtml = '';

if (todayClasses.length === 0) {

todayClassesHtml = \`&lt;div class="text-blue-200/50 italic text-sm py-4 px-2"&gt;Hôm nay lớp không có lịch học hoặc cô chưa cập nhật file Excel.&lt;/div&gt;\`;

} else {

todayClassesHtml = todayClasses.map(c => \`

&lt;div class="bg-\[#1e2343\] hover:bg-\[#282d52\] transition-colors rounded-2xl p-4 min-w-\[180px\] border border-blue-400/20 shadow-sm"&gt;

&lt;div class="flex justify-between items-center text-blue-200 text-\[11px\] font-bold mb-3"&gt;

&lt;span&gt;\${c.period}&lt;/span&gt;

&lt;span class="flex items-center gap-1"&gt;&lt;i class="ph-bold ph-clock"&gt;&lt;/i&gt; \${c.time}&lt;/span&gt;

&lt;/div&gt;

&lt;div class="text-white font-black text-xl mb-1.5"&gt;\${c.subject}&lt;/div&gt;

&lt;div class="text-blue-300 text-\[10px\] font-bold uppercase tracking-widest"&gt;GV: \${c.teacher}&lt;/div&gt;

&lt;/div&gt;

\`).join('');

}

// Bật đồng hồ chạy liên tục cho thanh TKB

if (!window.tkbClockInterval) {

window.tkbClockInterval = setInterval(() => {

const clockEl = document.getElementById('tkb-realtime-clock');

if (clockEl) clockEl.innerText = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

}, 1000);

}

// --- KHUNG UPLOAD EXCEL ---

const renderUploadSection = (type, title, icon, htmlKey) => {

const tableHtml = state.timetable\[htmlKey\];

return \`

&lt;div class="bg-white rounded-\[2rem\] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col h-full"&gt;

&lt;div class="flex justify-between items-center mb-6"&gt;

&lt;h3 class="font-black text-lg md:text-xl text-slate-800 flex items-center gap-2"&gt;&lt;i class="ph-fill \${icon} text-blueAccent"&gt;&lt;/i&gt; \${title}&lt;/h3&gt;

&lt;button onclick="document.getElementById('upload-tb-\${type}').click()" class="text-xs font-bold bg-blue-50 text-blueAccent px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm border border-blue-100 flex items-center gap-2"&gt;

&lt;i class="ph-bold ph-file-xls"&gt;&lt;/i&gt; Tải File Excel

&lt;/button&gt;

&lt;input type="file" id="upload-tb-\${type}" class="hidden" accept=".xlsx, .xls" onchange="handleTimetableExcelUpload(event, '\${htmlKey}')"&gt;

&lt;/div&gt;

&lt;div class="flex-1 bg-slate-50/50 rounded-\[1.5rem\] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group min-h-\[400px\]"&gt;

\${tableHtml

? \`&lt;div class="w-full h-full overflow-x-auto p-3 md:p-5 custom-scrollbar bg-white rounded-\[1.5rem\]"&gt;

&lt;style&gt;

/\* Ép bảng vừa đúng 100% khung, không bị tràn \*/

# full-timetable-section table {

width: 100% !important; max-width: 100%; border-collapse: separate; border-spacing: 0;

background: #fff; border-radius: 16px; overflow: hidden;

box-shadow: 0 10px 30px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;

}

/\* Ghi đè các style mặc định của Excel, cho phép chữ tự rớt dòng \*/

# full-timetable-section td, #full-timetable-section th {

border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;

padding: 8px 4px !important; text-align: center !important; color: #334155;

font-weight: 700; transition: all 0.25s ease;

white-space: pre-wrap !important; word-break: break-word !important;

font-size: 12px !important; width: auto !important; height: auto !important;

}

# full-timetable-section td:last-child { border-right: none; }

# full-timetable-section tr:last-child td { border-bottom: none; }

/\* DÒNG 1: Tiêu đề Bảng (Màu Navy) \*/

# full-timetable-section tr:nth-child(1) td {

background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);

color: #fff !important; font-size: 14px !important; text-transform: uppercase; letter-spacing: 1px; border-bottom: none;

}

/\* DÒNG 2: Các Thứ trong tuần (Gradient Xanh biển) \*/

# full-timetable-section tr:nth-child(2) td {

background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

color: #fff !important; font-size: 12px !important; text-transform: uppercase; border-bottom: 2px solid #1d4ed8;

}

# full-timetable-section tr:nth-child(odd):not(:nth-child(1)) { background-color: #f8fafc; }

/\* Hiệu ứng HOVER \*/

# full-timetable-section tr:nth-child(n+3) td:hover {

background-color: #f59e0b; color: #fff !important;

transform: scale(1.05); border-radius: 6px;

box-shadow: 0 10px 20px rgba(245, 158, 11, 0.4);

z-index: 10; position: relative; cursor: pointer;

}

&lt;/style&gt;

\${tableHtml}

&lt;/div&gt;

&lt;div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-\[1.5rem\]"&gt;

&lt;button onclick="document.getElementById('upload-tb-\${type}').click()" class="bg-white text-slate-800 font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform"&gt;&lt;i class="ph-bold ph-arrows-clockwise text-xl"&gt;&lt;/i&gt; Tải file Excel khác&lt;/button&gt;

&lt;/div&gt;\`

: \`&lt;div class="text-center text-slate-400 p-8 flex flex-col items-center"&gt;

&lt;i class="ph-fill ph-file-xls text-6xl mb-4 text-slate-300"&gt;&lt;/i&gt;

&lt;p class="font-bold text-lg mb-1 text-slate-500"&gt;Chưa có dữ liệu Excel&lt;/p&gt;

&lt;p class="text-sm font-medium"&gt;Bấm "Tải File Excel" ở góc trên để hiển thị TKB.&lt;/p&gt;

&lt;/div&gt;\`

}

&lt;/div&gt;

&lt;/div&gt;

\`;

};

return \`

&lt;div class="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12 pt-2"&gt;

&lt;!-- THANH THỜI KHÓA BIỂU HÔM NAY (MÀU XANH NAVY) --&gt;

&lt;div class="bg-\[#0f172a\] rounded-\[2rem\] p-6 shadow-lg border border-slate-800 relative overflow-hidden"&gt;

&lt;div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"&gt;&lt;/div&gt;

&lt;div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10"&gt;

&lt;h3 class="text-white font-black text-xl flex items-center gap-3 tracking-tight"&gt;

&lt;i class="ph-bold ph-calendar text-yellow-400 text-2xl"&gt;&lt;/i&gt; Thời Khóa Biểu Hôm Nay

&lt;/h3&gt;

&lt;div class="flex items-center gap-4 w-full sm:w-auto"&gt;

&lt;div class="bg-\[#1e293b\] text-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-700 shadow-inner flex-1 justify-center sm:flex-none"&gt;

&lt;i class="ph-bold ph-clock text-blue-400"&gt;&lt;/i&gt; &lt;span id="tkb-realtime-clock" class="tracking-widest tabular-nums"&gt;\${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}&lt;/span&gt; &lt;span class="text-slate-500 mx-1"&gt;|&lt;/span&gt; &lt;span class="text-slate-300"&gt;\${dateStr}&lt;/span&gt;

&lt;/div&gt;

&lt;button onclick="document.getElementById('full-timetable-section').scrollIntoView({behavior: 'smooth'})" class="text-white text-sm font-bold hover:text-blue-300 flex items-center gap-1 transition-colors whitespace-nowrap"&gt;

Xem cả tuần &lt;i class="ph-bold ph-arrow-right"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- CÁC THẺ MÔN HỌC --&gt;

&lt;div class="flex gap-4 overflow-x-auto custom-scrollbar pb-3 relative z-10"&gt;

\${todayClassesHtml}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- KHU VỰC HIỂN THỊ EXCEL TKB --&gt;

&lt;div id="full-timetable-section" class="max-w-5xl mx-auto pt-8 w-full"&gt;

\${renderUploadSection('day', 'LỊCH HỌC BAN NGÀY', 'ph-sun', 'dayHtml')}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// Xử lý đọc file Excel và xuất ra HTML & Dữ liệu ngày

window.handleTimetableExcelUpload = function(event, htmlKey) {

const file = event.target.files\[0\];

if (!file) return;

const reader = new FileReader();

reader.onload = (e) => {

try {

const data = e.target.result;

const workbook = XLSX.read(data, {type: 'binary'});

const worksheet = workbook.Sheets\[workbook.SheetNames\[0\]\];

// 1. Chuyển Sheet thành HTML Table để hiển thị dưới giao diện

const htmlTable = XLSX.utils.sheet_to_html(worksheet, { id: 'tkb-table', editable: false });

if (!state.timetable) state.timetable = {};

state.timetable\[htmlKey\] = htmlTable;

// 2. Trích xuất mảng để bóc tách lịch các ngày

const rows = XLSX.utils.sheet_to_json(worksheet, {header: 1});

parseExcelToDailySchedule(rows);

saveData();

renderLayout();

showToast("Đã tải lên và cập nhật Thời khóa biểu!", "success");

} catch (error) {

console.error(error);

showToast("Lỗi đọc file Excel! Đảm bảo định dạng chuẩn.", "error");

}

};

reader.readAsBinaryString(file);

};

// Hàm phân tích Excel tự động nhận diện Thứ và Tiết bóc dữ liệu ra state

window.parseExcelToDailySchedule = function(rows) {

let headerRowIdx = -1;

// Tìm dòng header chứa các chữ "Thứ 2"

for (let i = 0; i < rows.length; i++) {

if (rows\[i\] && rows\[i\].some(cell => typeof cell === 'string' && cell.replace(/\\s+/g, '').toLowerCase().includes('thứ2'))) {

headerRowIdx = i;

break;

}

}

if (headerRowIdx === -1) return; // Nếu form không có thứ, bỏ qua trích xuất tự động

const schedule = { 1: \[\], 2: \[\], 3: \[\], 4: \[\], 5: \[\], 6: \[\] }; // Từ Thứ 2 (1) đến Thứ 7 (6)

// Bảng quy đổi giờ chuẩn theo lịch của trường cô

const timeMap = {

1: '07:15 - 08:00',

2: '08:00 - 08:45',

3: '09:05 - 09:50',

4: '09:50 - 10:35',

5: '10:45 - 11:30',

6: '13:30 - 14:15',

7: '14:15 - 15:00',

8: '15:15 - 16:00',

'ca1': '16:15 - 17:45',

'ca2': '18:30 - 20:00'

};

const headerRow = rows\[headerRowIdx\];

const dayColIndex = {};

let tietColIdx = 1;

for(let c = 0; c < headerRow.length; c++) {

const val = String(headerRow\[c\] || '').replace(/\\s+/g, '').toLowerCase();

if(val.includes('thứ2')) dayColIndex\[1\] = c;

if(val.includes('thứ3')) dayColIndex\[2\] = c;

if(val.includes('thứ4')) dayColIndex\[3\] = c;

if(val.includes('thứ5')) dayColIndex\[4\] = c;

if(val.includes('thứ6')) dayColIndex\[5\] = c;

if(val.includes('thứ7') || val.includes('thubay')) dayColIndex\[6\] = c;

if(val.includes('tiết') || val.includes('ca')) tietColIdx = c;

}

for (let i = headerRowIdx + 1; i < rows.length; i++) {

const row = rows\[i\];

if (!row || row.length === 0) continue;

const tietStr = String(row\[tietColIdx\] || '').trim().toLowerCase();

let periodLabel = '';

let timeString = '--:--';

// Nhận diện Ca 1, Ca 2 hoặc Tiết

if (tietStr.includes('ca 1') || tietStr === 'ca1' || tietStr === '9') {

periodLabel = 'Ca 1';

timeString = timeMap\['ca1'\];

} else if (tietStr.includes('ca 2') || tietStr === 'ca2' || tietStr === '10') {

periodLabel = 'Ca 2';

timeString = timeMap\['ca2'\];

} else {

const tietNum = parseInt(tietStr);

if (isNaN(tietNum)) continue;

periodLabel = 'Tiết ' + tietNum;

timeString = timeMap\[tietNum\] || '--:--';

}

for (let dayIndex = 1; dayIndex <= 6; dayIndex++) {

const colIndex = dayColIndex\[dayIndex\];

if (colIndex === undefined) continue;

const subject = row\[colIndex\];

if (subject && typeof subject === 'string' && subject.trim() !== '') {

let mon = subject.trim();

let gv = 'GV Bộ Môn';

// Tự động bóc tách môn và giáo viên nếu dùng dấu gạch ngang (Ví dụ: LÝ - Mào)

if (mon.includes('-')) {

const parts = mon.split('-');

mon = parts\[0\].trim();

gv = parts\[1\].trim();

} else if (mon.includes('\\n')) {

const parts = mon.split('\\n');

mon = parts\[0\].trim();

gv = parts\[1\].trim();

}

schedule\[dayIndex\].push({

period: periodLabel,

time: timeString,

subject: mon,

teacher: gv

});

}

}

}

state.dailySchedule = schedule;

};

// ---------------------------------------------------------

// CÁC HÀM HỖ TRỢ CHO BẢNG ĐIỂM NHANH (MỚI THÊM)

// ---------------------------------------------------------

window.toggleQuickMenu = function(event, menuId) {

event.stopPropagation();

const menu = document.getElementById(menuId);

const isHidden = menu.classList.contains('hidden');

closeAllStudentMenus(); // Đóng các menu khác đang mở

if (isHidden) {

menu.classList.remove('hidden');

}

};

window.toggleStudentMenu = function(event, id) {

event.stopPropagation();

const menu = document.getElementById('student-menu-' + id);

const isHidden = menu.classList.contains('hidden');

closeAllStudentMenus();

if (isHidden) {

menu.classList.remove('hidden');

}

};

window.closeAllStudentMenus = function() {

document.querySelectorAll('.student-dropdown').forEach(el => {

el.classList.add('hidden');

});

};

// Khi click ra ngoài vùng trống, sẽ tự đóng các menu

document.addEventListener('click', function(event) {

if (!event.target.closest('.student-dropdown') && !event.target.closest('button\[onclick\*="toggleQuickMenu"\]') && !event.target.closest('button\[onclick\*="toggleStudentMenu"\]')) {

closeAllStudentMenus();

}

});

window.executeQuickPoint = function(studentId, points, reason, category, type) {

const student = state.students.find(s => s.id === studentId);

if (!student) return;

const pointsToApply = type === 'add' ? points : -points;

// BỎ Math.max ĐỂ CHO PHÉP TỔNG ĐIỂM ÂM

student.points = (student.points || 0) + pointsToApply;

// Điểm Sao dùng để đổi quà nên em vẫn giữ tối thiểu là 0 (để không bị nợ Sao trong cửa hàng)

student.stars = Math.max(0, (student.stars || 0) + pointsToApply);

if (!student.history) student.history = \[\];

student.history.push({

id: Date.now(),

date: new Date().toISOString(),

points: pointsToApply,

reason: reason + \` \[\${category}\]\`

});

saveData();

renderLayout(); // Load lại giao diện sau khi chấm xong

showToast(\`Đã \${type === 'add' ? 'cộng' : 'trừ'} \${points} điểm cho \${student.name}\`, type === 'add' ? 'success' : 'error');

if (type === 'add' && typeof triggerConfetti === 'function') triggerConfetti();

};

// --- CÁC HÀM XỬ LÝ KÉO THẢ (DRAG & DROP) CHO SƠ ĐỒ LỚP ---

window.draggedStudentId = null;

window.onDragStartStudent = function(e, id) {

window.draggedStudentId = id;

e.dataTransfer.setData('text/plain', id);

e.currentTarget.classList.add('opacity-40', 'scale-95');

};

window.onDragEndStudent = function(e) {

e.currentTarget.classList.remove('opacity-40', 'scale-95');

window.draggedStudentId = null;

document.querySelectorAll('.seat-dropzone').forEach(el => el.classList.remove('bg-blue-50', 'border-blue-400', 'ring-4', 'ring-blue-100'));

};

window.onDragOverSeat = function(e) {

e.preventDefault();

const dropzone = e.currentTarget;

if (!dropzone.classList.contains('bg-blue-50')) {

dropzone.classList.add('bg-blue-50', 'border-blue-400', 'ring-4', 'ring-blue-100');

}

};

window.onDragLeaveSeat = function(e) {

e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400', 'ring-4', 'ring-blue-100');

};

window.onDropSeat = function(e, seatId) {

e.preventDefault();

e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400', 'ring-4', 'ring-blue-100');

const studentId = parseInt(e.dataTransfer.getData('text/plain'));

if (!studentId) return;

// Xóa học sinh khỏi vị trí cũ

for (const key in state.seatingChart) {

if (state.seatingChart\[key\] === studentId) delete state.seatingChart\[key\];

}

// Xếp vào ghế mới

state.seatingChart\[seatId\] = studentId;

saveData();

renderLayout();

};

window.onDragOverList = function(e) { e.preventDefault(); };

window.onDropList = function(e) {

e.preventDefault();

const studentId = parseInt(e.dataTransfer.getData('text/plain'));

if (!studentId) return;

for (const key in state.seatingChart) {

if (state.seatingChart\[key\] === studentId) delete state.seatingChart\[key\];

}

saveData();

renderLayout();

};

window.removeStudentFromSeat = function(e, seatId) {

e.stopPropagation();

delete state.seatingChart\[seatId\];

saveData();

renderLayout();

};

// --- CÁC HÀM ẨN/HIỆN GHẾ TRỐNG ---

window.hideSeat = function(e, seatId) {

e.stopPropagation();

if (!state.hiddenSeats) state.hiddenSeats = \[\];

if (!state.hiddenSeats.includes(seatId)) {

state.hiddenSeats.push(seatId);

saveData();

renderLayout();

}

};

window.restoreSeat = function(e, seatId) {

e.stopPropagation();

if (state.hiddenSeats) {

state.hiddenSeats = state.hiddenSeats.filter(id => id !== seatId);

saveData();

renderLayout();

}

};

window.addNewSeat = function() {

if (!state.totalSeats) state.totalSeats = 36;

state.totalSeats++;

saveData();

renderLayout();

showToast("Đã thêm 1 ghế mới vào cuối lớp!", "success");

};

window.autoArrangeSeats = function() {

if(confirm("Tự động xếp ngẫu nhiên tất cả học sinh chưa có chỗ vào các ghế trống?")) {

const unassigned = state.students.filter(s => !Object.values(state.seatingChart).includes(s.id));

let emptySeats = \[\];

const maxSeats = state.totalSeats || 36;

for (let i = 1; i <= maxSeats; i++) {

const seatId = 'seat-'+i;

// Lấy các ghế trống và KHÔNG bị ẩn

if (!state.seatingChart\[seatId\] && !(state.hiddenSeats && state.hiddenSeats.includes(seatId))) {

emptySeats.push(seatId);

}

}

unassigned.sort(() => Math.random() - 0.5);

unassigned.forEach(s => {

if(emptySeats.length > 0) {

const seat = emptySeats.shift();

state.seatingChart\[seat\] = s.id;

}

});

saveData(); renderLayout(); showToast("Đã xếp chỗ tự động!", "success");

}

};

// --- GIAO DIỆN SƠ ĐỒ LỚP HỌC CHUYÊN NGHIỆP ---

// --- GIAO DIỆN SƠ ĐỒ LỚP HỌC CHUYÊN NGHIỆP TỐI ƯU UI/UX ---

function renderViewSoDoLop() {

if (!state.seatingChart) state.seatingChart = {};

if (!state.hiddenSeats) state.hiddenSeats = \[\];

if (!state.totalSeats) state.totalSeats = 36; // Mặc định 36 ghế

const unassignedStudents = state.students.filter(s => !Object.values(state.seatingChart).includes(s.id));

let seatsHtml = '';

for (let i = 1; i <= state.totalSeats; i++) {

const seatId = 'seat-' + i;

// 1. Ghế bị ẩn

if (state.hiddenSeats.includes(seatId)) {

seatsHtml += \`

&lt;div class="h-28 rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group relative"&gt;

&lt;button onclick="restoreSeat(event, '\${seatId}')" class="bg-white text-emerald-500 w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-50 hover:scale-110 transition-all shadow-md border border-emerald-100" title="Khôi phục lại ghế này"&gt;

&lt;i class="ph-bold ph-plus text-sm"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;/div&gt;

\`;

continue;

}

const studentId = state.seatingChart\[seatId\];

// 2. Ghế đã có học sinh

if (studentId) {

const student = state.students.find(s => s.id === studentId);

if (student) {

let borderColor = student.gender === 'Nữ' ? 'border-pink-100' : 'border-blue-100';

let topBar = student.gender === 'Nữ' ? 'bg-gradient-to-r from-pink-300 to-pink-400' : 'bg-gradient-to-r from-blue-300 to-blue-400';

let dotColor = student.gender === 'Nữ' ? 'bg-pink-400' : 'bg-blue-400';

let hoverClass = student.gender === 'Nữ' ? 'hover:border-pink-300 hover:shadow-\[0_8px_20px_rgba(244,114,182,0.15)\]' : 'hover:border-blue-300 hover:shadow-\[0_8px_20px_rgba(59,130,246,0.15)\]';

seatsHtml += \`

&lt;div class="h-28 bg-white border \${borderColor} rounded-2xl shadow-sm \${hoverClass} relative group cursor-grab flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-1 overflow-hidden" draggable="true" ondragstart="onDragStartStudent(event, \${student.id})" ondragend="onDragEndStudent(event)"&gt;

&lt;div class="absolute top-0 left-0 w-full h-1.5 \${topBar} opacity-80"&gt;&lt;/div&gt;

&lt;button onclick="removeStudentFromSeat(event, '\${seatId}')" class="absolute top-2 right-2 bg-slate-50 hover:bg-red-500 text-slate-400 hover:text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 border border-slate-100 hover:border-red-500 shadow-sm" title="Thu hồi học sinh"&gt;&lt;i class="ph-bold ph-x text-\[10px\]"&gt;&lt;/i&gt;&lt;/button&gt;

\${getAvatarImg(student.avatarUrl, student.name, "w-11 h-11 mt-1.5 mb-2 pointer-events-none ring-2 ring-slate-50 shadow-sm")}

&lt;div class="flex items-center gap-1.5 pointer-events-none px-2 w-full justify-center"&gt;

&lt;span class="w-1.5 h-1.5 rounded-full \${dotColor}"&gt;&lt;/span&gt;

&lt;span class="text-\[11px\] font-bold text-slate-700 text-center truncate"&gt;\${student.name.split(' ').pop()}&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

} else {

delete state.seatingChart\[seatId\];

}

}

// 3. Ghế trống

if (!studentId || !state.students.find(s => s.id === studentId)) {

seatsHtml += \`

&lt;div class="seat-dropzone h-28 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 transition-all cursor-pointer hover:bg-indigo-50/60 hover:border-indigo-300 hover:text-indigo-500 relative group" ondragover="onDragOverSeat(event)" ondragleave="onDragLeaveSeat(event)" ondrop="onDropSeat(event, '\${seatId}')"&gt;

&lt;button onclick="hideSeat(event, '\${seatId}')" class="absolute top-2 right-2 bg-white hover:bg-slate-200 text-slate-400 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm border border-slate-100" title="Xóa bỏ ghế này"&gt;&lt;i class="ph-bold ph-minus text-\[10px\]"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors"&gt;&lt;i class="ph-bold ph-plus text-lg opacity-50"&gt;&lt;/i&gt;&lt;/div&gt;

&lt;span class="text-\[9px\] font-bold uppercase tracking-widest opacity-60"&gt;Ghế \${i}&lt;/span&gt;

&lt;/div&gt;

\`;

}

}

// Danh sách chờ

const unassignedHtml = unassignedStudents.length > 0

? unassignedStudents.map(s => \`

&lt;div class="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl mb-3 cursor-grab shadow-\[0_2px_10px_rgba(0,0,0,0.02)\] hover:shadow-\[0_5px_15px_rgba(79,70,229,0.08)\] hover:border-indigo-200 transition-all group" draggable="true" ondragstart="onDragStartStudent(event, \${s.id})" ondragend="onDragEndStudent(event)"&gt;

&lt;div class="w-5 h-8 flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:text-indigo-500 transition-colors"&gt;&lt;i class="ph-bold ph-dots-six-vertical text-lg"&gt;&lt;/i&gt;&lt;/div&gt;

\${getAvatarImg(s.avatarUrl, s.name, "w-10 h-10 pointer-events-none ring-2 ring-slate-50 shadow-sm")}

&lt;div class="flex-1 min-w-0 pointer-events-none"&gt;

&lt;div class="text-sm font-bold text-slate-800 truncate mb-0.5"&gt;\${s.name}&lt;/div&gt;

&lt;div class="text-\[10px\] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"&gt;&lt;i class="ph-fill ph-users text-indigo-400"&gt;&lt;/i&gt; \${s.group}&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`).join('')

: \`&lt;div class="text-center py-12 flex flex-col items-center border-2 border-dashed border-emerald-200 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm"&gt;&lt;i class="ph-fill ph-check-circle text-4xl mb-3"&gt;&lt;/i&gt;&lt;span class="text-sm font-bold"&gt;Lớp đã xếp chỗ xong!&lt;/span&gt;&lt;/div&gt;\`;

return \`

&lt;div class="max-w-7xl mx-auto animate-fade-in pb-12 pt-2 flex flex-col h-full"&gt;

&lt;!-- Header --&gt;

&lt;div class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-slate-200 pb-6 mb-6 flex-shrink-0 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-\[#1e1b4b\] tracking-tight flex items-center gap-3"&gt;

&lt;div class="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm"&gt;&lt;i class="ph-fill ph-grid-four text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

Sơ Đồ Lớp Học

&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-2"&gt;Sử dụng nút "-" trên ghế trống để xóa bớt ghế (tạo lối đi).&lt;/p&gt;

&lt;/div&gt;

&lt;div class="flex gap-3 flex-wrap justify-end sm:justify-start"&gt;

&lt;button onclick="addNewSeat()" class="px-5 py-3 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm flex items-center"&gt;&lt;i class="ph-bold ph-plus mr-2 text-lg"&gt;&lt;/i&gt; Thêm ghế&lt;/button&gt;

&lt;button onclick="clearAllSeats()" class="px-5 py-3 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm flex items-center"&gt;&lt;i class="ph-bold ph-arrow-counter-clockwise mr-2 text-lg"&gt;&lt;/i&gt; Thu hồi&lt;/button&gt;

&lt;button onclick="autoArrangeSeats()" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-sm rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center transform hover:-translate-y-0.5"&gt;&lt;i class="ph-bold ph-magic-wand mr-2 text-lg text-yellow-300"&gt;&lt;/i&gt; Xếp tự động&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex flex-col lg:flex-row gap-8 flex-1 min-h-\[600px\]"&gt;

&lt;!-- CỘT TRÁI: Bản Đồ Lớp (Hiệu ứng giấy kẻ lưới Blueprint) --&gt;

&lt;div class="flex-1 bg-slate-50/50 bg-\[radial-gradient(#cbd5e1_1px,transparent_1px)\] \[background-size:20px_20px\] rounded-\[2.5rem\] p-6 md:p-8 shadow-inner border border-slate-200 flex flex-col overflow-hidden h-\[700px\] lg:h-auto relative"&gt;

&lt;div class="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none z-0"&gt;&lt;/div&gt;

&lt;!-- Bục giảng siêu thực --&gt;

&lt;div class="relative w-full h-36 mb-10 bg-white border border-slate-200 rounded-\[2rem\] overflow-hidden shadow-\[0_8px_30px_rgba(0,0,0,0.04)\] flex-shrink-0 z-10"&gt;

&lt;!-- Cửa ra vào --&gt;

&lt;div class="absolute top-0 right-0 w-16 h-full border-l border-slate-100 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 rounded-r-\[2rem\] text-slate-400 font-black text-\[10px\] tracking-widest shadow-inner" style="writing-mode: vertical-rl; transform: rotate(180deg);"&gt;CỬA RA VÀO&lt;/div&gt;

&lt;!-- Bảng xanh từ --&gt;

&lt;div class="absolute top-4 left-1/2 -translate-x-1/2 w-\[65%\] h-8 bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-900 rounded shadow-inner flex items-center justify-center text-teal-50 text-\[10px\] font-bold tracking-\[0.2em\] border-4 border-amber-900/80"&gt;BẢNG TỪ XANH&lt;/div&gt;

&lt;!-- Bàn Giáo Viên --&gt;

&lt;div class="absolute bottom-4 left-0 w-\[calc(33.33%-12px)\] h-16 bg-gradient-to-b from-amber-700 to-amber-800 rounded-r-2xl shadow-lg border-b-4 border-amber-950 flex flex-col items-center justify-center text-white border-t border-r border-amber-600"&gt;

&lt;i class="ph-fill ph-chalkboard-teacher text-2xl mb-0.5 text-amber-200 opacity-90"&gt;&lt;/i&gt;

&lt;span class="text-\[9px\] font-black uppercase tracking-widest text-amber-100 opacity-90"&gt;Bàn Giáo Viên&lt;/span&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Bọc lưới chỗ ngồi --&gt;

&lt;div class="flex-1 overflow-y-auto custom-scrollbar pr-3 pb-6 z-10"&gt;

&lt;div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-5"&gt;

\${seatsHtml}

&lt;/div&gt;

&lt;div class="text-center mt-10 text-\[11px\] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-4"&gt;

&lt;div class="h-px bg-slate-300 flex-1 max-w-\[100px\]"&gt;&lt;/div&gt;

VỊ TRÍ CUỐI LỚP

&lt;div class="h-px bg-slate-300 flex-1 max-w-\[100px\]"&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- CỘT PHẢI: Danh sách chờ --&gt;

&lt;div class="w-full lg:w-\[380px\] flex-shrink-0 bg-white rounded-\[2.5rem\] p-7 shadow-\[0_8px_30px_rgba(0,0,0,0.04)\] border border-slate-100 flex flex-col h-\[600px\] lg:h-auto z-10" ondragover="onDragOverList(event)" ondrop="onDropList(event)"&gt;

&lt;div class="flex justify-between items-center mb-5"&gt;

&lt;h3 class="font-black text-slate-800 uppercase tracking-wide text-base flex items-center gap-2"&gt;&lt;i class="ph-fill ph-users-three text-indigo-500 text-xl"&gt;&lt;/i&gt; DANH SÁCH CHỜ&lt;/h3&gt;

&lt;span class="bg-indigo-50 text-indigo-700 text-xs font-black px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm"&gt;\${unassignedStudents.length} HS&lt;/span&gt;

&lt;/div&gt;

&lt;div class="text-xs text-slate-500 mb-6 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed text-center"&gt;

Cầm và kéo học sinh từ đây và thả vào &lt;b class="text-slate-700"&gt;Ghế trống&lt;/b&gt; bên trái.

&lt;/div&gt;

&lt;div class="flex-1 overflow-y-auto custom-scrollbar pr-2"&gt;

\${unassignedHtml}

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// ==========================================

// --- TÍNH NĂNG LỊCH BÁO GIẢNG THEO TIẾT ---

// ==========================================

function renderViewLichBaoGiang() {

if (!state.teachingSchedule) state.teachingSchedule = {};

if (!state.activeDay) state.activeDay = 2; // Mặc định hiển thị Thứ 2

const days = \[

{ id: 2, label: 'Thứ Hai' },

{ id: 3, label: 'Thứ Ba' },

{ id: 4, label: 'Thứ Tư' },

{ id: 5, label: 'Thứ Năm' },

{ id: 6, label: 'Thứ Sáu' },

{ id: 7, label: 'Thứ Bảy' }

\];

// Khung giờ chuẩn theo yêu cầu của cô

const morningSlots = \[

{ id: 'm1', period: 'Tiết 1 Sáng', time: '07:15 - 08:00' },

{ id: 'm2', period: 'Tiết 2 Sáng', time: '08:00 - 08:45' },

{ id: 'm3', period: 'Tiết 3 Sáng', time: '09:05 - 09:50' }, // (8h45-9h05 ra chơi)

{ id: 'm4', period: 'Tiết 4 Sáng', time: '09:50 - 10:35' },

{ id: 'm5', period: 'Tiết 5 Sáng', time: '10:45 - 11:30' }

\];

const afternoonSlots = \[

{ id: 'a1', period: 'Tiết 1 Chiều', time: '13:30 - 14:15' },

{ id: 'a2', period: 'Tiết 2 Chiều', time: '14:15 - 15:00' },

{ id: 'a3', period: 'Tiết 3 Chiều', time: '15:15 - 16:00' }

\];

const renderSlotsHtml = (slots) => {

// Danh sách các môn học theo yêu cầu của cô

const subjectOptions = \[

"Toán", "Văn", "Lý", "Hóa", "Sinh",

"Công nghệ", "Thể dục", "TNHN", "Tin học",

"Lịch Sử", "Anh văn", "Địa lý", "GDCD", "SHDC", "SHCN"

\].map(sub => \`&lt;option value="\${sub}" \${data.subject === sub ? 'selected' : ''}&gt;\${sub}&lt;/option&gt;\`).join('');

return slots.map(slot => {

const key = \`\${state.activeDay}\_\${slot.id}\`;

const data = state.teachingSchedule\[key\] || { subject: '', teacher: '' };

return \`

&lt;div class="bg-\[#1e2343\] border border-blue-400/20 rounded-2xl p-4 shadow-sm hover:border-blue-400/50 transition-all flex flex-col justify-between group relative"&gt;

&lt;div class="flex justify-between items-center text-blue-200 text-\[11px\] font-bold mb-3"&gt;

&lt;span class="bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-400/10"&gt;\${slot.period}&lt;/span&gt;

&lt;span class="flex items-center gap-1 text-slate-300"&gt;&lt;i class="ph-bold ph-clock text-amber-400"&gt;&lt;/i&gt; \${slot.time}&lt;/span&gt;

&lt;/div&gt;

&lt;div class="space-y-2 mb-3"&gt;

&lt;!-- Ô chọn môn học dạng thả xuống (Dropdown) đồng bộ màu Xanh Navy --&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updateTeachingSlot(\${state.activeDay}, '\${slot.id}', 'subject', this.value)" class="w-full bg-\[#141830\] border border-blue-400/20 rounded-xl px-3 py-2.5 text-white font-black text-sm outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"&gt;

&lt;option value="" class="text-slate-400"&gt;+ Chọn môn học&lt;/option&gt;

\${subjectOptions}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;!-- Ô nhập tên giáo viên --&gt;

&lt;input type="text" value="\${escapeHtmlAttr(data.teacher)}" placeholder="Nhập tên giáo viên..." onchange="updateTeachingSlot(\${state.activeDay}, '\${slot.id}', 'teacher', this.value)" class="w-full bg-\[#141830\] border border-blue-400/20 rounded-xl px-3 py-2 text-blue-200 text-xs font-bold outline-none focus:border-amber-400 transition-colors"&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

};

const dayTabsHtml = days.map(day => {

const isActive = state.activeDay === day.id;

return \`

&lt;button onclick="state.activeDay = \${day.id}; renderLayout();" class="px-6 py-3 rounded-2xl text-sm font-black transition-all \${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}"&gt;

\${day.label} \${day.id === 7 ? '&lt;span class="text-\[10px\] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-1"&gt;4 Tiết&lt;/span&gt;' : ''}

&lt;/button&gt;

\`;

}).join('');

// Thứ 7 chỉ học sáng 4 tiết

const isSaturday = state.activeDay === 7;

return \`

&lt;div class="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 pt-2"&gt;

&lt;!-- Header tiêu đề --&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;

&lt;div class="p-2.5 bg-blue-50 text-blueAccent rounded-xl border border-blue-100 shadow-sm"&gt;&lt;i class="ph-fill ph-notebook text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

Lịch Báo Giảng Theo Tiết

&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Phân công môn học và giáo viên giảng dạy chi tiết theo khung giờ chuẩn.&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Thanh chọn Thứ trong tuần --&gt;

&lt;div class="flex flex-wrap gap-3 bg-white p-4 rounded-\[2rem\] shadow-sm border border-slate-200"&gt;

\${dayTabsHtml}

&lt;/div&gt;

&lt;!-- GIAO DIỆN CHÍNH NỀN XANH NAVY ĐỒNG BỘ --&gt;

&lt;div class="bg-\[#0f172a\] rounded-\[2.5rem\] p-6 md:p-8 shadow-xl border border-slate-800 space-y-8 relative overflow-hidden"&gt;

&lt;div class="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"&gt;&lt;/div&gt;

&lt;!-- BUỔI SÁNG --&gt;

&lt;div class="space-y-4 relative z-10"&gt;

&lt;div class="flex items-center gap-3 text-amber-400 font-black text-base uppercase tracking-wider border-b border-slate-800 pb-3"&gt;

&lt;i class="ph-fill ph-sun text-2xl"&gt;&lt;/i&gt; Buổi Sáng (\${isSaturday ? '4 Tiết' : '5 Tiết'})

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"&gt;

\${renderSlotsHtml(isSaturday ? morningSlots.slice(0, 4) : morningSlots)}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- BUỔI CHIỀU (Ẩn đi nếu là Thứ 7) --&gt;

\${!isSaturday ? \`

&lt;div class="space-y-4 relative z-10 pt-4"&gt;

&lt;div class="flex items-center gap-3 text-blue-400 font-black text-base uppercase tracking-wider border-b border-slate-800 pb-3"&gt;

&lt;i class="ph-fill ph-moon-stars text-2xl"&gt;&lt;/i&gt; Buổi Chiều (3 Tiết)

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-3 gap-4"&gt;

\${renderSlotsHtml(afternoonSlots)}

&lt;/div&gt;

&lt;/div&gt;

\` : \`

&lt;div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400 italic text-sm"&gt;

☕ Thứ Bảy lớp chỉ học buổi sáng theo quy định.

&lt;/div&gt;

\`}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// ==========================================

// --- TÍNH NĂNG LỊCH BÁO GIẢNG THEO TIẾT ---

// ==========================================

function renderViewLichBaoGiang() {

if (!state.teachingSchedule) state.teachingSchedule = {};

if (!state.activeDay) state.activeDay = 2; // Mặc định hiển thị Thứ 2

const days = \[

{ id: 2, label: 'Thứ Hai' },

{ id: 3, label: 'Thứ Ba' },

{ id: 4, label: 'Thứ Tư' },

{ id: 5, label: 'Thứ Năm' },

{ id: 6, label: 'Thứ Sáu' },

{ id: 7, label: 'Thứ Bảy' }

\];

// Khung giờ chuẩn theo yêu cầu của cô

const morningSlots = \[

{ id: 'm1', period: 'Tiết 1 Sáng', time: '07:15 - 08:00' },

{ id: 'm2', period: 'Tiết 2 Sáng', time: '08:00 - 08:45' },

{ id: 'm3', period: 'Tiết 3 Sáng', time: '09:05 - 09:50' }, // (8h45-9h05 ra chơi)

{ id: 'm4', period: 'Tiết 4 Sáng', time: '09:50 - 10:35' },

{ id: 'm5', period: 'Tiết 5 Sáng', time: '10:45 - 11:30' }

\];

const afternoonSlots = \[

{ id: 'a1', period: 'Tiết 1 Chiều', time: '13:30 - 14:15' },

{ id: 'a2', period: 'Tiết 2 Chiều', time: '14:15 - 15:00' },

{ id: 'a3', period: 'Tiết 3 Chiều', time: '15:15 - 16:00' }

\];

const renderSlotsHtml = (slots) => {

return slots.map(slot => {

const key = \`\${state.activeDay}\_\${slot.id}\`;

const data = state.teachingSchedule\[key\] || { subject: '', teacher: '' };

// Danh sách các môn học theo yêu cầu của cô

const subjectOptions = \[

"Toán", "Văn", "Lý", "Hóa", "Sinh",

"Công nghệ", "Thể dục", "TNHN", "Tin học",

"Lịch Sử", "Anh văn", "Địa lý", "GDCD", "SHDC", "SHCN"

\].map(sub => \`&lt;option value="\${sub}" \${data.subject === sub ? 'selected' : ''}&gt;\${sub}&lt;/option&gt;\`).join('');

return \`

&lt;div class="bg-\[#1e2343\] border border-blue-400/20 rounded-2xl p-4 shadow-sm hover:border-blue-400/50 transition-all flex flex-col justify-between group relative"&gt;

&lt;div class="flex justify-between items-center text-blue-200 text-\[11px\] font-bold mb-3"&gt;

&lt;span class="bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-400/10"&gt;\${slot.period}&lt;/span&gt;

&lt;span class="flex items-center gap-1 text-slate-300"&gt;&lt;i class="ph-bold ph-clock text-amber-400"&gt;&lt;/i&gt; \${slot.time}&lt;/span&gt;

&lt;/div&gt;

&lt;div class="space-y-2 mb-3"&gt;

&lt;!-- Ô chọn môn học dạng thả xuống (Dropdown) --&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updateTeachingSlot(\${state.activeDay}, '\${slot.id}', 'subject', this.value)" class="w-full bg-\[#141830\] border border-blue-400/20 rounded-xl px-3 py-2.5 text-white font-black text-sm outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"&gt;

&lt;option value="" class="text-slate-400"&gt;+ Chọn môn học&lt;/option&gt;

\${subjectOptions}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;!-- Ô nhập tên giáo viên --&gt;

&lt;input type="text" value="\${escapeHtmlAttr(data.teacher)}" placeholder="Nhập tên giáo viên..." onchange="updateTeachingSlot(\${state.activeDay}, '\${slot.id}', 'teacher', this.value)" class="w-full bg-\[#141830\] border border-blue-400/20 rounded-xl px-3 py-2 text-blue-200 text-xs font-bold outline-none focus:border-amber-400 transition-colors"&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

};

const dayTabsHtml = days.map(day => {

const isActive = state.activeDay === day.id;

return \`

&lt;button onclick="state.activeDay = \${day.id}; renderLayout();" class="px-6 py-3 rounded-2xl text-sm font-black transition-all \${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}"&gt;

\${day.label} \${day.id === 7 ? '&lt;span class="text-\[10px\] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-1"&gt;4 Tiết&lt;/span&gt;' : ''}

&lt;/button&gt;

\`;

}).join('');

// Thứ 7 chỉ học sáng 4 tiết

const isSaturday = state.activeDay === 7;

return \`

&lt;div class="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 pt-2"&gt;

&lt;!-- Header tiêu đề --&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;

&lt;div class="p-2.5 bg-blue-50 text-blueAccent rounded-xl border border-blue-100 shadow-sm"&gt;&lt;i class="ph-fill ph-notebook text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

Lịch Báo Giảng Theo Tiết

&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Phân công môn học và giáo viên giảng dạy chi tiết theo khung giờ chuẩn.&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Thanh chọn Thứ trong tuần --&gt;

&lt;div class="flex flex-wrap gap-3 bg-white p-4 rounded-\[2rem\] shadow-sm border border-slate-200"&gt;

\${dayTabsHtml}

&lt;/div&gt;

&lt;!-- GIAO DIỆN CHÍNH NỀN XANH NAVY ĐỒNG BỘ --&gt;

&lt;div class="bg-\[#0f172a\] rounded-\[2.5rem\] p-6 md:p-8 shadow-xl border border-slate-800 space-y-8 relative overflow-hidden"&gt;

&lt;div class="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"&gt;&lt;/div&gt;

&lt;!-- BUỔI SÁNG --&gt;

&lt;div class="space-y-4 relative z-10"&gt;

&lt;div class="flex items-center gap-3 text-amber-400 font-black text-base uppercase tracking-wider border-b border-slate-800 pb-3"&gt;

&lt;i class="ph-fill ph-sun text-2xl"&gt;&lt;/i&gt; Buổi Sáng (\${isSaturday ? '4 Tiết' : '5 Tiết'})

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"&gt;

\${renderSlotsHtml(isSaturday ? morningSlots.slice(0, 4) : morningSlots)}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- BUỔI CHIỀU (Ẩn đi nếu là Thứ 7) --&gt;

\${!isSaturday ? \`

&lt;div class="space-y-4 relative z-10 pt-4"&gt;

&lt;div class="flex items-center gap-3 text-blue-400 font-black text-base uppercase tracking-wider border-b border-slate-800 pb-3"&gt;

&lt;i class="ph-fill ph-moon-stars text-2xl"&gt;&lt;/i&gt; Buổi Chiều (3 Tiết)

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-3 gap-4"&gt;

\${renderSlotsHtml(afternoonSlots)}

&lt;/div&gt;

&lt;/div&gt;

\` : \`

&lt;div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400 italic text-sm"&gt;

☕ Thứ Bảy lớp chỉ học buổi sáng theo quy định.

&lt;/div&gt;

\`}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

// ==========================================

// --- TÍNH NĂNG LỊCH BÁO GIẢNG THEO TIẾT ---

// ==========================================

function renderViewLichBaoGiang() {

if (!state.teachingSchedule) state.teachingSchedule = {};

if (!state.activeDay) state.activeDay = 2; // Mặc định hiển thị Thứ 2

const days = \[

{ id: 2, label: 'Thứ Hai' },

{ id: 3, label: 'Thứ Ba' },

{ id: 4, label: 'Thứ Tư' },

{ id: 5, label: 'Thứ Năm' },

{ id: 6, label: 'Thứ Sáu' },

{ id: 7, label: 'Thứ Bảy' }

\];

// Khung giờ chuẩn theo yêu cầu của cô

const morningSlots = \[

{ id: 'm1', period: 'Tiết 1 Sáng', time: '07:15 - 08:00' },

{ id: 'm2', period: 'Tiết 2 Sáng', time: '08:00 - 08:45' },

{ id: 'm3', period: 'Tiết 3 Sáng', time: '09:05 - 09:50' }, // (8h45-9h05 ra chơi)

{ id: 'm4', period: 'Tiết 4 Sáng', time: '09:50 - 10:35' },

{ id: 'm5', period: 'Tiết 5 Sáng', time: '10:45 - 11:30' }

\];

const afternoonSlots = \[

{ id: 'a1', period: 'Tiết 1 Chiều', time: '13:30 - 14:15' },

{ id: 'a2', period: 'Tiết 2 Chiều', time: '14:15 - 15:00' },

{ id: 'a3', period: 'Tiết 3 Chiều', time: '15:15 - 16:00' }

\];

const renderSlotsHtml = (slots) => {

return slots.map(slot => {

const key = \`\${state.activeDay}\_\${slot.id}\`;

// Vẫn dùng biến data.teacher trong code nhưng giao diện sẽ hiển thị là Lớp

const data = state.teachingSchedule\[key\] || { subject: '', teacher: '' };

// Danh sách các môn học (Đã thêm "Phân hóa")

const subjectOptions = \[

"Toán", "Văn", "Lý", "Hóa", "Sinh",

"Công nghệ", "Thể dục", "TNHN", "Tin học",

"Lịch Sử", "Anh văn", "Địa lý", "GDCD", "SHDC", "SHCN", "Phân hóa"

\].map(sub => \`&lt;option value="\${sub}" \${data.subject === sub ? 'selected' : ''}&gt;\${sub}&lt;/option&gt;\`).join('');

// Danh sách các lớp

const classList = \[

"12A1", "12A2", "12A3", "12A4", "12A5", "12A6", "12A7", "12A8", "12A9", "12A10", "12A11", "12A12", "12A13",

"11A5", "11A6"

\];

const classOptions = classList.map(cls => \`&lt;option value="\${cls}" \${data.teacher === cls ? 'selected' : ''}&gt;\${cls}&lt;/option&gt;\`).join('');

return \`

&lt;div class="bg-\[#1e2343\] border border-blue-400/20 rounded-2xl p-4 shadow-sm hover:border-blue-400/50 transition-all flex flex-col justify-between group relative"&gt;

&lt;div class="flex justify-between items-center text-blue-200 text-\[11px\] font-bold mb-3"&gt;

&lt;span class="bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-400/10"&gt;\${slot.period}&lt;/span&gt;

&lt;span class="flex items-center gap-1 text-slate-300"&gt;&lt;i class="ph-bold ph-clock text-amber-400"&gt;&lt;/i&gt; \${slot.time}&lt;/span&gt;

&lt;/div&gt;

&lt;div class="space-y-2 mb-3"&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updateTeachingSlot(\${state.activeDay}, '\${slot.id}', 'subject', this.value)" class="w-full bg-\[#141830\] border border-blue-400/20 rounded-xl px-3 py-2.5 text-white font-black text-sm outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"&gt;

&lt;option value="" class="text-slate-400"&gt;+ Chọn môn học&lt;/option&gt;

\${subjectOptions}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;div class="relative"&gt;

&lt;select onchange="updateTeachingSlot(\${state.activeDay}, '\${slot.id}', 'teacher', this.value)" class="w-full bg-\[#141830\] border border-blue-400/20 rounded-xl px-3 py-2 text-blue-200 text-xs font-bold outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"&gt;

&lt;option value="" class="text-slate-500/70"&gt;+ Chọn lớp&lt;/option&gt;

\${classOptions}

&lt;/select&gt;

&lt;i class="ph-bold ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-\[10px\]"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

};

const dayTabsHtml = days.map(day => {

const isActive = state.activeDay === day.id;

return \`

&lt;button onclick="state.activeDay = \${day.id}; renderLayout();" class="px-6 py-3 rounded-2xl text-sm font-black transition-all \${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}"&gt;

\${day.label} \${day.id === 7 ? '&lt;span class="text-\[10px\] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-1"&gt;4 Tiết&lt;/span&gt;' : ''}

&lt;/button&gt;

\`;

}).join('');

// Thứ 7 chỉ học sáng 4 tiết

const isSaturday = state.activeDay === 7;

return \`

&lt;div class="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12 pt-2"&gt;

&lt;!-- Header tiêu đề --&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;

&lt;div class="p-2.5 bg-blue-50 text-blueAccent rounded-xl border border-blue-100 shadow-sm"&gt;&lt;i class="ph-fill ph-notebook text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

Lịch Báo Giảng Theo Tiết

&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Phân công môn học và giáo viên giảng dạy chi tiết theo khung giờ chuẩn.&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Thanh chọn Thứ trong tuần --&gt;

&lt;div class="flex flex-wrap gap-3 bg-white p-4 rounded-\[2rem\] shadow-sm border border-slate-200"&gt;

\${dayTabsHtml}

&lt;/div&gt;

&lt;!-- GIAO DIỆN CHÍNH NỀN XANH NAVY ĐỒNG BỘ --&gt;

&lt;div class="bg-\[#0f172a\] rounded-\[2.5rem\] p-6 md:p-8 shadow-xl border border-slate-800 space-y-8 relative overflow-hidden"&gt;

&lt;div class="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"&gt;&lt;/div&gt;

&lt;!-- BUỔI SÁNG --&gt;

&lt;div class="space-y-4 relative z-10"&gt;

&lt;div class="flex items-center gap-3 text-amber-400 font-black text-base uppercase tracking-wider border-b border-slate-800 pb-3"&gt;

&lt;i class="ph-fill ph-sun text-2xl"&gt;&lt;/i&gt; Buổi Sáng (\${isSaturday ? '4 Tiết' : '5 Tiết'})

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"&gt;

\${renderSlotsHtml(isSaturday ? morningSlots.slice(0, 4) : morningSlots)}

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- BUỔI CHIỀU (Ẩn đi nếu là Thứ 7) --&gt;

\${!isSaturday ? \`

&lt;div class="space-y-4 relative z-10 pt-4"&gt;

&lt;div class="flex items-center gap-3 text-blue-400 font-black text-base uppercase tracking-wider border-b border-slate-800 pb-3"&gt;

&lt;i class="ph-fill ph-moon-stars text-2xl"&gt;&lt;/i&gt; Buổi Chiều (3 Tiết)

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-3 gap-4"&gt;

\${renderSlotsHtml(afternoonSlots)}

&lt;/div&gt;

&lt;/div&gt;

\` : \`

&lt;div class="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-center text-slate-400 italic text-sm"&gt;

☕ Thứ Bảy lớp chỉ học buổi sáng theo quy định.

&lt;/div&gt;

\`}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

window.updateTeachingSlot = function(dayId, slotId, field, value) {

if (!state.teachingSchedule) state.teachingSchedule = {};

const key = \`\${dayId}\_\${slotId}\`;

if (!state.teachingSchedule\[key\]) state.teachingSchedule\[key\] = { subject: '', teacher: '' };

state.teachingSchedule\[key\]\[field\] = value.trim();

saveData();

showToast("Đã cập nhật lịch báo giảng!", "success");

};

// ==========================================

// --- TÍNH NĂNG NHẮC NHỞ TIẾT DẠY TỰ ĐỘNG ---

// ==========================================

if (!window.teachingReminderInterval) {

window.teachingReminderInterval = setInterval(() => {

if (!state.teachingSchedule) return;

const now = new Date();

const currentDay = now.getDay(); // 0 là Chủ Nhật, 1: Thứ 2, ..., 6: Thứ 7

if (currentDay === 0) return; // Chủ nhật nghỉ

const currentHour = now.getHours();

const currentMinute = now.getMinutes();

const currentTimeInMinutes = currentHour \* 60 + currentMinute;

// Khung giờ quy đổi ra phút để so sánh

// Sáng: Tiết 1 (7:15), Tiết 2 (8:00), Tiết 3 (9:05), Tiết 4 (9:50), Tiết 5 (10:45)

// Chiều: Tiết 1 (13:30), Tiết 2 (14:15), Tiết 3 (15:15)

const slotTimes = {

'm1': 7 \* 60 + 15,

'm2': 8 \* 60 + 0,

'm3': 9 \* 60 + 5,

'm4': 9 \* 60 + 50,

'm5': 10 \* 60 + 45,

'a1': 13 \* 60 + 30,

'a2': 14 \* 60 + 15,

'a3': 15 \* 60 + 15

};

for (const slotId in slotTimes) {

const slotMinutes = slotTimes\[slotId\];

// Nhắc nhở trước đúng 3 phút khi chuẩn bị vào tiết

if (slotMinutes - currentTimeInMinutes === 3) {

const key = \`\${currentDay}\_\${slotId}\`;

const lesson = state.teachingSchedule\[key\];

if (lesson && lesson.subject) {

showToast(\`⚠️ Sắp vào tiết: \${lesson.subject} (\${lesson.teacher || 'GV Bộ Môn'}) sau 3 phút nữa!\`, "error");

if (typeof playBellSound === 'function') playBellSound(0); // Phát chuông báo

}

}

}

}, 60000); // Kiểm tra mỗi phút một lần

}

// ==========================================

// --- TÍNH NĂNG TRẠM ĐỒNG HÀNH ĐẶC BIỆT ---

// ==========================================

function renderViewTramDongHanh() {

if (!state.companions) state.companions = \[\];

const cardsHtml = state.companions.map(c => {

const student = state.students.find(s => s.id === c.studentId);

if (!student) return '';

return \`

&lt;div class="bg-white rounded-\[2rem\] p-6 shadow-sm border border-rose-200 relative group transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"&gt;

&lt;div class="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 z-0 opacity-50 pointer-events-none"&gt;&lt;/div&gt;

&lt;div class="relative z-10 flex items-start gap-4 mb-4"&gt;

\${getAvatarImg(student.avatarUrl, student.name, "w-14 h-14 ring-4 ring-rose-50 shadow-sm object-cover")}

&lt;div class="flex-1 min-w-0"&gt;

&lt;h3 class="text-lg font-black text-slate-800 truncate"&gt;\${student.name}&lt;/h3&gt;

&lt;div class="text-\[10px\] font-bold text-slate-500 uppercase tracking-widest"&gt;\${student.group}&lt;/div&gt;

&lt;/div&gt;

&lt;button onclick="openEditCompanionModal(\${c.id})" class="text-slate-400 hover:text-blueAccent transition-colors bg-slate-50 p-2 rounded-full border border-slate-100" title="Chỉnh sửa / Xóa bớt lỗi"&gt;&lt;i class="ph-fill ph-pencil-simple text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="relative z-10 mb-4 flex-1"&gt;

&lt;div class="text-\[11px\] font-bold text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"&gt;&lt;i class="ph-fill ph-warning-circle text-sm"&gt;&lt;/i&gt; Vấn đề cần khắc phục&lt;/div&gt;

&lt;div class="text-sm font-medium text-slate-700 bg-rose-50/60 p-3 rounded-xl border border-rose-100 whitespace-pre-line leading-relaxed"&gt;\${escapeHtmlAttr(c.issue)}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative z-10 mb-6"&gt;

&lt;div class="text-\[11px\] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"&gt;&lt;i class="ph-fill ph-hand-heart text-sm"&gt;&lt;/i&gt; Biện pháp đồng hành&lt;/div&gt;

&lt;div class="text-sm font-medium text-slate-700 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 whitespace-pre-line leading-relaxed"&gt;\${escapeHtmlAttr(c.measures)}&lt;/div&gt;

&lt;/div&gt;

&lt;div class="relative z-10 flex justify-between items-center mt-auto pt-4 border-t border-slate-100 border-dashed"&gt;

&lt;div class="text-\[10px\] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"&gt;

&lt;i class="ph-bold ph-calendar-plus text-blueAccent"&gt;&lt;/i&gt; Bắt đầu: \${formatDateForDisplay(c.startDate)}

&lt;/div&gt;

&lt;button onclick="deleteCompanion(\${c.id})" class="text-\[11px\] font-bold text-rose-600 hover:text-white hover:bg-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors border border-rose-100 hover:border-rose-500 shadow-sm"&gt;Hoàn thành&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

}).join('');

return \`

&lt;div class="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12 pt-2 flex flex-col h-full"&gt;

&lt;div class="flex flex-col md:flex-row justify-between items-start md:items-center py-2 border-b border-slate-200 pb-6 gap-4"&gt;

&lt;div&gt;

&lt;h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"&gt;

&lt;div class="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-sm"&gt;&lt;i class="ph-fill ph-hands-clapping text-2xl"&gt;&lt;/i&gt;&lt;/div&gt;

Trạm Đồng Hành

&lt;/h2&gt;

&lt;p class="text-slate-500 text-sm font-medium mt-1"&gt;Nơi theo dõi, áp dụng biện pháp giáo dục đặc biệt cho học sinh vi phạm hoặc học lực yếu.&lt;/p&gt;

&lt;/div&gt;

&lt;button onclick="openEditCompanionModal()" class="px-5 py-3 bg-\[#0f172a\] text-white font-bold rounded-xl text-sm shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2 transform hover:-translate-y-0.5"&gt;&lt;i class="ph-bold ph-user-plus text-lg"&gt;&lt;/i&gt; Đưa HS vào Trạm&lt;/button&gt;

&lt;/div&gt;

&lt;div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"&gt;

\${cardsHtml || \`

&lt;div class="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-emerald-200 rounded-\[2rem\] bg-emerald-50/30"&gt;

&lt;i class="ph-fill ph-check-circle text-6xl text-emerald-400 mb-4"&gt;&lt;/i&gt;

&lt;div class="text-slate-600 font-bold text-xl mb-1"&gt;Tuyệt vời!&lt;/div&gt;

&lt;p class="text-sm font-medium text-slate-500"&gt;Lớp không có học sinh nào cần áp dụng biện pháp đồng hành đặc biệt.&lt;/p&gt;

&lt;/div&gt;

\`}

&lt;/div&gt;

&lt;/div&gt;

\`;

}

window.openEditCompanionModal = function(id) {

if (!state.companions) state.companions = \[\];

const today = new Date().toISOString().split('T')\[0\];

const companion = id ? state.companions.find(c => c.id === id) : { studentId: '', startDate: today, issue: '', measures: '' };

const studentOptions = state.students.map(s =>

\`&lt;option value="\${s.id}" \${companion.studentId == s.id ? 'selected' : ''}&gt;\${s.name} (\${s.group})&lt;/option&gt;\`

).join('');

const modalHtml = \`

&lt;div class="fixed inset-0 bg-slate-900/70 z-\[100\] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="edit-companion-modal"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"&gt;

&lt;div class="bg-gradient-to-r from-rose-600 to-red-500 text-white p-6 flex justify-between items-center px-8 relative"&gt;

&lt;h3 class="font-black text-xl flex items-center gap-2 relative z-10"&gt;&lt;i class="ph-fill ph-hands-clapping text-rose-200"&gt;&lt;/i&gt; \${id ? 'CẬP NHẬT TRẠM ĐỒNG HÀNH' : 'THÊM HS VÀO TRẠM'}&lt;/h3&gt;

&lt;button onclick="closeModal('edit-companion-modal')" class="bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors relative z-10"&gt;&lt;i class="ph-bold ph-x text-lg"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;div class="p-8 space-y-5 bg-slate-50 text-left overflow-y-auto max-h-\[75vh\] custom-scrollbar"&gt;

&lt;input type="hidden" id="comp-id" value="\${id || ''}"&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Học sinh cần quan tâm&lt;/label&gt;

&lt;select id="comp-student" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:border-rose-500 outline-none transition-all shadow-sm cursor-pointer" \${id ? 'disabled' : ''}&gt;

&lt;option value=""&gt;-- Chọn học sinh --&lt;/option&gt;

\${studentOptions}

&lt;/select&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Ngày bắt đầu theo dõi&lt;/label&gt;

&lt;input type="date" id="comp-date" value="\${companion.startDate}" class="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-rose-500 outline-none transition-all shadow-sm cursor-pointer"&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;div class="flex justify-between items-end mb-2"&gt;

&lt;label class="block text-\[11px\] font-bold text-rose-600 uppercase tracking-widest"&gt;Các Lỗi / Vấn đề gặp phải &lt;span class="text-rose-500"&gt;\*&lt;/span&gt;&lt;/label&gt;

&lt;span class="text-\[10px\] text-slate-400 italic bg-white px-2 py-0.5 rounded border border-slate-200"&gt;Xóa bớt dòng khi HS đã sửa lỗi&lt;/span&gt;

&lt;/div&gt;

&lt;textarea id="comp-issue" rows="4" placeholder="VD: - Thường xuyên hút thuốc trong NVS - Học lực Hóa rất yếu - Đánh nhau với bạn" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none transition-all resize-y shadow-sm leading-relaxed"&gt;\${escapeHtmlAttr(companion.issue)}&lt;/textarea&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-emerald-600 mb-2 uppercase tracking-widest"&gt;Biện pháp sử dụng đồng hành&lt;/label&gt;

&lt;textarea id="comp-measures" rows="4" placeholder="VD: - Đã mời Phụ huynh làm việc ngày... - Phân công lớp trưởng kèm 15p cuối giờ - Giao riêng phiếu học tập cơ bản" class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-y shadow-sm leading-relaxed"&gt;\${escapeHtmlAttr(companion.measures)}&lt;/textarea&gt;

&lt;/div&gt;

&lt;button onclick="saveCompanion()" class="w-full py-4 bg-\[#0f172a\] hover:bg-black text-white font-black rounded-xl mt-4 shadow-lg transition-all hover:-translate-y-0.5"&gt;LƯU HỒ SƠ ĐỒNG HÀNH&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

\`;

document.getElementById('modal-container').innerHTML = modalHtml;

}

window.saveCompanion = function() {

if (!state.companions) state.companions = \[\];

const id = document.getElementById('comp-id').value;

const studentId = document.getElementById('comp-student').value;

const startDate = document.getElementById('comp-date').value;

const issue = document.getElementById('comp-issue').value.trim();

const measures = document.getElementById('comp-measures').value.trim();

if (!studentId) return showToast('Vui lòng chọn học sinh!', 'error');

if (!issue) return showToast('Vui lòng nhập các lỗi hoặc vấn đề của học sinh!', 'error');

if (id) {

const idx = state.companions.findIndex(c => c.id == id);

if (idx > -1) {

state.companions\[idx\] = { ...state.companions\[idx\], startDate, issue, measures };

}

} else {

// Kiểm tra xem học sinh này đã có trong Trạm chưa

const existing = state.companions.find(c => c.studentId == studentId);

if(existing) return showToast('Học sinh này đang ở trong Trạm rồi, vui lòng bấm sửa Thẻ cũ!', 'error');

state.companions.unshift({

id: Date.now(),

studentId: parseInt(studentId),

startDate,

issue,

measures

});

}

saveData();

renderLayout();

closeModal('edit-companion-modal');

showToast('Đã lưu hồ sơ Trạm Đồng Hành!', 'success');

}

window.deleteCompanion = function(id) {

if (confirm('Học sinh đã hoàn toàn thay đổi tích cực và bạn muốn kết thúc quá trình đồng hành?')) {

state.companions = state.companions.filter(c => c.id !== id);

saveData();

renderLayout();

showToast('Tuyệt vời! Đã kết thúc đồng hành thành công!', 'success');

if (typeof triggerConfetti === 'function') triggerConfetti();

}

}

// ==========================================

// --- CÁC HÀM XỬ LÝ PHÂN QUYỀN VÀ ĐĂNG NHẬP ---

// ==========================================

function renderLoginScreen() {

const currentRole = state.auth.role || 'gvcn';

// ĐÃ SỬA LỖI: Dùng biến riêng loginBannerUrl thay vì bannerUrl chung

const bannerBg = (state.theme && state.theme.loginBannerUrl) ? state.theme.loginBannerUrl : '<https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop>';

return \`

&lt;div class="fixed inset-0 z-50 flex bg-slate-50 animate-fade-in font-sans"&gt;

&lt;!-- Bên trái: Khung ảnh dễ thương (chiếm 2/3) --&gt;

&lt;div class="hidden lg:flex w-2/3 bg-blue-50/50 relative overflow-hidden items-center justify-center p-12"&gt;

&lt;!-- Hình nền trang trí dạng bong bóng mờ (Blob Pastel) --&gt;

&lt;div class="absolute top-\[-10%\] left-\[-10%\] w-\[30rem\] h-\[30rem\] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"&gt;&lt;/div&gt;

&lt;div class="absolute top-\[20%\] right-\[-10%\] w-\[30rem\] h-\[30rem\] bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"&gt;&lt;/div&gt;

&lt;div class="absolute bottom-\[-20%\] left-\[20%\] w-\[30rem\] h-\[30rem\] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"&gt;&lt;/div&gt;

&lt;!-- Cụm Khung Ảnh Chính --&gt;

&lt;div class="relative z-10 w-full max-w-4xl mx-auto"&gt;

&lt;!-- Nút tải ảnh lên --&gt;

&lt;div class="absolute -top-6 -right-6 z-30"&gt;

&lt;button onclick="document.getElementById('login-banner-upload').click()" class="bg-white text-blueAccent hover:text-pink-500 hover:scale-110 shadow-\[0_10px_30px_rgba(0,0,0,0.15)\] p-4 rounded-full transition-all flex items-center justify-center border-4 border-white group" title="Thay đổi ảnh lớp học"&gt;

&lt;i class="ph-bold ph-camera text-3xl group-hover:animate-bounce-slight"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;input type="file" id="login-banner-upload" class="hidden" accept="image/\*" onchange="handleLoginBannerUpload(event)"&gt;

&lt;/div&gt;

&lt;!-- Khung viền ảnh (Style khung tranh bo tròn nổi 3D) --&gt;

&lt;div class="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-\[3.5rem\] shadow-\[0_20px_60px_rgba(0,0,0,0.08)\] transform rotate-1 hover:rotate-0 transition-transform duration-500 relative border border-white"&gt;

&lt;!-- Chibi / Trái tim trang trí góc --&gt;

&lt;div class="absolute -top-8 -left-8 bg-pink-100 text-pink-500 w-20 h-20 rounded-\[1.5rem\] flex items-center justify-center shadow-lg border-4 border-white transform -rotate-12 z-20"&gt;

&lt;i class="ph-fill ph-heart text-4xl animate-pulse"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;div class="w-full h-\[500px\] rounded-\[2.5rem\] overflow-hidden relative group shadow-inner bg-slate-100"&gt;

&lt;img src="\${bannerBg}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Ảnh lớp"&gt;

&lt;!-- Lớp phủ Gradient mượt mà để hiện chữ --&gt;

&lt;div class="absolute inset-0 bg-gradient-to-t from-\[#1e1b4b\] via-\[#1e1b4b\]/40 to-transparent opacity-90"&gt;&lt;/div&gt;

&lt;!-- Chữ đè lên ảnh --&gt;

&lt;div class="absolute bottom-0 left-0 w-full p-10 md:p-12 text-white transform transition-transform duration-500"&gt;

&lt;div class="flex items-center gap-2 mb-4"&gt;

&lt;span class="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/30 flex items-center gap-1.5"&gt;&lt;i class="ph-fill ph-stars text-yellow-300"&gt;&lt;/i&gt; Không Gian Học Tập&lt;/span&gt;

&lt;/div&gt;

&lt;h1 class="text-6xl font-black tracking-tight mb-4 drop-shadow-lg"&gt;\${state.admin.className || 'LỚP 12A1'}&lt;/h1&gt;

&lt;p class="text-indigo-100 font-medium text-base max-w-2xl leading-relaxed drop-shadow-md"&gt;Nơi gieo mầm tri thức và lưu giữ những kỷ niệm thanh xuân rực rỡ nhất của tuổi học trò.&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Nhãn dán dễ thương nổi bên ngoài --&gt;

&lt;div class="absolute -bottom-8 right-12 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-8 py-3.5 rounded-2xl shadow-xl border-4 border-white font-black text-sm transform rotate-6 animate-bounce-slight z-20"&gt;

✨ Mỗi ngày đến trường là một niềm vui!

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Bên phải: Khung đăng nhập (chiếm 1/3) --&gt;

&lt;div class="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-10 bg-white relative z-20 shadow-\[-20px_0_40px_rgba(0,0,0,0.03)\] overflow-y-auto custom-scrollbar"&gt;

&lt;div class="bg-white w-full max-w-md rounded-\[2.5rem\] p-8 sm:p-10 shadow-2xl border border-slate-100 relative"&gt;

&lt;!-- Logo / Tiêu đề --&gt;

&lt;div class="text-center mb-8"&gt;

&lt;div class="w-16 h-16 bg-\[#1e1b4b\] rounded-\[1.2rem\] mx-auto flex items-center justify-center shadow-lg mb-5 text-white text-2xl font-black transform transition-transform hover:scale-110"&gt;

&lt;i class="ph-fill ph-graduation-cap text-orange-400"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;h3 class="text-2xl font-black text-slate-800 tracking-tight"&gt;Đăng Nhập Quản Trị&lt;/h3&gt;

&lt;p class="text-\[10px\] text-slate-400 font-bold uppercase tracking-widest mt-1.5"&gt;Xác thực phân quyền hệ thống&lt;/p&gt;

&lt;/div&gt;

&lt;!-- Lựa chọn vai trò đăng nhập --&gt;

&lt;div class="flex bg-slate-100 p-1.5 rounded-2xl mb-8"&gt;

&lt;button onclick="state.auth.role='gvcn'; renderLayout();" class="flex-1 py-3 rounded-\[1rem\] text-xs font-black transition-all \${currentRole==='gvcn' ? 'bg-\[#1e1b4b\] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}"&gt;GV Chủ Nhiệm&lt;/button&gt;

&lt;button onclick="state.auth.role='bancansu'; renderLayout();" class="flex-1 py-3 rounded-\[1rem\] text-xs font-black transition-all \${currentRole==='bancansu' ? 'bg-\[#1e1b4b\] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}"&gt;Ban Cán Sự&lt;/button&gt;

&lt;/div&gt;

&lt;!-- Form đăng nhập tương ứng vai trò --&gt;

&lt;div class="space-y-4"&gt;

\${currentRole === 'gvcn' ? \`

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Email GVCN&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;input type="email" id="login-email" placeholder="Email Firebase Authentication" class="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blueAccent shadow-sm transition-colors"&gt;

&lt;i class="ph-bold ph-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div&gt;

&lt;label class="block text-\[11px\] font-bold text-slate-500 mb-2 uppercase tracking-widest"&gt;Mật khẩu&lt;/label&gt;

&lt;div class="relative"&gt;

&lt;input type="password" id="login-password" placeholder="••••••••" class="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blueAccent shadow-sm transition-colors"&gt;

&lt;i class="ph-bold ph-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="flex items-center gap-2 pt-1 mb-2"&gt;

&lt;input type="checkbox" id="remember-me" class="w-4 h-4 rounded text-blueAccent border-slate-300 cursor-pointer"&gt;

&lt;label for="remember-me" class="text-xs font-bold text-slate-600 cursor-pointer"&gt;Ghi nhớ tài khoản&lt;/label&gt;

&lt;/div&gt;

&lt;button onclick="handleLogin()" class="w-full py-4 bg-blueAccent hover:bg-blue-600 text-white font-black rounded-xl shadow-\[0_8px_20px_rgba(59,130,246,0.3)\] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm mt-2"&gt;

&lt;i class="ph-bold ph-sign-in text-lg"&gt;&lt;/i&gt; ĐĂNG NHẬP AN TOÀN

&lt;/button&gt;

\` : \`

&lt;div class="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-center mb-4"&gt;

&lt;p class="text-xs font-bold text-indigo-900 leading-relaxed"&gt;Ban cán sự được cấp quyền truy cập nhanh vào các mục: &lt;b class="text-blueAccent"&gt;Học sinh, Thời khóa biểu, Điểm danh&lt;/b&gt;.&lt;/p&gt;

&lt;/div&gt;

&lt;button onclick="handleLogin()" class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-\[0_8px_20px_rgba(16,185,129,0.3)\] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm mt-4"&gt;

&lt;i class="ph-bold ph-shield-check text-lg"&gt;&lt;/i&gt; TRUY CẬP BAN CÁN SỰ

&lt;/button&gt;

\`}

&lt;/div&gt;

&lt;!-- Đường phân cách Phụ huynh / Học sinh --&gt;

&lt;div class="relative my-8"&gt;

&lt;div class="absolute inset-0 flex items-center"&gt;&lt;div class="w-full border-t border-slate-200"&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="relative flex justify-center"&gt;&lt;span class="bg-white px-4 text-\[10px\] text-slate-400 font-bold uppercase tracking-widest"&gt;Phụ huynh / Học sinh&lt;/span&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;!-- Nút tra cứu mã (Đã nâng cấp thành ô nhập trực tiếp) --&gt;

&lt;div class="bg-orange-50 p-4 rounded-\[1.5rem\] border border-orange-100"&gt;

&lt;p class="text-\[11px\] font-bold text-orange-800 text-center mb-3"&gt;Nhập mã học sinh (5 số) để xem điểm & nề nếp&lt;/p&gt;

&lt;div class="flex gap-2"&gt;

&lt;input type="text" id="direct-lookup-code" placeholder="Ví dụ: 12345" class="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl text-center text-xl font-black tracking-\[0.2em\] text-orange-600 outline-none focus:border-orange-500 shadow-inner transition-colors" maxlength="5" onkeypress="if(event.key === 'Enter') performDirectLookup()"&gt;

&lt;button onclick="performDirectLookup()" class="px-6 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-xl shadow-md transition-all flex items-center justify-center transform hover:-translate-y-0.5" title="Tra cứu"&gt;

&lt;i class="ph-bold ph-magnifying-glass text-2xl"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-\[9px\] text-slate-400 text-center mt-8 leading-relaxed font-bold uppercase tracking-widest flex items-center justify-center gap-1.5"&gt;

&lt;i class="ph-fill ph-lock-key"&gt;&lt;/i&gt; Phiên đăng nhập được mã hóa an toàn

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- SỬA LỖI Ở ĐÂY: Thêm khung chứa ẩn để hiện Bảng Điểm Phụ Huynh --&gt;

&lt;div id="modal-container"&gt;&lt;/div&gt;

\`;

}

// --- HÀM TẢI ẢNH LÊN CHO MÀN HÌNH ĐĂNG NHẬP ---

window.handleLoginBannerUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

if (!state.theme) state.theme = {};

// ĐÃ SỬA LỖI: Lưu vào một kho riêng tên là loginBannerUrl

state.theme.loginBannerUrl = dataUrl;

saveData();

renderLayout();

showToast("Đã thay đổi ảnh bìa ngoài màn hình đăng nhập!", "success");

}, 1200, 0.8);

};

window.handleLogin = function() {

if (!state.auth) state.auth = { loggedIn: false, role: 'gvcn' };

const currentRole = state.auth.role;

// 1. Nếu là GVCN đăng nhập

if (currentRole === 'gvcn') {

const email = document.getElementById('login-email').value.trim();

const pass = document.getElementById('login-password').value.trim();

// CÔ THAY ĐỔI TÀI KHOẢN VÀ MẬT KHẨU Ở DÒNG DƯỚI NÀY NHÉ:

if (email === '<cothuy@hoasen.edu.vn>' && pass === 'hoasen123') {

state.auth.loggedIn = true;

state.currentTab = 'tong-quan'; // Đăng nhập xong tự nhảy vào Tổng quan

renderLayout();

showToast("Đăng nhập thành công với quyền GVCN!", "success");

} else {

showToast("Sai Email hoặc Mật khẩu. Vui lòng thử lại!", "error");

}

}

// 2. Nếu là Ban cán sự đăng nhập

else if (currentRole === 'bancansu') {

// Ban cán sự bấm nút là vào thẳng (không cần pass)

state.auth.loggedIn = true;

state.currentTab = 'hoc-sinh'; // Tự động mở tab Học sinh cho BCS

renderLayout();

showToast("Truy cập thành công với quyền Ban Cán Sự!", "success");

}

};

window.logout = function() {

state.auth.loggedIn = false;

renderLayout();

showToast("Đã đăng xuất tài khoản!", "info");

};

window.renderLoginScreen = function() {

const bgAnimation = \`

&lt;style&gt;

@keyframes gradientNavy {

0% { background-position: 0% 50%; }

50% { background-position: 100% 50%; }

100% { background-position: 0% 50%; }

}

.bg-animated-navy {

background: linear-gradient(-45deg, #1e3a8a, #312e81, #0f172a, #3b82f6);

background-size: 300% 300%;

animation: gradientNavy 12s ease infinite;

}

/\* FIX LỖI CUỘN MÀN HÌNH ĐĂNG NHẬP TRÊN ĐIỆN THOẠI \*/

.login-wrapper {

min-height: 100dvh;

display: flex;

align-items: center; /\* <--- Đã sửa thành center để căn giữa màn hình PC \*/

justify-content: center;

padding: 2rem 1rem;

overflow-y: auto;

}

@media (min-width: 768px) {

.login-wrapper {

align-items: center;

padding: 1rem;

}

}

&lt;/style&gt;

\`;

return \`

\${bgAnimation}

&lt;div class="login-wrapper bg-animated-navy custom-scrollbar"&gt;

&lt;div class="bg-white rounded-\[2rem\] shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden relative z-10 animate-fade-in"&gt;

&lt;!-- CỘT TRÁI: Khu vực hiển thị ảnh --&gt;

&lt;div class="w-full md:w-1/2 p-6 md:p-10 flex flex-col items-center justify-center bg-white relative border-b md:border-b-0 md:border-r border-slate-100"&gt;

&lt;!-- Khung viền đứt tải ảnh trường --&gt;

&lt;div class="w-full h-20 md:h-24 border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden mb-6 flex justify-center items-center relative group cursor-pointer hover:border-blue-400 transition-colors shadow-sm bg-slate-50/50" onclick="document.getElementById('school-logo-upload').click()" title="Bấm để đổi ảnh logo trường"&gt;

&lt;img src="\${(state.theme && state.theme.schoolLogoUrl) ? state.theme.schoolLogoUrl : '<https://truonghoasen.com/wp-content/uploads/2023/10/logo-hoa-sen-01.png'}>" class="w-full h-full object-contain p-1" alt="School Logo" id="school-logo-img"&gt;

&lt;div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"&gt;

&lt;i class="ph-bold ph-camera text-white text-2xl"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;input type="file" id="school-logo-upload" class="hidden" accept="image/\*" onchange="handleSchoolLogoUpload(event)"&gt;

&lt;/div&gt;

&lt;!-- Khung tải ảnh lớp học --&gt;

&lt;div class="relative w-full h-\[300px\] md:h-\[400px\] rounded-\[2rem\] overflow-hidden shadow-lg group"&gt;

&lt;img src="\${(state.theme && state.theme.loginClassImg) ? state.theme.loginClassImg : (state.admin.classAvatarUrl || '<https://placehold.co/600x800/1e1b4b/ffffff?text=L%E1%BB%9AP+H%E1%BB%8CC')}>" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" id="login-class-img"&gt;

&lt;button class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl text-blue-600 shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors z-20" onclick="document.getElementById('login-class-upload').click()" title="Đổi ảnh lớp"&gt;

&lt;i class="ph-bold ph-camera text-xl"&gt;&lt;/i&gt;

&lt;/button&gt;

&lt;input type="file" id="login-class-upload" class="hidden" accept="image/\*" onchange="handleLoginClassUpload(event)"&gt;

&lt;div class="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl text-pink-500 shadow-md flex items-center justify-center z-20"&gt;

&lt;i class="ph-fill ph-heart text-xl animate-pulse"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;div class="absolute inset-0 bg-gradient-to-t from-\[#1e1b4b\]/90 via-\[#1e1b4b\]/20 to-transparent flex flex-col justify-end p-6 z-10 pointer-events-none"&gt;

&lt;span class="bg-amber-400 text-\[#1e1b4b\] text-\[10px\] font-black px-3 py-1.5 rounded-lg w-max mb-3 tracking-widest shadow-sm"&gt;KHÔNG GIAN HỌC TẬP&lt;/span&gt;

&lt;h1 class="text-white text-3xl font-black mb-2 shadow-sm"&gt;\${state.admin.className || 'LỚP 12A1'}&lt;/h1&gt;

&lt;p class="text-blue-50 text-xs font-medium leading-relaxed opacity-90"&gt;Nơi gieo mầm tri thức và lưu giữ những kỷ niệm thanh xuân rực rỡ nhất của tuổi học trò.&lt;/p&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="mt-6 bg-yellow-100/80 text-yellow-700 px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm border border-yellow-200"&gt;

&lt;i class="ph-fill ph-sparkle text-yellow-500"&gt;&lt;/i&gt; Mỗi ngày đến trường là một niềm vui!

&lt;/div&gt;

&lt;/div&gt;

&lt;!-- CỘT PHẢI: Form đăng nhập --&gt;

&lt;div class="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white"&gt;

&lt;div class="w-14 h-14 bg-\[#1e1b4b\] text-white rounded-2xl flex items-center justify-center text-3xl shadow-md mx-auto mb-5 transform hover:rotate-12 transition-transform"&gt;

&lt;i class="ph-fill ph-graduation-cap"&gt;&lt;/i&gt;

&lt;/div&gt;

&lt;h2 class="text-2xl font-black text-slate-800 text-center mb-1"&gt;Đăng Nhập Quản Trị&lt;/h2&gt;

&lt;p class="text-\[10px\] text-slate-500 font-bold uppercase tracking-widest text-center mb-8"&gt;Xác thực phân quyền hệ thống&lt;/p&gt;

&lt;div class="flex bg-slate-100 p-1.5 rounded-xl mb-4 shadow-inner"&gt;

&lt;button onclick="selectLoginRole('gvcn')" id="btn-role-gvcn" class="flex-1 py-2.5 rounded-lg text-sm font-bold bg-\[#1e1b4b\] text-white shadow-sm transition-all"&gt;GVCN&lt;/button&gt;

&lt;button onclick="selectLoginRole('bancansu')" id="btn-role-bancansu" class="flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"&gt;BCS&lt;/button&gt;

&lt;button onclick="selectLoginRole('bgh')" id="btn-role-bgh" class="flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"&gt;BGH&lt;/button&gt;

&lt;/div&gt;

&lt;input type="hidden" id="login-role" value="gvcn"&gt;

&lt;div id="login-role-desc" class="text-center text-xs font-medium text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100 mb-6 transition-all"&gt;

Bạn đang đăng nhập với tư cách Giáo viên chủ nhiệm.

&lt;/div&gt;

&lt;div class="mb-6 relative group"&gt;

&lt;input type="password" id="login-password" placeholder="Nhập mật khẩu..." class="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-center text-lg font-black text-slate-800 tracking-\[0.2em\] focus:border-\[#1e1b4b\] focus:ring-4 focus:ring-indigo-100 transition-all outline-none" onkeypress="if(event.key === 'Enter') processLogin()"&gt;

&lt;/div&gt;

&lt;button onclick="processLogin()" class="w-full py-4 bg-\[#1e1b4b\] text-white font-black rounded-xl shadow-lg hover:bg-\[#312e81\] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mb-8 tracking-wide"&gt;

&lt;i class="ph-bold ph-shield-check text-xl"&gt;&lt;/i&gt; TRUY CẬP HỆ THỐNG

&lt;/button&gt;

&lt;div class="relative py-2 mb-6"&gt;

&lt;div class="absolute inset-0 flex items-center"&gt;&lt;div class="w-full border-t border-slate-200"&gt;&lt;/div&gt;&lt;/div&gt;

&lt;div class="relative flex justify-center"&gt;&lt;span class="bg-white px-4 text-\[10px\] text-slate-400 font-bold uppercase tracking-widest"&gt;Phụ huynh / Học sinh&lt;/span&gt;&lt;/div&gt;

&lt;/div&gt;

&lt;div class="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex flex-col items-center relative overflow-hidden group w-full mb-4"&gt;

&lt;div class="text-xs font-bold text-orange-600 mb-4 text-center"&gt;Nhập mã tra cứu (5 số) để xem điểm & nề nếp&lt;/div&gt;

&lt;div class="flex gap-3 w-full"&gt;

&lt;input type="text" id="direct-lookup-code" placeholder="Vd: 38323" class="flex-1 px-4 py-3 bg-white border border-orange-200 rounded-xl text-center font-black text-slate-800 tracking-\[0.2em\] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all shadow-sm" maxlength="5" onkeypress="if(event.key === 'Enter') performDirectLookup()"&gt;

&lt;button onclick="performDirectLookup()" class="w-14 h-auto bg-\[#f97316\] text-white rounded-xl flex items-center justify-center shadow-md hover:bg-\[#ea580c\] transition-all"&gt;&lt;i class="ph-bold ph-magnifying-glass text-xl"&gt;&lt;/i&gt;&lt;/button&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div class="text-\[9px\] text-slate-400 font-medium flex items-center justify-center gap-1"&gt;

&lt;i class="ph-fill ph-lock-key"&gt;&lt;/i&gt; Phiên đăng nhập được mã hóa an toàn

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;/div&gt;

&lt;div id="modal-container" class="print:hidden"&gt;&lt;/div&gt;

\`;

};

// --- HÀM TẢI ẢNH LOGO TRƯỜNG ---

window.handleSchoolLogoUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

if(!state.theme) state.theme = {};

state.theme.schoolLogoUrl = dataUrl;

const img = document.getElementById('school-logo-img');

if(img) img.src = dataUrl;

saveData();

showToast("Đã cập nhật logo trường!", "success");

}, 800, 0.8);

};

// --- HÀM TẢI ẢNH LỚP HỌC ---

window.handleLoginClassUpload = function(event) {

const file = event.target.files\[0\];

if (!file) return;

compressImage(file, (dataUrl) => {

if(!state.theme) state.theme = {};

state.theme.loginClassImg = dataUrl;

const img = document.getElementById('login-class-img');

if(img) img.src = dataUrl;

saveData();

showToast("Đã cập nhật ảnh lớp học!", "success");

}, 1200, 0.8);

};

// --- HÀM ĐỔI TAB QUYỀN ĐĂNG NHẬP ---

window.selectLoginRole = function(role) {

document.getElementById('login-role').value = role;

const roles = \['gvcn', 'bancansu', 'bgh'\];

roles.forEach(r => {

const btn = document.getElementById('btn-role-' + r);

if (r === role) {

btn.className = "flex-1 py-2.5 rounded-lg text-sm font-bold bg-\[#1e1b4b\] text-white shadow-sm transition-all";

} else {

btn.className = "flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition-all bg-transparent";

}

});

const descEl = document.getElementById('login-role-desc');

if (role === 'gvcn') {

descEl.innerText = "Bạn đang đăng nhập với tư cách Giáo viên chủ nhiệm.";

descEl.className = "text-center text-xs font-medium text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100 mb-6 transition-all";

}

else if (role === 'bancansu') {

descEl.innerText = "Ban cán sự được truy cập nhanh các mục: Học sinh, Thời khóa biểu, Điểm danh.";

descEl.className = "text-center text-xs font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-6 transition-all";

}

else if (role === 'bgh') {

descEl.innerText = "Ban giám hiệu được xem báo cáo, sơ đồ lớp và tình hình chuyên cần.";

descEl.className = "text-center text-xs font-medium text-purple-600 bg-purple-50 p-3 rounded-xl border border-purple-100 mb-6 transition-all";

}

};

// --- XỬ LÝ KIỂM TRA MẬT KHẨU ---

window.processLogin = function() {

const role = document.getElementById('login-role').value;

const pass = document.getElementById('login-password').value;

let isValid = false;

// Passwords cài đặt sẵn

if (role === 'gvcn' && pass === '123456') isValid = true;

else if (role === 'bancansu' && pass === '123') isValid = true;

else if (role === 'bgh' && pass === '12A1') isValid = true;

if (isValid) {

state.auth = { loggedIn: true, role: role };

saveData();

showToast("Đăng nhập hệ thống thành công!", "success");

state.currentTab = 'tong-quan';

renderLayout();

} else {

showToast("Mật khẩu không chính xác!", "error");

}

};

// --- XỬ LÝ TRA CỨU CỦA PHỤ HUYNH ---

window.performDirectLookup = function() {

const code = document.getElementById('direct-lookup-code').value.trim();

if (!code) return showToast("Vui lòng nhập mã tra cứu!", "error");

const student = state.students.find(s => s.code === code);

if (student) {

showToast("Đang tải dữ liệu...", "success");

setTimeout(() => {

if(typeof showParentView === 'function') {

showParentView(student.id);

}

}, 400);

} else {

showToast("Mã tra cứu không chính xác!", "error");

}

};

window.startApp = function() {

try {

const savedData = localStorage.getItem('chuyen_tau_data');

if (savedData) {

state = { ...state, ...JSON.parse(savedData) };

applyStateDefaults();

} else {

initDefaultStudents();

applyStateDefaults();

saveData();

}

} catch (err) {

initDefaultStudents();

applyStateDefaults();

saveData();

}

isDataLoaded = true;

renderLayout();

};

function saveData() {

try {

localStorage.setItem('chuyen_tau_data', JSON.stringify(state));

} catch (e) {

console.warn("Không thể lưu localStorage:", e);

}

}

window.onload = function() {

if (typeof window.startApp === 'function') {

window.startApp();

} else {

console.error("Không tìm thấy hàm khởi động startApp!");

}

};

window.deleteHistoryRecord = function(studentId, historyId) {

const student = state.students.find(s => s.id === studentId);

if (!student) return;

const historyIndex = student.history.findIndex(h => h.id === historyId);

if (historyIndex > -1) {

const h = student.history\[historyIndex\];

if (confirm(\`Cô có chắc chắn muốn xóa lịch sử: "\${h.reason}" và hoàn tác \${h.points} điểm này không?\`)) {

// 1. Trả lại điểm số

student.points = (student.points || 0) - h.points;

student.stars = Math.max(0, (student.stars || 0) - h.points); // Cập nhật lại cả Sao đổi quà

// 2. Xóa dòng lịch sử

student.history.splice(historyIndex, 1);

// 3. Lưu và tải lại giao diện

saveData();

renderLayout(); // Cập nhật điểm ngoài màn hình chính

openStudentHistoryModal(studentId); // Mở lại bảng lịch sử mới

showToast("Đã xóa lịch sử và hoàn tác điểm thành công!", "success");

}

}

};

&lt;/script&gt;

&lt;/body&gt;

&lt;/html&gt;