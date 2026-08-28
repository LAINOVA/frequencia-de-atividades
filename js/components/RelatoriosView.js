window.RelatoriosViewComponent = {
    props: {
        membros: { type: Array, default: () => [] },
        filtroRelatorio: { type: Object, required: true },
        periodoRelatorioTexto: { type: String, default: '' },
        kpisRelatorio: { type: Object, required: true },
        rankingRelatorio: { type: Array, default: () => [] },
        registrosRelatorio: { type: Array, default: () => [] },
        registrosRelatorioOrdenados: { type: Array, default: () => [] },
        formatarDataSheet: { type: Function, required: true }
    },
    emits: ['aplicar-filtro-rapido', 'exportar-csv', 'imprimir-relatorio'],
    methods: {
        sanitizarCSV(texto) {
            if (!texto) return '';
            let str = String(texto).replace(/"/g, '""');
            if (str.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(str.charAt(0))) {
                str = "'" + str;
            }
            return str;
        }
    },
    template: `
        <div class="space-y-6 pb-10 print:space-y-4 print:pb-0">
            <!-- CABEÇALHO EXECUTIVO EXCLUSIVO PARA IMPRESSÃO (PDF) -->
            <div class="print-only pb-4 border-b-2 border-emerald-600">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl font-black tracking-wider text-emerald-700">LAINOVA</span>
                            <span class="text-[9pt] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">Relatório Oficial de Atividades</span>
                        </div>
                        <p class="text-[9pt] text-slate-500 mt-1">Painel Consolidado de Banco de Horas e Produtividade Acadêmica</p>
                    </div>
                    <div class="text-right text-[8.5pt] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <p><strong>Período:</strong> {{ periodoRelatorioTexto }}</p>
                        <p v-if="filtroRelatorio.membro"><strong>Filtro:</strong> {{ filtroRelatorio.membro }}</p>
                        <p><strong>Emissão:</strong> {{ new Date().toLocaleDateString('pt-BR') }} às {{ new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) }}</p>
                    </div>
                </div>
            </div>

            <!-- CONTROLES NA TELA (NÃO IMPRIMEM) -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4 no-print">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-file-invoice text-emerald-600"></i> Relatório Geral de Atividades
                    </h2>
                    <p class="text-slate-500 text-sm mt-1">
                        Período de Análise: <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{{ periodoRelatorioTexto }}</span>
                    </p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto">
                    <button @click="$emit('exportar-csv')" class="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition text-sm">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i> Exportar CSV
                    </button>
                    <button @click="$emit('imprimir-relatorio')" class="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2 transition text-sm">
                        <i class="fa-solid fa-print"></i> Guardar PDF
                    </button>
                </div>
            </div>

            <!-- FILTROS (NÃO IMPRIMEM) -->
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
                <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button @click="$emit('aplicar-filtro-rapido', 'mes')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition border border-slate-200">Mensal</button>
                        <button @click="$emit('aplicar-filtro-rapido', 'semestre')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition border border-slate-200">Semestral</button>
                        <button @click="$emit('aplicar-filtro-rapido', 'ano')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition border border-slate-200">Anual</button>
                        <button @click="$emit('aplicar-filtro-rapido', 'tudo')" class="flex-1 sm:flex-none px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-medium transition shadow-sm">Ver Tudo</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Data Inicial</label>
                        <input type="date" v-model="filtroRelatorio.inicio" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Data Final</label>
                        <input type="date" v-model="filtroRelatorio.fim" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Filtrar por Utilizador</label>
                        <select v-model="filtroRelatorio.membro" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm">
                            <option value="">Todos os membros da equipa</option>
                            <option v-for="m in membros" :key="m.login || m.nome" :value="m.nome">{{ m.nome }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- BLOCO DE KPIS -->
            <div class="grid grid-cols-2 lg:grid-cols-4 print:grid-cols-4 gap-4 print:gap-3 print-avoid-break">
                <div class="bg-white p-5 print:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span class="text-slate-500 text-xs uppercase font-bold tracking-wider mb-0.5">Total de Horas</span>
                    <span class="text-2xl print:text-xl font-black text-slate-800">{{ kpisRelatorio.totalHoras }}<span class="text-sm font-semibold text-slate-500 ml-0.5">h</span></span>
                    <span class="text-[8pt] text-slate-400 mt-0.5">Carga horária acumulada</span>
                </div>
                
                <div class="bg-white p-5 print:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center border-l-4 border-l-emerald-500">
                    <span class="text-emerald-700 text-xs uppercase font-bold tracking-wider mb-0.5">Membros Ativos</span>
                    <span class="text-2xl print:text-xl font-black text-slate-800">{{ rankingRelatorio.length }}</span>
                    <span class="text-[8pt] text-slate-400 mt-0.5">Participantes no período</span>
                </div>
                
                <div class="bg-white p-5 print:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span class="text-slate-500 text-xs uppercase font-bold tracking-wider mb-0.5">Atividades</span>
                    <span class="text-2xl print:text-xl font-black text-slate-800">{{ kpisRelatorio.totalAtividades }}</span>
                    <span class="text-[8pt] text-slate-400 mt-0.5">Média: {{ kpisRelatorio.mediaHorasPorAtividade }}h / registro</span>
                </div>
                
                <div class="bg-white p-5 print:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span class="text-amber-600 text-xs uppercase font-bold tracking-wider mb-0.5">Destaque</span>
                    <span class="text-base print:text-sm font-black text-slate-800 truncate" :title="kpisRelatorio.membroDestaque">{{ kpisRelatorio.membroDestaque || 'N/A' }}</span>
                    <span class="text-[8pt] text-slate-400 mt-0.5">Maior volume de horas</span>
                </div>
            </div>

            <!-- BLOCO DE GRÁFICOS -->
            <div class="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 print-avoid-break">
                <div class="bg-white p-5 print:p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Ranking de Horas por Membro</h4>
                    <p class="text-[8.5pt] text-slate-400 mb-3 no-print">Top 10 membros com mais horas no período</p>
                    <div class="relative h-60 w-full chart-container-print">
                        <canvas id="chartRelRanking"></canvas>
                    </div>
                </div>
                <div class="bg-white p-5 print:p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">Distribuição por Categoria</h4>
                    <p class="text-[8.5pt] text-slate-400 mb-3 no-print">Proporção de horas por tipo de atividade</p>
                    <div class="relative h-60 w-full chart-container-print">
                        <canvas id="chartRelCategoria"></canvas>
                    </div>
                </div>
            </div>

            <!-- TABELAS DE DETALHAMENTO -->
            <div class="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-1 gap-6 print:gap-4">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1 print-avoid-break flex flex-col">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider">Resumo por Membro</h3>
                        <span class="text-[8pt] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">{{ rankingRelatorio.length }} membros</span>
                    </div>
                    <div class="overflow-x-auto flex-1 max-h-[350px] print:max-h-none">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-white sticky top-0 shadow-sm z-10 print:static print:shadow-none">
                                <tr class="text-slate-500 text-[8pt] uppercase tracking-wider">
                                    <th class="px-3 py-2 font-semibold">Nome</th>
                                    <th class="px-3 py-2 font-semibold text-right">Horas</th>
                                    <th class="px-3 py-2 font-semibold text-center">Ativ.</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="(m, index) in rankingRelatorio" :key="m.nome" class="hover:bg-slate-50 transition">
                                    <td class="px-3 py-2 font-medium text-slate-800 text-xs">
                                        <span class="text-slate-400 font-bold mr-1">{{ index + 1 }}º</span> {{ m.nome }}
                                    </td>
                                    <td class="px-3 py-2 text-right text-emerald-700 font-bold text-xs">{{ m.horas }}h</td>
                                    <td class="px-3 py-2 text-center text-slate-500 text-xs">{{ m.atividades }}</td>
                                </tr>
                                <tr v-if="rankingRelatorio.length === 0">
                                    <td colspan="3" class="px-3 py-6 text-center text-slate-400 italic text-xs">Nenhum dado no período.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 print-avoid-break flex flex-col">
                    <div class="px-4 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider">
                            Extrato Detalhado de Lançamentos
                        </h3>
                        <span class="text-[8pt] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">{{ registrosRelatorio.length }} registros</span>
                    </div>
                    <div class="overflow-x-auto flex-1 max-h-[350px] print:max-h-none">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-white sticky top-0 shadow-sm z-10 print:static print:shadow-none">
                                <tr class="text-slate-500 text-[8pt] uppercase tracking-wider">
                                    <th class="px-3 py-2 font-semibold">Data</th>
                                    <th class="px-3 py-2 font-semibold" v-if="!filtroRelatorio.membro">Membro</th>
                                    <th class="px-3 py-2 font-semibold">Projeto</th>
                                    <th class="px-3 py-2 font-semibold">Categoria</th>
                                    <th class="px-3 py-2 font-semibold text-right">Horas</th>
                                    <th class="px-3 py-2 font-semibold">Descrição</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="r in registrosRelatorioOrdenados" :key="r.ID" class="hover:bg-slate-50 transition">
                                    <td class="px-3 py-2 text-slate-600 font-mono text-[8pt] whitespace-nowrap">{{ formatarDataSheet(r.Data) }}</td>
                                    <td class="px-3 py-2 font-medium text-slate-800 text-xs whitespace-nowrap" v-if="!filtroRelatorio.membro">{{ r.Nome_Membro }}</td>
                                    <td class="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">{{ r.Projeto || 'Atividade' }}</td>
                                    <td class="px-3 py-2 whitespace-nowrap"><span class="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[7.5pt] font-bold">{{ r.Categoria }}</span></td>
                                    <td class="px-3 py-2 font-bold text-slate-800 text-right text-xs whitespace-nowrap">{{ parseFloat(r.Horas_Gastas).toFixed(1) }}h</td>
                                    <td class="px-3 py-2 text-slate-600 text-xs truncate max-w-[200px] print:max-w-none print:whitespace-normal" :title="r.Descricao">{{ r.Descricao }}</td>
                                </tr>
                                <tr v-if="registrosRelatorio.length === 0">
                                    <td colspan="6" class="px-3 py-6 text-center text-slate-400 italic text-xs">Nenhum registro encontrado.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- RODAPÉ EXECUTIVO PARA IMPRESSÃO -->
            <div class="print-only mt-6 pt-3 border-t border-slate-300 flex justify-between items-center text-[7.5pt] text-slate-400">
                <span>LAINOVA • Liga Acadêmica de Inovação • Relatório gerado com autenticação segura</span>
                <span>Documento Oficial</span>
            </div>
        </div>
    `
};
