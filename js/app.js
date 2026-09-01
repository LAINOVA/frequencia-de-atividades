const { createApp, ref, computed, onMounted, onUnmounted, nextTick, watch } = Vue;

const app = createApp({
    components: {
        'toast-container': window.ToastContainerComponent,
        'modal-confirmacao': window.ModalConfirmacaoComponent,
        'modal-alterar-senha': window.ModalAlterarSenhaComponent,
        'modal-admin-reset-senha': window.ModalAdminResetSenhaComponent,
        'modal-alterar-cargo': window.ModalAlterarCargoComponent,
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

        // Modal de Alteração de Cargo (Proprietário)
        const modalAlterarCargoAberto = ref(false);
        const membroCargoSelecionado = ref({});
        const enviandoAlterarCargo = ref(false);

        // Navegação e Estado
        const abas = ref(window.ABAS_NAVEGACAO);
        const abaAtual = ref('dashboard');
        const menuMobileAberto = ref(false);
        const carregandoDados = ref(false);
        const enviandoRegistro = ref(false);
        const enviandoMembro = ref(false);
        const carregandoItemLista = ref(false);

        // Relógio
        const dataAtualObj = ref(new Date());
        let intervalRelogio;
        const horaFormatada = computed(() => dataAtualObj.value.toLocaleTimeString('pt-PT'));
        const dataFormatada = computed(() => new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dataAtualObj.value));

        // Dados do Sistema
        const membros = ref([]);
        const registros = ref([]);
        const todosRegistros = ref([]);
        const projetos = ref([]);
        const categorias = ref(window.CATEGORIAS_ATIVIDADES || []);
        const filtroMembroHist = ref('');
        const periodoGrafico = ref('mes');

        // Paginação do Histórico
        const paginacao = ref({
            paginaAtual: 1,
            totalPaginas: 1,
            totalRegistros: 0,
            de: 0,
            ate: 0,
            temProximaPagina: false,
            temPaginaAnterior: false
        });

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
                'alterarCargo': 'api_alterar_cargo_usuario',
                'alterarCargoUsuario': 'api_alterar_cargo_usuario',
                'obterDados': 'api_obter_dados',
                'inserir': 'api_inserir_registro',
                'inserirLote': 'api_inserir_registros_lote',
                'editarRegistro': 'api_editar_registro',
                'editarRegistrosLote': 'api_editar_registros_lote',
                'excluirRegistro': 'api_excluir_registro',
                'excluirRegistrosLote': 'api_excluir_registros_lote',
                'adicionarProjeto': 'api_adicionar_projeto',
                'editarProjeto': 'api_editar_projeto',
                'excluirProjeto': 'api_excluir_projeto',
                'adicionarCategoria': 'api_adicionar_categoria',
                'editarCategoria': 'api_editar_categoria',
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
                usuarioAutenticado.value = false;
                tokenSessao.value = '';
                sessionStorage.removeItem('lainova_session_token');
                adicionarToast("A sua sessão expirou. Por favor, faça login novamente.", "erro");
                throw new Error("Sessão expirada.");
            }

            if (data && data.sucesso === false) {
                throw new Error(data.erro || "Falha na operação.");
            }

            return data;
        };

        // Autenticação
        const fazerLogin = async ({ login, senha }) => {
            carregandoLogin.value = true;
            mensagemErroLogin.value = '';
            try {
                const cleanLogin = (login || '').trim().toLowerCase().normalize('NFC');
                const cleanSenha = (senha || '').trim().normalize('NFC');
                const res = await chamarBackend('login', { p_login: cleanLogin, p_senha: cleanSenha });
                
                if (!res || !res.sucesso) {
                    throw new Error(res && res.erro ? res.erro : 'Login ou senha inválidos.');
                }

                tokenSessao.value = res.token;
                sessionStorage.setItem('lainova_session_token', res.token);
                
                const userObj = res.usuario || res;
                usuarioAtual.value = {
                    id: userObj.id,
                    login: userObj.login,
                    nome: userObj.nome,
                    cargo: (userObj.cargo || '').toUpperCase()
                };
                usuarioAutenticado.value = true;
                
                if (userObj.primeiroAcesso) {
                    primeiroAcessoObrigatorio.value = true;
                    modalSenhaAberto.value = true;
                } else {
                    adicionarToast(`Bem-vindo(a), ${userObj.nome}!`, "sucesso");
                }

                await fetchDados(1);
            } catch (err) {
                mensagemErroLogin.value = err.message || "Falha ao iniciar sessão.";
                adicionarToast(mensagemErroLogin.value, "erro");
            } finally {
                carregandoLogin.value = false;
            }
        };

        const fazerLogout = async () => {
            if (tokenSessao.value) {
                try {
                    await chamarBackend('logout', { p_token: tokenSessao.value });
                } catch (e) {
                    console.warn("Erro no logout RPC:", e);
                }
            }
            tokenSessao.value = '';
            sessionStorage.removeItem('lainova_session_token');
            usuarioAutenticado.value = false;
            usuarioAtual.value = { login: '', nome: '', cargo: '' };
            abaAtual.value = 'dashboard';
            adicionarToast("Sessão terminada.", "info");
        };

        const salvarAlteracaoSenha = async ({ senhaAtual, novaSenha }) => {
            enviandoSenha.value = true;
            try {
                const res = await chamarBackend('alterarSenha', {
                    p_token: tokenSessao.value,
                    p_senha_atual: senhaAtual,
                    p_nova_senha: novaSenha
                });
                adicionarToast(res.mensagem || "Palavra-passe alterada com sucesso!", "sucesso");
                modalSenhaAberto.value = false;
                primeiroAcessoObrigatorio.value = false;
            } catch (err) {
                adicionarToast(err.message || "Erro ao alterar palavra-passe.", "erro");
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
                adicionarToast(res.mensagem || `Palavra-passe de @${loginAlvo} redefinida com sucesso!`, "sucesso");
                modalAdminResetAberto.value = false;
            } catch (err) {
                adicionarToast(err.message || "Erro ao redefinir senha do membro.", "erro");
            } finally {
                enviandoAdminReset.value = false;
            }
        };

        // Alteração de Cargo (Proprietário)
        const abrirModalAlterarCargo = (membro) => {
            membroCargoSelecionado.value = { ...membro };
            modalAlterarCargoAberto.value = true;
        };

        const executarAlterarCargo = async ({ loginAlvo, novoCargo }) => {
            enviandoAlterarCargo.value = true;
            try {
                let res = null;
                // Suporta p_login (como criado no Supabase) e p_login_alvo como fallback
                try {
                    const { data, error } = await supabase.rpc('api_alterar_cargo_usuario', {
                        p_token: tokenSessao.value,
                        p_login: loginAlvo,
                        p_novo_cargo: novoCargo
                    });
                    if (error) throw error;
                    res = data;
                } catch (rpcErr) {
                    const { data, error } = await supabase.rpc('api_alterar_cargo_usuario', {
                        p_token: tokenSessao.value,
                        p_login_alvo: loginAlvo,
                        p_novo_cargo: novoCargo
                    });
                    if (error) throw error;
                    res = data;
                }

                if (res && res.sucesso === false) {
                    throw new Error(res.erro || "Falha ao alterar cargo.");
                }

                adicionarToast(res.mensagem || `Cargo de @${loginAlvo} atualizado para ${novoCargo}!`, "sucesso");
                modalAlterarCargoAberto.value = false;
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao alterar cargo.", "erro");
            } finally {
                enviandoAlterarCargo.value = false;
            }
        };

        // Edição de Projetos e Categorias
        const adicionarProjeto = async (nomeProjeto) => {
            carregandoItemLista.value = true;
            try {
                await chamarBackend('adicionarProjeto', {
                    p_token: tokenSessao.value,
                    p_nome: nomeProjeto
                });
                adicionarToast(`Projeto '${nomeProjeto}' adicionado!`, "sucesso");
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao adicionar projeto.", "erro");
            } finally {
                carregandoItemLista.value = false;
            }
        };

        const editarProjeto = async (params) => {
            carregandoItemLista.value = true;
            try {
                const ant = params.nomeAntigo || params.p_nome_antigo || '';
                const nov = params.novoNome || params.nomeNovo || params.p_nome_novo || '';
                const res = await chamarBackend('editarProjeto', {
                    p_token: tokenSessao.value,
                    p_nome_antigo: ant,
                    p_nome_novo: nov
                });
                adicionarToast(res.mensagem || `Projeto renomeado para '${nomeNovo}'!`, "sucesso");
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao renomear projeto.", "erro");
            } finally {
                carregandoItemLista.value = false;
            }
        };

        const excluirProjeto = (nomeProjeto) => {
            abrirConfirmacao({
                titulo: "Excluir Projeto",
                mensagem: `Tem certeza que deseja excluir o projeto "${nomeProjeto}" do catálogo?`,
                textoBotao: "Excluir Projeto",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirProjeto', {
                        p_token: tokenSessao.value,
                        p_nome: nomeProjeto
                    });
                    adicionarToast(`Projeto '${nomeProjeto}' removido!`, "info");
                    await fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        const adicionarCategoria = async (nomeCategoria) => {
            carregandoItemLista.value = true;
            try {
                await chamarBackend('adicionarCategoria', {
                    p_token: tokenSessao.value,
                    p_nome: nomeCategoria
                });
                adicionarToast(`Categoria '${nomeCategoria}' adicionada!`, "sucesso");
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao adicionar categoria.", "erro");
            } finally {
                carregandoItemLista.value = false;
            }
        };

        const editarCategoria = async (params) => {
            carregandoItemLista.value = true;
            try {
                const ant = params.nomeAntigo || params.p_nome_antigo || '';
                const nov = params.novoNome || params.nomeNovo || params.p_nome_novo || '';
                const res = await chamarBackend('editarCategoria', {
                    p_token: tokenSessao.value,
                    p_nome_antigo: ant,
                    p_nome_novo: nov
                });
                adicionarToast(res.mensagem || `Categoria renomeada para '${nomeNovo}'!`, "sucesso");
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao renomear categoria.", "erro");
            } finally {
                carregandoItemLista.value = false;
            }
        };

        const excluirCategoria = (nomeCategoria) => {
            abrirConfirmacao({
                titulo: "Excluir Categoria",
                mensagem: `Tem certeza que deseja excluir a categoria "${nomeCategoria}"?`,
                textoBotao: "Excluir Categoria",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirCategoria', {
                        p_token: tokenSessao.value,
                        p_nome: nomeCategoria
                    });
                    adicionarToast(`Categoria '${nomeCategoria}' removida!`, "info");
                    await fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Obtenção de Dados
        const fetchDados = async (pagina = 1) => {
            if (!tokenSessao.value) return;
            carregandoDados.value = true;
            try {
                const res = await chamarBackend('obterDados', {
                    p_token: tokenSessao.value,
                    p_pagina: pagina,
                    p_filtro_membro: filtroMembroHist.value
                });

                membros.value = res.membros || [];
                registros.value = res.registros || [];
                projetos.value = res.projetos || [];
                if (res.categorias && res.categorias.length > 0) {
                    categorias.value = res.categorias;
                }
                if (res.todosRegistros) {
                    todosRegistros.value = res.todosRegistros;
                }

                if (res.paginacao) {
                    paginacao.value = res.paginacao;
                }
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
            } finally {
                carregandoDados.value = false;
            }
        };

        const mudarFiltroMembroHist = (novoFiltro) => {
            filtroMembroHist.value = novoFiltro;
            fetchDados(1);
        };

        const irParaPagina = (pag) => {
            if (pag >= 1 && pag <= paginacao.value.totalPaginas) {
                fetchDados(pag);
            }
        };

        // Registro de Horas
        const hojeIso = new Date().toISOString().split('T')[0];
        const form = ref({
            data: hojeIso,
            inicio: '08:00',
            fim: '12:00',
            projeto: '',
            categoria: '',
            descricao: '',
            membro: ''
        });

        const duracaoCalculadaHoras = computed(() => {
            if (!form.value.inicio || !form.value.fim) return 0;
            const [h1, m1] = form.value.inicio.split(':').map(Number);
            const [h2, m2] = form.value.fim.split(':').map(Number);
            const min1 = h1 * 60 + m1;
            const min2 = h2 * 60 + m2;
            if (min2 <= min1) return 0;
            return parseFloat(((min2 - min1) / 60).toFixed(2));
        });

        // Cronômetro
        const timerAtivo = ref(false);
        const segundosTimer = ref(0);
        let intervalCronometro = null;
        const cronometroDisplay = computed(() => {
            const h = Math.floor(segundosTimer.value / 3600).toString().padStart(2, '0');
            const m = Math.floor((segundosTimer.value % 3600) / 60).toString().padStart(2, '0');
            const s = (segundosTimer.value % 60).toString().padStart(2, '0');
            return `${h}:${m}:${s}`;
        });

        const iniciarCronometro = () => {
            timerAtivo.value = true;
            const agora = new Date();
            form.value.inicio = agora.toTimeString().substring(0, 5);
            segundosTimer.value = 0;
            intervalCronometro = setInterval(() => {
                segundosTimer.value++;
            }, 1000);
        };

        const pararCronometro = () => {
            timerAtivo.value = false;
            if (intervalCronometro) clearInterval(intervalCronometro);
            const agora = new Date();
            form.value.fim = agora.toTimeString().substring(0, 5);
        };

        const salvarRegistro = async (payload) => {
            enviandoRegistro.value = true;
            try {
                await chamarBackend('inserir', {
                    p_token: tokenSessao.value,
                    p_data: payload.data,
                    p_projeto: payload.projeto,
                    p_categoria: payload.categoria,
                    p_horas: payload.horas,
                    p_descricao: payload.descricao,
                    p_membro_alvo: payload.membroAlvo || null
                });
                adicionarToast("Lançamento guardado com sucesso!", "sucesso");
                form.value.descricao = '';
                await fetchDados(1);
            } catch (err) {
                adicionarToast(err.message || "Erro ao salvar lançamento.", "erro");
            } finally {
                enviandoRegistro.value = false;
            }
        };

        const salvarRegistroLote = async (payload) => {
            enviandoRegistro.value = true;
            try {
                await chamarBackend('inserirLote', {
                    p_token: tokenSessao.value,
                    p_data: payload.data,
                    p_projeto: payload.projeto,
                    p_categoria: payload.categoria,
                    p_horas: payload.horas,
                    p_descricao: payload.descricao,
                    p_logins_membros: payload.loginsMembros
                });
                adicionarToast(`Lançamento em lote guardado para ${payload.loginsMembros.length} membros!`, "sucesso");
                await fetchDados(1);
            } catch (err) {
                adicionarToast(err.message || "Erro ao salvar lançamento em lote.", "erro");
            } finally {
                enviandoRegistro.value = false;
            }
        };

        // Edição e Exclusão de Registros
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
                const idReg = payload.idRegistro || payload.id || payload.ID || '';
                await chamarBackend('editarRegistro', {
                    p_token: tokenSessao.value,
                    p_id_registro: idReg,
                    p_data: payload.data,
                    p_projeto: payload.projeto,
                    p_categoria: payload.categoria,
                    p_horas: payload.horas,
                    p_descricao: payload.descricao
                });
                adicionarToast("Lançamento atualizado com sucesso!", "sucesso");
                modalEdicaoAberto.value = false;
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao atualizar lançamento.", "erro");
            } finally {
                enviandoEdicao.value = false;
            }
        };

        const excluirRegistroConfirmado = (idRegistro) => {
            abrirConfirmacao({
                titulo: "Excluir Lançamento",
                mensagem: "Tem a certeza que deseja eliminar este registo de horas?",
                textoBotao: "Excluir",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirRegistro', {
                        p_token: tokenSessao.value,
                        p_id_registro: idRegistro
                    });
                    adicionarToast("Lançamento excluído com sucesso!", "info");
                    await fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Edição e Exclusão em Lote
        const modalEdicaoLoteAberto = ref(false);
        const idsParaEdicaoLote = ref([]);
        const enviandoEdicaoLote = ref(false);

        const abrirModalEdicaoLote = (ids) => {
            idsParaEdicaoLote.value = [...ids];
            modalEdicaoLoteAberto.value = true;
        };

        const salvarEdicaoLote = async (payload) => {
            enviandoEdicaoLote.value = true;
            try {
                await chamarBackend('editarRegistrosLote', {
                    p_token: tokenSessao.value,
                    p_ids_registros: payload.ids,
                    p_data: payload.data || null,
                    p_projeto: payload.projeto || null,
                    p_categoria: payload.categoria || null,
                    p_horas: payload.horas || null,
                    p_descricao: payload.descricao || null
                });
                adicionarToast(`${payload.ids.length} lançamentos atualizados com sucesso!`, "sucesso");
                modalEdicaoLoteAberto.value = false;
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao editar em lote.", "erro");
            } finally {
                enviandoEdicaoLote.value = false;
            }
        };

        const excluirLoteConfirmado = (ids) => {
            abrirConfirmacao({
                titulo: "Excluir Lançamentos em Lote",
                mensagem: `Tem certeza que deseja excluir ${ids.length} lançamentos selecionados?`,
                textoBotao: "Excluir Todos",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirRegistrosLote', {
                        p_token: tokenSessao.value,
                        p_ids_registros: ids
                    });
                    adicionarToast(`${ids.length} lançamentos excluídos com sucesso!`, "info");
                    await fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // Gestão de Membros
        const modalMembroAberto = ref(false);
        const salvarMembro = async (formMembro) => {
            enviandoMembro.value = true;
            try {
                await chamarBackend('adicionarUsuario', {
                    p_token: tokenSessao.value,
                    p_novo_nome: formMembro.nome,
                    p_novo_login: formMembro.login,
                    p_nova_senha: formMembro.senha,
                    p_cargo: formMembro.cargo,
                    p_ativo: formMembro.ativo === 'SIM'
                });
                adicionarToast(`Membro @${formMembro.login} cadastrado com sucesso!`, "sucesso");
                modalMembroAberto.value = false;
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao adicionar membro.", "erro");
            } finally {
                enviandoMembro.value = false;
            }
        };

        const alternarStatusMembro = async (loginMembro, novoStatus) => {
            try {
                await chamarBackend('alternarStatusUsuario', {
                    p_token: tokenSessao.value,
                    p_login_alvo: loginMembro,
                    p_ativo: novoStatus === 'SIM'
                });
                adicionarToast(`Status de @${loginMembro} atualizado!`, "sucesso");
                await fetchDados(paginacao.value.paginaAtual);
            } catch (err) {
                adicionarToast(err.message || "Erro ao atualizar status.", "erro");
            }
        };

        const removerMembro = (loginMembro) => {
            abrirConfirmacao({
                titulo: "Excluir Membro",
                mensagem: `Tem certeza que deseja remover o utilizador @${loginMembro}? Todos os registos de horas serão mantidos.`,
                textoBotao: "Excluir Membro",
                perigoso: true,
                onConfirm: async () => {
                    await chamarBackend('excluirUsuario', {
                        p_token: tokenSessao.value,
                        p_login_alvo: loginMembro
                    });
                    adicionarToast(`Utilizador @${loginMembro} excluído!`, "info");
                    await fetchDados(paginacao.value.paginaAtual);
                }
            });
        };

        // KPIs e Métricas Globais
        const totalHorasGeral = computed(() => {
            const lista = todosRegistros.value.length > 0 ? todosRegistros.value : registros.value;
            const total = lista.reduce((acc, r) => acc + (parseFloat(r.Horas_Gastas) || 0), 0);
            return total.toFixed(1);
        });

        const totalLancamentos = computed(() => {
            const lista = todosRegistros.value.length > 0 ? todosRegistros.value : registros.value;
            return lista.length;
        });

        const acumuladoMembros = computed(() => {
            const lista = todosRegistros.value.length > 0 ? todosRegistros.value : registros.value;
            const mapaHoras = {};
            const mapaCargos = {};

            membros.value.forEach(m => {
                mapaHoras[m.nome] = 0;
                mapaCargos[m.nome] = m.cargo || 'MEMBRO';
            });

            lista.forEach(r => {
                const nome = r.Nome_Membro || r.nome_membro;
                if (nome) {
                    const horas = parseFloat(r.Horas_Gastas || r.horas_gastas) || 0;
                    mapaHoras[nome] = (mapaHoras[nome] || 0) + horas;
                }
            });

            return Object.keys(mapaHoras).map(nome => {
                const total = mapaHoras[nome] || 0;
                return {
                    nome,
                    cargo: mapaCargos[nome] || 'MEMBRO',
                    horas: parseFloat(total.toFixed(1)),
                    aprovadas: total.toFixed(1)
                };
            }).sort((a, b) => b.horas - a.horas);
        });

        // Relatórios
        const filtroRelatorio = ref({
            membro: '',
            projeto: '',
            categoria: '',
            dataInicio: '',
            dataFim: ''
        });

        const periodoRelatorioTexto = computed(() => {
            if (filtroRelatorio.value.dataInicio && filtroRelatorio.value.dataFim) {
                return `${filtroRelatorio.value.dataInicio} a ${filtroRelatorio.value.dataFim}`;
            }
            if (filtroRelatorio.value.dataInicio) return `A partir de ${filtroRelatorio.value.dataInicio}`;
            if (filtroRelatorio.value.dataFim) return `Até ${filtroRelatorio.value.dataFim}`;
            return 'Todo o Período';
        });

        const aplicarFiltroRapido = (tipo) => {
            const hoje = new Date();
            if (tipo === 'mes') {
                const ano = hoje.getFullYear();
                const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
                const ultDia = new Date(ano, hoje.getMonth() + 1, 0).getDate();
                filtroRelatorio.value.dataInicio = `${ano}-${mes}-01`;
                filtroRelatorio.value.dataFim = `${ano}-${mes}-${ultDia.toString().padStart(2, '0')}`;
            } else if (tipo === 'ano') {
                const ano = hoje.getFullYear();
                filtroRelatorio.value.dataInicio = `${ano}-01-01`;
                filtroRelatorio.value.dataFim = `${ano}-12-31`;
            } else if (tipo === 'todos') {
                filtroRelatorio.value.dataInicio = '';
                filtroRelatorio.value.dataFim = '';
                filtroRelatorio.value.membro = '';
                filtroRelatorio.value.projeto = '';
                filtroRelatorio.value.categoria = '';
            }
        };

        const registrosRelatorio = computed(() => {
            const base = todosRegistros.value.length > 0 ? todosRegistros.value : registros.value;
            return base.filter(r => {
                if (filtroRelatorio.value.membro && r.Nome_Membro !== filtroRelatorio.value.membro) return false;
                if (filtroRelatorio.value.projeto && r.Projeto !== filtroRelatorio.value.projeto) return false;
                if (filtroRelatorio.value.categoria && r.Categoria !== filtroRelatorio.value.categoria) return false;
                if (filtroRelatorio.value.dataInicio && r.Data < filtroRelatorio.value.dataInicio) return false;
                if (filtroRelatorio.value.dataFim && r.Data > filtroRelatorio.value.dataFim) return false;
                return true;
            });
        });

        const registrosRelatorioOrdenados = computed(() => {
            return [...registrosRelatorio.value].sort((a, b) => new Date(b.Data) - new Date(a.Data));
        });

        const kpisRelatorio = computed(() => {
            const regs = registrosRelatorio.value;
            const totalHoras = regs.reduce((acc, r) => acc + (parseFloat(r.Horas_Gastas) || 0), 0);
            const membrosUnicos = new Set(regs.map(r => r.Nome_Membro)).size;
            const mediaPorAtiv = regs.length > 0 ? (totalHoras / regs.length).toFixed(1) : 0;

            return {
                totalHoras: totalHoras.toFixed(1),
                totalAtividades: regs.length,
                mediaHorasPorAtividade: mediaPorAtiv,
                membrosAtivos: membrosUnicos
            };
        });

        const rankingRelatorio = computed(() => {
            const regs = registrosRelatorio.value;
            const mapa = {};
            regs.forEach(r => {
                if (r.Nome_Membro) {
                    mapa[r.Nome_Membro] = (mapa[r.Nome_Membro] || 0) + (parseFloat(r.Horas_Gastas) || 0);
                }
            });
            return Object.keys(mapa).map(nome => ({
                nome,
                horas: parseFloat(mapa[nome].toFixed(1))
            })).sort((a, b) => b.horas - a.horas);
        });

        const exportarCSV = () => {
            const regs = registrosRelatorioOrdenados.value;
            if (regs.length === 0) {
                adicionarToast("Não há dados para exportar.", "aviso");
                return;
            }

            let csv = "ID,Data,Membro,Projeto,Categoria,Horas,Descricao\n";
            regs.forEach(r => {
                const desc = `"${(r.Descricao || '').replace(/"/g, '""')}"`;
                csv += `${r.ID},${r.Data},"${r.Nome_Membro}","${r.Projeto}","${r.Categoria}",${r.Horas_Gastas},${desc}
`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `relatorio_lainova_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const imprimirRelatorio = () => {
            window.print();
        };

        const formatarDataSheet = (dataStr) => {
            if (!dataStr) return '';
            const partes = dataStr.split('-');
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
            return dataStr;
        };

        const mudarAba = (novaAba) => {
            abaAtual.value = novaAba;
            menuMobileAberto.value = false;
        };

        // Ciclo de Vida
        onMounted(async () => {
            intervalRelogio = setInterval(() => {
                dataAtualObj.value = new Date();
            }, 1000);

            if (tokenSessao.value) {
                try {
                    const res = await chamarBackend('validarSessao', { p_token: tokenSessao.value });
                    if (res && res.sucesso && (res.usuario || res.login)) {
                        const u = res.usuario || res;
                        usuarioAtual.value = {
                            id: u.id,
                            login: u.login,
                            nome: u.nome,
                            cargo: (u.cargo || '').toUpperCase()
                        };
                        usuarioAutenticado.value = true;
                        await fetchDados(1);
                    } else {
                        tokenSessao.value = '';
                        sessionStorage.removeItem('lainova_session_token');
                    }
                } catch (e) {
                    tokenSessao.value = '';
                    sessionStorage.removeItem('lainova_session_token');
                }
            }
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
            modalAlterarCargoAberto, membroCargoSelecionado, enviandoAlterarCargo, abrirModalAlterarCargo, executarAlterarCargo,
            abas, abaAtual, tituloAbaAtual: computed(() => abas.value.find(a => a.id === abaAtual.value)?.label),
            horaFormatada, dataFormatada, menuMobileAberto, mudarAba,
            membros, registros, todosRegistros, projetos, categorias, carregandoDados, enviandoRegistro, enviandoMembro,
            filtroMembroHist, mudarFiltroMembroHist, paginacao, irParaPagina,
            totalHorasGeral, totalLancamentos, acumuladoMembros,
            periodoGrafico,
            carregandoItemLista, adicionarProjeto, editarProjeto, excluirProjeto, adicionarCategoria, editarCategoria, excluirCategoria,
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
