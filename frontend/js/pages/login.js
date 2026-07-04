import { api } from '../api.js';
import { showToast } from '../ui.js';

export function render(container) {
    container.innerHTML = `
        <div class="w-full max-w-md relative">
            <div class="absolute -inset-4 bg-v-orange/5 rounded-3xl blur-2xl"></div>
            <div class="relative bg-v-charcoal border border-v-stone/20 rounded-2xl p-8">
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-v-ash tracking-tight">HR<span class="text-v-orange">MS</span></h1>
                    <p class="text-xs text-v-stone-l mt-1">Human Resource Management System</p>
                </div>
                <div class="flex border-b border-v-stone/20 mb-6">
                    <button id="tab-signin" class="flex-1 pb-3 text-sm font-medium text-v-orange border-b-2 border-v-orange transition-colors">Sign In</button>
                    <button id="tab-signup" class="flex-1 pb-3 text-sm font-medium text-v-stone-l hover:text-v-ash transition-colors">Sign Up</button>
                </div>

                <form id="signin-form" class="space-y-4">
                    <div>
                        <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Email</label>
                        <input type="email" id="si-email" placeholder="admin@test.com" value="admin@test.com" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Password</label>
                        <input type="password" id="si-password" placeholder="••••••••" value="password123" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                    </div>
                    <button type="submit" id="si-btn" class="w-full py-2.5 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors">Sign In</button>
                </form>

                <form id="signup-form" class="space-y-4 hidden">
                    <div>
                        <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Full Name</label>
                        <input type="text" id="su-name" placeholder="John Doe" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Employee ID</label>
                            <input type="text" id="su-empid" placeholder="EMP001" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Role</label>
                            <select id="su-role" class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash focus:outline-none focus:border-v-orange transition-colors">
                                <option value="employee">Employee</option>
                                <option value="admin">HR / Admin</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Email</label>
                        <input type="email" id="su-email" placeholder="you@company.com" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                    </div>
                    <div>
                        <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Password</label>
                        <input type="password" id="su-password" placeholder="Min 6 characters" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                    </div>
                    <button type="submit" id="su-btn" class="w-full py-2.5 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors">Create Account</button>
                </form>
            </div>
        </div>
    `;

    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');

    tabSignin.addEventListener('click', () => { formSignin.classList.remove('hidden'); formSignup.classList.add('hidden'); tabSignin.classList.add('text-v-orange', 'border-v-orange'); tabSignin.classList.remove('text-v-stone-l'); tabSignup.classList.remove('text-v-orange', 'border-v-orange'); tabSignup.classList.add('text-v-stone-l'); });
    tabSignup.addEventListener('click', () => { formSignup.classList.remove('hidden'); formSignin.classList.add('hidden'); tabSignup.classList.add('text-v-orange', 'border-v-orange'); tabSignup.classList.remove('text-v-stone-l'); tabSignin.classList.remove('text-v-orange', 'border-v-orange'); tabSignin.classList.add('text-v-stone-l'); });

    const formSignin = document.getElementById('signin-form');
    const formSignup = document.getElementById('signup-form');

    formSignin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('si-btn');
        btn.disabled = true; btn.textContent = 'Signing In...';
        try {
            const data = await api.post('/auth/signin', { email: document.getElementById('si-email').value, password: document.getElementById('si-password').value });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Login successful!', 'ok');
            window.location.reload();
        } catch (error) { showToast(error.details?.[0]?.message || 'Login failed', 'err'); btn.disabled = false; btn.textContent = 'Sign In'; }
    });

    formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('su-btn');
        btn.disabled = true; btn.textContent = 'Creating...';
        try {
            await api.post('/auth/signup', { name: document.getElementById('su-name').value, employee_id: document.getElementById('su-empid').value, email: document.getElementById('su-email').value, password: document.getElementById('su-password').value, role: document.getElementById('su-role').value });
            showToast('Account created!', 'ok'); tabSignin.click(); document.getElementById('si-email').value = document.getElementById('su-email').value;
        } catch (error) { showToast(error.details?.[0]?.message || 'Signup failed', 'err'); }
        finally { btn.disabled = false; btn.textContent = 'Create Account'; }
    });
}