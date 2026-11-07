// Endereço de cada ficha no Google: a URL do "App da Web" (termina em /exec).
// Ao publicar uma nova versão pelo "Gerenciar implantações", a URL continua a mesma.
const REQUISICOES = {
  tipos: {
    farmacia: {
      nome: 'Farmácia/Almoxarifado',
      descricao: 'Medicamentos e materiais médico-hospitalares para uso interno.',
      titulo: 'Requisição de medicamentos e materiais<br>médico-hospitalares para uso interno',
      destino: 'à Farmácia/Almoxarifado',
      prefixo: 'REQ',
      api: 'https://script.google.com/macros/s/AKfycbyTA0bhcVnMyZVygnE6qwap_oD9EyllxZIfjVfWkb5-8YURTKjs5JmqC8vv9P2P-6JI9g/exec'
    },
    escritorio: {
      nome: 'Materiais de escritório',
      descricao: 'Papel, canetas, pastas e outros materiais de uso administrativo.',
      titulo: 'Requisição de materiais de escritório',
      destino: 'à equipe de Materiais de escritório',
      prefixo: 'ESC',
      api: 'https://script.google.com/macros/s/AKfycbz_A8pFF-ChoQRSuDTeMT-TZP4E3WMMFwoVEh9s0wkEjRRgaetsR1EUwpBWpkjK__KR1A/exec'
    }
  }
};
