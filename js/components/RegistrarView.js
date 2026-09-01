window.RegistrarViewComponent = {
    props: {
        projetos: { type: Array, default: () => [] },
        categorias: { type: Array, default: () => [] },
        membros: { type: Array, default: () => [] },
        form: { type: Object, required: true },
        duracaoCalculadaHoras: { type: Number, default: 0 },
        enviandoRegistro: { type: Boolean, default: false },
        timerAtivo: { type: Boolean, default: false },
        cronometroDisplay: { type: String, default: '00:00:00' },
        usuario: { type: Object, default: () => ({ nome: '', cargo: '' }) }
    },
    emits: ['salvar-registro', 'salvar-registro-lote', 'iniciar-cronometro', 'parar-cronometro'],
    data() {
        return {
            tipoAbaLancamento: 'individual',
            modoRegistro: 'manual',
            membroIndividualSelecionado: '',
            membrosLoteSelecionados: [],
            selecionarTodosMembrosLote: false,
            modalPreviaLoteAberto: false
        };
    },
    computed: {
        podeLancarOutros() {
            const c = (this.usuario.cargo || '').toUpperCase(); return c === 'PROPRIETARIO' || c === 'ADMINISTRADOR_MASTER' || c === 'ADMINISTRADOR' || c === 'GESTOR';
        }
    },
    methods: {
        alternarSelecionarTodos() {
            if (this.selecionarTodosMembrosLote) {
                this.membrosLoteSelecionados = this.membros.map(m => m.login);
            } else {
                this.membrosLoteSelecionados = [];
            }
        },
        abrirPreviaLote() {
            if (this.membrosLoteSelecionados.length === 0) {
                this.$root.adicionarToast?.("Selecione pelo menos um membro para o lançamento em lote.", "aviso");
                return;
            }
            if (this.duracaoCalculadaHoras <= 0) {
                this.$root.adicionarToast?.("Horário inválido. Verifique o início e o término.", "aviso");
                return;
            }
            this.modalPreviaLoteAberto = true;
        },
        confirmarLote() {
            this.modalPreviaLoteAberto = false;
            this.$emit('salvar-registro-lote', {
                loginsMembros: this.membrosLoteSelecionados,
                data: this.form.data,
                inicio: this.form.inicio,
                termino: this.form.termino,
                projeto: this.form.projeto,
                categoria: this.form.categoria,
                horas: this.duracaoCalculadaHoras,
                descricao: this.form.descricao
            });
        },
        submeterIndividual() {
            this.$emit('salvar-registro', {
                loginAlvo: this.podeLancarOutros && this.membroIndividualSelecionado ? this.membroIndividualSelecionado : null
            });
        }
    },
    mounted() {
        this.membroIndividualSelecionado = this.usuario.login;
    },
    template: `
        <div class="max-w-4xl mx-auto space-y-6 pb-10">
            <!-- Abas Superiores: Individual vs Em Lote (Admins) -->
            <div v-if="podeLancarOutros" class="flex p-1 bg-slate-200 rounded-xl w-full sm:w-max mx-auto md:mx-0">
                <button @click="tipoAbaLancamento = 'individual'" class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                    :class="tipoAbaLancamento === 'individual' ? 'bg-white shadow text-slate-800' : 'text-slate-600 hover:text-slate-900'">
                    <i class="fa-solid fa-user"></i> Lançamento Individual
                </button>
                <button @click="tipoAbaLancamento = 'lote'" class="flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                    :class="tipoAbaLancamento === 'lote' ? 'bg-emerald-600 shadow text-white' : 'text-slate-600 hover:text-slate-900'">
                    <i class="fa-solid fa-users-gear"></i> Lançamento em Lote
                </button>
            </div>

            <!-- Sub-abas Modo Individual: Manual vs Cronômetro -->
            <div v-if="tipoAbaLancamento === 'individual'" class="flex p-1 bg-slate-100 rounded-lg w-max border border-slate-200">
                <button @click="modoRegistro = 'manual'" class="px-4 py-1.5 rounded-md font-medium text-xs transition"
                    :class="modoRegistro === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-500'">Manual</button>
                <button @click="modoRegistro = 'cronometro'" class="px-4 py-1.5 rounded-md font-medium text-xs transition"
                    :class="modoRegistro === 'cronometro' ? 'bg-white shadow text-slate-800' : 'text-slate-500'">Cronómetro</button>
            </div>

            <!-- CRONÔMETRO -->
            <div v-if="tipoAbaLancamento === 'individual' && modoRegistro === 'cronometro'" class="bg-slate-900 text-white rounded-xl shadow-xl p-8 flex flex-col items-center relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-800 to-transparent opacity-50"></div>
                <h3 class="text-slate-300 mb-4 uppercase text-xs font-bold tracking-widest relative z-10 flex items-center">
                    <i class="fa-solid fa-circle text-red-500 text-[8px] animate-pulse mr-2" v-if="timerAtivo"></i> Monitorização em Tempo Real
                </h3>
                <div class="text-5xl sm:text-7xl font-mono font-bold mb-8 relative z-10 tracking-tight">{{ cronometroDisplay }}</div>
                <div class="flex gap-4 relative z-10 w-full sm:w-auto">
                    <button v-if="!timerAtivo" @click="$emit('iniciar-cronometro')" class="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-full font-bold shadow-lg transition">Iniciar</button>
                    <button v-else @click="$emit('parar-cronometro')" class="w-full sm:w-auto bg-red-500 hover:bg-red-600 px-8 py-3 rounded-full font-bold shadow-lg transition"><i class="fa-solid fa-stop mr-2"></i>Parar e Preencher</button>
                </div>
            </div>

            <!-- FORMULÁRIO PRINCIPAL -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <!-- SELETOR DE MEMBROS EM LOTE -->
                <div v-if="tipoAbaLancamento === 'lote'" class="mb-6 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span class="text-sm font-bold text-emerald-950 flex items-center gap-2">
                            <i class="fa-solid fa-users text-emerald-600"></i> Selecione os Membros que receberão este lançamento:
                        </span>
                        <label class="flex items-center gap-2 text-xs font-bold text-emerald-800 cursor-pointer bg-emerald-100 px-3 py-1.5 rounded-lg">
                            <input type="checkbox" v-model="selecionarTodosMembrosLote" @change="alternarSelecionarTodos" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span>Selecionar Todos ({{ membros.length }})</span>
                        </label>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-lg border border-emerald-100">
                        <label v-for="m in membros" :key="m.login" class="flex items-center gap-2 p-2 rounded hover:bg-slate-50 cursor-pointer text-xs transition">
                            <input type="checkbox" :value="m.login" v-model="membrosLoteSelecionados" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span class="font-medium text-slate-700 truncate" :title="m.nome">{{ m.nome }} (@{{ m.login }})</span>
                        </label>
                    </div>
                    <div class="text-xs text-emerald-700 font-bold">
                        {{ membrosLoteSelecionados.length }} membro(s) selecionado(s).
                    </div>
                </div>

                <form @submit.prevent="tipoAbaLancamento === 'lote' ? abrirPreviaLote() : submeterIndividual()" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Membro Individual -->
                        <div v-if="tipoAbaLancamento === 'individual'">
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Membro Responsável</label>
                            <select v-if="podeLancarOutros" v-model="membroIndividualSelecionado" required class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition font-medium">
                                <option v-for="m in membros" :key="m.login" :value="m.login">
                                    {{ m.nome }} (@{{ m.login }})
                                </option>
                            </select>
                            <input v-else :value="usuario.nome + ' (@' + usuario.login + ')'" readonly disabled class="w-full border border-slate-200 p-3 rounded-lg bg-slate-100 text-slate-600 font-semibold cursor-not-allowed" />
                        </div>

                        <div>
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Data da Atividade</label>
                            <input v-model="form.data" type="date" required class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition" />
                        </div>

                        <div>
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Projeto</label>
                            <select v-model="form.projeto" required class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition">
                                <option v-for="proj in projetos" :key="proj" :value="proj">{{ proj }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Categoria da Atividade</label>
                            <select v-model="form.categoria" required class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition">
                                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Hora de Início</label>
                            <input v-model="form.inicio" type="time" required class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition font-mono" />
                        </div>
                        <div>
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Hora de Término</label>
                            <input v-model="form.termino" type="time" required class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition font-mono" />
                        </div>
                        
                        <div class="md:col-span-2">
                            <div class="p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between border transition-colors" :class="duracaoCalculadaHoras > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'">
                                <span class="text-slate-600 font-medium mb-1 sm:mb-0"><i class="fa-solid fa-calculator mr-2 opacity-50"></i>Tempo Calculado:</span>
                                <span class="text-2xl font-bold" :class="duracaoCalculadaHoras > 0 ? 'text-emerald-700' : 'text-slate-400'">{{ duracaoCalculadaHoras }} horas</span>
                            </div>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-sm font-semibold mb-1 text-slate-700">Descrição Detalhada</label>
                            <textarea v-model="form.descricao" rows="3" required placeholder="Descreva brevemente o que foi realizado..." class="w-full border border-slate-300 p-3 rounded-lg bg-slate-50 focus:border-emerald-500 outline-none transition resize-none"></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4 border-t border-slate-100">
                        <button type="submit" :disabled="enviandoRegistro" 
                                class="w-full sm:w-auto px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 text-white"
                                :class="tipoAbaLancamento === 'lote' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-emerald-600 hover:bg-emerald-700'">
                            <span v-if="enviandoRegistro"><i class="fa-solid fa-spinner fa-spin"></i> A processar...</span>
                            <span v-else>
                                <i :class="tipoAbaLancamento === 'lote' ? 'fa-solid fa-users-gear mr-1' : 'fa-regular fa-paper-plane mr-1'"></i>
                                {{ tipoAbaLancamento === 'lote' ? 'Prévia e Lançar em Lote' : 'Registar Atividade' }}
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- MODAL DE PRÉVIA DO LANÇAMENTO EM LOTE -->
            <div v-if="modalPreviaLoteAberto" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl transform transition-all border border-slate-100 flex flex-col max-h-[90vh]">
                    <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                        <div>
                            <h3 class="text-xl font-bold text-slate-800">Prévia do Lançamento em Lote</h3>
                            <p class="text-xs text-slate-500 mt-0.5">Confirme os dados antes de gravar no banco de dados.</p>
                        </div>
                        <button @click="modalPreviaLoteAberto = false" class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>

                    <div class="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-200">
                        <div><span class="text-slate-400 block">Data:</span><strong class="text-slate-800">{{ form.data }}</strong></div>
                        <div><span class="text-slate-400 block">Duração:</span><strong class="text-emerald-700 font-bold">{{ duracaoCalculadaHoras }}h</strong></div>
                        <div><span class="text-slate-400 block">Projeto:</span><strong class="text-slate-800">{{ form.projeto }}</strong></div>
                        <div><span class="text-slate-400 block">Categoria:</span><strong class="text-slate-800">{{ form.categoria }}</strong></div>
                    </div>

                    <p class="text-xs font-bold text-slate-700 mb-2">Serão criados {{ membrosLoteSelecionados.length }} lançamentos para os seguintes membros:</p>
                    
                    <div class="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 mb-6 max-h-60">
                        <div v-for="log in membrosLoteSelecionados" :key="log" class="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                            <span class="font-bold text-slate-800">{{ membros.find(m => m.login === log)?.nome || log }}</span>
                            <span class="text-slate-400 font-mono">@{{ log }}</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" @click="modalPreviaLoteAberto = false" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">Cancelar</button>
                        <button type="button" @click="confirmarLote" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition text-sm flex items-center gap-2">
                            <i class="fa-solid fa-check"></i> Confirmar e Gravar Lote
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};
