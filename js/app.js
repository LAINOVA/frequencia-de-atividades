const { createApp, ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

const app = createApp({
    components: {
        'toast-container': window.ToastContainerComponent,
        'modal-confirmacao': window.ModalConfirmacaoComponent,
        'modal-alterar-senha': window.ModalAlterarSenhaComponent,
        'login-view': window.LoginViewComponent,
        'app-sidebar': window.SidebarComponent,
        'app-header': window.HeaderComponent,
        'dashboard-view': window.DashboardViewComponent,
        'graficos-view': window.GraficosViewComponent,
        'projetos-categorias-view': window.ProjetosCategoriasViewComponent,
        'registrar-view': window.RegistrarViewComponent,
        'membros-view': window.MembrosViewComponent,
        'historico-view': window.HistoricoViewComponent,
        'relatorios-view': window.RelatoriosViewComponent,
        'modal-membro': window.ModalMembroComponent,
        'modal-editar-registro': window.ModalEditarRegistroComponent
    },
    setup() {
        // Estado de Autenticação
        const usuarioAutenticado = ref(false);
        const tokenSessao = ref(sessionStorage.getItem('lainova_session_token') || '');
        const usuarioAtual = ref({ login: '', nome: '', cargo: '', id: '', primeiroAcesso: false });
        const carregandoLogin = ref(false);
        const mensagemErroLogin = ref('');
        const mensagemSucessoLogin = ref('');

        // Modal de Alteração de Senha & Primeiro Acesso Obrigatório
        const modalSenhaAberto = ref(false);
        const primeiroAcessoObrigatorio = ref(false);
        const enviandoSenha = ref(false);
        const erroSenha = ref('');

        // Sistema de Notificações Toast
        const toasts = ref([]);
        let toastSeq = 0;
        const mostrarToast = (tipo, mensagem) => {
            const id = ++toastSeq;
            toasts.value.push({ id, tipo, mensagem });
            setTimeout(() => fecharToast(id), 4000);
        };
        const fecharToast = (id) => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        };

        // Modal de Confirmação Customizado (Substitui confirm())
        const modalConfirmacao = ref({
            aberto: false,
            titulo: '',
            mensagem: '',
            tipo: 'destrutivo',
            textoConfirmar: 'Confirmar',
            textoCancelar: 'Cancelar',
            carregando: false,
            aoConfirmar: null
        });

        const abrirConfirmacao = ({ titulo, mensagem, tipo = 'destrutivo', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', aoConfirmar }) => {
            modalConfirmacao.value = {
                aberto: true,
                titulo,
                mensagem,
                tipo,
                textoConfirmar,
                textoCancelar,
                carregando: false,
                aoConfirmar
            };
        };

        const executarConfirmacao = async () => {
            if (typeof modalConfirmacao.value.aoConfirmar === 'function') {
                modalConfirmacao.value.carregando = true;
                try {
                    await modalConfirmacao.value.aoConfirmar();
                    modalConfirmacao.value.aberto = false;
                } catch (e) {
                    mostrarToast('erro', e.message || 'Erro ao processar ação.');
                } finally {
                    modalConfirmacao.value.carregando = false;
                }
            } else {
                modalConfirmacao.value.aberto = false;
            }
        };

        // Navegação
        const abas = ref(window.ABAS_NAVEGACAO);
        const abaAtual = ref('dashboard');
        const menuMobileAberto = ref(false);
        const carregandoDados = ref(false);
        const enviandoRegistro = ref(false);
        const enviandoMembro = ref(false);
        const carregandoProjetosCategorias = ref(false);
        const modalMembroAberto = ref(false);

        // Modal de Edição de Registro
        const modalEdicaoAberto = ref(false);
        const registroParaEdicao = ref({});
        const enviandoEdicao = ref(false);

        // Relógio e Data
        const dataAtualObj = ref(new Date());
        let intervalRelogio;
        const horaFormatada = computed(() => dataAtualObj.value.toLocaleTimeString('pt-PT'));
        const dataFormatada = computed(() => new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dataAtualObj.value));

        // Dados da Aplicação
        const membros = ref([]);
        const registros = ref([]);
        const projetos = ref(['Atividade']);
        const categorias = ref(['Ensino', 'Pesquisa', 'Extensão', 'Reuniões', 'Evento', 'Divulgação', 'Administrativo', 'Projeto', 'Outros']);

        // Paginação do Histórico (Backend)
        const paginacaoHistorico = ref({
            paginaAtual: 1,
            limite: 100,
            totalRegistros: 0,
            totalPaginas: 1,
            temProximaPagina: false,
            temPaginaAnterior: false,
            de: 0,
            ate: 0
        });
        const filtroMembroHistorico = ref('');

        const podeEditarExcluir = computed(() => {
            return usuarioAtual.value.cargo === 'ADMINISTRADOR' || usuarioAtual.value.cargo === 'GESTOR';
        });

        // Comunicação Segura com o Backend
        const chamarBackend = async (payload) => {
            const res = await fetch(window.API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.sessaoInvalida) {
                fazerLogout();
                throw new Error("Sessão expirada ou acesso revogado. Por favor, inicie sessão novamente.");
            }
            if (data.sucesso === false && data.erro) {
                throw new Error(data.erro);
            }
            return data;
        };

        const fazerLogin = async ({ login, senha }) => {
            carregandoLogin.value = true;
            mensagemErroLogin.value = '';
            mensagemSucessoLogin.value = '';
            try {
                const res = await chamarBackend({ acao: 'login', login, senha });
                tokenSessao.value = res.token;
                sessionStorage.setItem('lainova_session_token', res.token);
                usuarioAtual.value = { 
                    login: res.login, 
                    nome: res.nome, 
                    cargo: res.cargo, 
                    id: res.id || '',
                    primeiroAcesso: !!res.primeiroAcesso
                };
                usuarioAutenticado.value = true;

                // Se for primeiro acesso, bloqueia e exige nova senha
                if (res.primeiroAcesso) {
                    primeiroAcessoObrigatorio.value = true;
                    modalSenhaAberto.value = true;
                    mostrarToast('aviso', 'Primeiro acesso detectado. Defina a sua palavra-passe definitiva.');
                } else {
                    abaAtual.value = 'dashboard';
                    await fetchDados(1);
                    mostrarToast('sucesso', `Bem-vindo(a), ${res.nome}!`);
                }
            } catch (err) {
                mensagemErroLogin.value = err.message || 'Login ou senha inválidos.';
            } finally {
                carregandoLogin.value = false;
            }
        };

        const fazerLogout = async () => {
            if (tokenSessao.value) {
                try {
                    await fetch(window.API_URL, {
                        method: "POST",
                        headers: { "Content-Type": "text/plain;charset=utf-8" },
                        body: JSON.stringify({ acao: 'logout', token: tokenSessao.value })
                    });
                } catch (e) { /* ignore */ }
            }
            tokenSessao.value = '';
            sessionStorage.removeItem('lainova_session_token');
            usuarioAutenticado.value = false;
            usuarioAtual.value = { login: '', nome: '', cargo: '', id: '', primeiroAcesso: false };
            modalSenhaAberto.value = false;
            primeiroAcessoObrigatorio.value = false;
            membros.value = [];
            registros.value = [];
        };

        const verificarSessaoInicial = async () => {
            if (!tokenSessao.value) return;
            carregandoDados.value = true;
            try {
                const res = await chamarBackend({ acao: 'validarSessao', token: tokenSessao.value });
                usuarioAtual.value = { 
                    login: res.login, 
                    nome: res.nome, 
                    cargo: res.cargo, 
                    id: res.id || '',
                    primeiroAcesso: !!res.primeiroAcesso
                };
                usuarioAutenticado.value = true;
                if (res.primeiroAcesso) {
                    primeiroAcessoObrigatorio.value = true;
                    modalSenhaAberto.value = true;
                } else {
                    await fetchDados(1);
                }
            } catch (err) {
                fazerLogout();
            } finally {
                carregandoDados.value = false;
            }
        };

        // Alterar Senha
        const salvarNovaSenha = async ({ senhaAtual, novaSenha, confirmarSenha, primeiroAcesso }) => {
            enviandoSenha.value = true;
            erroSenha.value = '';
            try {
                await chamarBackend({
                    acao: 'alterarSenha',
                    token: tokenSessao.value,
                    senhaAtual,
                    novaSenha,
                    confirmarSenha,
                    primeiroAcesso
                });
                modalSenhaAberto.value = false;
                primeiroAcessoObrigatorio.value = false;
                usuarioAtual.value.primeiroAcesso = false;
                mostrarToast('sucesso', 'Palavra-passe atualizada com sucesso!');
                if (primeiroAcesso) {
                    abaAtual.value = 'dashboard';
                    await fetchDados(1);
                }
            } catch (e) {
                erroSenha.value = e.message || 'Erro ao alterar palavra-passe.';
            } finally {
                enviandoSenha.value = false;
            }
        };

        // Obter Dados com Paginação Backend
        const fetchDados = async (pagina = 1) => {
            if (!usuarioAutenticado.value || !tokenSessao.value || primeiroAcessoObrigatorio.value) return;
            carregandoDados.value = true;
            try {
                const data = await chamarBackend({ 
                    acao: 'obterDados', 
                    token: tokenSessao.value,
                    pagina: pagina,
                    limite: 100,
                    filtroMembro: filtroMembroHistorico.value
                });
                
                membros.value = data.membros || [];
                registros.value = data.registros || [];
                if (data.projetos && data.projetos.length > 0) projetos.value = data.projetos;
                if (data.categorias && data.categorias.length > 0) categorias.value = data.categorias;
                
                if (data.paginacao) {
                    paginacaoHistorico.value = data.paginacao;
                }

                if (abaAtual.value === 'graficos') nextTick(() => renderizarGraficos());
                if (abaAtual.value === 'relatorios') nextTick(() => renderizarGraficosRelatorio());
            } catch (e) {
                mostrarToast('erro', 'Erro ao obter dados: ' + e.message);
            } finally {
                carregandoDados.value = false;
            }
        };

        const mudarPaginaHistorico = (novaPagina) => {
            fetchDados(novaPagina);
        };

        const mudarFiltroMembroHistorico = (novoMembro) => {
            filtroMembroHistorico.value = novoMembro;
            fetchDados(1);
        };

        const totalHorasGeral = computed(() => {
            return registros.value.reduce((acc, curr) => acc + (parseFloat(curr.Horas_Gastas) || 0), 0).toFixed(1);
        });

        const totalLancamentos = computed(() => paginacaoHistorico.value.totalRegistros || registros.value.length);

        const acumuladoMembros = computed(() => {
            return membros.value.map(m => {
                const regsMembro = registros.value.filter(r => (r.Nome_Membro === m.nome || r.Login_Membro === m.login));
                const totalHoras = regsMembro.reduce((acc, curr) => acc + (parseFloat(curr.Horas_Gastas) || 0), 0).toFixed(1);
                return { nome: m.nome, login: m.login, cargo: m.cargo, totalHoras, totalAtividades: regsMembro.length };
            }).sort((a,b) => parseFloat(b.totalHoras) - parseFloat(a.totalHoras));
        });

        const mudarAba = (idAba) => {
            if (primeiroAcessoObrigatorio.value) {
                mostrarToast('aviso', 'Defina uma nova palavra-passe para aceder ao sistema.');
                return;
            }
            abaAtual.value = idAba;
            menuMobileAberto.value = false;
            if (idAba === 'graficos') nextTick(() => renderizarGraficos());
            if (idAba === 'relatorios') nextTick(() => renderizarGraficosRelatorio());
        };

        const formatarDataSheet = (dataStr) => {
            if (!dataStr) return '';
            const str = String(dataStr).trim();
            if (str.includes('T')) {
                const [ano, mes, dia] = str.split('T')[0].split('-');
                return `${dia}/${mes}/${ano}`;
            }
            if (str.includes('-') && str.split('-')[0].length === 4) {
                const [ano, mes, dia] = str.split('-');
                return `${dia}/${mes}/${ano}`;
            }
            return str;
        };

        const parseDateToTime = (dStr) => {
            if(!dStr) return 0;
            let iso = String(dStr).trim();
            if(iso.includes('/')) {
                const parts = iso.split('/');
                iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            if(iso.includes('T')) iso = iso.split('T')[0];
            return new Date(iso + 'T00:00:00').getTime();
        };

        const abrirEdicaoRegistro = (reg) => {
            registroParaEdicao.value = { ...reg };
            modalEdicaoAberto.value = true;
        };

        const salvarEdicaoRegistro = async (dadosAtualizados) => {
            enviandoEdicao.value = true;
            try {
                await chamarBackend({
                    acao: 'editarRegistro',
                    token: tokenSessao.value,
                    ...dadosAtualizados
                });
                modalEdicaoAberto.value = false;
                await fetchDados(paginacaoHistorico.value.paginaAtual);
                mostrarToast('sucesso', 'Lançamento atualizado com sucesso!');
            } catch (e) {
                mostrarToast('erro', 'Erro ao editar lançamento: ' + e.message);
            } finally {
                enviandoEdicao.value = false;
            }
        };

        const solicitarExclusaoRegistro = (reg) => {
            abrirConfirmacao({
                titulo: 'Excluir Lançamento de Horas',
                mensagem: `Deseja realmente eliminar permanentemente o lançamento de ${reg.Horas_Gastas}h em "${reg.Projeto || 'Atividade'}" (${reg.Nome_Membro})?`,
                tipo: 'destrutivo',
                textoConfirmar: 'Sim, Excluir',
                aoConfirmar: async () => {
                    await chamarBackend({
                        acao: 'excluirRegistro',
                        token: tokenSessao.value,
                        idRegistro: reg.ID
                    });
                    await fetchDados(paginacaoHistorico.value.paginaAtual);
                    mostrarToast('sucesso', 'Lançamento removido com sucesso!');
                }
            });
        };

        const adicionarProjeto = async (nomeProjeto) => {
            carregandoProjetosCategorias.value = true;
            try {
                await chamarBackend({ acao: 'adicionarProjeto', token: tokenSessao.value, nome: nomeProjeto });
                await fetchDados(1);
                mostrarToast('sucesso', `Projeto "${nomeProjeto}" adicionado com sucesso!`);
            } catch (e) {
                mostrarToast('erro', "Erro ao adicionar projeto: " + e.message);
            } finally {
                carregandoProjetosCategorias.value = false;
            }
        };

        const excluirProjeto = (nomeProjeto) => {
            abrirConfirmacao({
                titulo: 'Remover Projeto',
                mensagem: `Tem a certeza que deseja remover o projeto "${nomeProjeto}"?`,
                tipo: 'destrutivo',
                textoConfirmar: 'Remover',
                aoConfirmar: async () => {
                    await chamarBackend({ acao: 'excluirProjeto', token: tokenSessao.value, nome: nomeProjeto });
                    await fetchDados(1);
                    mostrarToast('sucesso', `Projeto "${nomeProjeto}" removido.`);
                }
            });
        };

        const adicionarCategoria = async (nomeCategoria) => {
            carregandoProjetosCategorias.value = true;
            try {
                await chamarBackend({ acao: 'adicionarCategoria', token: tokenSessao.value, nome: nomeCategoria });
                await fetchDados(1);
                mostrarToast('sucesso', `Categoria "${nomeCategoria}" adicionada com sucesso!`);
            } catch (e) {
                mostrarToast('erro', "Erro ao adicionar categoria: " + e.message);
            } finally {
                carregandoProjetosCategorias.value = false;
            }
        };

        const excluirCategoria = (nomeCategoria) => {
            abrirConfirmacao({
                titulo: 'Remover Categoria',
                mensagem: `Tem a certeza que deseja remover a categoria "${nomeCategoria}"?`,
                tipo: 'destrutivo',
                textoConfirmar: 'Remover',
                aoConfirmar: async () => {
                    await chamarBackend({ acao: 'excluirCategoria', token: tokenSessao.value, nome: nomeCategoria });
                    await fetchDados(1);
                    mostrarToast('sucesso', `Categoria "${nomeCategoria}" removida.`);
                }
            });
        };

        // Relatórios
        const filtroRelatorio = ref({ inicio: '', fim: '', membro: '' });
        let chartRelRankingInstance = null;
        let chartRelCategoriaInstance = null;

        const aplicarFiltroRapido = (tipo) => {
            const hoje = new Date();
            filtroRelatorio.value.membro = '';
            
            if (tipo === 'mes') {
                const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                filtroRelatorio.value.inicio = primeiroDia.toISOString().split('T')[0];
                filtroRelatorio.value.fim = ultimoDia.toISOString().split('T')[0];
            } else if (tipo === 'semestre') {
                const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
                filtroRelatorio.value.inicio = seisMesesAtras.toISOString().split('T')[0];
                filtroRelatorio.value.fim = hoje.toISOString().split('T')[0];
            } else if (tipo === 'ano') {
                const primeiroDia = new Date(hoje.getFullYear(), 0, 1);
                filtroRelatorio.value.inicio = primeiroDia.toISOString().split('T')[0];
                filtroRelatorio.value.fim = hoje.toISOString().split('T')[0];
            } else if (tipo === 'tudo') {
                filtroRelatorio.value.inicio = '';
                filtroRelatorio.value.fim = '';
            }
        };

        const registrosRelatorio = computed(() => {
            const inicioTime = filtroRelatorio.value.inicio ? parseDateToTime(filtroRelatorio.value.inicio) : 0;
            const fimTime = filtroRelatorio.value.fim ? parseDateToTime(filtroRelatorio.value.fim) : Infinity;
            
            return registros.value.filter(r => {
                const rTime = parseDateToTime(r.Data);
                const noPeriodo = (!inicioTime || rTime >= inicioTime) && (!fimTime || rTime <= fimTime);
                const matchMembro = filtroRelatorio.value.membro ? r.Nome_Membro === filtroRelatorio.value.membro : true;
                return noPeriodo && matchMembro;
            });
        });

        const registrosRelatorioOrdenados = computed(() => {
            return [...registrosRelatorio.value].sort((a,b) => parseDateToTime(b.Data) - parseDateToTime(a.Data));
        });

        const periodoRelatorioTexto = computed(() => {
            if(!filtroRelatorio.value.inicio && !filtroRelatorio.value.fim) return "Todo o Histórico";
            const i = filtroRelatorio.value.inicio ? formatarDataSheet(filtroRelatorio.value.inicio) : 'Início';
            const f = filtroRelatorio.value.fim ? formatarDataSheet(filtroRelatorio.value.fim) : 'Hoje';
            return `${i} a ${f}`;
        });

        const kpisRelatorio = computed(() => {
            const regs = registrosRelatorio.value;
            let totalHoras = 0;
            const membrosCount = {};
            
            regs.forEach(r => {
                const h = parseFloat(r.Horas_Gastas) || 0;
                totalHoras += h;
                membrosCount[r.Nome_Membro] = (membrosCount[r.Nome_Membro] || 0) + h;
            });

            let membroDestaque = '';
            let maxHoras = 0;
            for (const [nome, h] of Object.entries(membrosCount)) {
                if (h > maxHoras) { maxHoras = h; membroDestaque = nome; }
            }

            const mediaPorAtiv = regs.length > 0 ? (totalHoras / regs.length).toFixed(1) : 0;

            return {
                totalHoras: totalHoras.toFixed(1),
                totalAtividades: regs.length,
                mediaHorasPorAtividade: mediaPorAtiv,
                membroDestaque: membroDestaque
            };
        });

        const rankingRelatorio = computed(() => {
            const mapa = {};
            registrosRelatorio.value.forEach(r => {
                if(!mapa[r.Nome_Membro]) mapa[r.Nome_Membro] = { nome: r.Nome_Membro, horas: 0, atividades: 0 };
                mapa[r.Nome_Membro].horas += (parseFloat(r.Horas_Gastas) || 0);
                mapa[r.Nome_Membro].atividades += 1;
            });
            return Object.values(mapa)
                .map(m => ({ ...m, horas: parseFloat(m.horas.toFixed(1)) }))
                .sort((a, b) => b.horas - a.horas);
        });

        const renderizarGraficosRelatorio = () => {
            const ctxRank = document.getElementById('chartRelRanking');
            const ctxCat = document.getElementById('chartRelCategoria');
            if (!ctxRank || !ctxCat) return;

            Chart.defaults.font.family = "'Inter', sans-serif";

            const rankData = rankingRelatorio.value.slice(0, 10); 
            if (chartRelRankingInstance) chartRelRankingInstance.destroy();
            chartRelRankingInstance = new Chart(ctxRank, {
                type: 'bar',
                data: {
                    labels: rankData.map(d => (d.nome || '').split(' ')[0]),
                    datasets: [{
                        label: 'Horas Registadas',
                        data: rankData.map(d => d.horas),
                        backgroundColor: '#10b981',
                        borderRadius: 6,
                        barPercentage: 0.6
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] } }, x: { grid: { display: false } } }
                }
            });

            const catMap = {};
            registrosRelatorio.value.forEach(r => {
                const c = r.Categoria || 'Outros';
                catMap[c] = (catMap[c] || 0) + (parseFloat(r.Horas_Gastas) || 0);
            });
            
            if (chartRelCategoriaInstance) chartRelCategoriaInstance.destroy();
            chartRelCategoriaInstance = new Chart(ctxCat, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(catMap),
                    datasets: [{
                        data: Object.values(catMap),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#f43f5e', '#0ea5e9'],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: { 
                    responsive: true, maintainAspectRatio: false, 
                    plugins: { 
                        legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } 
                    },
                    cutout: '65%'
                }
            });
        };

        watch(registrosRelatorio, () => {
            if(abaAtual.value === 'relatorios') {
                nextTick(() => renderizarGraficosRelatorio());
            }
        }, { deep: true });

        const exportarCSV = () => {
            const sanitizar = (txt) => {
                if (!txt) return '';
                let s = String(txt).replace(/"/g, '""');
                if (s.length > 0 && ['=', '+', '-', '@', '\t', '\r'].includes(s.charAt(0))) {
                    s = "'" + s;
                }
                return s;
            };

            let csv = "Data,Membro,Projeto,Categoria,Horas,Descricao\n";
            registrosRelatorioOrdenados.value.forEach(r => {
                csv += `"${sanitizar(formatarDataSheet(r.Data))}","${sanitizar(r.Nome_Membro)}","${sanitizar(r.Projeto || 'Atividade')}","${sanitizar(r.Categoria)}",${parseFloat(r.Horas_Gastas || 0).toFixed(1)},"${sanitizar(r.Descricao)}"\n`;
            });
            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Relatorio_LAINOVA_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            mostrarToast('sucesso', 'Ficheiro CSV descarregado com sucesso!');
        };

        const imprimirRelatorio = () => {
            window.print();
        };

        let chartTemporalInstance = null;
        let chartCategoriaInstance = null;
        const periodoGrafico = ref('mes');

        const mudarPeriodoGrafico = (periodo) => {
            periodoGrafico.value = periodo;
            renderizarGraficos();
        };

        const renderizarGraficos = () => {
            const ctxTemp = document.getElementById('graficoTemporal');
            const ctxCat = document.getElementById('graficoCategoria');
            if (!ctxTemp || !ctxCat) return;

            Chart.defaults.font.family = "'Inter', sans-serif";
            const dadosTemporais = {};
            registros.value.forEach(r => {
                let d = new Date(r.Data);
                if (isNaN(d.getTime()) && r.Data && String(r.Data).includes('/')) {
                    const parts = String(r.Data).split('/');
                    d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
                if (isNaN(d.getTime())) return;

                let chave = "";
                if (periodoGrafico.value === 'mes') {
                    chave = d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
                } else if (periodoGrafico.value === 'semestre') {
                    const sem = d.getMonth() < 6 ? '1º Sem' : '2º Sem';
                    chave = `${sem}/${d.getFullYear()}`;
                } else if (periodoGrafico.value === 'semana') {
                    const inicioSemana = new Date(d);
                    inicioSemana.setDate(d.getDate() - d.getDay());
                    chave = `Sem ${inicioSemana.getDate()}/${inicioSemana.getMonth()+1}`;
                }

                dadosTemporais[chave] = (dadosTemporais[chave] || 0) + (parseFloat(r.Horas_Gastas) || 0);
            });

            if (chartTemporalInstance) chartTemporalInstance.destroy();
            chartTemporalInstance = new Chart(ctxTemp, {
                type: 'bar',
                data: {
                    labels: Object.keys(dadosTemporais),
                    datasets: [{
                        label: 'Horas Registadas',
                        data: Object.values(dadosTemporais),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
            });

            const dadosCategorias = {};
            registros.value.forEach(r => {
                const cat = r.Categoria || 'Outros';
                dadosCategorias[cat] = (dadosCategorias[cat] || 0) + (parseFloat(r.Horas_Gastas) || 0);
            });

            if (chartCategoriaInstance) chartCategoriaInstance.destroy();
            chartCategoriaInstance = new Chart(ctxCat, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(dadosCategorias),
                    datasets: [{
                        data: Object.values(dadosCategorias),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        };

        const salvarMembro = async (formData) => {
            enviandoMembro.value = true;
            try {
                await chamarBackend({
                    acao: "adicionarUsuario",
                    token: tokenSessao.value,
                    nome: formData.nome,
                    login: formData.login,
                    senha: formData.senha,
                    cargo: formData.cargo,
                    ativo: formData.ativo
                });
                modalMembroAberto.value = false;
                await fetchDados(1);
                mostrarToast('sucesso', `Membro @${formData.login} cadastrado com sucesso!`);
            } catch (err) {
                mostrarToast('erro', "Erro ao cadastrar membro: " + err.message);
            } finally {
                enviandoMembro.value = false;
            }
        };

        const alternarStatusMembro = async (loginMembro, novoStatusAtivo) => {
            carregandoDados.value = true;
            try {
                await chamarBackend({
                    acao: "alternarStatusUsuario",
                    token: tokenSessao.value,
                    loginUsuario: loginMembro,
                    ativo: novoStatusAtivo ? 'SIM' : 'NAO'
                });
                await fetchDados(1);
                mostrarToast('sucesso', `Status do utilizador @${loginMembro} atualizado.`);
            } catch (err) {
                mostrarToast('erro', "Erro ao alterar status: " + err.message);
                carregandoDados.value = false;
            }
        };

        const removerMembro = (loginMembro) => {
            abrirConfirmacao({
                titulo: 'Eliminar Membro',
                mensagem: `Tem a certeza que deseja eliminar permanentemente o utilizador @${loginMembro} da liga?`,
                tipo: 'destrutivo',
                textoConfirmar: 'Sim, Eliminar',
                aoConfirmar: async () => {
                    await chamarBackend({
                        acao: "excluirUsuario",
                        token: tokenSessao.value,
                        loginUsuario: loginMembro
                    });
                    await fetchDados(1);
                    mostrarToast('sucesso', `Utilizador @${loginMembro} excluído.`);
                }
            });
        };

        const modoRegistro = ref('manual');
        const form = ref({
            data: new Date().toISOString().split('T')[0],
            projeto: 'Atividade',
            categoria: '',
            inicio: '',
            termino: '',
            descricao: ''
        });

        const duracaoCalculadaHoras = computed(() => {
            if (!form.value.inicio || !form.value.termino) return 0;
            const [h1, m1] = form.value.inicio.split(':').map(Number);
            const [h2, m2] = form.value.termino.split(':').map(Number);
            const minutos = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
            return parseFloat((minutos / 60).toFixed(1));
        });

        const salvarRegistro = async () => {
            if (duracaoCalculadaHoras.value <= 0) { 
                mostrarToast('aviso', "Horário inválido. Verifique o início e fim da atividade."); 
                return; 
            }
            if (!form.value.categoria) { 
                mostrarToast('aviso', "Selecione uma categoria de atividade."); 
                return; 
            }
            enviandoRegistro.value = true;
            const dataFormatadaStr = form.value.data.split('-').reverse().join('/');

            try {
                await chamarBackend({
                    acao: "inserir",
                    token: tokenSessao.value,
                    data: dataFormatadaStr,
                    projeto: form.value.projeto || 'Atividade',
                    categoria: form.value.categoria,
                    horas: duracaoCalculadaHoras.value,
                    descricao: form.value.descricao + ` (${form.value.inicio} - ${form.value.termino})`
                });
                form.value = { 
                    data: new Date().toISOString().split('T')[0], 
                    projeto: projetos.value[0] || 'Atividade',
                    categoria: '', 
                    inicio: '', 
                    termino: '', 
                    descricao: '' 
                };
                mostrarToast('sucesso', 'Atividade registada com sucesso!');
                mudarAba('historico');
                await fetchDados(1);
            } catch (err) {
                mostrarToast('erro', "Erro ao registar: " + err.message);
            } finally {
                enviandoRegistro.value = false;
            }
        };

        const timerAtivo = ref(false);
        const segundosCount = ref(0);
        let intervalCronometro;
        const cronometroDisplay = computed(() => {
            const h = Math.floor(segundosCount.value / 3600).toString().padStart(2, '0');
            const m = Math.floor((segundosCount.value % 3600) / 60).toString().padStart(2, '0');
            const s = (segundosCount.value % 60).toString().padStart(2, '0');
            return `${h}:${m}:${s}`;
        });

        const iniciarCronometro = () => {
            form.value.inicio = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute:'2-digit' });
            timerAtivo.value = true;
            intervalCronometro = setInterval(() => segundosCount.value++, 1000);
            mostrarToast('info', 'Cronómetro iniciado.');
        };

        const pararCronometro = () => {
            timerAtivo.value = false;
            clearInterval(intervalCronometro);
            form.value.termino = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute:'2-digit' });
            modoRegistro.value = 'manual';
            segundosCount.value = 0;
            mostrarToast('sucesso', 'Tempo preenchido no formulário!');
        };

        onMounted(() => {
            intervalRelogio = setInterval(() => dataAtualObj.value = new Date(), 1000);
            verificarSessaoInicial();
            aplicarFiltroRapido('mes');
        });

        onUnmounted(() => {
            clearInterval(intervalRelogio);
            if (intervalCronometro) clearInterval(intervalCronometro);
        });

        return {
            usuarioAutenticado, usuarioAtual, carregandoLogin, mensagemErroLogin, mensagemSucessoLogin,
            fazerLogin, fazerLogout,
            toasts, mostrarToast, fecharToast,
            modalConfirmacao, abrirConfirmacao, executarConfirmacao,
            modalSenhaAberto, primeiroAcessoObrigatorio, enviandoSenha, erroSenha, salvarNovaSenha,
            abas, abaAtual, tituloAbaAtual: computed(() => abas.value.find(a => a.id === abaAtual.value)?.label),
            horaFormatada, dataFormatada, menuMobileAberto, mudarAba,
            membros, registros, projetos, categorias, carregandoDados, enviandoRegistro, enviandoMembro, carregandoProjetosCategorias,
            totalHorasGeral, totalLancamentos, acumuladoMembros, fetchDados,
            paginacaoHistorico, filtroMembroHistorico, mudarPaginaHistorico, mudarFiltroMembroHistorico,
            adicionarProjeto, excluirProjeto, adicionarCategoria, excluirCategoria,
            modalMembroAberto, salvarMembro, alternarStatusMembro, removerMembro,
            modalEdicaoAberto, registroParaEdicao, enviandoEdicao, abrirEdicaoRegistro, salvarEdicaoRegistro, solicitarExclusaoRegistro, podeEditarExcluir,
            periodoGrafico, mudarPeriodoGrafico,
            modoRegistro, form, duracaoCalculadaHoras, salvarRegistro,
            timerAtivo, cronometroDisplay, iniciarCronometro, pararCronometro,
            formatarDataSheet,
            filtroRelatorio, periodoRelatorioTexto, registrosRelatorio, registrosRelatorioOrdenados,
            kpisRelatorio, rankingRelatorio, aplicarFiltroRapido, exportarCSV, imprimirRelatorio
        };
    }
});

app.mount('#app');
