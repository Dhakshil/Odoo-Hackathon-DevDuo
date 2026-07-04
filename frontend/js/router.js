import { showSpinner, showToast } from './ui.js';

const routes = {
    'dashboard': './pages/dashboard.js',
    'employees': './pages/employees.js',
    'attendance': './pages/attendance.js',
    'leaves': './pages/leaves.js',
    'profile': './pages/profile.js',
    'payroll': './pages/payroll.js'
};

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

async function handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const app = document.getElementById('app');
    const role = localStorage.getItem('role');
    
    // Guard for admin routes - NOW WITH TOAST!
    if (hash === 'employees' && role !== 'admin') {
        showToast('Access Denied: Admins only!', 'err');
        window.location.hash = 'dashboard';
        return;
    }

    showSpinner(app);
    try {
        const module = await import(routes[hash]);
        app.innerHTML = '';
        module.render(app);
        updateActiveLink(hash);
        document.getElementById('page-title').textContent = hash.charAt(0).toUpperCase() + hash.slice(1).replace('-', ' ');
    } catch (err) {
        app.innerHTML = `<div class="text-center py-20"><p class="text-4xl mb-4">🌋</p><p class="text-v-stone-l">Page loading or under construction...</p></div>`;
    }
}

function updateActiveLink(hash) {
    document.querySelectorAll('#sidebar-nav a').forEach(a => {
        a.classList.remove('nav-active');
        if (a.dataset.page === hash) a.classList.add('nav-active');
    });
}