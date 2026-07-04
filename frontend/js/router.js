import { showSpinner, showToast } from './ui.js';

const routes = {
    dashboard: './pages/dashboard.js',
    employees: './pages/employees.js',
    attendance: './pages/attendance.js',
    leaves: './pages/leaves.js',
    profile: './pages/profile.js',
    payroll: './pages/payroll.js'
};

export function initRouter() {
    window.removeEventListener('hashchange', handleRoute);
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

async function handleRoute() {
    const hash = (window.location.hash.slice(1) || 'dashboard').toLowerCase();
    const app = document.getElementById('app');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const role = (localStorage.getItem('role') || storedUser.role || 'employee').toLowerCase();

    if (!routes[hash]) {
        window.location.hash = 'dashboard';
        return;
    }

    if (hash === 'employees' && role !== 'admin' && role !== 'hr') {
        showToast('Access Denied: Admins only!', 'err');
        window.location.hash = 'dashboard';
        return;
    }

    if (app) showSpinner(app);
    try {
        const module = await import(routes[hash]);
        if (app) {
            app.innerHTML = '';
            module.render(app);
        }
        updateActiveLink(hash);
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = hash.charAt(0).toUpperCase() + hash.slice(1).replace('-', ' ');
        }
    } catch (error) {
        console.error('Failed to load page', error);
        if (app) {
            app.innerHTML = `<div class="text-center py-20"><p class="text-4xl mb-4">🌋</p><p class="text-v-stone-l">Page loading or under construction...</p></div>`;
        }
    }
}

function updateActiveLink(hash) {
    document.querySelectorAll('#sidebar-nav a').forEach((a) => {
        a.classList.remove('nav-active');
        if (a.dataset.page === hash) a.classList.add('nav-active');
    });
}