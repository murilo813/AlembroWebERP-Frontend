import api from '@/api/api';

const mockClientsDatabase = [
  { id: 101, name: "THIAGO FARIAS LIMA", document: "111.222.333-44", group: "THIAGO FARIAS LIMA", lastSale: "25/02/2026" },
  { id: 102, name: "MURILO DE SOUZA", document: "999.888.777-66", group: "THIAGO FARIAS LIMA", lastSale: null },
];

const mockAtendimentos = [
  { id: 1, date: "18/03/2026", user: "Marcos Adm", obs: "Falei com ele, prospectando novo contrato de insumos.", clientRef: "TTHIAGO FARIAS LIMA" },
  { id: 2, date: "15/01/2026", user: "Murilo", obs: "Cobrança via e-mail referente a parcela atrasada.", clientRef: "THIAGO FARIAS LIMA" },
  { id: 3, date: "13/01/2026", user: "Murilo", obs: "teste na soja.", clientRef: "THIAGO FARIAS LIMA" },
  { id: 4, date: "10/01/2026", user: "Murilo", obs: "teste no site.", clientRef: "MURILO DE SOUZA" },
];

const mockContratos = [
  { id: 1, companyId: "1", clientName: "THIAGO FARIAS LIMA", cpf_cnpj: "111.222.333-44", contractType: "Soja Futuro", generationDate: "10/01/2026", dueDate: "10/05/2026", originalValue: 150000.00, balanceDue: 50000.00 },
];

const mockCheques = [
  { id: 1, emp: "1", nome: "THIAGO FARIAS", cpfCnpj: "111.222.333-44", doc: "CHQ-9912", correntista: "Thiago F. Lima", recebimento: "15/02/2026", bomPara: "15/03/2026", valor: 2500.00, aReceber: 2500.00 },
  { id: 2, emp: "1", nome: "THIAGO FARIAS", cpfCnpj: "111.222.333-44", doc: "CHQ-9913", correntista: "Thiago F. Lima", recebimento: "15/02/2026", bomPara: "15/04/2026", valor: 2500.00, aReceber: 2500.00 }
];

const mockNotas = [
  { id: 1, emp: "3", nome: "THIAGO FARIAS", cpfCnpj: "111.222.333-44", nfe: "11945", parcela: "1/3", geracao: "02/01/2026", vencimento: "02/02/2026", valor: 182.00, aReceber: 182.00 },
  { id: 2, emp: "3", nome: "THIAGO FARIAS", cpfCnpj: "111.222.333-44", nfe: "2519A", parcela: "2/3", geracao: "02/02/2026", vencimento: "02/03/2026", valor: 182.00, aReceber: 182.00 },
  { id: 3, emp: "1", nome: "THIAGO FARIAS", cpfCnpj: "111.222.333-44", nfe: "2519A", parcela: "3/3", geracao: "02/03/2026", vencimento: "02/04/2026", valor: 182.00, aReceber: 182.00 },
];

export default {
  async searchClients(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query) {
          resolve([]);
          return;
        }
        const lowerQuery = query.toLowerCase();
        const results = mockClientsDatabase.filter(c => 
          c.id.toString() === query || c.name.toLowerCase().includes(lowerQuery)
        );
        resolve(results);
      }, 600); 
    });
  },

  async getClientDashboard(client) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          groupClients: mockClientsDatabase.filter(c => c.group === client.group),
          atendimentos: mockAtendimentos,
          contratos: mockContratos,
          cheques: mockCheques,
          notas: mockNotas
        });
      }, 400); 
    });
  }
};