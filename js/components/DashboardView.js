window.DashboardViewComponent = {
    props: {
        membros: { type: Array, default: () => [] },
        acumuladoMembros: { type: Array, default: () => [] },
        totalHorasGeral: { type: [String, Number], default: '0.0' },
        totalLancamentos: { type: Number, default: 0 },
        cargoUsuario: { type: String, default: '' }
    },
    computed: {
        isMembroComum() {
            const c = (this.cargoUsuario || '').toUpperCase();
            return c === 'MEMBRO' || c === 'MEMBRO_COMUM' || c === 'FUNCIONARIO';
        },
        totalHorasExibicao() {
            const val = parseFloat(this.totalHorasGeral);
            return isNaN(val) ? '0.0' : val.toFixed(1);
        }
    },
    methods: {
        formatarCargo(c) {
            const up = (c || '').toUpperCase();
            if (up === 'PROPRIETARIO' || up === 'ADMINISTRADOR_MASTER') return 'Proprietário';
            if (up === 'ADMINISTRADOR') return 'Administrador';
            if (up === 'GESTOR') return 'Gestor';
            return 'Membro';
        },
        formatarHoras(m) {
            if (m.aprovadas !== undefined && m.aprovadas !== null && m.aprovadas !== '') {
                const num = parseFloat(m.aprovadas);
                return isNaN(num) ? '0.0' : num.toFixed(1);
            }
            if (m.horas !== undefined && m.horas !== null) {
                const num = parseFloat(m.horas);
                return isNaN(num) ? '0.0' : num.toFixed(1);
            }
            return '0.0';
        }
    },
    template: `
        <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-500 text-xl shrink-0">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">{{ isMembroComum ? 'Membros da Equipa' : 'Membros Ativos' }}</p>
                        <p class="text-2xl font-bold text-slate-800">{{ membros.length }}</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-emerald-500 text-xl shrink-0">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">{{ isMembroComum ? 'As Minhas Horas Lançadas' : 'Total de Horas Registadas' }}</p>
                        <p class="text-2xl font-bold text-slate-800">{{ totalHorasExibicao }}h</p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-amber-500 text-xl shrink-0">
                        <i class="fa-solid fa-list-check"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">{{ isMembroComum ? 'Os Meus Lançamentos' : 'Total de Atividades' }}</p>
                        <p class="text-2xl font-bold text-slate-800">{{ totalLancamentos }}</p>
                    </div>
                </div>
            </div>

            <div v-if="!isMembroComum" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 class="font-semibold text-slate-700">Acumulado de Horas por Integrante</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500 text-sm">
                            <tr>
                                <th class="px-6 py-3 font-medium">Membro</th>
                                <th class="px-6 py-3 font-medium">Cargo</th>
                                <th class="px-6 py-3 font-medium text-right">Horas Realizadas</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="m in acumuladoMembros" :key="m.nome" class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-bold text-slate-700">{{ m.nome }}</td>
                                <td class="px-6 py-4 text-slate-600">{{ formatarCargo(m.cargo) }}</td>
                                <td class="px-6 py-4 text-right text-emerald-600 font-bold text-base">{{ formatarHoras(m) }}h</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
