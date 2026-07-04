export function render(container) {
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="w-16 h-16 rounded-full bg-v-orange/10 flex items-center justify-center text-3xl mb-4">✈️</div>
            <h2 class="text-xl font-bold text-v-ash mb-2">Leave Management Module</h2>
            <p class="text-sm text-v-stone-l max-w-sm">This section will handle applying for leaves, viewing leave history, and the HR approval workflow.</p>
        </div>
    `;
}