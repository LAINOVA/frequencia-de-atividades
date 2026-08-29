window.HistoricoViewComponent = {
    props: {
        registrosOrdenados: { type: Array, default: () => [] },
        formatarDataSheet: { type: Function, required: true },
        cargoUsuario: { type: String, default: '' },
        membros: { type: Array, default: () => [] },
        filtroMembro: { type: String, default: '' },
        paginacao: { type: Object, default: () => ({ paginaAtual: 1, totalPaginas: 1, totalRegistros: 0, de: 0, ate: 0 }) },
        podeEditarExcluir: { type: Boolean, default: false }
    },
    emits: ['mudar-filtro-membro', 'ir-pagina', 'abrir-edicao', 'excluir-registro', 'abrir-edicao-lote', 'excluir-lote'],
    data() {
        return {
            selecionados: [],
            selecionarTodos: false
        };
    },
    watch: {
        registrosOrdenados() {
            this.selecionados = [];
            this.selecionarTodos = false;
        }
    },
    methods: {
        alternarSelecionarTodos() {
            if (this.selecionarTodos) {
                this.selecionados = this.registrosOrdenados.map(r => r.ID);
            } else {
                this.selecionados = [];
            }
        }
    },
    template: `
        <div class="space-y-6">
            <!-- Barra Superior de Filtros e Ações em Lote -->
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div v-if="cargoUsuario !== 'FUNCIONARIO'" class="flex items-center gap-2 w-full md:w-auto">
                    <i class="fa-solid fa-filter text-slate-400"></i>
                    <span class="text-sm font-semibold text-slate-700 shrink-0">Filtrar por Membro:</span>
                    <select :value="filtroMembro" @change="$emit('mudar-filtro-membro', $event.target.value)"
                            class="w-full sm:w-64 border border-slate-300 p-2 rounded-lg text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition font-medium">
                        <option value="">Todos os Membros</option>
                        <option v-for="m in membros" :key="m.login" :value="m.nome">{{ m.nome }} (@{{ m.login }})</option>
                    </select>
                </div>
                <div v-else class="text-sm text-slate-500">
                    Extrato de horas cadastradas por você.
                </div>

                <!-- Ações em Lote -->
                <div v-if="podeEditarExcluir && selecionados.length > 0" class="flex items-center gap-2 w-full md:w-auto bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all">
                    <span class="text-xs font-bold text-emerald-900 mr-2">{{ selecionados.length }} selecionado(s):</span>
                    <button @click="$emit('abrir-edicao-lote', selecionados)" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-bold text-xs shadow transition flex items-center gap-1.5">
                        <i class="fa-regular fa-pen-to-square"></i> Editar em Lote
                    </button>
                    <button @click="$emit('excluir-lote', selecionados)" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md font-bold text-xs shadow transition flex items-center gap-1.5">
                        <i class="fa-regular fa-trash-can"></i> Excluir em Lote
                    </button>
                </div>
            </div>

            <!-- Tabela Principal -->
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <tr>
                                <th class="px-4 py-4 w-10 text-center" v-if="podeEditarExcluir">
                                    <input type="checkbox" v-model="selecionarTodos" @change="alternarSelecionarTodos" class="rounded text-emerald-600 focus:ring-emerald-500" />
                                </th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Data</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider" v-if="cargoUsuario !== 'FUNCIONARIO'">Membro</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Projeto</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Categoria</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider text-right">Horas</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Descrição</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider text-right" v-if="podeEditarExcluir">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="r in registrosOrdenados" :key="r.ID" class="hover:bg-slate-50 text-sm transition" :class="selecionados.includes(r.ID) ? 'bg-emerald-50/40' : ''">
                                <td class="px-4 py-4 text-center" v-if="podeEditarExcluir">
                                    <input type="checkbox" :value="r.ID" v-model="selecionados" class="rounded text-emerald-600 focus:ring-emerald-500" />
                                </td>
                                <td class="px-6 py-4 text-slate-500 font-mono text-xs">{{ formatarDataSheet(r.Data) }}</td>
                                <td class="px-6 py-4 font-semibold text-slate-700" v-if="cargoUsuario !== 'FUNCIONARIO'">{{ r.Nome_Membro }}</td>
                                <td class="px-6 py-4"><span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">{{ r.Projeto || 'Atividade' }}</span></td>
                                <td class="px-6 py-4"><span class="bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{{ r.Categoria }}</span></td>
                                <td class="px-6 py-4 font-bold text-slate-800 text-right">{{ r.Horas_Gastas }}h</td>
                                <td class="px-6 py-4 text-slate-600 max-w-xs truncate" :title="r.Descricao">{{ r.Descricao }}</td>
                                <td class="px-6 py-4 text-right" v-if="podeEditarExcluir">
                                    <div class="flex items-center justify-end gap-1">
                                        <button @click="$emit('abrir-edicao', r)" class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar Lançamento">
                                            <i class="fa-regular fa-pen-to-square"></i>
                                        </button>
                                        <button @click="$emit('excluir-registro', r.ID)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir Lançamento">
                                            <i class="fa-regular fa-trash-can"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="registrosOrdenados.length === 0">
                                <td :colspan="podeEditarExcluir ? 8 : 6" class="px-6 py-12 text-center text-slate-400">Nenhum registo encontrado.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- CONTROLES DE PAGINAÇÃO REAL BACKEND -->
                <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
                    <div>
                        Exibindo <span class="font-bold text-slate-800">{{ paginacao.de }}</span> a <span class="font-bold text-slate-800">{{ paginacao.ate }}</span> de <span class="font-bold text-slate-800">{{ paginacao.totalRegistros }}</span> registos
                    </div>
                    <div class="flex items-center gap-1">
                        <button @click="$emit('ir-pagina', 1)" :disabled="paginacao.paginaAtual <= 1"
                                class="px-2.5 py-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold" title="Primeira Página">
                            <i class="fa-solid fa-angles-left"></i>
                        </button>
                        <button @click="$emit('ir-pagina', paginacao.paginaAtual - 1)" :disabled="!paginacao.temPaginaAnterior"
                                class="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold">
                            <i class="fa-solid fa-chevron-left mr-1"></i> Anterior
                        </button>
                        <span class="px-3 py-1.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                            Página {{ paginacao.paginaAtual }} de {{ paginacao.totalPaginas }}
                        </span>
                        <button @click="$emit('ir-pagina', paginacao.paginaAtual + 1)" :disabled="!paginacao.temProximaPagina"
                                class="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold">
                            Seguinte <i class="fa-solid fa-chevron-right ml-1"></i>
                        </button>
                        <button @click="$emit('ir-pagina', paginacao.totalPaginas)" :disabled="paginacao.paginaAtual >= paginacao.totalPaginas"
                                class="px-2.5 py-1.5 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold" title="Última Página">
                            <i class="fa-solid fa-angles-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};
