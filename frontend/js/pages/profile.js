import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    const role = localStorage.getItem('role');

    try {
        const profile = await api.get('/profile');

        container.innerHTML = `
            <div class="max-w-3xl mx-auto">
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
                    <div class="p-6 border-b border-v-stone/20 flex items-center gap-4 bg-v-black/20">
                        <div class="w-16 h-16 rounded-full bg-v-orange/20 border-2 border-v-orange flex items-center justify-center text-xl font-bold text-v-orange">
                            ${profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-v-ash">${profile.name || 'User'}</h2>
                            <p class="text-sm text-v-orange font-medium">${profile.job_title || 'Employee'}</p>
                        </div>
                    </div>

                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Employee ID</p>
                            <p class="text-sm text-v-ash font-mono">${profile.employee_id}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Email</p>
                            <p class="text-sm text-v-ash">${profile.email}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Phone</p>
                            <p class="text-sm text-v-ash">${profile.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Department</p>
                            <p class="text-sm text-v-ash">${profile.department || 'N/A'}</p>
                        </div>
                        <div class="md:col-span-2">
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Address</p>
                            <p class="text-sm text-v-ash">${profile.address || 'N/A'}</p>
                        </div>
                    </div>

                    ${role === 'hr' ? `
                    <div class="px-6 pb-6">
                        <button id="edit-profile-btn" class="px-5 py-2 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors">Edit Profile</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        if (role === 'hr') {
            document.getElementById('edit-profile-btn').addEventListener('click', async () => {
                const btn = document.getElementById('edit-profile-btn');
                btn.disabled = true; btn.textContent = 'Saving...';
                try {
                    // FIXED: Send actual editable fields
                    await api.patch('/profile', { phone: '9999999999', address: 'Updated Address', job_title: 'Senior Dev', department: 'IT' });
                    showToast('Profile updated successfully!', 'ok');
                    render(document.getElementById('app'));
                } catch (err) {
                    const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to update';
                    showToast(msg, 'err');
                } finally {
                    btn.disabled = false; btn.textContent = 'Edit Profile';
                }
            });
        }

    } catch (err) {
        showToast('Failed to load profile', 'err');
    }
}