window.ModalEditarRegistroComponent = {
    props: {
        modalAberto: { type: Boolean, default: false },
        registro: { type: Object, default: () => ({}) },
        projetos: { type: Array, default: () => [] },
        categorias: { type: Array, default: () => [] },
        enviando: { type: Boolean, default: false }
    },
    emits: ['fechar', 'salvar-edicao'],
    data() {
        return {
            form: {
                id: '',
                data: '',
                projeto: '',
                categoria: '',
                horas: 0,
                descricao: ''
            }
        };
    },
    watch: {
        modalAberto(val) {
            if (val && this.registro) {
                let d = this.registro.Data;
                if (d && String(d).includes('/')) {
                    const parts = String(d).split('/');
                    d = `${parts[2]}-${parts[1]}-${parts[0]}`;
                } else if (d && String(d).includes('T')) {
                    d = String(d).split('T')[0];
                }
                this.form = {
                    id: this.registro.ID,
                    data: d || new Date().toISOString().split('T')[0],
                    projeto: this.registro.Projeto || 'Atividade',
                    categoria: this.registro.Categoria || (this.categorias[0] || 'Geral'),
                    horas: parseFloat(this.registro.Horas_Gastas || 0),
                    descricao: this.registro.Descricao || ''
                };
            }
        }
    },
    methods: {
        submeter() {
            if (this.form.horas <= 0) {
                alert('A quantidade de horas deve ser superior a 0.');
                return;
            }
            const dataFormatada = this.form.data.split('-').reverse().join('/');
            this.$emit('salvar-edicao', {
                idRegistro: this.form.id,
                data: dataFormatada,
                projeto: this.form.projeto,
                categoria: this.form.categoria,
                horas: this.form.horas,
                descricao: this.form.descricao
            });
        }
    },
    template: `
        <div v-if="modalAberto" class="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Editar Lançamento de Horas</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Lançamento de {{ registro.Nome_Membro }} (ID: {{ form.id }})</p>
                    </div>
                    <button @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700 text-xl"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Data *</label>
                            <input v-model="form.data" type="date" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Horas Registadas *</label>
                            <input v-model.number="form.horas" type="number" step="0.1" min="0.1" max="24" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white font-bold text-emerald-700" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Projeto *</label>
                            <select v-model="form.projeto" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white">
                                <option v-for="p in projetos" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Categoria *</label>
                            <select v-model="form.categoria" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white">
                                <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Descrição Detalhada *</label>
                        <textarea v-model="form.descricao" rows="3" required maxlength="500" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none transition bg-slate-50 focus:bg-white resize-none"></textarea>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar')" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition text-sm">Cancelar</button>
                        <button type="submit" :disabled="enviando" class="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition disabled:opacity-70 flex items-center gap-2 text-sm">
                            <span v-if="enviando"><i class="fa-solid fa-spinner fa-spin"></i> A guardar...</span>
                            <span v-else><i class="fa-solid fa-check"></i> Salvar Alterações</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
