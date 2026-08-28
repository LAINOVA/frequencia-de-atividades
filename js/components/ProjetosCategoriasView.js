window.ProjetosCategoriasViewComponent = {
    props: {
        projetos: { type: Array, default: () => [] },
        categorias: { type: Array, default: () => [] },
        carregando: { type: Boolean, default: false }
    },
    emits: ['adicionar-projeto', 'excluir-projeto', 'adicionar-categoria', 'excluir-categoria'],
    data() {
        return {
            novoProjeto: '',
            novaCategoria: ''
        };
    },
    methods: {
        submeterProjeto() {
            if (!this.novoProjeto.trim()) return;
            this.$emit('adicionar-projeto', this.novoProjeto.trim());
            this.novoProjeto = '';
        },
        submeterCategoria() {
            if (!this.novaCategoria.trim()) return;
            this.$emit('adicionar-categoria', this.novaCategoria.trim());
            this.novaCategoria = '';
        }
    },
    template: `
        <div class="space-y-8 pb-10">
            <div>
                <h3 class="text-xl font-bold text-slate-800">Gerenciamento de Projetos e Categorias</h3>
                <p class="text-xs text-slate-500 mt-0.5">Cadastre e remova opções disponíveis para os membros selecionarem ao lançar horas.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                <i class="fa-solid fa-folder-tree"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">Projetos</h4>
                                <p class="text-xs text-slate-500">{{ projetos.length }} projetos ativos</p>
                            </div>
                        </div>

                        <form @submit.prevent="submeterProjeto" class="flex gap-2 mb-6">
                            <input 
                                v-model="novoProjeto" 
                                type="text" 
                                required 
                                maxlength="50"
                                placeholder="Nome do novo projeto..." 
                                class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition"
                            />
                            <button type="submit" :disabled="carregando" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1">
                                <i class="fa-solid fa-plus"></i> Adicionar
                            </button>
                        </form>

                        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                            <div v-for="p in projetos" :key="p" class="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-100 transition">
                                <span class="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                    <i class="fa-regular fa-folder text-blue-500"></i> {{ p }}
                                </span>
                                <button @click="$emit('excluir-projeto', p)" class="text-red-400 hover:text-red-600 p-1.5 rounded transition" title="Remover Projeto">
                                    <i class="fa-regular fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                <i class="fa-solid fa-tags"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-slate-800">Categorias de Atividades</h4>
                                <p class="text-xs text-slate-500">{{ categorias.length }} categorias ativas</p>
                            </div>
                        </div>

                        <form @submit.prevent="submeterCategoria" class="flex gap-2 mb-6">
                            <input 
                                v-model="novaCategoria" 
                                type="text" 
                                required 
                                maxlength="50"
                                placeholder="Nome da nova categoria..." 
                                class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition"
                            />
                            <button type="submit" :disabled="carregando" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1">
                                <i class="fa-solid fa-plus"></i> Adicionar
                            </button>
                        </form>

                        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
                            <div v-for="cat in categorias" :key="cat" class="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-100 transition">
                                <span class="font-semibold text-slate-700 text-sm flex items-center gap-2">
                                    <i class="fa-solid fa-tag text-emerald-500 text-xs"></i> {{ cat }}
                                </span>
                                <button @click="$emit('excluir-categoria', cat)" class="text-red-400 hover:text-red-600 p-1.5 rounded transition" title="Remover Categoria">
                                    <i class="fa-regular fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
