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
                            ${profile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-v-ash">${profile.name}</h2>
                            <p class="text-sm text-v-orange font-medium">${profile.designation}</p>
                        </div>
                    </div>

                    <!-- Details Grid -->
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
                            <p class="text-sm text-v-ash">${profile.phone}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Department</p>
                            <p class="text-sm text-v-ash">${profile.department}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Join Date</p>
                            <p class="text-sm text-v-ash">${new Date(profile.join_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div>
                            <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1">Address</p>
                            <p class="text-sm text-v-ash">${profile.address}</p>
                        </div>
                    </div>

                    ${role === 'admin' ? `
                    <!-- Admin Only: Edit Button -->
                    <div class="px-6 pb-6">
                        <button id="edit-profile-btn" class="px-5 py-2 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors">
                            Edit Profile
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Edit button mock action
        if (role === 'admin') {
            document.getElementById('edit-profile-btn').addEventListener('click', async () => {
                const btn = document.getElementById('edit-profile-btn');
                btn.disabled = true; btn.textContent = 'Saving...';
                try {
                    await api.patch('/profile', { name: profile.name });
                    showToast('Profile updated successfully!', 'ok');
                } catch (err) {
                    showToast('Failed to update', 'err');
                } finally {
                    btn.disabled = false; btn.textContent = 'Edit Profile';
                }
            });
        }

    } catch (err) {
        showToast('Failed to load profile', 'err');
    }
}