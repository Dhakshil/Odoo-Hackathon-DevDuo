import { api } from '../api.js';
import { showToast } from '../ui.js';

let currentSignupEmail = '';

export function render(container) {
    container.innerHTML = `
        <div class="w-full max-w-md relative">
            <div class="absolute -inset-4 bg-v-orange/5 rounded-3xl blur-2xl"></div>
            <div class="relative bg-v-charcoal border border-v-stone/20 rounded-2xl p-8">
                
                <div class="text-center mb-8">
                    <h1 class="text-2xl font-bold text-v-ash tracking-tight">HR<span class="text-v-orange">MS</span></h1>
                    <p class="text-xs text-v-stone-l mt-1">Human Resource Management System</p>
                </div>

                <div id="view-auth">
                    <div class="flex border-b border-v-stone/20 mb-6">
                        <button id="tab-signin" class="flex-1 pb-3 text-sm font-medium text-v-orange border-b-2 border-v-orange transition-colors">Sign In</button>
                        <button id="tab-signup" class="flex-1 pb-3 text-sm font-medium text-v-stone-l hover:text-v-ash transition-colors">Sign Up</button>
                    </div>

                    <form id="signin-form" class="space-y-4">
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Email</label>
                            <input type="email" id="si-email" placeholder="admin@test.com" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
                        </div>
                        <div>
                            <label class="block text-xs font-medium uppercase tracking-wider text-v-stone-l mb-1.5">Password</label>
                            <input type="password" id="si-password" placeholder="••••••••" required class="w-full px-3 py-2.5 bg-v-black/50 border border-v-stone/30 rounded-lg text-sm text-v-ash placeholder-v-stone focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange transition-colors">
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
                                    <option value="hr">HR / Admin</option>
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

                <div id="view-otp" class="hidden text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-v-orange/10 flex items-center justify-center text-3xl">✉️</div>
                    <h2 class="text-xl font-bold text-v-ash mb-2">Verify Your Email</h2>
                    <p class="text-sm text-v-stone-l mb-6">Enter the 4-digit code sent to your email.</p>
                    
                    <div class="bg-v-orange/10 border border-v-orange/30 rounded-lg p-3 mb-6 inline-block">
                        <p class="text-[10px] text-v-orange font-bold uppercase tracking-widest">Demo OTP</p>
                        <p class="text-3xl font-bold text-v-orange tracking-[0.5em] font-mono" id="display-otp">----</p>
                    </div>

                    <div class="flex justify-center gap-3 mb-6" id="otp-inputs">
                        <input type="text" maxlength="1" class="otp-input w-14 h-14 text-center text-2xl font-bold bg-v-black/50 border border-v-stone/30 rounded-lg text-v-ash focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange">
                        <input type="text" maxlength="1" class="otp-input w-14 h-14 text-center text-2xl font-bold bg-v-black/50 border border-v-stone/30 rounded-lg text-v-ash focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange">
                        <input type="text" maxlength="1" class="otp-input w-14 h-14 text-center text-2xl font-bold bg-v-black/50 border border-v-stone/30 rounded-lg text-v-ash focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange">
                        <input type="text" maxlength="1" class="otp-input w-14 h-14 text-center text-2xl font-bold bg-v-black/50 border border-v-stone/30 rounded-lg text-v-ash focus:outline-none focus:border-v-orange focus:ring-1 focus:ring-v-orange">
                    </div>

                    <button id="verify-btn" class="w-full py-2.5 bg-v-orange hover:bg-v-orange-h text-v-black font-semibold text-sm rounded-lg transition-colors mb-3">Verify & Continue</button>
                    <button id="back-to-auth" class="w-full py-2 text-sm text-v-stone-l hover:text-v-ash transition-colors">← Back to Sign In</button>
                </div>
            </div>
        </div>
    `;
    initLogic();
}

function initLogic() {
    const viewAuth = document.getElementById('view-auth');
    const viewOtp = document.getElementById('view-otp');
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const formSignin = document.getElementById('signin-form');
    const formSignup = document.getElementById('signup-form');

    tabSignin.addEventListener('click', () => { formSignin.classList.remove('hidden'); formSignup.classList.add('hidden'); tabSignin.classList.add('text-v-orange', 'border-v-orange'); tabSignin.classList.remove('text-v-stone-l'); tabSignup.classList.remove('text-v-orange', 'border-v-orange'); tabSignup.classList.add('text-v-stone-l'); });
    tabSignup.addEventListener('click', () => { formSignup.classList.remove('hidden'); formSignin.classList.add('hidden'); tabSignup.classList.add('text-v-orange', 'border-v-orange'); tabSignup.classList.remove('text-v-stone-l'); tabSignin.classList.remove('text-v-orange', 'border-v-orange'); tabSignin.classList.add('text-v-stone-l'); });

    formSignin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('si-btn');
        btn.disabled = true; btn.textContent = 'Signing In...';
        try {
            // FIXED: Changed /auth/login to /auth/signin
            const data = await api.post('/auth/signin', { email: document.getElementById('si-email').value, password: document.getElementById('si-password').value });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', data.user.role);
            showToast('Login successful!', 'ok');
            window.location.reload();
        } catch (error) {
            const msg = Array.isArray(error.details) ? error.details[0] : 'Login failed';
            // FIXED: Check for NOT_VERIFIED code
            if (error.code === 'NOT_VERIFIED') {
                showToast('Please verify your email first!', 'warn');
                showOtpView(document.getElementById('si-email').value, '----');
            } else {
                showToast(msg, 'err');
            }
            btn.disabled = false; btn.textContent = 'Sign In';
        }
    });

    formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('su-btn');
        const email = document.getElementById('su-email').value;
        btn.disabled = true; btn.textContent = 'Sending OTP...';
        
        try {
            const data = await api.post('/auth/signup', {
                name: document.getElementById('su-name').value,
                employee_id: document.getElementById('su-empid').value,
                email: email,
                password: document.getElementById('su-password').value,
                role: document.getElementById('su-role').value
            });
            
            showToast('OTP Sent to your email!', 'ok');
            showOtpView(email, data.otp);
            
        } catch (error) {
            const msg = Array.isArray(error.details) ? error.details[0] : 'Signup failed';
            showToast(msg, 'err');
        } finally {
            btn.disabled = false; btn.textContent = 'Create Account';
        }
    });

    function showOtpView(email, otp) {
        currentSignupEmail = email;
        viewAuth.classList.add('hidden');
        viewOtp.classList.remove('hidden');
        document.getElementById('display-otp').textContent = otp;
        
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach((input, index) => {
            input.value = '';
            input.addEventListener('input', (e) => {
                if (e.target.value && index < inputs.length - 1) inputs[index + 1].focus();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) inputs[index - 1].focus();
            });
        });
        inputs[0].focus();
    }

    document.getElementById('verify-btn').addEventListener('click', async () => {
        const btn = document.getElementById('verify-btn');
        const inputs = document.querySelectorAll('.otp-input');
        const enteredOtp = Array.from(inputs).map(i => i.value).join('');
        
        if (enteredOtp.length !== 4) {
            showToast('Please enter 4 digits', 'warn');
            return;
        }

        btn.disabled = true; btn.textContent = 'Verifying...';
        try {
            await api.post('/auth/verify', { email: currentSignupEmail, otp: enteredOtp });
            showToast('Email Verified! Please sign in.', 'ok');
            
            viewOtp.classList.add('hidden');
            viewAuth.classList.remove('hidden');
            tabSignin.click();
            document.getElementById('si-email').value = currentSignupEmail;
            document.getElementById('si-password').focus();
            
        } catch (error) {
            const msg = Array.isArray(error.details) ? error.details[0] : 'Verification failed';
            showToast(msg, 'err');
            inputs.forEach(i => i.value = '');
            inputs[0].focus();
        } finally {
            btn.disabled = false; btn.textContent = 'Verify & Continue';
        }
    });

    document.getElementById('back-to-auth').addEventListener('click', () => {
        viewOtp.classList.add('hidden');
        viewAuth.classList.remove('hidden');
    });
}