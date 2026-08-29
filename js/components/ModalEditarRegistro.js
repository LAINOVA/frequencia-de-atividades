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
                idRegistro: '',
                data: '',
                projeto: '',
                categoria: '',
                horas: 0,
                descricao: ''
            }
        };
    },
    watch: {
        registro: {
            immediate: true,
            handler(val) {
                if (val && val.ID) {
                    let d = val.Data || '';
                    if (d.includes('/')) {
                        const p = d.split('/');
                        d = `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
                    }
                    this.form = {
                        idRegistro: val.ID,
                        data: d,
                        projeto: val.Projeto || 'Atividade',
                        categoria: val.Categoria || '',
                        horas: parseFloat(val.Horas_Gastas) || 0,
                        descricao: val.Descricao || ''
                    };
                }
            }
        }
    },
    methods: {
        submeter() {
            let dataStr = this.form.data;
            if (dataStr && dataStr.includes('-')) {
                dataStr = dataStr.split('-').reverse().join('/');
            }
            this.$emit('salvar-edicao', {
                idRegistro: this.form.idRegistro,
                data: dataStr,
                projeto: this.form.projeto,
                categoria: this.form.categoria,
                horas: parseFloat(this.form.horas),
                descricao: this.form.descricao
            });
        }
    },
    template: `
        <div v-if="modalAberto" class="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
            <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all border border-slate-100">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="text-xl font-bold text-slate-800">Editar Lançamento de Horas</h3>
                        <p class="text-xs text-slate-400 font-mono mt-0.5">ID: {{ form.idRegistro }}</p>
                    </div>
                    <button @click="$emit('fechar')" class="text-slate-400 hover:text-slate-700 text-xl">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form @submit.prevent="submeter" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Data</label>
                            <input v-model="form.data" type="date" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Carga Horária (horas)</label>
                            <input v-model="form.horas" type="number" step="0.1" min="0.1" max="24" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Projeto</label>
                            <select v-model="form.projeto" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition">
                                <option v-for="p in projetos" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                            <select v-model="form.categoria" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition">
                                <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
                            </select>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Descrição</label>
                            <textarea v-model="form.descricao" rows="3" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition resize-none"></textarea>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button type="button" @click="$emit('fechar')" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm transition">Cancelar</button>
                        <button type="submit" :disabled="enviando" class="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition text-sm flex items-center gap-2 disabled:opacity-70">
                            <i v-if="enviando" class="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Salvar Alterações</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
