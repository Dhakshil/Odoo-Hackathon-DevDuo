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
                    <!-- Header -->
                    <div class="p-6 border-b border-v-stone/20 flex items-center gap-4 bg-v-black/20">
                        <div class="w-16 h-16 rounded-full bg-v-orange/20 border-2 border-v-orange flex items-center justify-center text-xl font-bold text-v-orange">
                            ${profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-v-ash">${profile.name || 'User'}</h2>
                            <p class="text-sm text-v-orange font-medium">${profile.job_title || 'Employee'}</p>
                        </div>
                    </div>

                    <!-- View Details Grid -->
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5" id="profile-details">
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
                            <p class="text-sm text-v-ash" id="display-phone">${profile.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Department</p>
                            <p class="text-sm text-v-ash" id="display-dept">${profile.department || 'N/A'}</p>
                        </div>
                        <div class="md:col-span-2">
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Address</p>
                            <p class="text-sm text-v-ash" id="display-address">${profile.address || 'N/A'}</p>
                        </div>
                    </div>

                    <!-- Edit Form (Hidden by default) -->
                    <div class="p-6 hidden" id="profile-edit-form">
                        <h3 class="text-lg font-bold text-v-ash mb-4">Edit Profile</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Phone</label>
                                <input type="text" id="edit-phone" value="${profile.phone || ''}" class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash">
                            </div>
                            <div>
                                <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Department</label>
                                <input type="text" id="edit-dept" value="${profile.department || ''}" class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash" ${role === 'employee' ? 'disabled' : ''}>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Address</label>
                                <textarea id="edit-address" rows="2" class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash">${profile.address || ''}</textarea>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Job Title</label>
                                <input type="text" id="edit-title" value="${profile.job_title || ''}" class="w-full px-3 py-2 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash" ${role === 'employee' ? 'disabled' : ''}>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button id="save-profile-btn" class="px-5 py-2 bg-ok text-v-black font-semibold text-sm rounded-lg transition-colors">Save Changes</button>
                            <button id="cancel-edit-btn" class="px-5 py-2 bg-v-stone/30 text-v-ash font-semibold text-sm rounded-lg transition-colors">Cancel</button>
                        </div>
                    </div>

                    <div class="px-6 pb-6" id="edit-btn-container">
                        <button id="edit-profile-btn" class="px-5 py-2 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors">Edit Profile</button>
                    </div>
                </div>
            </div>
        `;

        // Show Edit Form
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            document.getElementById('profile-details').classList.add('hidden');
            document.getElementById('edit-btn-container').classList.add('hidden');
            document.getElementById('profile-edit-form').classList.remove('hidden');
        });

        // Cancel Edit
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            document.getElementById('profile-details').classList.remove('hidden');
            document.getElementById('edit-btn-container').classList.remove('hidden');
            document.getElementById('profile-edit-form').classList.add('hidden');
        });

        // Save Profile
        document.getElementById('save-profile-btn').addEventListener('click', async () => {
            const btn = document.getElementById('save-profile-btn');
            btn.disabled = true; btn.textContent = 'Saving...';
            
            try {
                const payload = {
                    phone: document.getElementById('edit-phone').value,
                    address: document.getElementById('edit-address').value
                };

                // Only HR can send these fields (Employee inputs are disabled)
                if (role === 'hr') {
                    payload.department = document.getElementById('edit-dept').value;
                    payload.job_title = document.getElementById('edit-title').value;
                }

                await api.patch('/profile', payload);
                showToast('Profile updated successfully!', 'ok');
                
                // Refresh page to show new data
                render(document.getElementById('app'));
            } catch (err) {
                const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to update';
                showToast(msg, 'err');
                btn.disabled = false; btn.textContent = 'Save Changes';
            }
        });

    } catch (err) {
        const msg = Array.isArray(err.details) ? err.details[0] : 'Failed to load profile';
        showToast(msg, 'err');
    }
}