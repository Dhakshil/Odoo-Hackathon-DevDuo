export function showToast(message, type = 'ok') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = { ok: 'border-ok/30 text-ok', err: 'border-err/30 text-err', warn: 'border-warn/30 text-warn', info: 'border-v-orange/30 text-v-orange' };

    toast.className = `flex items-center gap-3 px-4 py-3 bg-v-charcoal border ${colors[type] || colors.info} rounded-lg shadow-xl shadow-black/40 min-w-[300px] transform translate-x-full transition-transform duration-300`;
    toast.innerHTML = `<div class="w-2 h-2 rounded-full bg-current flex-shrink-0"></div><p class="text-sm text-v-ash flex-1">${message}</p><button class="text-v-stone-l hover:text-v-ash text-lg leading-none" onclick="this.parentElement.remove()">&times;</button>`;
    
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    setTimeout(() => { toast.classList.add('translate-x-full'); setTimeout(() => toast.remove(), 300); }, 3000);
}

export function showSpinner(container) {
    container.innerHTML = `<div class="flex justify-center items-center py-20"><div class="w-8 h-8 border-2 border-v-orange border-t-transparent rounded-full animate-spin"></div></div>`;
}