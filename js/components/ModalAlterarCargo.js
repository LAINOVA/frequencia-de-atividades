window.ModalAlterarCargoComponent = {
    props: {
        modalAberto: { type: Boolean, default: false },
        membro: { type: Object, default: () => ({ nome: '', login: '', cargo: '' }) },
        enviando: { type: Boolean, default: false }
    },
    emits: ['fechar', 'salvar-cargo'],
    data() {
        return {
            novoCargo: 'MEMBRO'
        };
    },
    watch: {
        membro: {
            immediate: true,
            handler(val) {
                if (val && val.cargo) {
                    const c = val.cargo.toUpperCase();
                    if (c === 'FUNCIONARIO' || c === 'MEMBRO_COMUM') this.novoCargo = 'MEMBRO';
                    else this.novoCargo = c;
                }
            }
        }
    },
    methods: {
        submeter() {
            this.$emit('salvar-cargo', {
                loginAlvo: this.membro.login,
                novoCargo: this.novoCargo
            });
        }
    },
    template: `
        <div v-if="modalAberto" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Alterar Cargo de Membro</h3>
                        <p class="text-xs text-slate-500 mt-1">
                            Usuário: <strong class="text-slate-800">{{ membro.nome }} (@{{ membro.login }})</strong>
                        </p>
                    </div>
                    <button @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Selecione o Novo Nível de Acesso</label>
                        <select v-model="novoCargo" required class="w-full border border-slate-300 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white focus:border-purple-500 outline-none transition font-semibold text-slate-800">
                            <option value="MEMBRO">Membro (Usuário Comum)</option>
                            <option value="ADMINISTRADOR">Administrador (Gestão de Lote, Horas e Cadastros)</option>
                            <option value="GESTOR">Gestor</option>
                        </select>
                    </div>

                    <div class="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs leading-relaxed">
                        <i class="fa-solid fa-shield-halved text-purple-600 mr-1"></i>
                        <span v-if="novoCargo === 'ADMINISTRADOR'">
                            <strong>Administrador:</strong> Poderá lançar horas em lote, editar e excluir horas de qualquer membro, gerenciar projetos e relatórios.
                        </span>
                        <span v-else>
                            <strong>Membro Comum:</strong> Acesso restrito aos seus próprios lançamentos e extrato individual.
                        </span>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="enviando" class="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md transition text-sm flex items-center gap-2 disabled:opacity-70">
                            <i v-if="enviando" class="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Salvar Alteração de Cargo</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
