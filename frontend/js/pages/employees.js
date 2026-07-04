import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);

    try {
        const employees = await api.get('/employees');
        
        container.innerHTML = `
            <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
                <div class="p-4 border-b border-v-stone/20">
                    <h3 class="text-sm font-semibold text-v-ash">Company Directory</h3>
                    <p class="text-xs text-v-stone-l mt-1">Click 'View' to see detailed profile and payroll data.</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-v-stone/20 bg-v-black/30">
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Employee</th>
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l hidden md:table-cell">Job Title</th>
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l hidden lg:table-cell">Department</th>
                                <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Base Salary</th>
                                <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${employees.map(emp => `
                                <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-full bg-v-orange/10 flex items-center justify-center text-xs font-bold text-v-orange">
                                                ${emp.name ? emp.name.split(' ').map(n=>n[0]).join('') : 'U'}
                                            </div>
                                            <div>
                                                <p class="font-medium text-v-ash">${emp.name || 'Unknown'}</p>
                                                <p class="text-xs text-v-stone-l">${emp.employee_id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-v-stone-l hidden md:table-cell">${emp.job_title || 'N/A'}</td>
                                    <td class="px-4 py-3 text-v-stone-l hidden lg:table-cell">${emp.department || 'N/A'}</td>
                                    <td class="px-4 py-3 text-right text-v-ash font-mono">₹${emp.base_salary ? emp.base_salary.toLocaleString('en-IN') : '0'}</td>
                                    <td class="px-4 py-3 text-right">
                                        <button onclick="loadEmployeeDetails(${emp.id})" class="px-3 py-1.5 text-xs font-medium rounded-md bg-v-orange/10 text-v-orange border border-v-orange/30 hover:bg-v-orange/20 transition-colors">View</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${employees.length === 0 ? '<p class="text-center text-v-stone-l text-sm py-10">No employees found.</p>' : ''}
            </div>

            <div id="emp-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/70" onclick="closeEmpModal()"></div>
                <div class="relative bg-v-charcoal border border-v-stone/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50 transform scale-95 opacity-0 transition-all duration-300" id="emp-modal-content">
                    <div class="sticky top-0 bg-v-charcoal border-b border-v-stone/20 p-5 flex justify-between items-center z-10">
                        <h3 class="text-lg font-bold text-v-ash" id="modal-emp-name">Employee Details</h3>
                        <button onclick="closeEmpModal()" class="text-v-stone-l hover:text-v-ash text-2xl leading-none">&times;</button>
                    </div>
                    <div class="p-6 space-y-6" id="modal-body">
                        <div class="flex justify-center py-10 text-v-stone-l text-sm">Loading data...</div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to load employees';
        showToast(msg, 'err');
    }
}

window.loadEmployeeDetails = async (userId) => {
    const modal = document.getElementById('emp-modal');
    const modalContent = document.getElementById('emp-modal-content');
    const modalBody = document.getElementById('modal-body');
    const modalName = document.getElementById('modal-emp-name');

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    });

    modalBody.innerHTML = '<div class="flex justify-center py-10"><div class="w-8 h-8 border-2 border-v-orange border-t-transparent rounded-full animate-spin"></div></div>';

    try {
        const [profile, payroll] = await Promise.all([
            api.get(`/profile/${userId}`),
            api.get(`/payroll/${userId}`)
        ]);

        modalName.textContent = profile.name || 'Employee Details';

        modalBody.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-v-black/30 rounded-lg p-4 border border-v-stone/10">
                    <p class="text-xs text-v-stone-l uppercase mb-1">Employee ID</p>
                    <p class="text-sm text-v-ash font-mono">${profile.employee_id || userId}</p>
                </div>
                <div class="bg-v-black/30 rounded-lg p-4 border border-v-stone/10">
                    <p class="text-xs text-v-stone-l uppercase mb-1">Email</p>
                    <p class="text-sm text-v-ash">${profile.email || 'N/A'}</p>
                </div>
                <div class="bg-v-black/30 rounded-lg p-4 border border-v-stone/10">
                    <p class="text-xs text-v-stone-l uppercase mb-1">Job Title</p>
                    <p class="text-sm text-v-ash">${profile.job_title || 'N/A'}</p>
                </div>
                <div class="bg-v-black/30 rounded-lg p-4 border border-v-stone/10">
                    <p class="text-xs text-v-stone-l uppercase mb-1">Department</p>
                    <p class="text-sm text-v-ash">${profile.department || 'N/A'}</p>
                </div>
            </div>

            <div>
                <h4 class="text-sm font-semibold text-v-ash mb-3 border-b border-v-stone/20 pb-2">Salary Structure</h4>
                <div class="bg-v-black/30 rounded-lg p-4 border border-v-stone/10 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-v-stone-l uppercase">Base Salary</p>
                        <p class="text-2xl font-bold text-v-orange mt-1">₹${payroll.base_salary ? payroll.base_salary.toLocaleString('en-IN') : '0'}</p>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-v-orange/10 flex items-center justify-center text-xl">💰</div>
                </div>
            </div>
        `;
    } catch (err) {
        modalBody.innerHTML = `<p class="text-center text-err text-sm py-10">Failed to load detailed data.</p>`;
        showToast('Error loading employee details', 'err');
    }
};

window.closeEmpModal = () => {
    const modal = document.getElementById('emp-modal');
    const modalContent = document.getElementById('emp-modal-content');
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};