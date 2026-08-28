window.ModalConfirmacaoComponent = {
    props: {
        aberto: { type: Boolean, default: false },
        titulo: { type: String, default: 'Confirmação' },
        mensagem: { type: String, default: 'Deseja realmente prosseguir com esta ação?' },
        textoConfirmar: { type: String, default: 'Confirmar' },
        textoCancelar: { type: String, default: 'Cancelar' },
        tipo: { type: String, default: 'destrutivo' },
        carregando: { type: Boolean, default: false }
    },
    emits: ['confirmar', 'cancelar'],
    template: `
        <div v-if="aberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9990] p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-7 w-full max-w-md border border-slate-100 transform transition-all">
                <div class="flex items-start gap-4">
                    <div 
                        class="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                        :class="{
                            'bg-red-100 text-red-600': tipo === 'destrutivo',
                            'bg-amber-100 text-amber-600': tipo === 'aviso',
                            'bg-blue-100 text-blue-600': tipo === 'padrao'
                        }">
                        <i v-if="tipo === 'destrutivo'" class="fa-solid fa-triangle-exclamation"></i>
                        <i v-else-if="tipo === 'aviso'" class="fa-solid fa-circle-exclamation"></i>
                        <i v-else class="fa-solid fa-circle-question"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-slate-800">{{ titulo }}</h3>
                        <p class="text-sm text-slate-600 mt-1.5 leading-relaxed">{{ mensagem }}</p>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-7 pt-4 border-t border-slate-100">
                    <button 
                        type="button" 
                        @click="$emit('cancelar')" 
                        :disabled="carregando"
                        class="px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition text-sm disabled:opacity-50">
                        {{ textoCancelar }}
                    </button>
                    <button 
                        type="button" 
                        @click="$emit('confirmar')" 
                        :disabled="carregando"
                        class="px-5 py-2.5 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center gap-2 disabled:opacity-50"
                        :class="{
                            'bg-red-600 hover:bg-red-700 shadow-red-600/30': tipo === 'destrutivo',
                            'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30': tipo === 'aviso',
                            'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30': tipo === 'padrao'
                        }">
                        <i v-if="carregando" class="fa-solid fa-circle-notch fa-spin"></i>
                        <span>{{ textoConfirmar }}</span>
                    </button>
                </div>
            </div>
        </div>
    `
};
