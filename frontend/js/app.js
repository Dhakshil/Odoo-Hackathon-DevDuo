import { initRouter } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (token) {
        initApp();
    } else {
        showAuth();
    }

    document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
    document.getElementById('sidebar-overlay').addEventListener('click', toggleSidebar);
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.reload();
    });

    updateClock();
    setInterval(updateClock, 1000);
});

function showAuth() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    import('./pages/login.js').then(mod => {
        const authDiv = document.getElementById('auth-container');
        authDiv.innerHTML = ''; 
        mod.render(authDiv);
    });
}

function initApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    const user = JSON.parse(localStorage.getItem('user'));
    const displayName = user.name || user.email || 'User';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    document.getElementById('user-info').innerHTML = `
        <div class="w-8 h-8 rounded-full bg-v-orange/20 flex items-center justify-center text-xs font-bold text-v-orange">${initials}</div>
        <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-v-ash truncate">${displayName}</p>
            <p class="text-[10px] text-v-stone-l uppercase">${user.role}</p>
        </div>
    `;

    buildSidebar(user.role);
    initRouter();
}

function buildSidebar(role) {
    const nav = document.getElementById('sidebar-nav');
    const links = [
        { page: 'dashboard', label: 'Dashboard', img: 'https://z-cdn-media.chatglm.cn/files/41ab38ca-4377-4577-91ff-9f947d04bb06.png?auth_key=1883159015-c67332abf3e04afdaa098311c678ff24-0-fc42cba58fdb9af9e3572d49be91415c', adminOnly: false },
        { page: 'employees', label: 'Employees', img: 'https://z-cdn-media.chatglm.cn/files/58333250-f1de-48f7-a583-f2b402cb2101.png?auth_key=1883158378-19c4b063b3124e7ea6cacf7b7327740c-0-89d20d5e7eefc8561122554634d2037b', adminOnly: true },
        { page: 'attendance', label: 'Attendance', img: 'https://z-cdn-media.chatglm.cn/files/16fb6c50-43ca-4da5-a065-4d3c96c2ac89.png?auth_key=1883158378-17cc1f88f51847f1aca1e0493cb93b26-0-70d38bc46a0f64b97475051c35f54022', adminOnly: false },
        { page: 'leaves', label: 'Leave Mgmt', img: 'https://z-cdn-media.chatglm.cn/files/1a314bf9-4378-4c11-ae5b-52e71706edd3.png?auth_key=1883158378-d3dbd97eef8f40c3bf3f2f04a59df743-0-72963e7d12c59df2bf160e27ab659f77', adminOnly: false },
        { page: 'profile', label: 'My Profile', img: 'https://z-cdn-media.chatglm.cn/files/d0ddd2a8-b92f-41c2-89c6-6c6084eec4e9.png?auth_key=1883158378-7fd318464a7b43a8bcd5ab1890e656fe-0-35c7ca15f63bc5b41369cb56ec8c3de4', adminOnly: false },
        { page: 'payroll', label: 'Payroll', img: 'https://z-cdn-media.chatglm.cn/files/6af06cf1-53fe-4306-a9b3-ded5d50efe71.png?auth_key=1883158378-6c9d39f1b0474aa6a1b499801ca2c9b6-0-68a779f7be7f979d3156a12342d34ea4', adminOnly: false },
    ];

    nav.innerHTML = links.filter(l => !l.adminOnly || role === 'hr')
        .map(l => `
            <a href="#${l.page}" data-page="${l.page}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-v-stone-l hover:text-v-ash hover:bg-v-hover transition-colors border-l-2 border-transparent -ml-[2px]">
                <img src="${l.img}" alt="${l.label}" class="w-5 h-5 object-contain">
                <span>${l.label}</span>
            </a>
        `).join('');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.toggle('hidden');
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const clockEl = document.getElementById('live-clock');
    if(clockEl) clockEl.textContent = timeStr;
}