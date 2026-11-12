# Requisições internas — Poupatempo da Saúde

Telas do sistema de requisições internas do Poupatempo da Saúde, publicadas no GitHub Pages:

**https://tipoupatempo.github.io/requisicoes/**

Os setores pedem materiais pelo site, recebem um número e acompanham o atendimento. A equipe responsável separa e registra o que foi entregue num painel com login.

O site é só a parte visual. Os dados ficam em planilhas Google, acessadas por um Google Apps Script publicado como App da Web. O código desse script está no repositório privado [`requisicoes-apps-script`](https://github.com/tipoupatempo/requisicoes-apps-script).

## Fichas

Cada ficha é um sistema independente, com planilha, script, usuários e numeração próprios.

| Ficha | Parâmetro | Número | O que se pede |
| --- | --- | --- | --- |
| Farmácia/Almoxarifado | *(nenhum)* ou `?tipo=farmacia` | `REQ-2026-0001` | Medicamentos e materiais médico-hospitalares para uso interno. Pede código, descrição REMUME e estoque do setor. |
| Materiais de escritório | `?tipo=escritorio` | `ESC-2026-0001` | Papel, canetas, pastas e outros materiais administrativos. |

Sem `?tipo=` as telas abrem a ficha da Farmácia, para que os links antigos continuem valendo.

## Telas

| Arquivo | Quem usa | O que faz |
| --- | --- | --- |
| `index.html` | Todos | Página inicial: escolher a ficha, acompanhar uma requisição ou entrar no painel. |
| `requisitar.html` | Qualquer funcionário, sem login | Ficha de requisição. |
| `acompanhar.html` | Quem enviou | Consulta pelo número (`acompanhar.html?n=REQ-2026-0001`). |
| `painel.html` | Equipe responsável, com usuário e senha | Fila de requisições e registro do atendimento. |
| `config.js` | — | Nome, títulos, prefixo e endereço do App da Web de cada ficha. |
| `assets/base.css` | — | Estilo base (cores, tema claro/escuro, botões, campos). |
| `assets/requisicoes.css` | — | Estilo específico das telas de requisição. |
| `assets/comum.js` | — | Funções comuns: escolha da ficha, tema, chamada à API, formatação. |
| `assets/logo-*.png` | — | Logos da Fundação ABC e da Prefeitura de Santo André. |

### Ficha de requisição
- Responsável, função e setor.
- Até 15 itens, cada um com descrição, unidade de medida e quantidade solicitada (e, na Farmácia, código e estoque atual do setor).
- A descrição tem busca no catálogo: primeiro aparecem os materiais que o setor escolhido costuma pedir, depois os demais.
- Justificativa: Reposição programada, Admissão de paciente, Aumento do consumo, Perda, Quebra, Vencimento ou Outro (com texto). As opções variam por ficha.
- Cada envio leva um identificador: se a conexão cair e a pessoa reenviar, o servidor devolve o mesmo número em vez de duplicar a requisição.
- Campo-armadilha escondido contra robôs.

### Acompanhar
Mostra status, itens com quantidade solicitada e atendida, observação e histórico. Não mostra nomes.

### Painel
- Login com usuário e senha da planilha. Na primeira entrada (senha provisória) é obrigatório criar a própria senha. Sessão de até 6 horas, guardada só na aba do navegador.
- Lista das requisições em aberto e das encerradas nos últimos 30 dias, com filtros.
- Detalhe: preencher a quantidade atendida de cada item, escolher o status e escrever observação.
- Atualização automática a cada 60 segundos e notificações do navegador para requisições novas.

### Recursos comuns
- Tema claro/escuro, lembrado no navegador e compartilhado com o sistema de chamados.
- Setores, unidades e catálogo ficam guardados no navegador: a tela abre na hora e confere a versão do servidor em segundo plano.
- Se o servidor não responder em 45 segundos, aparece uma mensagem de erro em vez de a tela ficar carregando.
- Funciona no celular.

## Status

| Status | Regra |
| --- | --- |
| Recebida | Toda requisição nova. |
| Em separação | Equipe começou a separar. |
| Atendida | Todos os itens com a quantidade solicitada (ou mais). |
| Atendida parcialmente | Todos os itens com quantidade atendida preenchida (use 0 para o que não foi entregue). |
| Recusada | Exige observação com o motivo. |

## Como as telas falam com o Google

`POST` para o `/exec` da ficha, corpo JSON em `text/plain` e sem cookies:

```json
{ "acao": "enviarRequisicao", "args": [ { "setor": "Coleta", "itens": [ ... ] } ] }
```

Resposta: `{ "ok": true, "dados": ... }` ou `{ "ok": false, "erro": "mensagem" }`.

| Ação | Argumentos | Usada em |
| --- | --- | --- |
| `dadosTela` | — | todas |
| `enviarRequisicao` | dados da ficha | requisitar |
| `consultarRequisicao` | `numero` | acompanhar |
| `entrar` / `sair` | `usuario, senha` / `token` | painel |
| `trocarSenha` | `token, atual, nova` | painel |
| `listarRequisicoes` | `token` | painel |
| `detalharRequisicao` | `token, numero` | painel |
| `atualizarRequisicao` | `token, numero, { status, quantidades, observacao }` | painel |

## Configuração (`config.js`)

```js
const REQUISICOES = {
  tipos: {
    farmacia: {
      nome: 'Farmácia/Almoxarifado',     // nome curto nas telas
      descricao: '...',                   // texto do cartão na página inicial
      titulo: 'Requisição de ...',        // título da ficha (aceita <br>)
      destino: 'à Farmácia/Almoxarifado', // usado na frase de confirmação
      prefixo: 'REQ',                     // início do número
      api: 'https://script.google.com/macros/s/.../exec'
    },
    escritorio: { ... }
  }
};
```

Para criar uma ficha nova: instale outra cópia do script (veja `requisicoes-apps-script`), adicione a ficha em `TIPOS` no `Code.gs` e aqui em `config.js`, e inclua o cartão em `index.html`.

## Publicar uma alteração

Não há build. Edite os arquivos, faça o commit na branch `main` e o GitHub Pages publica em cerca de 1 minuto.

Para testar localmente:

```bash
python -m http.server 8000
```

e abra `http://localhost:8000/`. As telas usam os scripts reais de `config.js`: requisições de teste entram na planilha de verdade, então apague-as depois.

## Repositórios relacionados

- [`requisicoes-apps-script`](https://github.com/tipoupatempo/requisicoes-apps-script) — código do Google (planilha, API, e-mails) e catálogo.
- [`chamados`](https://github.com/tipoupatempo/chamados) — sistema de chamados de TI e Manutenção, no mesmo modelo.
