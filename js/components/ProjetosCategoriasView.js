window.ProjetosCategoriasViewComponent = {
    props: {
        projetos: { type: Array, default: () => [] },
        categorias: { type: Array, default: () => [] },
        carregando: { type: Boolean, default: false }
    },
    emits: ['adicionar-projeto', 'editar-projeto', 'excluir-projeto', 'adicionar-categoria', 'editar-categoria', 'excluir-categoria'],
    data() {
        return {
            novoProjeto: '',
            novaCategoria: '',
            modalEditarProjetoAberto: false,
            projetoAntigo: '',
            projetoNovoNome: '',
            modalEditarCategoriaAberto: false,
            categoriaAntiga: '',
            categoriaNovoNome: ''
        };
    },
    methods: {
        salvarProjeto() {
            if (!this.novoProjeto.trim()) return;
            this.$emit('adicionar-projeto', this.novoProjeto.trim());
            this.novoProjeto = '';
        },
        abrirEdicaoProjeto(proj) {
            this.projetoAntigo = proj;
            this.projetoNovoNome = proj;
            this.modalEditarProjetoAberto = true;
        },
        confirmarEdicaoProjeto() {
            if (!this.projetoNovoNome.trim() || this.projetoNovoNome.trim() === this.projetoAntigo) {
                this.modalEditarProjetoAberto = false;
                return;
            }
            this.$emit('editar-projeto', { nomeAntigo: this.projetoAntigo, novoNome: this.projetoNovoNome.trim() });
            this.modalEditarProjetoAberto = false;
        },
        salvarCategoria() {
            if (!this.novaCategoria.trim()) return;
            this.$emit('adicionar-categoria', this.novaCategoria.trim());
            this.novaCategoria = '';
        },
        abrirEdicaoCategoria(cat) {
            this.categoriaAntiga = cat;
            this.categoriaNovoNome = cat;
            this.modalEditarCategoriaAberto = true;
        },
        confirmarEdicaoCategoria() {
            if (!this.categoriaNovoNome.trim() || this.categoriaNovoNome.trim() === this.categoriaAntiga) {
                this.modalEditarCategoriaAberto = false;
                return;
            }
            this.$emit('editar-categoria', { nomeAntigo: this.categoriaAntiga, novoNome: this.categoriaNovoNome.trim() });
            this.modalEditarCategoriaAberto = false;
        }
    },
    template: `
        <div class="space-y-6">
            <div class="border-b border-slate-200 pb-4">
                <h2 class="text-2xl font-bold text-slate-800">Projetos & Categorias</h2>
                <p class="text-slate-500 text-sm mt-1">Adicione, edite/renomeie ou exclua as opções disponíveis para os lançamentos de horas.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- PAINEL DE PROJETOS -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                            <i class="fa-solid fa-diagram-project"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 text-base">Catálogo de Projetos</h3>
                            <p class="text-xs text-slate-400">{{ projetos.length }} projetos cadastrados</p>
                        </div>
                    </div>

                    <form @submit.prevent="salvarProjeto" class="flex gap-2">
                        <input v-model="novoProjeto" type="text" required placeholder="Nome do novo projeto..."
                               class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" />
                        <button type="submit" :disabled="carregando" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition shrink-0 flex items-center gap-1">
                            <i class="fa-solid fa-plus"></i> Adicionar
                        </button>
                    </form>

                    <div class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        <div v-for="proj in projetos" :key="proj" class="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                            <span class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <i class="fa-regular fa-folder text-slate-400 text-xs"></i> {{ proj }}
                            </span>
                            <div class="flex items-center gap-1.5">
                                <button @click="abrirEdicaoProjeto(proj)" class="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-1" title="Editar / Renomear Projeto">
                                    <i class="fa-regular fa-pen-to-square"></i> Editar
                                </button>
                                <button @click="$emit('excluir-projeto', proj)" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition" title="Excluir Projeto">
                                    <i class="fa-regular fa-trash-can text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <div v-if="projetos.length === 0" class="py-8 text-center text-slate-400 text-sm">Nenhum projeto cadastrado.</div>
                    </div>
                </div>

                <!-- PAINEL DE CATEGORIAS -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                            <i class="fa-solid fa-tags"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-slate-800 text-base">Categorias de Atividades</h3>
                            <p class="text-xs text-slate-400">{{ categorias.length }} categorias cadastradas</p>
                        </div>
                    </div>

                    <form @submit.prevent="salvarCategoria" class="flex gap-2">
                        <input v-model="novaCategoria" type="text" required placeholder="Nome da nova categoria..."
                               class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition" />
                        <button type="submit" :disabled="carregando" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition shrink-0 flex items-center gap-1">
                            <i class="fa-solid fa-plus"></i> Adicionar
                        </button>
                    </form>

                    <div class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        <div v-for="cat in categorias" :key="cat" class="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                            <span class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <i class="fa-solid fa-tag text-slate-400 text-xs"></i> {{ cat }}
                            </span>
                            <div class="flex items-center gap-1.5">
                                <button @click="abrirEdicaoCategoria(cat)" class="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition flex items-center gap-1" title="Editar / Renomear Categoria">
                                    <i class="fa-regular fa-pen-to-square"></i> Editar
                                </button>
                                <button @click="$emit('excluir-categoria', cat)" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition" title="Excluir Categoria">
                                    <i class="fa-regular fa-trash-can text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <div v-if="categorias.length === 0" class="py-8 text-center text-slate-400 text-sm">Nenhuma categoria cadastrada.</div>
                    </div>
                </div>
            </div>

            <!-- MODAL DE EDIÇÃO DE PROJETO -->
            <div v-if="modalEditarProjetoAberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100">
                    <h3 class="text-lg font-bold text-slate-800 mb-1">Editar / Renomear Projeto</h3>
                    <p class="text-xs text-slate-500 mb-4">Ao renomear, os lançamentos de horas existentes serão atualizados automaticamente no banco de dados.</p>
                    <form @submit.prevent="confirmarEdicaoProjeto" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome do Projeto</label>
                            <input v-model="projetoNovoNome" type="text" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition font-semibold" />
                        </div>
                        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button type="button" @click="modalEditarProjetoAberto = false" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">Cancelar</button>
                            <button type="submit" class="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition text-sm">Salvar Alteração</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL DE EDIÇÃO DE CATEGORIA -->
            <div v-if="modalEditarCategoriaAberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100">
                    <h3 class="text-lg font-bold text-slate-800 mb-1">Editar / Renomear Categoria</h3>
                    <p class="text-xs text-slate-500 mb-4">Ao renomear, os lançamentos de horas existentes serão atualizados automaticamente no banco de dados.</p>
                    <form @submit.prevent="confirmarEdicaoCategoria" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nome da Categoria</label>
                            <input v-model="categoriaNovoNome" type="text" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition font-semibold" />
                        </div>
                        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button type="button" @click="modalEditarCategoriaAberto = false" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">Cancelar</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition text-sm">Salvar Alteração</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `
};
