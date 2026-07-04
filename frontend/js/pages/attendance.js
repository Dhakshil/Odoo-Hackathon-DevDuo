import { api } from '../api.js';
import { showSpinner, showToast } from '../ui.js';

export async function render(container) {
    showSpinner(container);
    
    let isCheckedIn = false;
    let checkInTime = null;

    try {
        const records = await api.get('/attendance');

        // Check if already checked in today
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const todayRecord = records.find(r => r.date === todayStr);
        
        if (todayRecord && todayRecord.check_in && !todayRecord.check_out) {
            isCheckedIn = true;
            // Format time for UI
            checkInTime = new Date(todayRecord.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto">
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl p-8 mb-6 text-center">
                    <p class="text-xs font-medium uppercase tracking-wider text-v-stone-l mb-6">Today's Attendance</p>
                    <div class="flex flex-col items-center justify-center">
                        <button id="check-btn" class="w-44 h-44 rounded-full bg-v-orange text-v-black font-bold text-xl shadow-lg shadow-v-orange/30 hover:shadow-v-orange/50 hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center border-4 border-v-orange/50">
                            <span id="btn-text" class="mt-[-8px]">CHECK-IN</span>
                            <span id="btn-sub" class="text-xs font-normal mt-2 opacity-80">Click to start day</span>
                        </button>
                        <p id="status-text" class="mt-6 text-sm text-v-stone-l">You are not checked in yet.</p>
                    </div>
                </div>
                <div class="bg-v-charcoal border border-v-stone/20 rounded-xl overflow-hidden">
                    <div class="p-4 border-b border-v-stone/20">
                        <h3 class="text-sm font-semibold text-v-ash">Recent History</h3>
                    </div>
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-v-stone/20 bg-v-black/30">
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Date</th>
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Check In</th>
                                <th class="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Check Out</th>
                                <th class="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-v-stone-l">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${records.map(r => `
                                <tr class="border-b border-v-stone/10 hover:bg-v-hover transition-colors">
                                    <td class="px-4 py-3 text-v-ash font-medium">${r.date}</td>
                                    <td class="px-4 py-3 text-v-stone-l font-mono text-xs">${r.check_in ? new Date(r.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '---'}</td>
                                    <td class="px-4 py-3 text-v-stone-l font-mono text-xs">${r.check_out ? new Date(r.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '---'}</td>
                                    <td class="px-4 py-3 text-right">
                                        <span class="px-2.5 py-1 rounded-full text-xs font-medium ${r.status === 'present' ? 'bg-ok/15 text-ok' : 'bg-err/15 text-err'}">
                                            ${r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const checkBtn = document.getElementById('check-btn');
        const btnText = document.getElementById('btn-text');
        const btnSub = document.getElementById('btn-sub');
        const statusText = document.getElementById('status-text');

        // If already checked in, update UI on load
        if (isCheckedIn) {
            checkBtn.classList.remove('bg-v-orange', 'border-v-orange/50', 'shadow-v-orange/30', 'hover:shadow-v-orange/50');
            checkBtn.classList.add('bg-err', 'border-err/50', 'shadow-err/30', 'hover:shadow-err/50');
            btnText.textContent = 'CHECK-OUT';
            btnSub.textContent = `Since ${checkInTime}`;
            statusText.innerHTML = `<span class="text-ok font-medium">Checked in at ${checkInTime}</span>`;
        }

        checkBtn.addEventListener('click', async () => {
            checkBtn.disabled = true;
            checkBtn.classList.add('opacity-70');

            try {
                if (!isCheckedIn) {
                    const res = await api.post('/attendance/check-in');
                    isCheckedIn = true;
                    checkInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    
                    checkBtn.classList.remove('bg-v-orange', 'border-v-orange/50', 'shadow-v-orange/30', 'hover:shadow-v-orange/50');
                    checkBtn.classList.add('bg-err', 'border-err/50', 'shadow-err/30', 'hover:shadow-err/50');
                    btnText.textContent = 'CHECK-OUT';
                    btnSub.textContent = `Since ${checkInTime}`;
                    statusText.innerHTML = `<span class="text-ok font-medium">Checked in at ${checkInTime}</span>`;
                    
                    showToast('Successfully checked in!', 'ok');
                } else {
                    await api.post('/attendance/check-out');
                    isCheckedIn = false;
                    
                    checkBtn.classList.remove('bg-err', 'border-err/50', 'shadow-err/30', 'hover:shadow-err/50');
                    checkBtn.classList.add('bg-v-stone', 'border-v-stone/50', 'shadow-none', 'cursor-not-allowed');
                    btnText.textContent = 'FINISHED';
                    btnSub.textContent = 'Have a good day!';
                    statusText.innerHTML = `<span class="text-v-stone-l">Day completed.</span>`;
                    checkBtn.disabled = true;
                    
                    showToast('Successfully checked out!', 'ok');
                }
            } catch (err) {
                const msg = Array.isArray(err.details) ? err.details[0] : 'Action failed';
                showToast(msg, 'err');
                checkBtn.disabled = false;
                checkBtn.classList.remove('opacity-70');
            }
        });

    } catch (err) {
        showToast('Failed to load attendance data', 'err');
    }
}