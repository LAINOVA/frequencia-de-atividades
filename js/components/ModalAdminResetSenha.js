window.ModalAdminResetSenhaComponent = {
    props: {
        modalAberto: { type: Boolean, default: false },
        membro: { type: Object, default: () => ({ nome: '', login: '' }) },
        enviando: { type: Boolean, default: false }
    },
    emits: ['fechar', 'salvar-reset'],
    data() {
        return {
            novaSenha: '',
            mostrarSenha: false,
            erroLocal: ''
        };
    },
    methods: {
        submeter() {
            this.erroLocal = '';
            if (!this.novaSenha || this.novaSenha.length < 6) {
                this.erroLocal = 'A nova senha deve ter pelo menos 6 caracteres.';
                return;
            }
            this.$emit('salvar-reset', {
                loginAlvo: this.membro.login,
                novaSenha: this.novaSenha
            });
        }
    },
    watch: {
        modalAberto(val) {
            if (val) {
                this.novaSenha = '';
                this.erroLocal = '';
            }
        }
    },
    template: `
        <div v-if="modalAberto" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Redefinir Senha de Membro</h3>
                        <p class="text-xs text-slate-500 mt-1">
                            Usuário: <strong class="text-slate-800">{{ membro.nome }} (@{{ membro.login }})</strong>
                        </p>
                    </div>
                    <button @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <div v-if="erroLocal" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation shrink-0"></i>
                    <span>{{ erroLocal }}</span>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nova Palavra-passe</label>
                        <div class="relative">
                            <input 
                                v-model="novaSenha" 
                                :type="mostrarSenha ? 'text' : 'password'" 
                                required 
                                placeholder="Defina a nova senha para o membro"
                                class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition pr-10 font-mono" 
                            />
                            <button type="button" @click="mostrarSenha = !mostrarSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                                <i :class="mostrarSenha ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                        <i class="fa-solid fa-shield-halved mr-1"></i> Apenas o <strong>Proprietário</strong> pode redefinir senhas diretamente.
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="enviando" class="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition text-sm flex items-center gap-2 disabled:opacity-70">
                            <i v-if="enviando" class="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Salvar Nova Senha</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
