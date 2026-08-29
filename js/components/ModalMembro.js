window.ModalMembroComponent = {
    props: {
        modalMembroAberto: { type: Boolean, default: false },
        enviandoMembro: { type: Boolean, default: false },
        usuario: { type: Object, default: () => ({ cargo: '' }) }
    },
    emits: ['fechar-modal', 'salvar-membro'],
    data() {
        return {
            form: {
                nome: '',
                login: '',
                senha: '',
                cargo: 'MEMBRO',
                ativo: 'SIM'
            },
            mostrarSenha: false
        };
    },
    computed: {
        isProprietario() {
            const c = (this.usuario.cargo || '').toUpperCase();
            return c === 'PROPRIETARIO' || c === 'ADMINISTRADOR_MASTER';
        }
    },
    methods: {
        gerarSugestaoSenha() {
            if (!this.form.nome.trim()) return;
            const partes = this.form.nome.trim().split(' ').filter(p => p.length > 0);
            if (partes.length >= 1) {
                const prim = partes[0];
                const sob = partes.length > 1 ? partes[partes.length - 1] : '';
                const duasLetras = prim.substring(0, 2);
                const duasFormatadas = duasLetras.charAt(0).toUpperCase() + duasLetras.slice(1).toLowerCase();
                const sobFormatado = sob ? (sob.charAt(0).toUpperCase() + sob.slice(1).toLowerCase()) : '';
                this.form.senha = `${duasFormatadas}${sobFormatado}123`;
            }
        },
        gerarSugestaoLogin() {
            if (!this.form.nome.trim()) return;
            const partes = this.form.nome.trim().toLowerCase().split(' ').filter(p => p.length > 0);
            if (partes.length === 1) {
                this.form.login = partes[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            } else if (partes.length > 1) {
                const prim = partes[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                const sob = partes[partes.length - 1].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                this.form.login = `${prim}.${sob}`;
            }
        },
        submeter() {
            this.$emit('salvar-membro', { ...this.form });
        }
    },
    watch: {
        modalMembroAberto(val) {
            if (val) {
                this.form = { nome: '', login: '', senha: '', cargo: 'MEMBRO', ativo: 'SIM' };
            }
        }
    },
    template: `
        <div v-if="modalMembroAberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-slate-800">Cadastrar Novo Membro</h3>
                    <button @click="$emit('fechar-modal')" class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-xl"></i></button>
                </div>
                <form @submit.prevent="submeter" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome Completo</label>
                        <input v-model="form.nome" @blur="gerarSugestaoLogin(); gerarSugestaoSenha();" type="text" required placeholder="Ex: Juliana Souza" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome de Utilizador / Login</label>
                        <input v-model="form.login" type="text" required placeholder="Ex: juliana.souza" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition font-mono" />
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">Palavra-passe Inicial</label>
                            <button type="button" @click="gerarSugestaoSenha" class="text-[10px] text-emerald-600 hover:underline font-bold">Aplicar Regra Padrão</button>
                        </div>
                        <div class="relative">
                            <input v-model="form.senha" :type="mostrarSenha ? 'text' : 'password'" required placeholder="Ex: JuSouza123" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition pr-10 font-mono" />
                            <button type="button" @click="mostrarSenha = !mostrarSenha" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm">
                                <i :class="mostrarSenha ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                            </button>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-1">Regra: 2 primeiras letras do nome + sobrenome + 123.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Cargo / Permissão</label>
                            <select v-model="form.cargo" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition font-medium">
                                <option value="MEMBRO">Membro</option>
                                <option value="GESTOR">Gestor</option>
                                <option value="ADMINISTRADOR">Administrador</option>
                                <option v-if="isProprietario" value="PROPRIETARIO">Proprietário</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Status Inicial</label>
                            <select v-model="form.ativo" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition">
                                <option value="SIM">Ativo</option>
                                <option value="NAO">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar-modal')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">Cancelar</button>
                        <button type="submit" :disabled="enviandoMembro" class="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition text-sm flex items-center gap-2 disabled:opacity-70">
                            <i v-if="enviandoMembro" class="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Criar Membro</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
