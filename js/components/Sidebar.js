window.SidebarComponent = {
    props: {
        abas: { type: Array, required: true },
        abaAtual: { type: String, required: true },
        menuMobileAberto: { type: Boolean, default: false },
        cargoUsuario: { type: String, default: '' }
    },
    emits: ['mudar-aba', 'fechar-menu', 'fazer-logout'],
    computed: {
        abasPermitidas() {
            return this.abas.filter(aba => !aba.cargos || aba.cargos.includes(this.cargoUsuario));
        }
    },
    template: `
        <div class="h-full shrink-0 flex">
            <div v-if="menuMobileAberto" @click="$emit('fechar-menu')" 
                 class="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-opacity"></div>

            <aside :class="menuMobileAberto ? 'translate-x-0' : '-translate-x-full'" 
                   class="fixed inset-y-0 left-0 z-40 w-64 h-full bg-slate-900 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none flex-shrink-0">
                
                <div class="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <div>
                        <h1 class="text-2xl font-bold tracking-wider text-emerald-400">LAINOVA</h1>
                        <p class="text-xs text-slate-400 mt-1">Gestão de Atividades</p>
                    </div>
                    <button @click="$emit('fechar-menu')" class="md:hidden text-slate-400 hover:text-white text-xl">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
                    <button v-for="aba in abasPermitidas" :key="aba.id" @click="$emit('mudar-aba', aba.id)"
                        class="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-left"
                        :class="abaAtual === aba.id ? 'bg-emerald-600 text-white font-medium shadow-md' : 'text-slate-300 hover:bg-slate-800'">
                        <div class="flex items-center gap-3">
                            <i :class="aba.icon" class="w-5 text-center"></i>
                            <span>{{ aba.label }}</span>
                        </div>
                    </button>
                </nav>

                <div class="p-4 border-t border-slate-800 shrink-0">
                    <button @click="$emit('fazer-logout')" 
                            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition text-sm font-semibold">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        <span>Terminar Sessão</span>
                    </button>
                </div>
            </aside>
        </div>
    `
};
