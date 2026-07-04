import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    const role = localStorage.getItem('role');

    if (role === 'admin') {
        await renderAdminView(container);
    } else {
        await renderEmployeeView(container);
    }
}

// ==========================================
// EMPLOYEE VIEW: Apply Form + My Leaves
// ==========================================
async function renderEmployeeView(container) {
    try {
        const data = await api.get('/leaves/my');
        const leaves = data.leaves || [];

        container.innerHTML = `
            <div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <!-- Apply Form -->
                <div class="lg:col-span-1 bg-v-charcoal border border-v-stone/20 rounded-xl p-5 h-fit">
                    <h3 class="text-sm font-semibold text-v-ash mb-4 border-b border-v-stone/20 pb-3">Apply for Leave</h3>
                    <form id="leave-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Type</label>
                            <select id="l-type" required class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash focus:outline-none focus:border-v-orange">
                                <option value="Sick">Sick Leave</option>
                                <option value="Paid">Paid Leave</option>
                                <option value="Unpaid">Unpaid Leave</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Start Date</label>
                            <input type="date" id="l-start" required class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash focus:outline-none focus:border-v-orange [color-scheme:dark]">
                        </div>
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">End Date</label>
                            <input type="date" id="l-end" required class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash focus:outline-none focus:border-v-orange [color-scheme:dark]">
                        </div>
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Remarks</label>
                            <textarea id="l-remarks" rows="3" required class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange resize-none" placeholder="Reason for leave..."></textarea>
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors">Submit Request</button>
                    </form>
                </div>

                <!-- My Leaves Table -->
                <div class="lg:col-span-2 bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
                    <div class="p-4 border-b border-v-stone/20">
                        <h3 class="text-sm font-semibold text-v-ash">My History</h3>
                    </div>
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-v-stone/20 bg-v-black/30">
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Type</th>
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Dates</th>
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l hidden md:table-cell">Remarks</th>
                                <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Status</th>
                            </tr>
                        </thead>
                        <tbody id="my-leaves-tbody">
                            ${renderLeaveRows(leaves, false)}
                        </tbody>
                    </table>
                    ${leaves.length === 0 ? '<p class="text-center text-v-stone-l text-sm py-10">No leave history found.</p>' : ''}
                </div>
            </div>
        `;

        // Handle Form Submit
        document.getElementById('leave-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Submitting...';
            try {
                const newLeave = await api.post('/leaves', {
                    type: document.getElementById('l-type').value,
                    startDate: document.getElementById('l-start').value,
                    endDate: document.getElementById('l-end').value,
                    remarks: document.getElementById('l-remarks').value
                });
                document.getElementById('my-leaves-tbody').insertAdjacentHTML('afterbegin', renderLeaveRows([newLeave], false));
                e.target.reset();
                showToast('Leave applied successfully!', 'ok');
            } catch (err) {
                showToast(err.details?.[0]?.message || 'Failed to apply', 'err');
            } finally {
                btn.disabled = false; btn.textContent = 'Submit Request';
            }
        });

    } catch (err) {
        showToast('Failed to load leaves', 'err');
    }
}

// ==========================================
// ADMIN VIEW: Approval Table
// ==========================================
async function renderAdminView(container) {
    try {
        const data = await api.get('/leaves/all');
        const leaves = data.leaves || [];

        container.innerHTML = `
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
                <div class="p-4 border-b border-v-stone/20 flex justify-between items-center">
                    <h3 class="text-sm font-semibold text-v-ash">All Leave Requests</h3>
                    <span class="text-xs text-warn font-medium bg-warn/10 px-2 py-1 rounded">${leaves.filter(l => l.status === 'pending').length} Pending</span>
                </div>
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-v-stone/20 bg-v-black/30">
                            <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Employee</th>
                            <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Type</th>
                            <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Dates</th>
                            <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l hidden md:table-cell">Remarks</th>
                            <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-leaves-tbody">
                        ${leaves.map(l => renderAdminRow(l)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        showToast('Failed to load admin leaves', 'err');
    }
}

function renderAdminRow(l) {
    const isPending = l.status === 'pending';
    return `
        <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
            <td class="px-4 py-3 font-medium text-v-ash">${l.user.name}</td>
            <td class="px-4 py-3 text-v-stone-l">${l.type}</td>
            <td class="px-4 py-3 text-v-stone-l">${l.startDate} ${l.endDate !== l.startDate ? '→ ' + l.endDate : ''}</td>
            <td class="px-4 py-3 text-v-stone-l hidden md:table-cell">${l.remarks}</td>
            <td class="px-4 py-3 text-right">
                ${isPending ? `
                    <div class="flex items-center justify-end gap-2">
                        <input type="text" placeholder="Comment..." class="w-24 px-2 py-1 bg-v-black/50 border border-v-stone/30 rounded text-xs text-v-ash focus:outline-none focus:border-ok comment-input">
                        <button onclick="handleAdminAction(${l.id}, 'approved', this)" class="px-3 py-1 text-xs font-medium rounded-md bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20 transition-colors">Approve</button>
                        <button onclick="handleAdminAction(${l.id}, 'rejected', this)" class="px-3 py-1 text-xs font-medium rounded-md bg-err/10 text-err border border-err/30 hover:bg-err/20 transition-colors">Reject</button>
                    </div>
                ` : `<span class="px-2.5 py-1 rounded-full text-xs font-medium ${l.status === 'approved' ? 'bg-ok/15 text-ok' : 'bg-err/15 text-err'}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span>`}
            </td>
        </tr>
    `;
}

// Global function for button clicks
window.handleAdminAction = async (id, status, btn) => {
    const row = btn.closest('tr');
    const comment = row.querySelector('.comment-input')?.value || '';
    btn.disabled = true;
    btn.textContent = '...';
    
    try {
        await api.patch(`/leaves/${id}/status`, { status, comment });
        showToast(`Leave ${status}!`, status === 'approved' ? 'ok' : 'warn');
        // Refresh the page data smoothly
        render(document.getElementById('app'));
    } catch (err) {
        showToast('Action failed', 'err');
        btn.disabled = false;
    }
};

// ==========================================
// HELPER: Render Employee Table Rows
// ==========================================
function renderLeaveRows(leaves) {
    return leaves.map(l => {
        let statusClass = 'bg-warn/15 text-warn';
        if (l.status === 'approved') statusClass = 'bg-ok/15 text-ok';
        if (l.status === 'rejected') statusClass = 'bg-err/15 text-err';

        return `
            <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                <td class="px-4 py-3 text-v-ash">${l.type}</td>
                <td class="px-4 py-3 text-v-stone-l">${l.startDate} ${l.endDate !== l.startDate ? '→ ' + l.endDate : ''}</td>
                <td class="px-4 py-3 text-v-stone-l hidden md:table-cell">${l.remarks}</td>
                <td class="px-4 py-3 text-right">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}