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
        // Proper exception handling
        const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to load payroll data';
        showToast(msg, 'err');
    }
}

async function renderEmployeePayroll(container, userId) {
    // FIXED: Call /payroll/:userId instead of /payroll/my
    const data = await api.get(`/payroll/${userId}`);
    const baseSalary = data.base_salary || 0;
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <!-- Main Net Pay Card -->
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
                <p class="text-xs text-v-stone-l mt-4 italic">Note: Additional allowances and deductions are calculated dynamically by the finance department.</p>
            </div>
        </div>
    `;
}

async function renderAdminPayroll(container) {
    // FIXED: Call /employees to get the list, since /payroll/all doesn't exist
    const employees = await api.get('/employees');

    container.innerHTML = `
        <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-v-stone/20">
                <h3 class="text-sm font-semibold text-v-ash">Employee Payroll Overview</h3>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-v-stone/20 bg-v-black/30">
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Employee</th>
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Emp ID</th>
                        <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Base Salary</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(s => `
                        <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                            <td class="px-4 py-3 font-medium text-v-ash">${s.name || 'Unknown'}</td>
                            <td class="px-4 py-3 text-v-stone-l font-mono text-xs">${s.employee_id}</td>
                            <td class="px-4 py-3 text-right text-v-orange font-semibold">₹${s.base_salary ? s.base_salary.toLocaleString('en-IN') : '0'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${employees.length === 0 ? '<p class="text-center text-v-stone-l text-sm py-10">No employee data found.</p>' : ''}
        </div>
    `;
}