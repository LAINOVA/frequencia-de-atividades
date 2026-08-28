window.GraficosViewComponent = {
    props: {
        registros: { type: Array, default: () => [] },
        periodoGrafico: { type: String, default: 'mes' },
        usuario: { type: Object, default: () => ({ nome: '', cargo: '' }) }
    },
    emits: ['mudar-periodo'],
    methods: {
        imprimirGraficos() {
            window.print();
        }
    },
    template: `
        <div class="space-y-6 pb-8">
            <!-- CABEÇALHO EXECUTIVO EXCLUSIVO PARA IMPRESSÃO (PDF) -->
            <div class="print-only mb-6 pb-4 border-b-2 border-emerald-500">
                <div class="flex justify-between items-center">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl font-black tracking-wider text-emerald-700">LAINOVA</span>
                            <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Relatório Gráfico</span>
                        </div>
                        <h2 class="text-lg font-bold text-slate-800 mt-1">Evolução & Análise de Desempenho de Atividades</h2>
                    </div>
                    <div class="text-right text-xs text-slate-500">
                        <p>Visualização: <strong class="capitalize text-slate-700">{{ periodoGrafico }}</strong></p>
                        <p>Emitido em: {{ new Date().toLocaleDateString('pt-BR') }} às {{ new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}</p>
                    </div>
                </div>
            </div>

            <!-- CONTROLES NA TELA (NÃO IMPRIMEM) -->
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h3 class="font-bold text-slate-800 text-lg">Evolução Geral</h3>
                    <p class="text-slate-500 text-sm">Distribuição temporal e setorial das horas registadas.</p>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <div class="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 flex-1 md:flex-none">
                        <button @click="$emit('mudar-periodo', 'semana')" :class="periodoGrafico === 'semana' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="px-3.5 py-1.5 rounded-md text-xs sm:text-sm transition">Semana</button>
                        <button @click="$emit('mudar-periodo', 'mes')" :class="periodoGrafico === 'mes' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="px-3.5 py-1.5 rounded-md text-xs sm:text-sm transition">Mês</button>
                        <button @click="$emit('mudar-periodo', 'semestre')" :class="periodoGrafico === 'semestre' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="px-3.5 py-1.5 rounded-md text-xs sm:text-sm transition">Semestre</button>
                    </div>
                    <button @click="imprimirGraficos" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition whitespace-nowrap">
                        <i class="fa-solid fa-print"></i> Guardar PDF
                    </button>
                </div>
            </div>

            <!-- ÁREA DOS GRÁFICOS -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print-avoid-break">
                <div class="lg:col-span-2 print:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:p-4">
                    <h4 class="font-semibold text-slate-800 mb-3 capitalize text-sm">Carga Horária (Por {{ periodoGrafico }})</h4>
                    <div class="relative h-72 w-full chart-container-print"><canvas id="graficoTemporal"></canvas></div>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:p-4">
                    <h4 class="font-semibold text-slate-800 mb-3 text-sm">Distribuição por Categoria</h4>
                    <div class="relative h-72 w-full chart-container-print"><canvas id="graficoCategoria"></canvas></div>
                </div>
            </div>

            <!-- RODAPÉ EXECUTIVO PARA IMPRESSÃO -->
            <div class="print-only mt-8 pt-4 border-t border-slate-200 text-center text-[8pt] text-slate-400">
                <p>LAINOVA • Painel Administrativo de Atividades • Documento oficial gerado pelo sistema.</p>
            </div>
        </div>
    `
};
