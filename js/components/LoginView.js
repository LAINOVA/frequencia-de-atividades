window.LoginViewComponent = {
    props: {
        carregandoLogin: { type: Boolean, default: false },
        mensagemErro: { type: String, default: '' }
    },
    emits: ['fazer-login'],
    data() {
        return {
            login: '',
            senha: '',
            mostrarSenha: false
        };
    },
    methods: {
        submeter() {
            if (!this.login.trim() || !this.senha) return;
            this.$emit('fazer-login', { login: this.login.trim(), senha: this.senha });
        }
    },
    template: `
        <div class="min-h-screen w-full flex items-center justify-center bg-slate-900 px-4 py-8 relative overflow-hidden">
            <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10 border border-slate-100">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-inner">
                        <i class="fa-solid fa-clock-rotate-left text-3xl"></i>
                    </div>
                    <h1 class="text-2xl font-black text-slate-800 tracking-wider">LAINOVA</h1>
                    <p class="text-xs text-slate-500 font-medium mt-1">Sistema de Gestão de Atividades & Horas</p>
                </div>

                <div v-if="mensagemErro" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
                    <i class="fa-solid fa-circle-exclamation text-red-500 mt-0.5 text-base shrink-0"></i>
                    <span>{{ mensagemErro }}</span>
                </div>

                <form @submit.prevent="submeter" class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Utilizador / Login</label>
                        <div class="relative">
                            <i class="fa-regular fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input 
                                v-model="login" 
                                type="text" 
                                required 
                                autocomplete="username"
                                placeholder="Digite o seu utilizador (ex: RHLAINOVA)" 
                                class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Palavra-passe</label>
                        <div class="relative">
                            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input 
                                v-model="senha" 
                                :type="mostrarSenha ? 'text' : 'password'" 
                                required 
                                autocomplete="current-password"
                                placeholder="Digite a sua palavra-passe" 
                                class="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                            />
                            <button 
                                type="button" 
                                @click="mostrarSenha = !mostrarSenha" 
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                tabindex="-1"
                            >
                                <i :class="mostrarSenha ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        :disabled="carregandoLogin" 
                        class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        <i v-if="carregandoLogin" class="fa-solid fa-circle-notch fa-spin"></i>
                        <span v-if="carregandoLogin">A validar credenciais...</span>
                        <span v-else class="flex items-center gap-2"><i class="fa-solid fa-arrow-right-to-bracket"></i> Iniciar Sessão</span>
                    </button>
                </form>

                <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p class="text-xs text-slate-400">
                        <i class="fa-solid fa-shield-halved mr-1 text-slate-400"></i> Acesso restrito a membros da LAINOVA.
                    </p>
                </div>
            </div>
        </div>
    `
};
