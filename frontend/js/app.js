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
        { page: 'dashboard', label: 'Dashboard', icon: '◉' },
        { page: 'employees', label: 'Employees', icon: '👤', adminOnly: true },
        { page: 'attendance', label: 'Attendance', icon: '⏱' },
        { page: 'leaves', label: 'Leave Mgmt', icon: '✈' },
        { page: 'profile', label: 'My Profile', icon: '☐' },
        { page: 'payroll', label: 'Payroll', icon: '💰' },
    ];

    nav.innerHTML = links.filter(l => !l.adminOnly || role === 'hr')
        .map(l => `
            <a href="#${l.page}" data-page="${l.page}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-v-stone-l hover:text-v-ash hover:bg-v-hover transition-colors">
                <span class="text-base">${l.icon}</span> ${l.label}
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