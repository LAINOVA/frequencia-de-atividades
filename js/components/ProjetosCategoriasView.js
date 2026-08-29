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
        salvarProjeto() {
            if (!this.novoProjeto.trim()) return;
            this.$emit('adicionar-projeto', this.novoProjeto.trim());
            this.novoProjeto = '';
        },
        salvarCategoria() {
            if (!this.novaCategoria.trim()) return;
            this.$emit('adicionar-categoria', this.novaCategoria.trim());
            this.novaCategoria = '';
        }
    },
    template: `
        <div class="space-y-6">
            <div class="border-b border-slate-200 pb-4">
                <h2 class="text-2xl font-bold text-slate-800">Projetos & Categorias</h2>
                <p class="text-slate-500 text-sm mt-1">Gerencie as opções disponíveis para seleção nos lançamentos de horas.</p>
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
                            <button @click="$emit('excluir-projeto', proj)" class="text-slate-400 hover:text-red-600 p-1 rounded transition" title="Excluir Projeto">
                                <i class="fa-regular fa-trash-can text-sm"></i>
                            </button>
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
                               class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" />
                        <button type="submit" :disabled="carregando" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition shrink-0 flex items-center gap-1">
                            <i class="fa-solid fa-plus"></i> Adicionar
                        </button>
                    </form>

                    <div class="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        <div v-for="cat in categorias" :key="cat" class="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                            <span class="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <i class="fa-solid fa-tag text-slate-400 text-xs"></i> {{ cat }}
                            </span>
                            <button @click="$emit('excluir-categoria', cat)" class="text-slate-400 hover:text-red-600 p-1 rounded transition" title="Excluir Categoria">
                                <i class="fa-regular fa-trash-can text-sm"></i>
                            </button>
                        </div>
                        <div v-if="categorias.length === 0" class="py-8 text-center text-slate-400 text-sm">Nenhuma categoria cadastrada.</div>
                    </div>
                </div>
            </div>
        </div>
    `
};
