import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    const role = localStorage.getItem('role');

    try {
        if (role === 'admin') {
            await renderAdminPayroll(container);
        } else {
            await renderEmployeePayroll(container);
        }
    } catch (err) {
        showToast('Failed to load payroll data', 'err');
    }
}

async function renderEmployeePayroll(container) {
    const data = await api.get('/payroll/my');
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto">
            <!-- Main Net Pay Card -->
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-6 text-center mb-6 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-v-orange"></div>
                <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-2">Net Salary for ${data.month} ${data.year}</p>
                <p class="text-5xl font-bold text-v-orange">₹${data.net_pay.toLocaleString('en-IN')}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Earnings -->
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5">
                    <h3 class="text-sm font-semibold text-ok mb-4 border-b border-v-stone/20 pb-2">Earnings</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Basic Salary</span><span class="text-v-ash">₹${data.basic.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">HRA</span><span class="text-v-ash">₹${data.hra.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Transport</span><span class="text-v-ash">₹${data.allowances.transport.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Medical</span><span class="text-v-ash">₹${data.allowances.medical.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Bonus</span><span class="text-v-ash">₹${data.allowances.bonus.toLocaleString('en-IN')}</span></div>
                    </div>
                </div>

                <!-- Deductions -->
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-5">
                    <h3 class="text-sm font-semibold text-err mb-4 border-b border-v-stone/20 pb-2">Deductions</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Provident Fund</span><span class="text-v-ash">- ₹${data.deductions.pf.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Tax (TDS)</span><span class="text-v-ash">- ₹${data.deductions.tax.toLocaleString('en-IN')}</span></div>
                        <div class="flex justify-between text-sm"><span class="text-v-stone-l">Insurance</span><span class="text-v-ash">- ₹${data.deductions.insurance.toLocaleString('en-IN')}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function renderAdminPayroll(container) {
    const data = await api.get('/payroll/all');

    container.innerHTML = `
        <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
            <div class="p-4 border-b border-v-stone/20">
                <h3 class="text-sm font-semibold text-v-ash">Employee Payroll Overview - ${data.salaries[0]?.month || 'Jan 2025'}</h3>
            </div>
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-v-stone/20 bg-v-black/30">
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Employee</th>
                        <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Emp ID</th>
                        <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Net Salary</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.salaries.map(s => `
                        <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                            <td class="px-4 py-3 font-medium text-v-ash">${s.user.name}</td>
                            <td class="px-4 py-3 text-v-stone-l font-mono text-xs">${s.user.employee_id}</td>
                            <td class="px-4 py-3 text-right text-v-orange font-semibold">₹${s.net_pay.toLocaleString('en-IN')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}