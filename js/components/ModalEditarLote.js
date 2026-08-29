window.ModalEditarLoteComponent = {
    props: {
        modalAberto: { type: Boolean, default: false },
        idsSelecionados: { type: Array, default: () => [] },
        projetos: { type: Array, default: () => [] },
        categorias: { type: Array, default: () => [] },
        enviando: { type: Boolean, default: false }
    },
    emits: ['fechar', 'salvar-edicao-lote'],
    data() {
        return {
            aplicarData: false,
            data: '',
            aplicarHoras: false,
            horas: 0,
            aplicarProjeto: false,
            projeto: '',
            aplicarCategoria: false,
            categoria: '',
            aplicarDescricao: false,
            descricao: ''
        };
    },
    watch: {
        modalAberto(val) {
            if (val) {
                this.aplicarData = false;
                this.data = '';
                this.aplicarHoras = false;
                this.horas = 0;
                this.aplicarProjeto = false;
                this.projeto = this.projetos[0] || 'Atividade';
                this.aplicarCategoria = false;
                this.categoria = this.categorias[0] || 'Ensino';
                this.aplicarDescricao = false;
                this.descricao = '';
            }
        }
    },
    methods: {
        submeter() {
            let dataFormatada = null;
            if (this.aplicarData && this.data) {
                dataFormatada = this.data.split('-').reverse().join('/');
            }
            this.$emit('salvar-edicao-lote', {
                idsRegistros: this.idsSelecionados,
                data: this.aplicarData ? dataFormatada : null,
                horas: this.aplicarHoras ? parseFloat(this.horas) : null,
                projeto: this.aplicarProjeto ? this.projeto : null,
                categoria: this.aplicarCategoria ? this.categoria : null,
                descricao: this.aplicarDescricao ? this.descricao : null
            });
        }
    },
    template: `
        <div v-if="modalAberto" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-xl transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Editar {{ idsSelecionados.length }} Lançamentos em Lote</h3>
                        <p class="text-xs text-slate-500 mt-1">Marque apenas os campos que você deseja alterar em todos os registros selecionados.</p>
                    </div>
                    <button @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700 text-xl"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <!-- Campo Data -->
                    <div class="p-3 border rounded-xl" :class="aplicarData ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'">
                        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mb-2">
                            <input type="checkbox" v-model="aplicarData" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span>Alterar Data de todos os registros selecionados</span>
                        </label>
                        <input v-if="aplicarData" v-model="data" type="date" required class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500" />
                    </div>

                    <!-- Campo Horas -->
                    <div class="p-3 border rounded-xl" :class="aplicarHoras ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'">
                        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mb-2">
                            <input type="checkbox" v-model="aplicarHoras" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span>Alterar Carga Horária de todos os registros selecionados</span>
                        </label>
                        <input v-if="aplicarHoras" v-model="horas" type="number" step="0.1" min="0.1" max="24" required placeholder="Ex: 2.0" class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500" />
                    </div>

                    <!-- Campo Projeto -->
                    <div class="p-3 border rounded-xl" :class="aplicarProjeto ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'">
                        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mb-2">
                            <input type="checkbox" v-model="aplicarProjeto" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span>Alterar Projeto de todos os registros selecionados</span>
                        </label>
                        <select v-if="aplicarProjeto" v-model="projeto" required class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500">
                            <option v-for="p in projetos" :key="p" :value="p">{{ p }}</option>
                        </select>
                    </div>

                    <!-- Campo Categoria -->
                    <div class="p-3 border rounded-xl" :class="aplicarCategoria ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'">
                        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mb-2">
                            <input type="checkbox" v-model="aplicarCategoria" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span>Alterar Categoria de todos os registros selecionados</span>
                        </label>
                        <select v-if="aplicarCategoria" v-model="categoria" required class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500">
                            <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
                        </select>
                    </div>

                    <!-- Campo Descrição -->
                    <div class="p-3 border rounded-xl" :class="aplicarDescricao ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'">
                        <label class="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer mb-2">
                            <input type="checkbox" v-model="aplicarDescricao" class="rounded text-emerald-600 focus:ring-emerald-500" />
                            <span>Alterar Descrição de todos os registros selecionados</span>
                        </label>
                        <textarea v-if="aplicarDescricao" v-model="descricao" rows="2" required placeholder="Nova descrição padrão para o lote..." class="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500 resize-none"></textarea>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">Cancelar</button>
                        <button type="submit" :disabled="enviando || (!aplicarData && !aplicarHoras && !aplicarProjeto && !aplicarCategoria && !aplicarDescricao)" 
                                class="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition text-sm flex items-center gap-2 disabled:opacity-50">
                            <i v-if="enviando" class="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Aplicar Alterações nos {{ idsSelecionados.length }} Lançamentos</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
