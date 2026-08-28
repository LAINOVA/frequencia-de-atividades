window.ModalAlterarSenhaComponent = {
    props: {
        aberto: { type: Boolean, default: false },
        primeiroAcesso: { type: Boolean, default: false },
        enviando: { type: Boolean, default: false },
        erro: { type: String, default: '' }
    },
    emits: ['salvar-senha', 'fechar'],
    data() {
        return {
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: '',
            mostrarSenhaAtual: false,
            mostrarNovaSenha: false,
            erroLocal: ''
        };
    },
    watch: {
        aberto(val) {
            if (val) {
                this.senhaAtual = '';
                this.novaSenha = '';
                this.confirmarSenha = '';
                this.erroLocal = '';
                this.mostrarSenhaAtual = false;
                this.mostrarNovaSenha = false;
            }
        }
    },
    methods: {
        submeter() {
            this.erroLocal = '';
            if (!this.primeiroAcesso && !this.senhaAtual) {
                this.erroLocal = 'Por favor, informe a sua palavra-passe atual.';
                return;
            }
            if (this.novaSenha.length < 6) {
                this.erroLocal = 'A nova palavra-passe deve conter no mínimo 6 caracteres.';
                return;
            }
            if (!this.primeiroAcesso && this.novaSenha === this.senhaAtual) {
                this.erroLocal = 'A nova palavra-passe deve ser diferente da atual.';
                return;
            }
            if (this.novaSenha !== this.confirmarSenha) {
                this.erroLocal = 'A confirmação de palavra-passe não coincide.';
                return;
            }

            this.$emit('salvar-senha', {
                senhaAtual: this.senhaAtual,
                novaSenha: this.novaSenha,
                confirmarSenha: this.confirmarSenha,
                primeiroAcesso: this.primeiroAcesso
            });
        }
    },
    template: `
        <div v-if="aberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[9995] p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-slate-100 transform transition-all">
                <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                <i class="fa-solid fa-key"></i>
                            </span>
                            <h3 class="text-xl font-bold text-slate-800">
                                {{ primeiroAcesso ? 'Definir Palavra-passe Definitiva' : 'Alterar Palavra-passe' }}
                            </h3>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">
                            {{ primeiroAcesso ? 'Este é o seu primeiro acesso. Por segurança, defina uma nova senha para continuar.' : 'Atualize a sua palavra-passe de acesso ao sistema.' }}
                        </p>
                    </div>
                    <button v-if="!primeiroAcesso" @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700 text-xl"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div v-if="erroLocal || erro" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation shrink-0"></i>
                    <span>{{ erroLocal || erro }}</span>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div v-if="!primeiroAcesso">
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Palavra-passe Atual *</label>
                        <div class="relative">
                            <input 
                                v-model="senhaAtual" 
                                :type="mostrarSenhaAtual ? 'text' : 'password'" 
                                required 
                                placeholder="Digite a senha atual" 
                                class="w-full border border-slate-300 rounded-xl p-2.5 pr-10 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                            />
                            <button type="button" @click="mostrarSenhaAtual = !mostrarSenhaAtual" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs" tabindex="-1">
                                <i :class="mostrarSenhaAtual ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nova Palavra-passe (Mínimo 6 dígitos) *</label>
                        <div class="relative">
                            <input 
                                v-model="novaSenha" 
                                :type="mostrarNovaSenha ? 'text' : 'password'" 
                                required 
                                minlength="6"
                                placeholder="Digite a nova senha" 
                                class="w-full border border-slate-300 rounded-xl p-2.5 pr-10 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                            />
                            <button type="button" @click="mostrarNovaSenha = !mostrarNovaSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs" tabindex="-1">
                                <i :class="mostrarNovaSenha ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Confirmar Nova Palavra-passe *</label>
                        <input 
                            v-model="confirmarSenha" 
                            type="password" 
                            required 
                            minlength="6"
                            placeholder="Repita a nova senha" 
                            class="w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                        />
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button v-if="!primeiroAcesso" type="button" @click="$emit('fechar')" class="px-4 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition text-sm">Cancelar</button>
                        <button type="submit" :disabled="enviando" class="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition disabled:opacity-70 flex items-center justify-center gap-2 text-sm">
                            <span v-if="enviando"><i class="fa-solid fa-circle-notch fa-spin"></i> A guardar...</span>
                            <span v-else><i class="fa-solid fa-check"></i> {{ primeiroAcesso ? 'Definir Senha e Entrar' : 'Salvar Nova Senha' }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
