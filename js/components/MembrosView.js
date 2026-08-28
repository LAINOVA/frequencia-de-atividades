window.MembrosViewComponent = {
    props: {
        membros: { type: Array, default: () => [] }
    },
    emits: ['abrir-modal', 'alternar-status', 'remover-membro'],
    template: `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">Gestão de Utilizadores e Membros</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Membros cadastrados na base de dados com acesso ao sistema.</p>
                </div>
                <button @click="$emit('abrir-modal')" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition flex items-center justify-center gap-2 text-sm">
                    <i class="fa-solid fa-user-plus"></i> Adicionar Membro
                </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 font-semibold">
                            <tr>
                                <th class="px-6 py-4">Nome Completo</th>
                                <th class="px-6 py-4">Utilizador / Login</th>
                                <th class="px-6 py-4">Cargo / Função</th>
                                <th class="px-6 py-4 text-center">Status</th>
                                <th class="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-sm">
                            <tr v-for="m in membros" :key="m.login" class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 font-semibold text-slate-800">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase border border-emerald-100">
                                            {{ (m.nome || 'U').substring(0,2) }}
                                        </div>
                                        <span>{{ m.nome }}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4 font-mono text-xs text-slate-700 font-bold">@{{ m.login }}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 rounded-md text-xs font-bold"
                                          :class="{
                                              'bg-purple-100 text-purple-800 border border-purple-200': m.cargo === 'ADMINISTRADOR',
                                              'bg-blue-100 text-blue-800 border border-blue-200': m.cargo === 'GESTOR',
                                              'bg-slate-100 text-slate-700 border border-slate-200': m.cargo === 'FUNCIONARIO'
                                          }">
                                        {{ m.cargo }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                          :class="m.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                                        <i class="fa-solid fa-circle text-[6px]"></i>
                                        {{ m.ativo ? 'Ativo' : 'Inativo' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    <button @click="$emit('alternar-status', m.login, !m.ativo)" 
                                            class="text-xs px-3 py-1.5 rounded-md font-semibold transition border"
                                            :class="m.ativo ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'"
                                            :title="m.ativo ? 'Desativar acesso deste utilizador' : 'Reativar acesso'">
                                        <i class="fa-solid" :class="m.ativo ? 'fa-user-slash mr-1' : 'fa-user-check mr-1'"></i>
                                        {{ m.ativo ? 'Desativar' : 'Ativar' }}
                                    </button>
                                    <button @click="$emit('remover-membro', m.login)" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition text-xs font-semibold" title="Eliminar utilizador permanentemente">
                                        <i class="fa-regular fa-trash-can mr-1"></i> Eliminar
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="membros.length === 0">
                                <td colspan="5" class="px-6 py-12 text-center text-slate-400">Nenhum membro cadastrado na base de dados.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
