import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    const role = localStorage.getItem('role');
    
    try {
        const stats = await api.get('/dashboard/stats');
        
        if (role === 'admin') {
            renderAdminDashboard(container, stats);
        } else {
            renderEmployeeDashboard(container, stats);
        }
    } catch (err) {
        showToast('Failed to load dashboard data', 'err');
    }
}

function renderAdminDashboard(container, stats) {
    container.innerHTML = `
        <!-- Admin Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-v-orange hover:border-v-stone/40 transition-all">
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Total Employees</p>
                <p class="text-3xl font-bold text-v-ash">${stats.total_employees}</p>
            </div>
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-ok hover:border-v-stone/40 transition-all">
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Present Today</p>
                <p class="text-3xl font-bold text-ok">${stats.present_today}</p>
            </div>
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-warn hover:border-v-stone/40 transition-all">
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Pending Leaves</p>
                <p class="text-3xl font-bold text-warn">${stats.pending_leaves}</p>
            </div>
        </div>

        <!-- Recent Activities Table -->
        <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-v-stone/20 flex justify-between items-center">
                <h3 class="text-sm font-semibold text-v-ash">Recent Leave Requests</h3>
                <a href="#leaves" class="text-xs text-v-orange hover:text-v-orange-h transition-colors">View All →</a>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-v-stone/20 bg-v-black/30">
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Employee</th>
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Type</th>
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Date</th>
                        <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.recent_activities.map(l => `
                        <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                            <td class="px-4 py-3 font-medium text-v-ash">${l.user.name}</td>
                            <td class="px-4 py-3 text-v-stone-l">${l.type}</td>
                            <td class="px-4 py-3 text-v-stone-l">${l.startDate}</td>
                            <td class="px-4 py-3 text-right space-x-2">
                                <button onclick="dashApprove(${l.id}, 'approved')" class="px-3 py-1 text-xs font-medium rounded-md bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20 transition-colors">Approve</button>
                                <button onclick="dashApprove(${l.id}, 'rejected')" class="px-3 py-1 text-xs font-medium rounded-md bg-err/10 text-err border border-err/30 hover:bg-err/20 transition-colors">Reject</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderEmployeeDashboard(container, stats) {
    container.innerHTML = `
        <!-- Employee Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-v-orange hover:border-v-stone/40 transition-all">
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">My Total Leaves</p>
                <p class="text-3xl font-bold text-v-ash">${stats.my_total_leaves}</p>
            </div>
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-warn hover:border-v-stone/40 transition-all">
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Pending Approvals</p>
                <p class="text-3xl font-bold text-warn">${stats.my_pending_leaves}</p>
            </div>
        </div>

        <!-- Recent Attendance Table -->
        <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-v-stone/20 flex justify-between items-center">
                <h3 class="text-sm font-semibold text-v-ash">My Recent Attendance</h3>
                <a href="#attendance" class="text-xs text-v-orange hover:text-v-orange-h transition-colors">View All →</a>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-v-stone/20 bg-v-black/30">
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Date</th>
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Check In</th>
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Check Out</th>
                        <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.last_5_attendance_records.map(r => `
                        <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                            <td class="px-4 py-3 text-v-ash font-medium">${r.date}</td>
                            <td class="px-4 py-3 text-v-stone-l font-mono text-xs">${r.check_in || '---'}</td>
                            <td class="px-4 py-3 text-v-stone-l font-mono text-xs">${r.check_out || '---'}</td>
                            <td class="px-4 py-3 text-right">
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium ${r.status === 'present' ? 'bg-ok/15 text-ok' : 'bg-err/15 text-err'}">
                                    ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Global handler for Dashboard Quick Approve/Reject (Matches backend /leaves/1 path)
window.dashApprove = async (id, status) => {
    try {
        // Fixed path: /leaves/1 instead of /leaves/1/status
        await api.patch(`/leaves/${id}`, { status, comment: 'Quick action from dashboard' });
        showToast(`Leave ${status}!`, status === 'approved' ? 'ok' : 'warn');
        render(document.getElementById('app')); // Refresh dashboard
    } catch (err) {
        showToast('Action failed', 'err');
    }
};