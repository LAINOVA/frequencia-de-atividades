window.ToastContainerComponent = {
    props: {
        toasts: { type: Array, default: () => [] }
    },
    emits: ['fechar-toast'],
    template: `
        <div class="fixed top-5 right-5 z-[9999] space-y-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
            <transition-group 
                enter-active-class="transform ease-out duration-300 transition"
                enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
                enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
                leave-active-class="transition ease-in duration-200"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <div 
                    v-for="t in toasts" 
                    :key="t.id" 
                    class="pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 text-sm bg-white"
                    :class="{
                        'border-emerald-200 text-emerald-900 bg-emerald-50/90': t.tipo === 'sucesso',
                        'border-red-200 text-red-900 bg-red-50/90': t.tipo === 'erro',
                        'border-amber-200 text-amber-900 bg-amber-50/90': t.tipo === 'aviso',
                        'border-blue-200 text-blue-900 bg-blue-50/90': t.tipo === 'info'
                    }">
                    <div class="mt-0.5 text-base shrink-0">
                        <i v-if="t.tipo === 'sucesso'" class="fa-solid fa-circle-check text-emerald-600"></i>
                        <i v-else-if="t.tipo === 'erro'" class="fa-solid fa-circle-xmark text-red-600"></i>
                        <i v-else-if="t.tipo === 'aviso'" class="fa-solid fa-triangle-exclamation text-amber-600"></i>
                        <i v-else class="fa-solid fa-circle-info text-blue-600"></i>
                    </div>
                    <div class="flex-1 font-medium leading-snug">
                        {{ t.mensagem }}
                    </div>
                    <button 
                        @click="$emit('fechar-toast', t.id)" 
                        class="text-slate-400 hover:text-slate-600 transition -mr-1 -mt-1 p-1">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </transition-group>
        </div>
    `
};
