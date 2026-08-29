window.MembrosViewComponent = {
    props: {
        membros: { type: Array, default: () => [] },
        usuario: { type: Object, default: () => ({ cargo: '' }) }
    },
    emits: ['abrir-modal', 'alternar-status', 'remover-membro', 'abrir-reset-senha'],
    computed: {
        isProprietario() {
            const c = (this.usuario.cargo || '').toUpperCase();
            return c === 'PROPRIETARIO' || c === 'ADMINISTRADOR_MASTER';
        }
    },
    methods: {
        formatarCargo(c) {
            const up = (c || '').toUpperCase();
            if (up === 'PROPRIETARIO' || up === 'ADMINISTRADOR_MASTER') return 'Proprietário';
            if (up === 'ADMINISTRADOR') return 'Administrador';
            if (up === 'GESTOR') return 'Gestor';
            return 'Membro';
        }
    },
    template: `
        <div class="space-y-6">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold text-slate-800">Gestão de Membros & Permissões</h3>
                    <p class="text-xs text-slate-500">Cadastre e gerencie as contas e permissões de acesso da LAINOVA.</p>
                </div>
                <button @click="$emit('abrir-modal')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium shadow flex items-center justify-center gap-2 transition text-sm">
                    <i class="fa-solid fa-user-plus"></i> Adicionar Membro
                </button>
            </div>
            
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                            <tr>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Membro</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Login / Utilizador</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider">Cargo / Permissão</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider text-center">Status</th>
                                <th class="px-6 py-4 font-semibold uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="m in membros" :key="m.login" class="hover:bg-slate-50 transition">
                                <td class="px-6 py-4 font-medium text-slate-800">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase"
                                             :class="{
                                                 'bg-amber-100 text-amber-800': m.cargo === 'PROPRIETARIO' || m.cargo === 'ADMINISTRADOR_MASTER',
                                                 'bg-purple-100 text-purple-800': m.cargo === 'ADMINISTRADOR',
                                                 'bg-blue-100 text-blue-800': m.cargo === 'GESTOR',
                                                 'bg-emerald-100 text-emerald-700': m.cargo === 'MEMBRO' || m.cargo === 'FUNCIONARIO'
                                             }">
                                            {{ (m.nome || 'U').substring(0,2) }}
                                        </div>
                                        <div>
                                            <span class="font-bold text-slate-800">{{ m.nome }}</span>
                                            <span v-if="m.cargo === 'PROPRIETARIO' || m.cargo === 'ADMINISTRADOR_MASTER'" class="ml-2 text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-black uppercase">Proprietário</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-slate-500 font-mono text-xs">@{{ m.login }}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                                          :class="{
                                              'bg-amber-100 text-amber-800 border border-amber-300': m.cargo === 'PROPRIETARIO' || m.cargo === 'ADMINISTRADOR_MASTER',
                                              'bg-purple-100 text-purple-700': m.cargo === 'ADMINISTRADOR',
                                              'bg-blue-100 text-blue-700': m.cargo === 'GESTOR',
                                              'bg-slate-100 text-slate-700': m.cargo === 'MEMBRO' || m.cargo === 'FUNCIONARIO'
                                          }">
                                        {{ formatarCargo(m.cargo) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                                          :class="m.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                                        <i class="fa-solid fa-circle text-[8px] mr-1"></i>{{ m.ativo ? 'Ativo' : 'Inativo' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <!-- Redefinir Senha (Apenas Proprietário) -->
                                        <button v-if="isProprietario" @click="$emit('abrir-reset-senha', m)"
                                                class="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center gap-1" title="Redefinir Senha do Membro">
                                            <i class="fa-solid fa-key text-xs text-amber-600"></i> Senha
                                        </button>

                                        <!-- Ativar/Desativar (Protege o Proprietário) -->
                                        <button v-if="m.cargo !== 'PROPRIETARIO' && m.cargo !== 'ADMINISTRADOR_MASTER'"
                                                @click="$emit('alternar-status', m.login, m.ativo ? 'NAO' : 'SIM')"
                                                class="text-xs px-3 py-1.5 rounded-lg font-semibold transition border"
                                                :class="m.ativo ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'">
                                            {{ m.ativo ? 'Desativar' : 'Ativar' }}
                                        </button>

                                        <!-- Excluir (Apenas Proprietário pode excluir, e não pode excluir a si mesmo) -->
                                        <button v-if="isProprietario && m.cargo !== 'PROPRIETARIO' && m.cargo !== 'ADMINISTRADOR_MASTER'"
                                                @click="$emit('remover-membro', m.login)" 
                                                class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Excluir Membro">
                                            <i class="fa-regular fa-trash-can"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
