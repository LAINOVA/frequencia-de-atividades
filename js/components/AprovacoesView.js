window.AprovacoesViewComponent = {
    props: {
        registrosPendentes: { type: Array, default: () => [] },
        formatarDataSheet: { type: Function, required: true }
    },
    emits: ['recarregar', 'processar-status'],
    template: `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center bg-amber-50 border border-amber-200 p-4 rounded-xl gap-4">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-shield-halved text-amber-600 text-2xl"></i>
                    <div>
                        <h4 class="font-bold text-amber-900">Validação da Direção</h4>
                        <p class="text-xs text-amber-700">Avalie os registos pendentes enviados pelos elementos.</p>
                    </div>
                </div>
                <button @click="$emit('recarregar')" class="text-amber-800 hover:text-amber-950 text-sm font-semibold flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-lg transition self-end sm:self-auto">
                    <i class="fa-solid fa-arrows-rotate"></i> Recarregar
                </button>
            </div>

            <div class="space-y-4">
                <div v-for="reg in registrosPendentes" :key="reg.ID" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
                    <div class="w-full md:w-auto">
                        <div class="flex items-center gap-3 flex-wrap mb-1">
                            <span class="text-lg font-bold text-slate-800">{{ reg.Nome_Membro }}</span>
                            <span class="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{{ reg.Categoria }}</span>
                            <span class="text-slate-400 text-xs font-mono"><i class="fa-regular fa-calendar mr-1"></i>{{ formatarDataSheet(reg.Data) }}</span>
                        </div>
                        <p class="text-slate-600 text-sm break-words">{{ reg.Descricao }}</p>
                        <p class="text-emerald-700 font-bold mt-2 text-sm sm:text-base"><i class="fa-regular fa-clock mr-1"></i> {{ reg.Horas_Gastas }} horas solicitadas</p>
                    </div>
                    <div class="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <button @click="$emit('processar-status', reg.ID, 'Aprovada')" class="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition">
                            <i class="fa-solid fa-check"></i> Aprovar
                        </button>
                        <button @click="$emit('processar-status', reg.ID, 'Recusada')" class="flex-1 md:flex-initial bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition">
                            <i class="fa-solid fa-xmark"></i> Recusar
                        </button>
                    </div>
                </div>

                <div v-if="registrosPendentes.length === 0" class="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
                    <i class="fa-regular fa-circle-check text-5xl text-emerald-400 mb-4 opacity-70"></i>
                    <p class="font-bold text-slate-700 text-lg">Tudo em dia!</p>
                    <p class="text-sm mt-1">Não há nenhum registo pendente de validação no momento.</p>
                </div>
            </div>
        </div>
    `
};
