window.ModalConfirmacaoComponent = {
    props: {
        aberto: { type: Boolean, default: false },
        titulo: { type: String, default: 'Confirmar Ação' },
        mensagem: { type: String, default: 'Deseja realmente continuar?' },
        textoBotao: { type: String, default: 'Confirmar' },
        perigoso: { type: Boolean, default: false },
        carregando: { type: Boolean, default: false }
    },
    emits: ['confirmar', 'cancelar'],
    template: `
        <div v-if="aberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all border border-slate-100">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                         :class="perigoso ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
                        <i :class="perigoso ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-question'" class="text-lg"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800">{{ titulo }}</h3>
                </div>
                <p class="text-slate-600 text-sm mb-6 leading-relaxed">{{ mensagem }}</p>
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" @click="$emit('cancelar')" :disabled="carregando" 
                            class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition text-sm">
                        Cancelar
                    </button>
                    <button type="button" @click="$emit('confirmar')" :disabled="carregando"
                            class="px-5 py-2.5 text-white font-bold rounded-lg shadow-md transition text-sm flex items-center gap-2"
                            :class="perigoso ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'">
                        <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
                        <span>{{ textoBotao }}</span>
                    </button>
                </div>
            </div>
        </div>
    `
};
