window.DashboardViewComponent = {
    props: {
        membros: { type: Array, default: () => [] },
        acumuladoMembros: { type: Array, default: () => [] },
        totalHorasGeral: { type: String, default: '0.0' },
        totalLancamentos: { type: Number, default: 0 },
        cargoUsuario: { type: String, default: '' }
    },
    template: `
        <div class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-blue-500 text-xl shrink-0">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">{{ cargoUsuario === 'FUNCIONARIO' ? 'Membros da Equipa' : 'Membros Ativos' }}</p>
                        <p class="text-2xl font-bold text-slate-800">{{ membros.length }}</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-emerald-500 text-xl shrink-0">
                        <i class="fa-solid fa-clock"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">{{ cargoUsuario === 'FUNCIONARIO' ? 'As Minhas Horas Lançadas' : 'Total de Horas Registadas' }}</p>
                        <p class="text-2xl font-bold text-slate-800">{{ totalHorasGeral }}h</p>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-indigo-500 text-xl shrink-0">
                        <i class="fa-solid fa-list-check"></i>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-slate-500">{{ cargoUsuario === 'FUNCIONARIO' ? 'Os Meus Lançamentos' : 'Total de Atividades' }}</p>
                        <p class="text-2xl font-bold text-slate-800">{{ totalLancamentos }}</p>
                    </div>
                </div>
            </div>

            <div v-if="cargoUsuario !== 'FUNCIONARIO'" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 class="font-semibold text-slate-700">Acumulado de Horas por Integrante</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                            <tr>
                                <th class="px-6 py-3">Membro</th>
                                <th class="px-6 py-3">Cargo</th>
                                <th class="px-6 py-3 text-right">Total de Horas</th>
                                <th class="px-6 py-3 text-center">Atividades</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            <tr v-for="m in acumuladoMembros" :key="m.login || m.nome" class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4 font-bold text-slate-700">{{ m.nome }}</td>
                                <td class="px-6 py-4 text-slate-600">{{ m.cargo }}</td>
                                <td class="px-6 py-4 text-right text-emerald-600 font-bold text-base">{{ m.totalHoras }}h</td>
                                <td class="px-6 py-4 text-center text-slate-500 font-semibold">{{ m.totalAtividades }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
