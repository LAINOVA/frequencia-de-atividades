window.ModalAlterarSenhaComponent = {
    props: {
        modalAberto: { type: Boolean, default: false },
        primeiroAcesso: { type: Boolean, default: false },
        enviando: { type: Boolean, default: false }
    },
    emits: ['fechar', 'salvar-senha'],
    data() {
        return {
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: '',
            mostrarSenhas: false,
            erroLocal: ''
        };
    },
    methods: {
        submeter() {
            this.erroLocal = '';
            if (this.novaSenha.length < 6) {
                this.erroLocal = 'A nova palavra-passe deve conter pelo menos 6 caracteres.';
                return;
            }
            if (this.novaSenha !== this.confirmarSenha) {
                this.erroLocal = 'A confirmação de palavra-passe não coincide.';
                return;
            }
            this.$emit('salvar-senha', {
                senhaAtual: this.senhaAtual,
                novaSenha: this.novaSenha,
                primeiroAcesso: this.primeiroAcesso
            });
        }
    },
    watch: {
        modalAberto(val) {
            if (val) {
                this.senhaAtual = '';
                this.novaSenha = '';
                this.confirmarSenha = '';
                this.erroLocal = '';
            }
        }
    },
    template: `
        <div v-if="modalAberto" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">
                            {{ primeiroAcesso ? 'Definir Palavra-passe Definitiva' : 'Alterar Palavra-passe' }}
                        </h3>
                        <p class="text-xs text-slate-500 mt-1">
                            {{ primeiroAcesso ? 'Por segurança, defina uma nova senha para acessar o sistema.' : 'Atualize as suas credenciais de acesso.' }}
                        </p>
                    </div>
                    <button v-if="!primeiroAcesso" @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700">
                        <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                </div>

                <div v-if="erroLocal" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation shrink-0"></i>
                    <span>{{ erroLocal }}</span>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div v-if="!primeiroAcesso">
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Palavra-passe Atual</label>
                        <input 
                            v-model="senhaAtual" 
                            :type="mostrarSenhas ? 'text' : 'password'" 
                            required 
                            class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" 
                        />
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nova Palavra-passe</label>
                        <input 
                            v-model="novaSenha" 
                            :type="mostrarSenhas ? 'text' : 'password'" 
                            required 
                            placeholder="Mínimo de 6 caracteres"
                            class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" 
                        />
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Confirmar Nova Palavra-passe</label>
                        <input 
                            v-model="confirmarSenha" 
                            :type="mostrarSenhas ? 'text' : 'password'" 
                            required 
                            class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" 
                        />
                    </div>

                    <div class="flex items-center gap-2 pt-1">
                        <input type="checkbox" id="showPassModal" v-model="mostrarSenhas" class="rounded text-emerald-600 focus:ring-emerald-500" />
                        <label for="showPassModal" class="text-xs text-slate-600 cursor-pointer">Mostrar palavras-passe</label>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button v-if="!primeiroAcesso" type="button" @click="$emit('fechar')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">
                            Cancelar
                        </button>
                        <button type="submit" :disabled="enviando" class="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition text-sm flex items-center gap-2 disabled:opacity-70">
                            <i v-if="enviando" class="fa-solid fa-circle-notch fa-spin"></i>
                            <span>{{ primeiroAcesso ? 'Salvar e Continuar' : 'Atualizar Palavra-passe' }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
