import { API_URL } from './config.js';

const USE_MOCK = false; 

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
    
    try {
        const res = await fetch(`${API_URL}${path}`, options);
        const data = await res.json();
        if (!data.success) throw data.error || { code: 'UNKNOWN_ERROR', details: ['An unknown error occurred'] };
        return data.data;
    } catch (error) {
        // If it's a network error or syntax error
        if (error instanceof TypeError) {
            throw { code: 'NETWORK_ERROR', details: ['Cannot connect to backend server'] };
        }
        throw error;
    }
}

// Keep the handleMock function exactly as it was in your file...
function handleMock(method, path, body) {
    const role = localStorage.getItem('role');
    if (path === '/auth/signup') return { otp: "1234", message: "OTP sent to email" };
    if (path === '/auth/verify') {
        if (body.otp === "1234") return { success: true, data: { verified: true }, message: "Email verified successfully" };
        throw { details: ["Invalid OTP. Please try again."] };
    }
    if (path === '/auth/signin') return { token: 'mock_token', user: { id: 1, name: 'Mock User', email: body.email, role: 'hr', employee_id: 'EMP001' } };
    if (path === '/dashboard/stats') {
        if (role === 'hr') {
            return { total_employees: 24, pending_leaves: 5, present_today: 18, recent_activities: [ { id: 1, user: { name: 'Alice' }, type: 'Sick', startDate: '2025-01-20', status: 'pending' } ] };
        }
        return { my_total_leaves: 12, my_pending_leaves: 1, last_5_attendance_records: [ { date: '2025-01-20', check_in: '09:05 AM', check_out: '06:10 PM', status: 'present' } ] };
    }
    if (path === '/attendance/my') return { records: [ { date: '2025-01-20', check_in: '09:05 AM', check_out: '06:10 PM', status: 'present' } ] };
    if (path === '/leaves/my') return { leaves: [ { id: 1, type: 'Sick', startDate: '2025-01-22', endDate: '2025-01-23', status: 'approved', remarks: 'Had a fever' } ] };
    if (path === '/leaves/all') return { leaves: [ { id: 2, user: { name: 'Me' }, type: 'Paid', startDate: '2025-01-28', endDate: '2025-01-28', status: 'pending', remarks: 'Personal work' } ] };
    if (method === 'POST' && path === '/leaves') return { id: 99, type: body.type, startDate: body.startDate, endDate: body.endDate, status: 'pending', remarks: body.remarks };
    if (method === 'PATCH' && path.startsWith('/leaves/')) return { id: 1, status: body.status, comment: body.comment };
    if (path === '/profile') return { name: 'Mock User', employee_id: 'EMP001', email: 'mock@test.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Software Developer', address: '123 Volcanic St', join_date: '2023-05-15' };
    if (path === '/payroll/my') return { month: 'January', year: 2025, basic: 50000, hra: 20000, allowances: { transport: 5000, medical: 2500, bonus: 7500 }, deductions: { pf: 6000, tax: 8000, insurance: 1500 }, net_pay: 69500 };
    if (path === '/payroll/all') return { salaries: [ { user: { name: 'Alice', employee_id: 'EMP002' }, month: 'Jan 2025', net_pay: 72000 } ] };
    if (method === 'PATCH' && path === '/profile') return { success: true, message: 'Profile updated' };
    throw { details: ['Mock route not found'] };
}

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path)
};