window.RegistrarViewComponent = {
    props: {
        projetos: { type: Array, default: () => ['Atividade'] },
        categorias: { type: Array, default: () => [] },
        modoRegistro: { type: String, default: 'manual' },
        form: { type: Object, required: true },
        duracaoCalculadaHoras: { type: Number, default: 0 },
        enviandoRegistro: { type: Boolean, default: false },
        timerAtivo: { type: Boolean, default: false },
        cronometroDisplay: { type: String, default: '00:00:00' },
        usuario: { type: Object, default: () => ({ nome: '', cargo: '', login: '' }) }
    },
    emits: ['mudar-modo', 'salvar-registro', 'iniciar-cronometro', 'parar-cronometro'],
    template: `
        <div class="max-w-3xl mx-auto space-y-6 pb-10">
            <div class="flex p-1 bg-slate-200 rounded-lg w-full sm:w-max mx-auto md:mx-0">
                <button @click="$emit('mudar-modo', 'manual')" class="flex-1 sm:flex-none px-5 py-2 rounded-md font-medium text-sm transition-colors"
                    :class="modoRegistro === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-500'">Manual</button>
                <button @click="$emit('mudar-modo', 'cronometro')" class="flex-1 sm:flex-none px-5 py-2 rounded-md font-medium text-sm transition-colors"
                    :class="modoRegistro === 'cronometro' ? 'bg-white shadow text-slate-800' : 'text-slate-500'">Cronómetro</button>
            </div>

            <div v-if="modoRegistro === 'cronometro'" class="bg-slate-900 text-white rounded-xl shadow-xl p-8 flex flex-col items-center relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-800 to-transparent opacity-50"></div>
                <h3 class="text-slate-300 mb-4 uppercase text-xs font-bold tracking-widest relative z-10 flex items-center">
                    <i class="fa-solid fa-circle text-red-500 text-[8px] animate-pulse mr-2" v-if="timerAtivo"></i> Monitorização de Atividade
                </h3>
                <div class="text-5xl sm:text-7xl font-mono font-bold mb-8 relative z-10 tracking-tight">{{ cronometroDisplay }}</div>
                <div class="flex gap-4 relative z-10 w-full sm:w-auto">
                    <button v-if="!timerAtivo" @click="$emit('iniciar-cronometro')" class="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-full font-bold shadow-lg transition">Iniciar</button>
                    <button v-else @click="$emit('parar-cronometro')" class="w-full sm:w-auto bg-red-500 hover:bg-red-600 px-8 py-3 rounded-full font-bold shadow-lg transition"><i class="fa-solid fa-stop mr-2"></i>Parar e Preencher</button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <form @submit.prevent="$emit('salvar-registro')" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Membro Responsável (Automático)</label>
                            <div class="flex items-center gap-3 w-full border border-slate-200 p-2.5 rounded-lg bg-slate-100 text-slate-700">
                                <div class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                    {{ (usuario.nome || 'U').substring(0,2).toUpperCase() }}
                                </div>
                                <div class="truncate">
                                    <p class="text-sm font-bold text-slate-800 leading-tight">{{ usuario.nome }}</p>
                                    <p class="text-xs text-slate-500">@{{ usuario.login }} ({{ usuario.cargo }})</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Data da Atividade *</label>
                            <input v-model="form.data" type="date" required class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition text-sm" />
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Projeto *</label>
                            <select v-model="form.projeto" required class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition text-sm">
                                <option value="" disabled>Selecione o projeto...</option>
                                <option v-for="p in projetos" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Categoria da Atividade *</label>
                            <select v-model="form.categoria" required class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition text-sm">
                                <option value="" disabled>Classifique a sua atividade...</option>
                                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Hora de Início *</label>
                            <input v-model="form.inicio" type="time" required class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition font-mono text-sm" />
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Hora de Término *</label>
                            <input v-model="form.termino" type="time" required class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition font-mono text-sm" />
                        </div>
                        
                        <div class="md:col-span-2">
                            <div class="p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between border transition-colors" :class="duracaoCalculadaHoras > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'">
                                <span class="text-slate-600 font-medium mb-1 sm:mb-0"><i class="fa-solid fa-calculator mr-2 opacity-50"></i>Tempo Calculado:</span>
                                <span class="text-2xl font-bold" :class="duracaoCalculadaHoras > 0 ? 'text-emerald-700' : 'text-slate-400'">{{ duracaoCalculadaHoras }} horas</span>
                            </div>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Descrição Detalhada *</label>
                            <textarea v-model="form.descricao" rows="3" required maxlength="500" placeholder="Descreva brevemente o que foi feito..." class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition resize-none text-sm"></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4 border-t border-slate-100">
                        <button type="submit" :disabled="enviandoRegistro" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70">
                            <span v-if="enviandoRegistro"><i class="fa-solid fa-spinner fa-spin"></i> A registar...</span>
                            <span v-else><i class="fa-solid fa-check"></i> Registar Atividade</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
