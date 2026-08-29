// Configuração Oficial do Supabase
window.SUPABASE_URL = "https://kphadeyhggefjkynkbjv.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwaGFkZXloZ2dlZmpreW5rYmp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMTM0MDksImV4cCI6MjEwMzU4OTQwOX0.J0LlvO0Ki2VO5enWLtCvrkdeGsFGLd6f4gwUTU7Prlg";

window.CATEGORIAS_ATIVIDADES = [
    'Ensino',
    'Pesquisa',
    'Extensão',
    'Reuniões',
    'Evento',
    'Divulgação',
    'Administrativo',
    'Projeto',
    'Outros'
];

window.ABAS_NAVEGACAO = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR', 'GESTOR', 'MEMBRO', 'MEMBRO_COMUM', 'FUNCIONARIO'] },
    { id: 'registrar', label: 'Registar Horas', icon: 'fa-solid fa-business-time', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR', 'GESTOR', 'MEMBRO', 'MEMBRO_COMUM', 'FUNCIONARIO'] },
    { id: 'historico', label: 'Histórico', icon: 'fa-solid fa-clock-rotate-left', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR', 'GESTOR', 'MEMBRO', 'MEMBRO_COMUM', 'FUNCIONARIO'] },
    { id: 'graficos', label: 'Gráficos & Análises', icon: 'fa-solid fa-chart-simple', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR', 'GESTOR'] },
    { id: 'projetos_categorias', label: 'Projetos & Categorias', icon: 'fa-solid fa-folder-tree', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR', 'GESTOR'] },
    { id: 'relatorios', label: 'Relatórios', icon: 'fa-solid fa-file-invoice', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR', 'GESTOR'] },
    { id: 'membros', label: 'Membros', icon: 'fa-solid fa-users', cargos: ['PROPRIETARIO', 'ADMINISTRADOR_MASTER', 'ADMINISTRADOR'] }
];
