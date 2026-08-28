window.ModalMembroComponent = {
    props: {
        modalMembroAberto: { type: Boolean, default: false },
        enviandoMembro: { type: Boolean, default: false }
    },
    emits: ['fechar-modal', 'salvar-membro'],
    data() {
        return {
            form: {
                nome: '',
                login: '',
                senha: '',
                cargo: 'FUNCIONARIO',
                ativo: 'SIM'
            },
            mostrarSenha: false,
            erroValidacao: ''
        };
    },
    watch: {
        modalMembroAberto(val) {
            if (val) {
                this.form = { nome: '', login: '', senha: '', cargo: 'FUNCIONARIO', ativo: 'SIM' };
                this.erroValidacao = '';
                this.mostrarSenha = false;
            }
        }
    },
    methods: {
        submeter() {
            this.erroValidacao = '';
            if (!this.form.nome.trim() || !this.form.login.trim() || !this.form.senha) {
                this.erroValidacao = 'Por favor, preencha todos os campos obrigatórios.';
                return;
            }
            if (!/^[a-zA-Z0-9._-]{3,30}$/.test(this.form.login.trim())) {
                this.erroValidacao = 'O login deve ter entre 3 e 30 caracteres alfanuméricos (sem espaços).';
                return;
            }
            this.$emit('salvar-membro', { ...this.form });
        }
    },
    template: `
        <div v-if="modalMembroAberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Registar Novo Membro</h3>
                        <p class="text-xs text-slate-500 mt-0.5">O novo membro receberá uma senha temporária e definirá a definitiva no primeiro acesso.</p>
                    </div>
                    <button @click="$emit('fechar-modal')" class="text-slate-400 hover:text-slate-700 text-xl"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div v-if="erroValidacao" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    <span>{{ erroValidacao }}</span>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome Completo *</label>
                        <input v-model="form.nome" type="text" required maxlength="100" placeholder="Ex: João Silva" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome de Utilizador / Login *</label>
                            <input v-model="form.login" type="text" required maxlength="30" placeholder="Ex: joao.silva" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Palavra-passe Inicial Temporária *</label>
                            <div class="relative">
                                <input v-model="form.senha" :type="mostrarSenha ? 'text' : 'password'" required minlength="6" maxlength="100" placeholder="Defina a senha inicial" class="w-full border border-slate-300 rounded-lg p-2.5 pr-10 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" />
                                <button type="button" @click="mostrarSenha = !mostrarSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs" tabindex="-1">
                                    <i :class="mostrarSenha ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nível de Permissão / Cargo *</label>
                            <select v-model="form.cargo" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white">
                                <option value="FUNCIONARIO">FUNCIONÁRIO (Regista suas horas)</option>
                                <option value="GESTOR">GESTOR (Gerencia projetos, categorias e relatórios)</option>
                                <option value="ADMINISTRADOR">ADMINISTRADOR (Acesso Total)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Status da Conta *</label>
                            <select v-model="form.ativo" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white">
                                <option value="SIM">Ativo (Pode aceder)</option>
                                <option value="NAO">Inativo (Bloqueado)</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar-modal')" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition text-sm">Cancelar</button>
                        <button type="submit" :disabled="enviandoMembro" class="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition disabled:opacity-70 flex items-center gap-2 text-sm">
                            <span v-if="enviandoMembro"><i class="fa-solid fa-spinner fa-spin"></i> A guardar...</span>
                            <span v-else><i class="fa-solid fa-user-check"></i> Criar Membro</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
