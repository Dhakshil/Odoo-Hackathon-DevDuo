import { API_URL } from './config.js';

// ==========================================
// 🔥 MOCK MODE: Change to false when backend is ready!
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
    if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 400));
        return handleMock(method, path, body);
    }
    const options = { method, headers: getHeaders(!!body) };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, options);
    const data = await res.json();
    if (!data.success) throw data.error || { code: 'UNKNOWN_ERROR', details: ['An unknown error occurred'] };
    return data.data;
}

function handleMock(method, path, body) {
    const role = localStorage.getItem('role');

    // 1. Auth
    if (path === '/auth/signup') return { token: 'mock_token', user: { id: 1, name: body.name, email: body.email, role: body.role, employee_id: body.employee_id } };
    if (path === '/auth/signin') return { token: 'mock_token', user: { id: 1, name: 'Mock User', email: body.email, role: 'admin', employee_id: 'EMP001' } };
    
    // 2. Dashboard (Role-based exactly like backend)
    if (path === '/dashboard/stats') {
        if (role === 'admin') {
            return { 
                total_employees: 24, 
                pending_leaves: 5, 
                present_today: 18, 
                recent_activities: [
                    { id: 1, user: { name: 'Alice' }, type: 'Sick', startDate: '2025-01-20', status: 'pending' },
                    { id: 2, user: { name: 'Bob' }, type: 'Paid', startDate: '2025-01-22', status: 'pending' }
                ] 
            };
        } else {
            return { 
                my_total_leaves: 12, 
                my_pending_leaves: 1, 
                last_5_attendance_records: [
                    { date: '2025-01-20', check_in: '09:05 AM', check_out: '06:10 PM', status: 'present' },
                    { date: '2025-01-19', check_in: '09:15 AM', check_out: '06:00 PM', status: 'present' }
                ] 
            };
        }
    }

    // 3. Attendance
    if (path === '/attendance/check-in') return { id: 1, check_in_time: new Date().toISOString() };
    if (path === '/attendance/check-out') return { id: 1, check_out_time: new Date().toISOString(), status: 'present' };
    if (path === '/attendance/my') {
        return { records: [
            { date: '2025-01-20', check_in: '09:05 AM', check_out: '06:10 PM', status: 'present' },
            { date: '2025-01-19', check_in: '09:15 AM', check_out: '06:00 PM', status: 'present' },
            { date: '2025-01-18', check_in: null, check_out: null, status: 'absent' }
        ]};
    }

    // 4. Leaves
    if (path === '/leaves/my') {
        return { leaves: [
            { id: 1, type: 'Sick', startDate: '2025-01-22', endDate: '2025-01-23', status: 'approved', remarks: 'Had a fever' },
            { id: 2, type: 'Paid', startDate: '2025-01-28', endDate: '2025-01-28', status: 'pending', remarks: 'Personal work' }
        ]};
    }
    if (path === '/leaves/all') {
        return { leaves: [
            { id: 2, user: { name: 'Me' }, type: 'Paid', startDate: '2025-01-28', endDate: '2025-01-28', status: 'pending', remarks: 'Personal work' },
            { id: 3, user: { name: 'Alice' }, type: 'Sick', startDate: '2025-01-25', endDate: '2025-01-26', status: 'pending', remarks: 'Dentist' },
            { id: 4, user: { name: 'Bob' }, type: 'Unpaid', startDate: '2025-01-20', endDate: '2025-01-22', status: 'approved', remarks: 'Vacation' }
        ]};
    }
    if (method === 'POST' && path === '/leaves') {
        return { id: 99, type: body.type, startDate: body.startDate, endDate: body.endDate, status: 'pending', remarks: body.remarks };
    }
    // FIXED: Backend teammate said path is /leaves/1, NOT /leaves/1/status
    if (method === 'PATCH' && path.startsWith('/leaves/') && path.split('/').length === 3) {
        const id = path.split('/')[2];
        return { id: id, status: body.status, comment: body.comment };
    }
        // 5. Profile
    if (path === '/profile') {
        const user = JSON.parse(localStorage.getItem('user'));
        return {
            name: user.name || 'Mock User',
            employee_id: user.employee_id || 'EMP001',
            email: user.email || 'mock@test.com',
            phone: '+91 98765 43210',
            department: 'Engineering',
            designation: 'Software Developer',
            address: '123 Volcanic St, Tech City',
            join_date: '2023-05-15'
        };
    }

    // 6. Payroll
    if (path === '/payroll/my') {
        return {
            month: 'January', year: 2025,
            basic: 50000, hra: 20000, 
            allowances: { transport: 5000, medical: 2500, bonus: 7500 },
            deductions: { pf: 6000, tax: 8000, insurance: 1500 },
            net_pay: 69500
        };
    }
    if (path === '/payroll/all') {
        return { salaries: [
            { user: { name: 'Alice', employee_id: 'EMP002' }, month: 'Jan 2025', net_pay: 72000 },
            { user: { name: 'Bob', employee_id: 'EMP003' }, month: 'Jan 2025', net_pay: 65000 },
            { user: { name: 'Charlie', employee_id: 'EMP004' }, month: 'Jan 2025', net_pay: 81000 }
        ]};
    }
    if (method === 'PATCH' && path === '/profile') {
        return { success: true, message: 'Profile updated' };
    }

    throw { details: [{ message: 'Mock route not found' }] };
}

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path)
};