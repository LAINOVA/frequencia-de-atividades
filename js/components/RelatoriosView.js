window.RelatoriosViewComponent = {
    props: {
        membros: { type: Array, default: () => [] },
        filtroRelatorio: { type: Object, required: true },
        periodoRelatorioTexto: { type: String, default: '' },
        kpisRelatorio: { type: Object, required: true },
        rankingRelatorio: { type: Array, default: () => [] },
        registrosRelatorio: { type: Array, default: () => [] },
        registrosRelatorioOrdenados: { type: Array, default: () => [] },
        formatarDataSheet: { type: Function, required: true },
        usuario: { type: Object, default: () => ({ nome: '' }) }
    },
    emits: ['aplicar-filtro-rapido', 'exportar-csv', 'imprimir-relatorio'],
    data() {
        return {
            chartRelatorioCat: null,
            chartRelatorioMembros: null
        };
    },
    methods: {
        renderizarGraficosRelatorio() {
            this.$nextTick(() => {
                const ctxCat = document.getElementById('graficoRelatorioCategoria');
                const ctxMem = document.getElementById('graficoRelatorioMembros');
                if (!ctxCat || !ctxMem) return;
                if (typeof Chart === 'undefined') return;

                Chart.defaults.font.family = "'Inter', sans-serif";
                const regs = this.registrosRelatorio || [];

                // 1. Categoria
                const catMap = {};
                regs.forEach(r => {
                    const c = r.Categoria || 'Outros';
                    catMap[c] = (catMap[c] || 0) + (parseFloat(r.Horas_Gastas) || 0);
                });

                if (this.chartRelatorioCat) this.chartRelatorioCat.destroy();
                this.chartRelatorioCat = new Chart(ctxCat, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(catMap),
                        datasets: [{
                            data: Object.values(catMap).map(v => parseFloat(v.toFixed(1))),
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e', '#0ea5e9']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });

                // 2. Ranking de Membros
                const topMembros = (this.rankingRelatorio || []).slice(0, 7);
                if (this.chartRelatorioMembros) this.chartRelatorioMembros.destroy();
                this.chartRelatorioMembros = new Chart(ctxMem, {
                    type: 'bar',
                    data: {
                        labels: topMembros.map(m => m.nome),
                        datasets: [{
                            label: 'Horas no Período',
                            data: topMembros.map(m => m.horas),
                            backgroundColor: '#3b82f6',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true } }
                    }
                });
            });
        }
    },
    mounted() {
        this.renderizarGraficosRelatorio();
    },
    watch: {
        registrosRelatorio: {
            deep: true,
            handler() { this.renderizarGraficosRelatorio(); }
        }
    },
    beforeUnmount() {
        if (this.chartRelatorioCat) this.chartRelatorioCat.destroy();
        if (this.chartRelatorioMembros) this.chartRelatorioMembros.destroy();
    },
    template: `
        <div class="space-y-6 pb-10 print:pb-0">
            <!-- Cabeçalho de Impressão -->
            <div class="hidden print-only mb-6 border-b-2 border-emerald-600 pb-3">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900">LAINOVA — Relatório Geral de Atividades</h1>
                        <p class="text-xs text-slate-500">Período: {{ periodoRelatorioTexto }} | Emitido por: {{ usuario.nome }}</p>
                    </div>
                </div>
            </div>

            <!-- Barra Superior de Ações -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-file-invoice text-emerald-600"></i> Relatório de Atividades
                    </h2>
                    <p class="text-slate-500 text-sm mt-1">
                        Período de Análise: <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{{ periodoRelatorioTexto }}</span>
                    </p>
                </div>
                <div class="flex items-center gap-2 w-full md:w-auto no-print">
                    <button @click="$emit('exportar-csv')" class="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition text-sm">
                        <i class="fa-solid fa-file-csv text-emerald-600"></i> Excel/CSV
                    </button>
                    <button @click="$emit('imprimir-relatorio')" class="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition text-sm">
                        <i class="fa-solid fa-print"></i> Guardar PDF Completo
                    </button>
                </div>
            </div>

            <!-- Filtros Rápidos (Ocultos na impressão) -->
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
                        <label class="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Filtrar por Membro</label>
                        <select v-model="filtroRelatorio.membro" class="w-full border border-slate-300 p-2.5 rounded-lg bg-slate-50 outline-none focus:border-emerald-500 text-sm font-medium">
                            <option value="">Todos os membros da equipa</option>
                            <option v-for="m in membros" :key="m.login" :value="m.nome">{{ m.nome }} (@{{ m.login }})</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Cards de KPI -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 print-avoid-break">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <span class="text-slate-500 text-xs font-bold uppercase mb-1 z-10">Total Horas</span>
                    <span class="text-3xl font-black text-slate-800 z-10">{{ kpisRelatorio.totalHoras }}<span class="text-lg font-medium text-slate-500">h</span></span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">No período selecionado</span>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <span class="text-slate-500 text-xs font-bold uppercase mb-1 z-10">Membros Participantes</span>
                    <span class="text-3xl font-black text-slate-800 z-10">{{ rankingRelatorio.length }}</span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">Com atividades ativas</span>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <span class="text-slate-500 text-xs font-bold uppercase mb-1 z-10">Total Atividades</span>
                    <span class="text-3xl font-black text-slate-800 z-10">{{ kpisRelatorio.totalAtividades }}</span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">Média: {{ kpisRelatorio.mediaHorasPorAtividade }}h / ativ.</span>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <span class="text-amber-600 text-xs font-bold uppercase mb-1 z-10">Destaque do Período</span>
                    <span class="text-lg font-black text-slate-800 truncate z-10" :title="kpisRelatorio.membroDestaque">{{ kpisRelatorio.membroDestaque || 'N/A' }}</span>
                    <span class="text-xs text-slate-400 mt-1 z-10 font-medium">Maior acumulador de horas</span>
                </div>
            </div>

            <!-- GRÁFICOS DO RELATÓRIO (Visíveis na tela e no PDF) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 print-avoid-break">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 class="font-bold text-slate-700 text-sm mb-3">Distribuição por Categoria</h4>
                    <div class="relative h-64 w-full chart-container-print"><canvas id="graficoRelatorioCategoria"></canvas></div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 class="font-bold text-slate-700 text-sm mb-3">Top Membros no Período</h4>
                    <div class="relative h-64 w-full chart-container-print"><canvas id="graficoRelatorioMembros"></canvas></div>
                </div>
            </div>

            <!-- TABELAS DO RELATÓRIO (Multi-página no PDF) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Resumo por Membro -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1 print-avoid-break flex flex-col">
                    <div class="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-sm">Resumo da Equipa</h3>
                        <span class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{{ rankingRelatorio.length }} membros</span>
                    </div>
                    <div class="overflow-x-auto flex-1 max-h-[400px]">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-white sticky top-0 shadow-sm z-10">
                                <tr class="text-slate-500 text-xs uppercase tracking-wider">
                                    <th class="px-4 py-3 font-semibold">Nome</th>
                                    <th class="px-4 py-3 font-semibold text-right">Horas</th>
                                    <th class="px-4 py-3 font-semibold text-center">Ativ.</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="(m, index) in rankingRelatorio" :key="m.nome" 
                                    class="hover:bg-slate-50 cursor-pointer transition group" 
                                    @click="filtroRelatorio.membro = m.nome" title="Clique para filtrar">
                                    <td class="px-4 py-3 font-semibold text-slate-700 flex items-center gap-2">
                                        <span class="text-xs font-bold text-slate-400 w-3 text-center">{{ index + 1 }}º</span> 
                                        <span class="group-hover:text-emerald-600 transition-colors">{{ m.nome }}</span>
                                    </td>
                                    <td class="px-4 py-3 text-right text-emerald-600 font-bold">{{ m.horas }}h</td>
                                    <td class="px-4 py-3 text-center text-slate-500">{{ m.atividades }}</td>
                                </tr>
                                <tr v-if="rankingRelatorio.length === 0">
                                    <td colspan="3" class="px-4 py-8 text-center text-slate-400 italic">Nenhum dado no período.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Extrato Detalhado de Todas as Atividades -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col">
                    <div class="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-2">
                        <h3 class="font-bold text-slate-700 text-sm">Extrato Completo de Lançamentos</h3>
                        <span class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">{{ registrosRelatorio.length }} registos</span>
                    </div>
                    <div class="overflow-x-auto flex-1 max-h-[400px]">
                        <table class="w-full text-left whitespace-nowrap text-sm">
                            <thead class="bg-white sticky top-0 shadow-sm z-10">
                                <tr class="text-slate-500 text-xs uppercase tracking-wider">
                                    <th class="px-4 py-3 font-semibold">Data</th>
                                    <th class="px-4 py-3 font-semibold" v-if="!filtroRelatorio.membro">Membro</th>
                                    <th class="px-4 py-3 font-semibold">Projeto</th>
                                    <th class="px-4 py-3 font-semibold">Categoria</th>
                                    <th class="px-4 py-3 font-semibold text-right">Horas</th>
                                    <th class="px-4 py-3 font-semibold">Descrição</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="r in registrosRelatorioOrdenados" :key="r.ID" class="hover:bg-slate-50 transition">
                                    <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ formatarDataSheet(r.Data) }}</td>
                                    <td class="px-4 py-3 font-semibold text-slate-700" v-if="!filtroRelatorio.membro">{{ r.Nome_Membro }}</td>
                                    <td class="px-4 py-3"><span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">{{ r.Projeto || 'Atividade' }}</span></td>
                                    <td class="px-4 py-3"><span class="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{{ r.Categoria }}</span></td>
                                    <td class="px-4 py-3 font-bold text-slate-800 text-right">{{ parseFloat(r.Horas_Gastas).toFixed(1) }}h</td>
                                    <td class="px-4 py-3 text-slate-600 truncate max-w-[220px]" :title="r.Descricao">{{ r.Descricao }}</td>
                                </tr>
                                <tr v-if="registrosRelatorio.length === 0">
                                    <td colspan="6" class="px-4 py-12 text-center text-slate-400">Nenhum registo encontrado para os filtros selecionados.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
};
