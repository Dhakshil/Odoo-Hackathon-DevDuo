import { API_URL } from './config.js';

// ==========================================
// 🔥 MOCK MODE: Set to false when backend is ready!
// ==========================================
const USE_MOCK = true; 

function getHeaders(hasBody = false) {
    const headers = {};
    if (hasBody) headers['Content-Type'] = 'application/json';
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function request(method, path, body = null) {
    // --- MOCK INTERCEPTOR ---
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 400)); // Fake network delay
        return handleMock(method, path, body);
    }
    // --- REAL API ---
    const options = { method, headers: getHeaders(!!body) };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, options);
    const data = await res.json();
    if (!data.success) throw data.error || { code: 'UNKNOWN_ERROR', details: ['An unknown error occurred'] };
    return data.data;
}

// Mock Data Handler
function handleMock(method, path, body) {
    if (path === '/auth/signup') return { token: 'mock_token', user: { id: 1, name: body.name, email: body.email, role: body.role, employee_id: body.employee_id } };
    if (path === '/auth/signin') return { token: 'mock_token', user: { id: 1, name: 'Mock User', email: body.email, role: 'admin', employee_id: 'EMP001' } };
    
    if (path === '/dashboard/stats') {
        return { totalEmployees: 24, presentToday: 18, pendingLeaves: 5, onLeaveToday: 3 };
    }
    
    if (path === '/leaves?status=pending') {
        return { leaves: [
            { id: 1, user: { name: 'Alice' }, type: 'Sick', startDate: '2025-01-20', endDate: '2025-01-21', status: 'pending' },
            { id: 2, user: { name: 'Bob' }, type: 'Paid', startDate: '2025-01-22', endDate: '2025-01-22', status: 'pending' }
        ]};
    }

    throw { details: [{ message: 'Mock route not found' }] };
}

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path)
};