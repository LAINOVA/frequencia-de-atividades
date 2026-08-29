window.ToastContainerComponent = {
    props: {
        toasts: { type: Array, default: () => [] }
    },
    emits: ['fechar'],
    template: `
        <div class="fixed top-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <div 
                v-for="toast in toasts" 
                :key="toast.id" 
                class="pointer-events-auto p-4 rounded-xl shadow-xl flex items-start gap-3 border transition-all duration-300 transform translate-y-0"
                :class="{
                    'bg-emerald-50 border-emerald-200 text-emerald-900': toast.tipo === 'sucesso',
                    'bg-red-50 border-red-200 text-red-900': toast.tipo === 'erro',
                    'bg-amber-50 border-amber-200 text-amber-900': toast.tipo === 'aviso',
                    'bg-blue-50 border-blue-200 text-blue-900': toast.tipo === 'info'
                }"
            >
                <i class="mt-0.5 text-lg shrink-0" :class="{
                    'fa-solid fa-circle-check text-emerald-600': toast.tipo === 'sucesso',
                    'fa-solid fa-circle-xmark text-red-600': toast.tipo === 'erro',
                    'fa-solid fa-triangle-exclamation text-amber-600': toast.tipo === 'aviso',
                    'fa-solid fa-circle-info text-blue-600': toast.tipo === 'info'
                }"></i>
                <div class="flex-1 text-sm font-medium leading-snug">{{ toast.mensagem }}</div>
                <button @click="$emit('fechar', toast.id)" class="text-slate-400 hover:text-slate-700 transition">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    `
};
