window.GraficosViewComponent = {
    props: {
        registros: { type: Array, default: () => [] },
        periodoGrafico: { type: String, default: 'mes' },
        usuario: { type: Object, default: () => ({ nome: '' }) }
    },
    emits: ['mudar-periodo'],
    data() {
        return {
            chartTemporal: null,
            chartCategoria: null
        };
    },
    methods: {
        renderizarGraficos() {
            this.$nextTick(() => {
                const ctxTemp = document.getElementById('graficoTemporal');
                const ctxCat = document.getElementById('graficoCategoria');
                if (!ctxTemp || !ctxCat) return;

                if (typeof Chart === 'undefined') {
                    console.warn('Chart.js ainda não carregado.');
                    return;
                }

                Chart.defaults.font.family = "'Inter', sans-serif";
                const registrosValidos = this.registros || [];

                // 1. Dados Temporais
                const dadosTemporais = {};
                registrosValidos.forEach(r => {
                    let d = new Date(r.Data);
                    if (isNaN(d.getTime()) && r.Data && r.Data.includes('/')) {
                        const parts = r.Data.split('/');
                        d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    }
                    if (isNaN(d.getTime())) return;

                    let chave = "";
                    if (this.periodoGrafico === 'mes') {
                        chave = d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
                    } else if (this.periodoGrafico === 'semestre') {
                        const sem = d.getMonth() < 6 ? '1º Sem' : '2º Sem';
                        chave = `${sem}/${d.getFullYear()}`;
                    } else if (this.periodoGrafico === 'semana') {
                        const inicioSemana = new Date(d);
                        inicioSemana.setDate(d.getDate() - d.getDay());
                        chave = `Sem ${inicioSemana.getDate()}/${inicioSemana.getMonth() + 1}`;
                    }

                    dadosTemporais[chave] = (dadosTemporais[chave] || 0) + (parseFloat(r.Horas_Gastas) || 0);
                });

                if (this.chartTemporal) this.chartTemporal.destroy();
                this.chartTemporal = new Chart(ctxTemp, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(dadosTemporais),
                        datasets: [{
                            label: 'Horas Realizadas',
                            data: Object.values(dadosTemporais).map(v => parseFloat(v.toFixed(1))),
                            backgroundColor: '#10b981',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });

                // 2. Dados por Categoria
                const dadosCategorias = {};
                registrosValidos.forEach(r => {
                    const cat = r.Categoria || 'Outros';
                    dadosCategorias[cat] = (dadosCategorias[cat] || 0) + (parseFloat(r.Horas_Gastas) || 0);
                });

                if (this.chartCategoria) this.chartCategoria.destroy();
                this.chartCategoria = new Chart(ctxCat, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(dadosCategorias),
                        datasets: [{
                            data: Object.values(dadosCategorias).map(v => parseFloat(v.toFixed(1))),
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e', '#0ea5e9']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            });
        },
        imprimirPDF() {
            window.print();
        }
    },
    mounted() {
        this.renderizarGraficos();
    },
    watch: {
        registros: {
            deep: true,
            handler() { this.renderizarGraficos(); }
        },
        periodoGrafico() {
            this.renderizarGraficos();
        }
    },
    beforeUnmount() {
        if (this.chartTemporal) this.chartTemporal.destroy();
        if (this.chartCategoria) this.chartCategoria.destroy();
    },
    template: `
        <div class="space-y-6">
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h3 class="font-bold text-slate-800 text-lg">Evolução Geral de Atividades</h3>
                    <p class="text-slate-500 text-sm">Distribuição das horas dedicadas no tempo e por categoria.</p>
                </div>
                <div class="flex items-center gap-3 w-full md:w-auto">
                    <div class="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-full md:w-auto overflow-x-auto">
                        <button @click="$emit('mudar-periodo', 'semana')" :class="periodoGrafico === 'semana' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm transition">Semana</button>
                        <button @click="$emit('mudar-periodo', 'mes')" :class="periodoGrafico === 'mes' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm transition">Mês</button>
                        <button @click="$emit('mudar-periodo', 'semestre')" :class="periodoGrafico === 'semestre' ? 'bg-white shadow text-emerald-600 font-bold' : 'text-slate-600'" class="flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm transition">Semestre</button>
                    </div>
                    <button @click="imprimirPDF" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 text-sm transition shrink-0">
                        <i class="fa-solid fa-print"></i> Guardar PDF
                    </button>
                </div>
            </div>

            <div class="hidden print-only mb-6 border-b-2 border-emerald-600 pb-3">
                <h1 class="text-2xl font-black text-slate-900">LAINOVA — Relatório Analítico de Gráficos</h1>
                <p class="text-xs text-slate-500">Emitido por: {{ usuario.nome }} | Sistema Oficial</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 print-avoid-break">
                <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 class="font-semibold text-slate-700 mb-4 capitalize">Carga Horária (Por {{ periodoGrafico }})</h4>
                    <div class="relative h-80 w-full chart-container-print"><canvas id="graficoTemporal"></canvas></div>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 class="font-semibold text-slate-700 mb-4">Distribuição por Categoria</h4>
                    <div class="relative h-80 w-full chart-container-print"><canvas id="graficoCategoria"></canvas></div>
                </div>
            </div>
        </div>
    `
};
