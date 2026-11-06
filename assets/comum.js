const CHAVE_TEMA = 'chamados.tema'; // mesma chave dos chamados: o tema escolhido vale nos dois sistemas

function temaSalvo() {
  try { return localStorage.getItem(CHAVE_TEMA); } catch (e) { return null; }
}
function temaAtual() {
  return document.documentElement.dataset.tema ||
    (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
}
function aplicarTema(tema) {
  if (tema) document.documentElement.dataset.tema = tema;
  else delete document.documentElement.dataset.tema;
  const botao = document.getElementById('botao-tema');
  if (botao) {
    const escuro = temaAtual() === 'escuro';
    botao.textContent = escuro ? '☀️' : '🌙';
    botao.title = botao.ariaLabel = escuro ? 'Usar tema claro' : 'Usar tema escuro';
  }
}
aplicarTema(temaSalvo());
document.addEventListener('DOMContentLoaded', () => {
  const topo = document.querySelector('.topo-conteudo');
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.id = 'botao-tema';
  botao.className = 'botao botao-claro botao-tema';
  botao.addEventListener('click', () => {
    const novo = temaAtual() === 'escuro' ? 'claro' : 'escuro';
    try { localStorage.setItem(CHAVE_TEMA, novo); } catch (e) { /* vale só nesta página */ }
    aplicarTema(novo);
  });
  (topo.querySelector('.topo-acoes') || topo).appendChild(botao);
  aplicarTema(temaSalvo());
});

// Sem cookies: o login do Google no navegador não interfere (evita o erro de várias contas)
async function chamar(acao) {
  const args = Array.prototype.slice.call(arguments, 1);
  let r;
  try {
    r = await fetch(REQUISICOES.api, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ acao: acao, args: args }),
      credentials: 'omit',
      redirect: 'follow'
    });
  } catch (e) {
    throw new Error('Sem conexão com o servidor. Verifique a internet e tente de novo.');
  }
  const j = await r.json();
  if (!j.ok) throw new Error(j.erro);
  return j.dados;
}
function mensagemErro(e) {
  return String((e && e.message) || e).replace(/^(Exception|Error|Erro):\s*/i, '');
}

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function slug(v) {
  return String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
}
function seloStatus(s) { return '<span class="selo st-' + slug(s) + '">' + esc(s) + '</span>'; }
function numeroBr(n) { return n == null || n === '' ? '—' : String(n).replace('.', ','); }
function dataHora(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function tempoDesde(ms) {
  if (!ms) return '—';
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return 'há ' + min + ' min';
  const h = Math.floor(min / 60);
  if (h < 24) return 'há ' + h + ' h';
  const d = Math.floor(h / 24);
  return 'há ' + d + (d === 1 ? ' dia' : ' dias');
}
function textoJustificativa(r) {
  return r.justificativas.map(j => j === 'Outro' ? 'Outro: ' + r.outro : j).join('; ');
}
function resumoItens(r) {
  if (!r.itens.length) return '—';
  const resto = r.itens.length - 1;
  return r.itens[0].descricao + (resto ? ' e mais ' + resto + (resto === 1 ? ' item' : ' itens') : '');
}
// Responsável e função só existem no painel: a consulta pública não traz nomes
function dadosRequisicaoHtml(r) {
  return '<dl class="dados">' + [
    ['Unidade', r.unidade], ['Setor', r.setor], ['Enviada em', dataHora(r.data)],
    ['Responsável', r.responsavel], ['Função', r.funcao], ['Justificativa', textoJustificativa(r)]
  ].filter(p => p[1]).map(p => '<div><dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd></div>').join('') + '</dl>';
}
function historicoHtml(r) {
  return '<ul class="linha-tempo">' + r.historico.slice().reverse().map(h =>
    '<li><div class="lt-meta">' + esc(dataHora(h.data)) + (h.autor ? ' · ' + esc(h.autor) : '') + '</div><div class="lt-texto">' + esc(h.texto) + '</div></li>'
  ).join('') + '</ul>';
}
