export const COMPANIES = {
    1: "Bela Vista",
    2: "Imbuia",
    3: "Vila Nova",
    4: "Aurora"
};
export const USER_TYPES = {
    admin: 'Administrador',
    gerente: 'Gerente',
    financeiro: 'Financeiro',
    contabil: 'Contábil',
    compras: 'Compras',
    v_interno: 'Vendedor',
    v_externo: 'Vendedor',
    caixa: 'Caixa',
    estoque: 'Estoque'
    
};
export const ROLE_PERMISSIONS = {
    admin: ['home', 'finance', 'stock', 'expenses', 'management'],
    gerente: ['home', 'finance', 'stock', 'expenses', 'management'],
    financeiro: ['home', 'finance'],
    contabil: ['home', 'finance', 'expenses'],
    compras: ['home', 'procurement'], 
    v_interno: ['home'],
    v_externo: ['home'],
    caixa: ['home', 'finance'],
    estoque: ['home']
};
export const DASHBOARD_CARDS = {
    admin: ['collections', 'bills'],
    gerente: ['collections', 'expenses'],
    financeiro: ['collections', 'bills'],
    contabil: ['collections', 'expenses'],
    compras: [], 
    v_interno: [],
    v_externo: [],
    caixa: ['collections', 'bills'],
    estoque: [] 
};