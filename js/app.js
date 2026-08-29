const { createApp, ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

const app = createApp({
    components: {
        'toast-container': window.ToastContainerComponent,
        'modal-confirmacao': window.ModalConfirmacaoComponent,
        'modal-alterar-senha': window.ModalAlterarSenhaComponent,
        'modal-admin-reset-senha': window.ModalAdminResetSenhaComponent,
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
        'modal-editar-registro': window.ModalEditarRegistroComponent,
        'modal-editar-lote': window.ModalEditarLoteComponent
    },
    setup() {
        let supabase = null;
        if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
            supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        }

        const usuarioAutenticado = ref(false);
        const tokenSessao = ref(sessionStorage.getItem('lainova_session_token') || '');
        const usuarioAtual = ref({ login: '', nome: '', cargo: '' });
        const carregandoLogin = ref(false);
        const mensagemErroLogin = ref('');

        // Toasts
        const toasts = ref([]);
        let toastCounter = 0;
        const adicionarToast = (mensagem, tipo = 'info') => {
            const id = ++toastCounter;
            toasts.value.push({ id, mensagem, tipo });
            setTimeout(() => removerToast(id), 4000);
        };
        const removerToast = (id) => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        };

        // Modal de Confirmação
        const modalConfirmacao = ref({
            aberto: false,
            titulo: '',
            mensagem: '',
            textoBotao: 'Confirmar',
            perigoso: false,
            carregando: false,
            onConfirm: null
        });
        const abrirConfirmacao = ({ titulo, mensagem, textoBotao = 'Confirmar', perigoso = false, onConfirm }) => {
            modalConfirmacao.value = { aberto: true, titulo, mensagem, textoBotao, perigoso, carregando: false, onConfirm };
        };
        const fecharConfirmacao = () => {
            modalConfirmacao.value.aberto = false;
            modalConfirmacao.value.onConfirm = null;
        };
        const executarConfirmacao = async () => {
            if (modalConfirmacao.value.onConfirm) {
                modalConfirmacao.value.carregando = true;
                try {
                    await modalConfirmacao.value.onConfirm();
                    fecharConfirmacao();
                } catch (e) {
                    modalConfirmacao.value.carregando = false;
                }
            }
        };

        // Modais de Senha
        const modalSenhaAberto = ref(false);
        const primeiroAcessoObrigatorio = ref(false);
        const enviandoSenha = ref(false);

        const modalAdminResetAberto = ref(false);
        const membroResetSelecionado = ref({});
        const enviandoAdminReset = ref(false);

        // Navegação e Estado
        const abas = ref(window.ABAS_NAVEGACAO);
        const abaAtual = ref('dashboard');
        const menuMobileAberto = ref(false);
        const carregandoDados = ref(false);
        const enviandoRegistro = ref(false);
        const enviandoMembro = ref(false);

        // Relógio
        const dataAtualObj = ref(new Date());
        let intervalRelogio;
        const horaFormatada = computed(() => dataAtualObj.value.toLocaleTimeString('pt-PT'));
        const dataFormatada = computed(() => new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dataAtualObj.value));

        // Dados
        const membros = ref([]);
        const registros = ref([]);
        const todosRegistros = ref([]);
        const projetos = ref([]);
        const categorias = ref(window.CATEGORIAS_ATIVIDADES);
        const filtroMembroHist = ref('');
        const acumuladoMembros = ref([]);
        const totalHorasGeral = ref('0.0');
        const paginacao = ref({ paginaAtual: 1, limite: 100, totalRegistros: 0, totalPaginas: 1, temProximaPagina: false, temPaginaAnterior: false, de: 0, ate: 0 });

        // Comunicação Supabase RPC
        const chamarBackend = async (acao, params = {}) => {
            if (!supabase) {
                throw new Error("Cliente Supabase não configurado. Verifique js/config.js.");
            }

            const mapRpc = {
                'login': 'api_login',
                'logout': 'api_logout',
                'validarSessao': 'api_validar_sessao',
                'alterarSenha': 'api_alterar_senha',
                'adminAlterarSenha': 'api_admin_alterar_senha_usuario',
                'obterDados': 'api_obter_dados',
                'inserir': 'api_inserir_registro',
                'inserirLote': 'api_inserir_registros_lote',
                'editarRegistro': 'api_editar_registro',
                'editarRegistrosLote': 'api_editar_registros_lote',
                'excluirRegistro': 'api_excluir_registro',
                'excluirRegistrosLote': 'api_excluir_registros_lote',
                'adicionarProjeto': 'api_adicionar_projeto',
                'excluirProjeto': 'api_excluir_projeto',
                'adicionarCategoria': 'api_adicionar_categoria',
                'excluirCategoria': 'api_excluir_categoria',
                'adicionarUsuario': 'api_adicionar_usuario',
                'alternarStatusUsuario': 'api_alternar_status_usuario',
                'excluirUsuario': 'api_excluir_usuario'
            };

            const rpcName = mapRpc[acao];
            if (!rpcName) throw new Error("Ação não mapeada no Supabase: " + acao);

            const { data, error } = await supabase.rpc(rpcName, params);
            if (error) {
                throw new Error(error.message || "Erro na consulta ao Supabase.");
            }

            if (data && data.sessaoInvalida) {
                fazerLogout();
                throw new Error("Sessão expirada. Por favor, inicie sessão novamente.");
            }

            if (data && data.sucesso === false && data.erro) {
                throw new Error(data.erro);
            }

            return data;
        };

        const fazerLogin = async ({ login, senha }) => {
            carregandoLogin.value = true;
            mensagemErroLogin.value = '';
            try {
                const res = await chamarBackend('login', { p_login: login, p_senha: senha });
                tokenSessao.value = res.token;
                sessionStorage.setItem('lainova_session_token', res.token);
                usuarioAtual.value = { id: res.id, login: res.login, nome: res.nome, cargo: res.cargo };
                usuarioAutenticado.value = true;
                
                if (res.primeiroAcesso) {
                    primeiroAcessoObrigatorio.value = true;
                    modalSenhaAberto.value = true;
                } else {
                    abaAtual.value = 'dashboard';
                }

                adicionarToast(`Bem-vindo, ${res.nome}!`, 'sucesso');
                await fetchDados();
            } catch (err) {
                mensagemErroLogin.value = err.message || 'Login ou senha inválidos.';
                adicionarToast(mensagemErroLogin.value, 'erro');
            } finally {
                carregandoLogin.value = false;
            }
        };

        const fazerLogout = async () => {
            if (tokenSessao.value) {
                try {
                    await chamarBackend('logout', { p_token: tokenSessao.value });
                } catch (e) {}
            }
            tokenSessao.value = '';
            sessionStorage.removeItem('lainova_session_token');
            usuarioAutenticado.value = false;
            usuarioAtual.value = { login: '', nome: '', cargo: '' };
            membros.value = [];
            registros.value = [];
            projetos.value = [];
            adicionarToast('Sessão encerrada.', 'info');
        };

        const verificarSessaoInicial = async () => {
            if (!tokenSessao.value) return;
            carregandoDados.value = true;
            try {
                const res = await chamarBackend('validarSessao', { p_token: tokenSessao.value });
                usuarioAtual.value = { id: res.id, login: res.login, nome: res.nome, cargo: res.cargo };
                usuarioAutenticado.value = true;
                
                if (res.primeiroAcesso) {
                    primeiroAcessoObrigatorio.value = true;
                    modalSenhaAberto.value = true;
                }

                await fetchDados();
            } catch (err) {
                fazerLogout();
            } finally {
                carregandoDados.value = false;
            }
        };

        const salvarAlteracaoSenha = async ({ senhaAtual, novaSenha, primeiroAcesso }) => {
            enviandoSenha.value = true;
            try {
                const res = await chamarBackend('alterarSenha', {
                    p_token: tokenSessao.value,
                    p_senha_atual: senhaAtual,
                    p_nova_senha: novaSenha,
                    p_primeiro_acesso: !!primeiroAcesso
                });
                adicionarToast(res.mensagem || 'Palavra-passe alterada com sucesso!', 'sucesso');
                modalSenhaAberto.value = false;
                primeiroAcessoObrigatorio.value = false;
            } catch (err) {
                adicionarToast(err.message || 'Erro ao alterar palavra-passe.', 'erro');
            } finally {
                enviandoSenha.value = false;
            }
        };

        const abrirModalAdminReset = (membro) => {
            membroResetSelecionado.value = { ...membro };
            modalAdminResetAberto.value = true;
        };

        const executarAdminResetSenha = async ({ loginAlvo, novaSenha }) => {
            enviandoAdminReset.value = true;
            try {
                const res = await chamarBackend('adminAlterarSenha', {
                    p_token: tokenSessao.value,
                    p_login_alvo: loginAlvo,
                    p_nova_senha: novaSenha
                });
                adicionarToast(res.mensagem || `Senha de @${loginAlvo} redefinida com sucesso!`, 'sucesso');
                modalAdminResetAberto.value = false;
            } catch (err) {
                adicionarToast(err.message || 'Erro ao redefinir senha.', 'erro');
            } finally {
                enviandoAdminReset.value = false;
            }
        };

        const fetchDados = async (pagina = 1) => {
            if (!usuarioAutenticado.value || !tokenSessao.value) return;
            carregandoDados.value = true;
            try {
                const data = await chamarBackend('obterDados', {
                    p_token: tokenSessao.value,
                    p_pagina: pagina,
                    p_limite: 100,
                    p_filtro_membro: filtroMembroHist.value
                });

                membros.value = data.membros || [];
                registros.value = data.registros || [];
                todosRegistros.value = data.todosRegistros || data.registros || [];
                projetos.value = data.projetos || [];
                categorias.value = data.categorias || [];
                acumuladoMembros.value = data.acumuladoMembros || [];
                totalHorasGeral.value = data.totalHorasGeral || '0.0';
                paginacao.value = data.paginacao || { paginaAtual: 1, limite: 100, totalRegistros: 0, totalPaginas: 1, temProximaPagina: false, temPaginaAnterior: false, de: 0, ate: 0 };
            } catch (e) {
                console.error("Erro ao obter dados do Supabase:", e);
                adicionarToast(e.message || "Erro ao atualizar dados.", "erro");
            } finally {
                carregandoDados.value = false;
            }
        };

        const mudarFiltroMembroHist = (novoMembro) => {
            filtroMembroHist.value = novoMembro;
            fetchDados(1);
        };

        const irParaPagina = (pag) => {
            fetchDados(pag);
        };

        // Cálculos e Agregações
        
        const totalLancamentos = computed(() => paginacao.value.totalRegistros || registros.value.length);

        
        const mudarAba = (idAba) => {
            if (primeiroAcessoObrigatorio.value) {
                adicionarToast('Por favor, defina sua nova senha antes de continuar.', 'aviso');
                return;
            }
            abaAtual.value = idAba;
            menuMobileAberto.value = false;
        };

        // Formulário de Lançamento de Horas
        const form = ref({
            data: new Date().toISOString().split('T')[0],
            inicio: '',
            termino: '',
            projeto: 'Atividade',
            categoria: 'Ensino',
            descricao: ''
        });

        const duracaoCalculadaHoras = computed(() => {
            if (!form.value.inicio || !form.value.termino) return 0;
            const [h1, m1] = form.value.inicio.split(':').map(Number);
            const [h2, m2] = form.value.termino.split(':').map(Number);
            const minutos = Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
            return parseFloat((minutos / 60).toFixed(1));
        });

        const salvarRegistro = async (extra = {}) => {
            if (duracaoCalculadaHoras.value <= 0) {
                adicionarToast("Horário inválido. Verifique o início e o término.", "aviso");
                return;
            }
            enviandoRegistro.value = true;
            const dataFormatadaStr = form.value.data.split('-').reverse().join('/');

            try {
                await chamarBackend('inserir', {
                    p_token: tokenSessao.value,
                    p_login_alvo: extra.loginAlvo || null,
                    p_data: dataFormatadaStr,
                    p_projeto: form.value.projeto,
                    p_categoria: form.value.categoria,
                    p_horas: duracaoCalculadaHoras.value,
                    p_descricao: form.value.descricao + ` (${form.value.inicio} - ${form.value.termino})`
                });

                adicionarToast("Atividade registrada com sucesso!", "sucesso");
                form.value.descricao = '';
                mudarAba('historico');
                fetchDados(1);
            } catch (err) {
                adicionarToast("Erro ao gravar: " + err.message, "erro");
            } finally {
                enviandoRegistro.value = false;
            }
        };

        const salvarRegistroLote = async (payload) => {
            enviandoRegistro.value = true;
            const dataFormatadaStr = payload.data.split('-').reverse().join('/');

            try {
                const res = await chamarBackend('inserirLote', {
                    p_token: tokenSessao.value,
                    p_logins_membros: payload.loginsMembros,
                    p_data: dataFormatadaStr,
                    p_projeto: payload.projeto,
                    p_categoria: payload.categoria,
                    p_horas: payload.horas,
                    p_descricao: payload.descricao + ` (${payload.inicio} - ${payload.termino})`
                });

                adicionarToast(res.mensagem || `Lançamento em lote criado com sucesso para ${payload.loginsMembros.length} membros!`, "sucesso");
                mudarAba('historico');
                fetchDados(1);
            } catch (err) {
                adicionarToast("Erro ao gravar lote: " + err.message, "erro");
            } finally {
                enviandoRegistro.value = false;
            }
        };

        // Cronômetro
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
            form.value.inicio = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            timerAtivo.value = true;
            intervalCronometro = setInterval(() => segundosCount.value++, 1000);
            adicionarToast("Cronómetro iniciado.", "info");
        };

        const pararCronometro = () => {
            timerAtivo.value = false;
            clearInterval(intervalCronometro);
            form.value.termino = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
            segundosCount.value = 0;
            adicionarToast("Tempo capturado no formulário.", "sucesso");
        };

        // Modal de Edição Individual
        const modalEdicaoAberto = ref(false);
        const registroParaEdicao = ref({});
        const enviandoEdicao = ref(false);

        const abrirModalEdicao = (reg) => {
            registroParaEdicao.value = { ...reg };
            modalEdicaoAberto.value = true;
        };

        const salvarEdicaoRegistro = async (payload) => {
            enviandoEdicao.value = true;
            try {
                await chamarBackend('editarRegistro', {
                    p_token: tokenSessao.value,
                    p_id_registro: payload.idRegistro,
                    p_data: payload.data,
                    p_projeto: payload.projeto,
                    p_categoria: payload.categoria,
                    p_horas: payload.horas,
                    p_descricao: payload.descricao
                });
                adicionarToast("Lançamento atualizado com sucesso!", "sucesso");
                modalEdicaoAberto.value = false;
                fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast("Erro ao editar: " + err.message, "erro");
            } finally {
                enviandoEdicao.value = false;
            }
        };

        const excluirRegistroConfirmado = (idRegistro) => {
            abrirConfirmacao({
                titulo: "Excluir Lançamento",
                mensagem: `Tem certeza que deseja excluir permanentemente o lançamento ID ${idRegistro}?`,
                textoBotao: "Excluir Registro",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirRegistro', {
                        p_token: tokenSessao.value,
                        p_id_registro: idRegistro
                    });
                    adicionarToast("Lançamento excluído com sucesso!", "sucesso");
                    fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Edição e Exclusão em Lote
        const modalEdicaoLoteAberto = ref(false);
        const idsParaEdicaoLote = ref([]);
        const enviandoEdicaoLote = ref(false);

        const abrirModalEdicaoLote = (ids) => {
            idsParaEdicaoLote.value = ids;
            modalEdicaoLoteAberto.value = true;
        };

        const salvarEdicaoLote = async (payload) => {
            enviandoEdicaoLote.value = true;
            try {
                const res = await chamarBackend('editarRegistrosLote', {
                    p_token: tokenSessao.value,
                    p_ids_registros: payload.idsRegistros,
                    p_data: payload.data,
                    p_projeto: payload.projeto,
                    p_categoria: payload.categoria,
                    p_horas: payload.horas,
                    p_descricao: payload.descricao
                });
                adicionarToast(res.mensagem || `Lançamentos atualizados em lote!`, "sucesso");
                modalEdicaoLoteAberto.value = false;
                fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast("Erro ao editar em lote: " + err.message, "erro");
            } finally {
                enviandoEdicaoLote.value = false;
            }
        };

        const excluirLoteConfirmado = (ids) => {
            abrirConfirmacao({
                titulo: "Excluir Lançamentos em Lote",
                mensagem: `Tem certeza que deseja excluir permanentemente os ${ids.length} lançamentos selecionados?`,
                textoBotao: "Excluir Lote Selecionado",
                perigoso: true,
                onConfirm: async () => {
                    const res = await chamarBackend('excluirRegistrosLote', {
                        p_token: tokenSessao.value,
                        p_ids_registros: ids
                    });
                    adicionarToast(res.mensagem || `${ids.length} lançamentos excluídos com sucesso!`, "sucesso");
                    fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Gestão de Projetos e Categorias
        const carregandoItemLista = ref(false);

        const adicionarProjeto = async (nome) => {
            carregandoItemLista.value = true;
            try {
                await chamarBackend('adicionarProjeto', { p_token: tokenSessao.value, p_nome: nome });
                adicionarToast(`Projeto '${nome}' criado com sucesso!`, 'sucesso');
                fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao adicionar projeto.", "erro");
            } finally {
                carregandoItemLista.value = false;
            }
        };

        const excluirProjeto = (nome) => {
            abrirConfirmacao({
                titulo: "Excluir Projeto",
                mensagem: `Deseja remover o projeto '${nome}' do catálogo?`,
                textoBotao: "Excluir Projeto",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirProjeto', { p_token: tokenSessao.value, p_nome: nome });
                    adicionarToast(`Projeto '${nome}' removido.`, "sucesso");
                    fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        const adicionarCategoria = async (nome) => {
            carregandoItemLista.value = true;
            try {
                await chamarBackend('adicionarCategoria', { p_token: tokenSessao.value, p_nome: nome });
                adicionarToast(`Categoria '${nome}' criada com sucesso!`, 'sucesso');
                fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao adicionar categoria.", "erro");
            } finally {
                carregandoItemLista.value = false;
            }
        };

        const excluirCategoria = (nome) => {
            abrirConfirmacao({
                titulo: "Excluir Categoria",
                mensagem: `Deseja remover a categoria '${nome}' do catálogo?`,
                textoBotao: "Excluir Categoria",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirCategoria', { p_token: tokenSessao.value, p_nome: nome });
                    adicionarToast(`Categoria '${nome}' removida.`, "sucesso");
                    fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Gestão de Membros
        const modalMembroAberto = ref(false);

        const salvarMembro = async (payload) => {
            enviandoMembro.value = true;
            try {
                const res = await chamarBackend('adicionarUsuario', {
                    p_token: tokenSessao.value,
                    p_nome: payload.nome,
                    p_login: payload.login,
                    p_senha: payload.senha,
                    p_cargo: payload.cargo,
                    p_ativo: payload.ativo
                });
                adicionarToast(res.mensagem || `Membro @${payload.login} cadastrado com sucesso!`, "sucesso");
                modalMembroAberto.value = false;
                fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast("Erro ao adicionar membro: " + err.message, "erro");
            } finally {
                enviandoMembro.value = false;
            }
        };

        const alternarStatusMembro = async (login, novoStatus) => {
            try {
                await chamarBackend('alternarStatusUsuario', {
                    p_token: tokenSessao.value,
                    p_login: login,
                    p_ativo: novoStatus
                });
                adicionarToast(`Status de @${login} alterado para ${novoStatus === 'SIM' ? 'Ativo' : 'Inativo'}.`, "sucesso");
                fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast("Erro ao alterar status: " + err.message, "erro");
            }
        };

        const removerMembro = (login) => {
            abrirConfirmacao({
                titulo: "Excluir Membro",
                mensagem: `Tem certeza que deseja excluir permanentemente o membro @${login}?`,
                textoBotao: "Excluir Membro",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirUsuario', {
                        p_token: tokenSessao.value,
                        p_login: login
                    });
                    adicionarToast(`Membro @${login} excluído.`, "sucesso");
                    fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Relatórios
        const filtroRelatorio = ref({ inicio: '', fim: '', membro: '' });

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

        const parseDateToTime = (dStr) => {
            if (!dStr) return 0;
            let iso = dStr;
            if (iso.includes('/')) {
                const parts = iso.split('/');
                iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            if (iso.includes('T')) iso = iso.split('T')[0];
            return new Date(iso + 'T00:00:00').getTime();
        };

        const registrosRelatorio = computed(() => {
            const inicioTime = filtroRelatorio.value.inicio ? parseDateToTime(filtroRelatorio.value.inicio) : 0;
            const fimTime = filtroRelatorio.value.fim ? parseDateToTime(filtroRelatorio.value.fim) : Infinity;
            
            return (todosRegistros.value.length > 0 ? todosRegistros.value : registros.value).filter(r => {
                const rTime = parseDateToTime(r.Data);
                const noPeriodo = (!inicioTime || rTime >= inicioTime) && (!fimTime || rTime <= fimTime);
                const matchMembro = filtroRelatorio.value.membro ? r.Nome_Membro === filtroRelatorio.value.membro : true;
                return noPeriodo && matchMembro;
            });
        });

        const registrosRelatorioOrdenados = computed(() => {
            return [...registrosRelatorio.value].sort((a, b) => parseDateToTime(b.Data) - parseDateToTime(a.Data));
        });

        const periodoRelatorioTexto = computed(() => {
            if (!filtroRelatorio.value.inicio && !filtroRelatorio.value.fim) return "Todo o Histórico";
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
                if (!mapa[r.Nome_Membro]) mapa[r.Nome_Membro] = { nome: r.Nome_Membro, horas: 0, atividades: 0 };
                mapa[r.Nome_Membro].horas += (parseFloat(r.Horas_Gastas) || 0);
                mapa[r.Nome_Membro].atividades += 1;
            });
            return Object.values(mapa)
                .map(m => ({ ...m, horas: parseFloat(m.horas.toFixed(1)) }))
                .sort((a, b) => b.horas - a.horas);
        });

        const exportarCSV = () => {
            let csv = "Data,Membro,Projeto,Categoria,Horas,Descricao\n";
            registrosRelatorioOrdenados.value.forEach(r => {
                let desc = (r.Descricao || '').replace(/"/g, '""');
                csv += `${formatarDataSheet(r.Data)},"${r.Nome_Membro}","${r.Projeto || 'Atividade'}","${r.Categoria}",${r.Horas_Gastas},"${desc}"\n`;
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
            adicionarToast("Relatório CSV descarregado.", "sucesso");
        };

        const imprimirRelatorio = () => {
            window.print();
        };

        const formatarDataSheet = (dataStr) => {
            if (!dataStr) return '';
            if (dataStr.includes('T')) return dataStr.split('T')[0].split('-').reverse().join('/');
            return dataStr;
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
            usuarioAutenticado, usuarioAtual, carregandoLogin, mensagemErroLogin,
            fazerLogin, fazerLogout,
            toasts, removerToast,
            modalConfirmacao, fecharConfirmacao, executarConfirmacao,
            modalSenhaAberto, primeiroAcessoObrigatorio, enviandoSenha, salvarAlteracaoSenha,
            modalAdminResetAberto, membroResetSelecionado, enviandoAdminReset, abrirModalAdminReset, executarAdminResetSenha,
            abas, abaAtual, tituloAbaAtual: computed(() => abas.value.find(a => a.id === abaAtual.value)?.label),
            horaFormatada, dataFormatada, menuMobileAberto, mudarAba,
            membros, registros, todosRegistros, projetos, categorias, carregandoDados, enviandoRegistro, enviandoMembro,
            filtroMembroHist, mudarFiltroMembroHist, paginacao, irParaPagina,
            totalHorasGeral, totalLancamentos, acumuladoMembros,
            periodoGrafico: ref('mes'),
            carregandoItemLista, adicionarProjeto, excluirProjeto, adicionarCategoria, excluirCategoria,
            form, duracaoCalculadaHoras, salvarRegistro, salvarRegistroLote,
            timerAtivo, cronometroDisplay, iniciarCronometro, pararCronometro,
            modalEdicaoAberto, registroParaEdicao, enviandoEdicao, abrirModalEdicao, salvarEdicaoRegistro, excluirRegistroConfirmado,
            modalEdicaoLoteAberto, idsParaEdicaoLote, enviandoEdicaoLote, abrirModalEdicaoLote, salvarEdicaoLote, excluirLoteConfirmado,
            modalMembroAberto, salvarMembro, alternarStatusMembro, removerMembro,
            formatarDataSheet,
            filtroRelatorio, periodoRelatorioTexto, registrosRelatorio, registrosRelatorioOrdenados,
            kpisRelatorio, rankingRelatorio, aplicarFiltroRapido, exportarCSV, imprimirRelatorio
        };
    }
});

app.mount('#app');
