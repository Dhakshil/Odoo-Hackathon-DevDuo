import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    const role = localStorage.getItem('role');
    const user = JSON.parse(localStorage.getItem('user'));

    try {
        if (role === 'hr') {
            await renderAdminPayroll(container);
        } else {
            await renderEmployeePayroll(container, user.id);
        }
    } catch (err) {
        const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to load payroll data';
        showToast(msg, 'err');
    }
}

async function renderEmployeePayroll(container, userId) {
    const data = await api.get(`/payroll/${userId}`);
    const baseSalary = data.base_salary || 0;
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-6 text-center mb-6 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-v-orange"></div>
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-2">Monthly Base Salary</p>
                <p class="text-5xl font-bold text-v-orange">₹${baseSalary.toLocaleString('en-IN')}</p>
            </div>
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5">
                <h3 class="text-sm font-semibold text-ok mb-4 border-b border-v-stone/20 pb-2">Salary Structure</h3>
                <div class="space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-v-stone-l">Base Pay</span>
                        <span class="text-v-ash">₹${baseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between text-sm pt-2 border-t border-v-stone/10">
                        <span class="text-v-stone-l font-medium">Total Net Pay</span>
                        <span class="text-v-orange font-bold">₹${baseSalary.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function renderAdminPayroll(container) {
    const employees = await api.get('/employees');

    container.innerHTML = `
        <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-v-stone/20">
                <h3 class="text-sm font-semibold text-v-ash">Employee Payroll Control</h3>
                <p class="text-xs text-v-stone-l mt-1">Click 'Edit' to update an employee's base salary.</p>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-v-stone/20 bg-v-black/30">
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Employee</th>
                        <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Current Salary</th>
                        <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Action</th>
                    </tr>
                </thead>
                <tbody id="payroll-tbody">
                    ${employees.map(s => `
                        <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                            <td class="px-4 py-3 font-medium text-v-ash">
                                ${s.name || 'Unknown'}
                                <p class="text-xs text-v-stone-l font-mono">${s.employee_id}</p>
                            </td>
                            <td class="px-4 py-3 text-right text-v-orange font-semibold" id="salary-display-${s.id}">
                                ₹${(s.base_salary || 0).toLocaleString('en-IN')}
                            </td>
                            <td class="px-4 py-3 text-right">
                                <div id="action-area-${s.id}" class="flex justify-end gap-2">
                                    <button onclick="showEditSalary(${s.id}, ${s.base_salary || 0})" class="px-3 py-1.5 text-xs font-medium rounded-md bg-v-orange/10 text-v-orange border border-v-orange/30 hover:bg-v-orange/20 transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${employees.length === 0 ? '<p class="text-center text-v-stone-l text-sm py-10">No employee data found.</p>' : ''}
        </div>
    `;
}

// Make function global so inline onclick="" can access it
window.showEditSalary = (id, currentSalary) => {
    const actionArea = document.getElementById(`action-area-${id}`);
    actionArea.innerHTML = `
        <input type="number" id="salary-input-${id}" value="${currentSalary}" class="w-28 px-2 py-1 bg-v-black/50 border border-v-stone/30 rounded text-right text-v-ash focus:outline-none focus:border-v-orange">
        <button onclick="saveSalary(${id})" class="px-3 py-1.5 text-xs font-medium rounded-md bg-ok text-v-black hover:bg-ok/80 transition-colors">Save</button>
        <button onclick="cancelEdit(${id}, ${currentSalary})" class="px-3 py-1.5 text-xs font-medium rounded-md bg-err/10 text-err border border-err/30 hover:bg-err/20 transition-colors">Cancel</button>
    `;
};

window.cancelEdit = (id, currentSalary) => {
    const actionArea = document.getElementById(`action-area-${id}`);
    actionArea.innerHTML = `<button onclick="showEditSalary(${id}, ${currentSalary})" class="px-3 py-1.5 text-xs font-medium rounded-md bg-v-orange/10 text-v-orange border border-v-orange/30 hover:bg-v-orange/20 transition-colors">Edit</button>`;
};

window.saveSalary = async (id) => {
    const inputVal = document.getElementById(`salary-input-${id}`).value;
    const newSalary = parseFloat(inputVal);
    
    if (isNaN(newSalary) || newSalary < 0) {
        showToast('Please enter a valid number', 'err');
        return;
    }

    try {
        // Call backend to update salary
        await api.patch(`/payroll/${id}`, { base_salary: newSalary });
        
        // Update UI instantly
        document.getElementById(`salary-display-${id}`).textContent = `₹${newSalary.toLocaleString('en-IN')}`;
        cancelEdit(id, newSalary); // Reset action button with new value
        showToast('Salary updated successfully!', 'ok');
    } catch (err) {
        const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to update salary';
        showToast(msg, 'err');
    }
};