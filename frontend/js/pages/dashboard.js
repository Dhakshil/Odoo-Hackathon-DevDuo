import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    
    try {
        const stats = await api.get('/dashboard/stats');
        const pendingLeaves = await api.get('/leaves?status=pending');
        
        container.innerHTML = `
            <!-- Stat Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-v-orange hover:border-v-stone/40 transition-all">
                    <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Total Employees</p>
                    <p class="text-3xl font-bold text-v-ash">${stats.totalEmployees}</p>
                </div>
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-ok hover:border-v-stone/40 transition-all">
                    <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Present Today</p>
                    <p class="text-3xl font-bold text-ok">${stats.presentToday}</p>
                </div>
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-warn hover:border-v-stone/40 transition-all">
                    <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Pending Leaves</p>
                    <p class="text-3xl font-bold text-warn">${stats.pendingLeaves}</p>
                </div>
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5 border-l-4 border-l-err hover:border-v-stone/40 transition-all">
                    <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">On Leave Today</p>
                    <p class="text-3xl font-bold text-err">${stats.onLeaveToday}</p>
                </div>
            </div>

            <!-- Pending Approvals Table -->
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
                            <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Dates</th>
                            <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingLeaves.leaves.map(l => `
                            <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                                <td class="px-4 py-3 font-medium text-v-ash">${l.user.name}</td>
                                <td class="px-4 py-3 text-v-stone-l">${l.type}</td>
                                <td class="px-4 py-3 text-v-stone-l">${l.startDate} ${l.endDate !== l.startDate ? '→ ' + l.endDate : ''}</td>
                                <td class="px-4 py-3 text-right space-x-2">
                                    <button onclick="handleMockApproval(${l.id}, 'approved')" class="px-3 py-1 text-xs font-medium rounded-md bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20 transition-colors">Approve</button>
                                    <button onclick="handleMockApproval(${l.id}, 'rejected')" class="px-3 py-1 text-xs font-medium rounded-md bg-err/10 text-err border border-err/30 hover:bg-err/20 transition-colors">Reject</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        showToast('Failed to load dashboard data', 'err');
    }
}

// Temporary global function for mock button clicks
window.handleMockApproval = (id, status) => {
    showToast(`Leave ${status}! (Backend not connected yet)`, status === 'approved' ? 'ok' : 'warn');
};