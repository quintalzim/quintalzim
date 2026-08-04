# QUINTALZIM — Documento de Contexto do Projeto

*Versão 1.13 — agosto/2026. Este documento dá contexto completo a qualquer nova conversa. Atualizar ao fim de sessões que mudem decisões, arquitetura ou estado.*

*Mudanças da v1.1: separação formal dos dois modelos de negócio (B2C direto e B2B2C), arquitetura de WhatsApp definida (número próprio do Quintalzim vs número de cada Empresa via Coexistence/Embedded Signup), "Plano B" de onboarding sem WhatsApp (cadastro direto no ecossistema via PWA), e mudança de precificação da Meta anunciada para 1/out/2026.*

*Mudanças da v1.2: fluxo "Prontim - Atendimento" revalidado, corrigido e republicado; Facebook e Instagram do Quintalzim já reservados; as 5 conversas de validação de campo com donos de negócio já foram realizadas (aprendizados a registrar).*

*Mudanças da v1.3: "Prontim - Extrator de Despesas" construído, testado ponta a ponta com escrita real no Supabase e publicado como sub-workflow do "Prontim - Atendimento" (chamado via Execute Sub-workflow); migração da Coexistence segue pendente de aprovação da Meta (Tech Provider em análise); registrado o gap de mapeamento telefone→user_id e o débito técnico de credenciais hardcoded no n8n.*

*Mudanças da v1.4: mapeamento telefone→user_id implementado e publicado — coluna `phone` na tabela `profiles`, campo "WhatsApp" no Perfil do portal Quintalzim, e o Extrator agora identifica o assinante pelo número de quem manda a mensagem (com aviso educado se o número não estiver vinculado, em vez de gravar errado ou ficar em silêncio). Nós de Supabase do Extrator passaram a usar a credencial nativa do n8n (`Supabase account`) em vez de header hardcoded — reduz a dívida técnica.*

*Mudanças da v1.5: memória de conversa do Prontim implementada e publicada — o fallback conversacional do "Prontim - Atendimento" virou um AI Agent (Claude Haiku + Redis Chat Memory, sessão por `remoteJid`, TTL 24h, últimas 8 interações), usando o Redis que já rodava no docker-compose (`quintalzim-redis-1`, sem senha, alcançável como `redis:6379` na rede `quintalzim_qz`). No processo, corrigido um bug real (não relacionado à memória) no "Prontim - Extrator de Despesas": os dois nodes IF paralelos usados como workaround do bug de conexão dupla (ver seção 6) tinham uma saída "falsa" sem nenhuma conexão — isso fazia o Execute Sub-workflow do fluxo pai devolver, às vezes, o dado errado desse beco sem saída em vez do resultado real do node "Fim", deixando o Prontim mudo em mensagens que não eram despesa. Corrigido conectando as duas saídas soltas no "Fim", convergindo todo caminho possível num único ponto de saída.*

*Mudanças da v1.6: criada a base de conta Empresa no portal — antes disso não existia nenhum conceito de Empresa no produto, só Pessoa Física. Nova tabela `empresas` no Supabase (dono, nome, slug, status do WhatsApp), rota `/app/empresa` (cadastro se não tem empresa ainda, painel se já tem) e o início do wizard de conexão de WhatsApp da Empresa (explicação + checagem de WhatsApp Business). O botão final de ativação via Meta fica desabilitado com aviso honesto, porque depende da aprovação do Quintalzim como Tech Provider (pendência 6, ainda em análise) — pronto pra ligar assim que sair.*

*Mudanças da v1.7: implementado o Plano B (seção 10.3) — cliente final vira usuário do Quintalzim sem precisar do WhatsApp da Empresa. Página pública `/b/[slug]` (sem exigir login) mostra o nome do negócio e um formulário simples (nome, WhatsApp, e-mail); o cadastro usa magic link (mesma infra de auth que já existia em `/entrar`, sem senha). O painel da Empresa (`/app/empresa`) ganhou um card com o link pronto pra copiar e compartilhar. Nova tabela `empresa_clientes` guarda o vínculo cliente↔empresa, e o telefone informado também é aproveitado pra já deixar esse cliente pronto pra usar o Prontim (mesmo campo `profiles.phone` do mapeamento telefone→user_id). **Ainda não implementado nessa entrega:** as notificações push de verdade (confirmação, lembrete 24h/2h) — hoje o cadastro só guarda o vínculo e o contato; falta a infraestrutura de push do PWA (service worker, permissão do navegador, VAPID keys) pra essas mensagens saírem de fato.*

*Mudanças da v1.8: corrigido um risco de confusão no retorno do cliente final do Plano B — como o cadastro via `/b/slug` não pede senha (só magic link), esse cliente podia voltar em `/entrar`, cair na aba padrão de e-mail+senha (que ele nunca criou) e travar sem achar o caminho certo (a opção "entra sem senha" existe, mas não é óbvia pra quem nunca usou o Quintalzim). Corrigido com boas-vindas na primeira vez que ele entra: `FinalizarCadastroClienteEmpresa` agora mostra um cartão de "bem-vindo" convidando a conhecer o resto do portal, com opção (não obrigatória) de criar senha ali mesmo via `supabase.auth.updateUser({password})` — quem não quiser, continua só recebendo os avisos, sem senha, sempre por magic link.*

*Mudanças da v1.9: implementada a infraestrutura real de push notifications do PWA (Web Push/VAPID) — fecha a lacuna que o Plano B (v1.7) tinha deixado aberta. Service worker (`public/sw.js`), lib de inscrição no navegador (`lib/push.ts`), card "Avisos" no Perfil (`components/app/AtivarNotificacoes.tsx`, com botão de ativar/desativar e um "mandar teste"), tabela `push_subscriptions` no Supabase (RLS própria) e rota de envio server-side (`app/api/push/enviar/route.ts`, usa `web-push` + a service role key, aceita chamada autenticada do próprio usuário — usada pelo botão de teste — ou um segredo compartilhado `PUSH_API_SECRET` pra uso futuro por automações como o n8n). Novas variáveis de ambiente (`.env.local` já atualizado local; **falta configurar as mesmas no Vercel**, que é onde o portal está hospedado): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `SUPABASE_SERVICE_ROLE_KEY`, `PUSH_API_SECRET`. **Ainda não implementado:** o disparo automático de lembretes de verdade (24h/2h antes de um horário, resumo diário etc.) — hoje só existe o botão manual de teste; a automação de quando/o que mandar é trabalho futuro, provavelmente via n8n chamando essa rota com o segredo. Corrigido também um erro de build no deploy (tipagem estrita do TypeScript pro `applicationServerKey` do Web Push — resolvido com cast pra `BufferSource` em `lib/push.ts`).*

*Mudanças da v1.10: construída a Vitrine da Empresa (camada 1 da esteira B2B2C, seção 3) — o `/b/slug` deixou de ser só um formulário de cadastro e virou um mini-site de verdade. Novos campos em `empresas` (`descricao`, `endereco`, `telefone_contato`, `instagram`, `horario_funcionamento`, script `docs/sql/vitrine-empresa.sql`), formulário de edição no painel (`components/app/FormularioEditarVitrine.tsx`) e a página pública agora mostra essas informações num cartão acima do formulário de contato do cliente final.*

*Mudanças da v1.11: primeira versão da Recepcionista IA (camada 2 da esteira B2B2C, seção 3) — via o canal do Plano B, já que o WhatsApp da própria Empresa segue bloqueado pela aprovação da Meta. Nova tabela `agendamentos` (script `docs/sql/agendamentos.sql`). Em `/b/slug`: se o visitante já está logado no Quintalzim, em vez do formulário de cadastro aparece `FormularioSolicitarAgendamento` (serviço, data/hora desejada, observação); ao enviar, cria o pedido com status `pendente` e manda push pro dono (usando a infra de push da v1.9). No painel (`/app/empresa`), `PainelAgendamentos` lista os pedidos com botões "Confirmar"/"Recusar" de 1 toque — ao decidir, manda push de volta pro cliente confirmando ou avisando que não deu. **Não é agenda de verdade:** não há checagem de disponibilidade/conflito de horário nem lembretes automáticos 24h/2h — é só o fluxo pedido→aprovação→aviso, que já é usável e é a base pra evoluir depois.*

*Mudanças da v1.12: correção de arquitetura importante, encontrada em teste real — não existia separação entre "assinante do Quintalzim" e "cliente final de uma Empresa via Plano B". Os dois viravam o mesmo tipo de usuário, com acesso total (inclusive podendo criar a própria Empresa e vincular WhatsApp do Prontim), e o link mágico do cliente final sempre devolvia pra `/app/inicio` em vez de voltar pra Vitrine de onde ele veio — na prática, dava pra se cadastrar mas não dava pra chegar na tela de pedir horário. Duas correções:*
*(1) Redirect: `FormularioClienteFinal` agora manda nome/telefone pelo `user_metadata` do Supabase (sobrevive trocar de navegador/dispositivo entre pedir o link e clicar nele, ao contrário do `localStorage` usado antes) e o `emailRedirectTo` volta pra `/b/[slug]` — não mais pra `/app/inicio`. Quem finaliza o vínculo agora é `FinalizarVinculoCliente` (`components/public`), rodando direto em `/b/[slug]`, silencioso — substituiu o `FinalizarCadastroClienteEmpresa` antigo (arquivo não pôde ser apagado fisicamente nesse ambiente, virou um no-op comentado, pode ser removido manualmente do repo).*
*(2) Separação de papéis: nova coluna `profiles.acesso_portal` (`'completo'` | `'restrito'`, script `docs/sql/tipos-de-acesso.sql`, com backfill pras contas de teste que já existiam). Quem nasce como cliente final via `/b/slug` recebe `'restrito'` por padrão (nunca rebaixa quem já era assinante). `app/app/layout.tsx` agora checa esse campo pra QUALQUER rota `/app/*`: usuário `'restrito'` vê só `PortalRestritoClienteFinal` (lista dos próprios pedidos, card de ativar avisos, e `DesbloquearPortalCompleto` — criar senha vira `'completo'` e libera o portal inteiro, com `router.refresh()` pra aplicar na hora). Usuário `'completo'` continua vendo o app normal (Início, Catálogo, Prontim, Perfil, Empresa) como sempre.*

*Mudanças da v1.13: causa raiz real do bug da v1.12 encontrada em teste de campo (cliente Babi) — o `emailRedirectTo`/`next` mandado pelo código nunca chegava no e-mail de verdade, porque o template "Magic Link" configurado no Supabase (seção 6, lição f) é texto fixo (`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .Type }}`), sem nenhuma variável de redirect — então TODO magic link (cliente final ou assinante) sempre voltava pra `/app/inicio`, e como o cliente final nunca chegava em `/b/slug`, `FinalizarVinculoCliente` nunca rodava e a conta ficava sem `profiles` (logo sem `acesso_portal='restrito'`, caindo no padrão `'completo'`). Corrigido: `emailRedirectTo` agora aponta direto pro destino final absoluto (`/b/slug` ou `/app/inicio`, sem envelopar em `/auth/callback?next=`, pra não gerar URL aninhada); `destinoParaTipo()` passou a aceitar um `next` explícito; `/auth/callback` e `/auth/confirmar` (page + action) repassam esse `next` ponta a ponta. **Ação manual pendente do usuário:** adicionar `&next={{ .RedirectTo }}` no template "Magic Link" do Supabase Dashboard (Authentication → Email Templates) — sem isso a correção de código não tem efeito nenhum, porque é o template que gera o link real que vai no e-mail.*

---

## 1. O QUE É O QUINTALZIM

Portal único (super app PWA) por assinatura para pessoas e pequenas empresas de **cidades pequenas do Brasil**. O cliente paga o portal, não cada item: dentro dele há apps, ferramentas de IA, automações, conteúdos e serviços, com uma IA concierge que entende a dor e monta a solução.

**Importante — dois modelos de negócio coexistem sob a mesma marca** (detalhado na seção 10): um **B2C direto** (assinante Pessoa Física fala com o Quintalzim) e um **B2B2C** (Empresa assina o Quintalzim, mas quem usa o produto no dia a dia é o cliente final da Empresa, que muitas vezes nunca ouviu falar do Quintalzim). Cada modelo tem canais, números de WhatsApp e papel do Prontim diferentes — nunca tratar os dois como a mesma coisa ao desenhar um fluxo novo.

**Fundador:** empreendedor solo, usando IA em todo o processo de construção. Possui um SaaS de finanças pessoais já pronto (mesma stack do projeto, com APIs) que será integrado como módulo — **já integrado via SSO** (ver seção 6). Objetivo: MRR significativo (referência: ~R$ 19 mil em 12-18 meses), não unicórnio.

**Marca:**
- Nome: **Quintalzim** (domínio quintalzim.com.br registrado; DNS no Cloudflare)
- Concierge/mascote: **Prontim** — a voz da IA. Confirma tarefas com "Prontim ✅"
- Slogan (proposta): "Resolve no Quintalzim"
- Tom de voz: vizinho competente do interior — simples, caloroso, direto, sem tecniquês. Nunca vende "IA/tecnologia"; vende o resultado ("responda seus clientes 24h")
- Identidade visual: Q ornamentado (cobre/verde, referência às vinhas/folhas) já aplicado como favicon e ícone PWA nos dois apps (Quintalzim e Quintal de Finanças); paleta verde-folha (#3F6B34) + creme (#FBF7EC) + terracota/laranja, tipografia arredondada, ilustrações estilo desenhado à mão (quintal: varal, portãozinho, plantas)
- E-mail do projeto: meuquintalzim@gmail.com

**Princípios inegociáveis:**
1. Curadoria de tudo (conteúdo honesto; nunca promessas de enriquecimento fácil)
2. Dado único, várias bocas: informação entra uma vez, sai em todas as interfaces
3. Confiança em cidade pequena se constrói com prova local; um incidente queima a marca
4. Limites de uso justos por plano + modelos de IA baratos para volume (proteção de margem)
5. **Custo de infraestrutura (Meta/WhatsApp, IA) nunca é repassado à parte pro cliente — sempre embutido na mensalidade.** Nunca prometer "sem custo" sem qualificar "pra você", já que pode deixar de ser literalmente gratuito pro Quintalzim (ver seção 10.4)

---

## 2. MODELO DE RECEITA — A ESCADA

| Degrau | Faixa | Papel |
|---|---|---|
| PF Base | R$ 19–39/mês | Volume, porta de entrada |
| PF Premium | R$ 39–59/mês | Acompanhamento ativo via WhatsApp |
| Empresa Start | R$ 79/mês | Vitrine + agendamento + catálogo básico |
| Empresa Pro | R$ 149/mês | + Recepcionista IA + posts diários |
| Empresa Completo | R$ 199–249/mês | + vendas, despesas, DRE, clube de assinaturas* |
| Profissional | R$ 29–49/mês | Perfil no marketplace + recomendação da IA |
| Sob medida | R$ 300–1.500 setup + mensalidade | Financia o ano 1; laboratório do SaaS |

\* Fase 2. Complementos: setup de Vitrine (R$ 97–197), comissões de marketplace (5–12%, Fase 2), criadores externos (take 20–30%, Fase 2).

Custo estimado de IA por assinante ativo: PF R$ 3–8/mês; Empresa R$ 10–30/mês. **A partir de out/2026, somar custo de mensageria WhatsApp por assinante Empresa (ver seção 10.4) — valor exato ainda não publicado pela Meta.**

---

## 3. CATÁLOGO — MÓDULOS DEFINIDOS

**Padrão arquitetural de todos os módulos:** motor com API + interface conversacional (WhatsApp ou chat no PWA, dependendo do modelo — ver seção 10) por cima + dashboard visual.

### Lado Pessoa Física (modelo B2C direto)
- **Finanças Pessoais:** SaaS existente do fundador vira motor+dashboard; chat (WhatsApp do Quintalzim ou chat web) vira interface ("almocei, gastei 25" → registrado; consultas com contexto; resumos proativos). **Integração SSO com o Quintal de Finanças já construída e em produção** (login único, catálogo, handoff)
- **Calorias por foto:** foto do prato → IA conta calorias. O "wow" de demonstração. Ainda não iniciado
- **Quiz-Funil saúde/fitness** (estilo BetterMe): jornada visual → diagnóstico → oferta personalizada → plano real de hábitos com check-ins. Motor genérico em JSON, replicável (quiz finanças, diagnóstico do negócio). Funil principal de aquisição PF
- **Briefings Inteligentes:** resumo diário por temas (push do PWA como canal principal — ver seção 10.5 — com opção WhatsApp/áudio), cruzando dados pessoais. Arquitetura um-para-muitos: 1 workflow por tema gera resumo-base (1 chamada cara/dia), distribuição personaliza com Haiku. Custo ≈ zero por assinante. Isca: 7 dias grátis
- **Utilitários** (regra: máx 2-3 dias de produção cada; 1-2/semana pós-lançamento): conversor extrato→Excel (alimenta finanças/DRE), calculadoras (juros, dívidas, preço de serviço), gerador de recibos, gerador de bio/legenda. Funções: volume percebido, aquisição orgânica (versão grátis limitada), moeda de promoção

### Lado Empresa — esteira "Vitrine do Cliente" (modelo B2B2C, espinha dorsal)
Cinco camadas empilháveis; cada uma cria necessidade da próxima:
1. **Presença:** mini-site multi-tenant gerado por IA (portal.com.br/nome-do-negocio)
2. **Atendimento:** Recepcionista IA — agendamento via WhatsApp da própria Empresa (Coexistence) **ou** via cadastro direto do cliente final no ecossistema Quintalzim (Plano B, seção 10.3) → alerta ao dono → confirmação em 1 toque vira venda. Lembretes anti-falta 24h/2h (sempre pagos no WhatsApp; grátis via push do PWA no Plano B)
3. **Conteúdo:** posts automáticos diários com dados reais da Vitrine/catálogo
4. **Gestão:** vendas → relatórios → despesas (mesmo motor das finanças PF) → DRE explicado em linguagem humana
5. **Catálogo & Loja:** produtos com estoque (serviços têm agenda/capacidade, não estoque); comércio conversacional — botão "Pedir pelo WhatsApp" ou pelo chat do Quintalzim; Recepcionista conhece o catálogo. Checkout online = Fase 2. Integração prioritária: catálogo WhatsApp Business; Meta Commerce depois (validar APIs antes de prometer)

Briefing empresarial diário (7h: agenda, vendas de ontem, dica de post) em todos os pacotes Empresa. Argumento de venda do Completo: substitui site+social media+secretária+gestão+contador (R$ 800–1.500/mês separado).

### Marketplace (dois modos, um guarda-chuva)
- **Perfis fixos:** estreia com personal trainers no vertical fitness (demanda já existe via quiz). IA recomenda no momento certo do plano de hábitos. Profissional evolui de "item do catálogo" para cliente Empresa
- **Balcão de Demandas:** pedido pontual em linguagem natural → IA estrutura (o quê, onde, quando, valor oferecido) → transmite por categoria+raio → interessados → escolha por perfil/avaliação
- **Proteções:** verificação de cadastro (doc+selfie; categorias sensíveis exigem comprovação, ex. CREF), avaliação mútua real, recomendação por critério transparente, somos ponte não empregador. **Ativação por densidade:** cidade a cidade, categoria a categoria (entregas primeiro), nunca aberto geral
- **Conexão direta com o Plano B (seção 10.3):** todo cliente final que se cadastra pra agendar um corte na barbearia já é, no mesmo login, um usuário em potencial do marketplace inteiro (personal trainer, outros negócios locais) — é o mecanismo natural de aquisição orgânica pro super-app, sem custo de mídia

### Concierge (transversal, papel muda por modelo — ver seção 10)
No modelo B2C, o Prontim é o concierge do próprio Quintalzim, falando com o assinante PF. No modelo B2B2C, o "Recepcionista IA" é uma instância do mesmo motor operando **em nome da Empresa**, no canal que o cliente final dela já usa. Quiz = mesmo motor em formato visual.

---

## 4. PAGAMENTOS

- **MVP:** assinaturas via Asaas (Pix recorrente/cartão/boleto). Pagamentos cliente-final↔negócio ficam FORA da plataforma
- **Fase 2:** split na origem via gateway (subcontas Asaas via API). NUNCA intermediar dinheiro (imposto só sobre comissão, sem risco regulatório). Comissão 2-3% negócios / 5-8% perfis / 8-12% demandas
- **Custo de mensageria WhatsApp (novo, ver seção 10.4):** absorvido internamente nos planos Empresa, nunca cobrado à parte do assinante

---

## 5. STACK E ARQUITETURA

| Camada | Ferramenta | Status |
|---|---|---|
| Frontend/portal | Next.js + PWA via Claude Code | ✅ Em produção (auth, SSO, landing) |
| Backend | Supabase | ✅ Em uso (auth do portal e do Quintal de Finanças) |
| Automações | n8n self-hosted | ✅ Rodando |
| WhatsApp — número do Quintalzim (B2C) | Evolution API (Baileys), self-hosted | ✅ Rodando, número reativado |
| WhatsApp — números de cada Empresa (B2B2C) | Meta WhatsApp Business Platform (Cloud API) via programa **Tech Provider + Embedded Signup v4**, com **Coexistence** para preservar o app/número já usado pelo dono | A construir (ver seção 10) |
| IA | API Anthropic: Haiku (volume), Sonnet (concierge/visão) | ✅ Key ativa |
| Pagamentos | Asaas | A criar conta |
| Métricas | PostHog | A configurar |
| Vitrines | Next.js multi-tenant (1 código, N clientes) | A construir |

**Decisões técnicas tomadas:**
- Imagem Docker da Evolution: `evoapicloud/evolution-api` (o repo `atendai/` foi descontinuado). Fixar versão, não usar :latest
- Caddy para HTTPS automático (não Nginx/Certbot)
- **WhatsApp: decisão revisada — os dois números (Prontim/B2C e os das Empresas/B2B2C) vão pra API oficial, nenhum fica no Baileys.** Motivo concreto: número do Prontim reativado esbarrou no erro 463 da própria WhatsApp ("reach-out time-lock", limite anti-abuso pra contato sem histórico — comum em clientes não-oficiais tipo Baileys) logo na primeira mensagem real depois da reativação, mesmo já aquecido manualmente. Isso confirma que Baileys não é confiável o bastante nem pro uso interno do Quintalzim, não só pros clientes Empresa
  - **Caminho técnico recomendado:** manter a Evolution API como camada (n8n continua chamando os mesmos endpoints REST), só trocar o **tipo de integração da instância** de `WHATSAPP-BAILEYS` pra `WHATSAPP-BUSINESS` (Cloud API oficial por trás). Isso evita reescrever os workflows do zero
  - Números das Empresas (Recepcionista, B2B2C): API oficial via **Embedded Signup + Coexistence**, preservando o número/app que a Empresa já usa (ver seção 10.2)
  - Número do Prontim (B2C): mesma migração pra Cloud API, também via Coexistence (preserva o app pra uso manual/monitoramento do time)
  - **Coexistence só ativa em cima de um número que já está no WhatsApp Business App** (não o WhatsApp comum) — o número do Prontim já está nessa condição
  - **Embedded Signup: construir direto na v4** — a v2 será descontinuada em 15/out/2026
  - Migrar o número do Prontim não precisa do fluxo completo de Tech Provider (isso só é necessário pra onboardar números de OUTRAS empresas); pro próprio número do Quintalzim basta o cadastro direto de app + WhatsApp Business Platform no Meta Business Manager
- Aquecimento de chip obrigatório (só se aplica ao número do Quintalzim/Baileys): usar como humano 3-7 dias antes de conectar; responder > iniciar; nunca disparar frio

---

## 6. INFRAESTRUTURA ATUAL (o que existe e funciona)

- **VPS:** Hostinger KVM 1, Ubuntu 24.04, IP **195.200.5.79**, hostname srv1841198. Firewall UFW: 22/80/443. Docker + Gerenciador Docker + detector de malware ativos
- **Projeto na VPS:** `/opt/quintalzim` — docker-compose.yml com 5 serviços rodando: caddy, postgres:16 (bancos: n8n, evolution), redis:7, n8n, evolution v2.3.7. Segredos em `.env` (N8N_ENCRYPTION_KEY, EVOLUTION_API_KEY, POSTGRES_PASSWORD) — valores no gerenciador de senhas do fundador, NUNCA neste documento
- **DNS (Cloudflare, plano Free, nameservers delegados pelo registro.br):** A records para @, www, n8n, evo → 195.200.5.79, todos DNS only (nuvem cinza). HTTPS emitido e funcionando
- **n8n:** https://n8n.quintalzim.com.br — conta admin criada; licença gratuita de recursos avançados solicitada
- **Evolution:** https://evo.quintalzim.com.br (manager em /manager, login com a API key)
- **Workflow existente:** "Prontim - Atendimento" (publicado): Webhook POST /webhook/prontim → Anthropic "Message a model" (claude-haiku-4-5, role System com personalidade do Prontim + role User com `{{ $json.body.data.message.conversation }}`) → HTTP Request POST http://evolution:8080/message/sendText/prontim (header apikey; body "Using Fields Below": number = `{{ $('Webhook').item.json.body.data.key.remoteJid }}`, text = `{{ $json.content[0].text }}`)
- **Número do Prontim reativado** (banimento anterior resolvido), instância `Prontim` conectada ("Connected") na Evolution, fluxo "Prontim - Atendimento" revalidado via curl e **republicado em produção**. Dois bugs corrigidos nessa revalidação: (a) o HTTP Request de envio apontava pra instância `prontim` minúsculo, mas o nome real é `Prontim` (case-sensitive) → 404; (b) o teste inicial usava o número placeholder do exemplo de curl (`5535999999999`), que não existe de verdade no WhatsApp → 400 "exists: false". **Falta validar recebendo mensagem real de um número de WhatsApp de verdade** (mandar mensagem pro número do Quintalzim a partir de um celular, não só via curl simulado) e conferir no manager da Evolution se o webhook do evento de mensagem recebida está de fato configurado apontando pra `https://n8n.quintalzim.com.br/webhook/prontim`
- **"Prontim - Extrator de Despesas" construído e publicado** (workflow separado, chamado como sub-workflow do "Prontim - Atendimento" via node Execute Sub-workflow "Chamar Extrator"): recebe `mensagem`+`remoteJid` → busca categorias do assinante no Supabase → Claude Haiku extrai `{title, amount, type, category, date}` (ou `{erro:"nao_entendi"}` se a mensagem não for uma despesa/receita) → se reconheceu, grava em `transactions` e confirma "Prontim ✅ Registrei: ..." pelo WhatsApp; se não reconheceu, o "Prontim - Atendimento" cai no fluxo de conversa normal (Claude responde livre). Testado ponta a ponta com execução real (não simulada): mensagem de teste "gastei 1 real em teste" gerou linha real na tabela `transactions` do fundador e confirmação enviada sem erro 463. **Gap conhecido:** hoje o `user_id` gravado é hardcoded pro fundador (não existe ainda mapeamento telefone→user_id) — bloqueia abrir o Prontim pra outros assinantes PF além dele; ver pendência na seção 7
- **Suporte a áudio no Prontim (transcrição via Groq Whisper), construído e publicado:** o "Prontim - Atendimento" agora detecta `messageType` do webhook da Evolution — se for `audioMessage`, baixa o áudio real (decriptado) via `POST /chat/getBase64FromMediaMessage/Prontim`, converte o base64 pra binário e transcreve com a **Groq API** (modelo `whisper-large-v3-turbo`, tier gratuito, sem custo no volume atual); se for texto normal, segue como antes. Os dois caminhos convergem num node único ("Mensagem Normalizada") antes de seguir pro Extrator de Despesas e pro fallback conversacional — ambos agora entendem tanto texto quanto áudio. Testado ponta a ponta com um áudio real do fundador ("Gastei 15 reais... Supermercado") → extraiu, gravou no Supabase e confirmou no WhatsApp corretamente. Credencial da Groq salva como credencial nativa do n8n (`Groq API`, tipo Header Auth), não hardcoded. **Lição aprendida:** o conector n8n usado (MCP) tem um bug ao criar duas conexões de saídas diferentes (`sourceOutput` 0 e 1) do mesmo node IF em chamadas separadas — sempre colapsa as duas no mesmo índice. Workaround: usar dois nodes IF paralelos (cada um só com sua própria saída verdadeira conectada) em vez de um IF só com dois ramos conectados
- **Mapeamento telefone→user_id, construído e publicado:** coluna `phone` adicionada à tabela `profiles` (Supabase), com índice único e política RLS pro próprio usuário editar sua linha. Novo campo "WhatsApp" na página de Perfil do portal (`app/app/perfil/page.tsx` + `components/app/FormularioEditarTelefone.tsx`) grava o número normalizado ali. No "Prontim - Extrator de Despesas", novo node "Buscar Usuário" (Code, chama a REST API do Supabase via `this.helpers.httpRequest` com o telefone extraído do `remoteJid`) resolve o `user_id` antes de tudo; se não achar, um node "Avisar Não Vinculado" manda mensagem educada pedindo pra vincular o WhatsApp no app, sem gravar nada e sem duplicar resposta (o "Precisa responder?" do fluxo pai trata `erro:"nao_vinculado"` como "já respondido", igual ao caso de sucesso). Os nodes que usam Supabase no Extrator (busca de categorias e gravação de transação) passaram a usar a credencial nativa `Supabase account` em vez de header hardcoded. Testado ponta a ponta nos dois caminhos (vinculado e não vinculado) com escrita/leitura reais
- **Memória de conversa do Prontim, construída e publicada:** o node único "Message a model" (Anthropic completion simples, sem memória) do "Prontim - Atendimento" foi substituído por um AI Agent (`@n8n/n8n-nodes-langchain.agent`) com dois subnodes: "Modelo Prontim" (Anthropic Chat Model, credencial `Anthropic account`) e "Memória Prontim" (Redis Chat Memory — `sessionIdType: customKey`, `sessionKey` = `remoteJid` de quem manda a mensagem, `sessionTTL` 24h, `contextWindowLength` 8 interações). Usa o Redis que já rodava no VPS desde o setup inicial (`quintalzim-redis-1`, imagem `redis:7`, sem senha, mesma rede docker `quintalzim_qz` do n8n — alcançável como host `redis` porta `6379`). Credencial Redis criada nativa no n8n (tipo Redis, sem senha). O node HTTP Request que envia a resposta no WhatsApp passou a ler `{{ $json.output }}` (formato do AI Agent) em vez de `{{ $json.content[0].text }}` (formato do node antigo). Testado em produção: Prontim lembrou corretamente o nome informado numa mensagem anterior. **Bug real encontrado e corrigido nesse processo** (não era da memória): no "Prontim - Extrator de Despesas", os dois nodes IF paralelos "Usuário Vinculado?" e "Não Vinculado?" (workaround do bug de conexão dupla do MCP do n8n — ver lição abaixo) tinham cada um uma saída falsa sem conexão nenhuma. Isso fazia o Execute Sub-workflow do "Prontim - Atendimento" às vezes devolver o dado desse beco sem saída em vez do resultado real do node "Fim", deixando o Prontim sem responder em mensagens que não eram despesa (ex: "qual é meu nome?"). Corrigido conectando as duas saídas soltas no "Fim", convergindo todo caminho possível num único ponto de retorno — mesmo padrão já usado no node "Mensagem Normalizada" do fluxo de áudio/texto
- **Portal Quintalzim:** Next.js em produção — auth Supabase completa (login, cadastro, magic link, reset), SSO com Quintal de Finanças funcionando, ícone/favicon atualizados pro Q ornamentado, seções `/app/prontim`, `/app/catalogo`, `/app/perfil`, `/app/inicio` no ar (a maior parte ainda como placeholder "Em breve")
- **Quintal de Finanças:** app em produção, vários bugs de UI corrigidos nesta fase (modal de cartão, exclusão de despesa recorrente, ícones)
- **Base de conta Empresa, construída (UI pronta, ativação real pendente da Meta):** tabela `empresas` no Supabase (`owner_id`, `nome`, `slug`, `whatsapp_status` — 1 empresa por dono por enquanto, RLS própria), script em `docs/sql/criar-tabela-empresas.sql`. Nova rota `/app/empresa` (`app/app/empresa/page.tsx`): sem empresa cadastrada mostra `FormularioCriarEmpresa`; com empresa mostra o painel + `WizardWhatsAppEmpresa`. O wizard (`components/app/WizardWhatsAppEmpresa.tsx`) tem hoje: explicação do que vai acontecer, pergunta se já usa WhatsApp Business (com orientação de migração se não), e um botão "Ativar via Meta" **desabilitado de propósito** com aviso de que depende da aprovação do Quintalzim como Tech Provider — nada de Embedded Signup real ainda, é só a casca do portal pronta pra plugar assim que a Meta liberar. Link de entrada adicionado como card no Perfil ("Tem um negócio?")
- **Plano B (cliente final sem WhatsApp da Empresa), construído — arquitetura corrigida na v1.12, ver changelog:** página pública `app/b/[slug]/page.tsx` (fora do layout autenticado, `empresas` ganhou política de leitura pública `empresas_select_public` pra isso funcionar) com `FormularioClienteFinal` (nome, WhatsApp, e-mail → `signInWithOtp`, reaproveitando a mesma infra de magic link de `/entrar`; nome/telefone viajam no `user_metadata`, não em `localStorage`; `emailRedirectTo` volta pra `/b/[slug]`). Quem finaliza o vínculo (tabela `empresa_clientes`) é `FinalizarVinculoCliente` (`components/public`), silencioso, rodando direto em `/b/[slug]` pra quem já está autenticado — também garante a linha em `profiles` com `acesso_portal='restrito'` se a conta acabou de nascer ali. Painel da Empresa ganhou `CardLinkEmpresa` com o link `/b/slug` pronto pra copiar. Scripts `docs/sql/plano-b-cliente-final.sql` e `docs/sql/tipos-de-acesso.sql`.
- **Separação assinante × cliente final (`acesso_portal`), construído na v1.12:** substitui o mecanismo antigo de "boas-vindas" (popup único). Cliente final nasce com `profiles.acesso_portal='restrito'`; `app/app/layout.tsx` intercepta QUALQUER rota `/app/*` pra esse caso e mostra só `PortalRestritoClienteFinal` (próprios pedidos + avisos + convite pra desbloquear). `components/app/DesbloquearPortalCompleto.tsx` — criar senha ali (mesma chamada `updateUser({password})` de "Alterar senha" no Perfil) marca `acesso_portal='completo'` e libera o portal inteiro. Assinante direto (`/entrar`) nunca passa por isso — coluna tem `DEFAULT 'completo'`
- **Vitrine da Empresa, construída:** `/b/slug` agora mostra descrição, endereço, horário de funcionamento, telefone de contato e Instagram (quando preenchidos) acima do formulário de contato do cliente final. Dono edita tudo isso em `/app/empresa` via `FormularioEditarVitrine`. Ainda simples (texto puro, sem foto/logo, sem geração por IA) — é a base da camada 1 da esteira B2B2C (seção 3), evolui depois
- **Recepcionista IA v1 (pedido de horário), construído:** tabela `agendamentos` com RLS (cliente vê/insere só o próprio, dono vê/atualiza os da empresa). Em `/b/slug`, cliente logado vê `FormularioSolicitarAgendamento` em vez do cadastro; dono recebe push na hora do pedido e decide em `/app/empresa` → `PainelAgendamentos` (Confirmar/Recusar de 1 toque), cliente recebe push da decisão. Não tem checagem de disponibilidade/conflito nem lembrete automático — é fila de pedido→aprovação, não agenda de verdade ainda
- **Push notifications reais do PWA, construído (infra pronta, disparo automático ainda não):** service worker `public/sw.js` (só push, sem cache offline por enquanto), `lib/push.ts` (pedir permissão, inscrever, salvar no Supabase), card "Avisos" no Perfil com botão de ativar/desativar e "mandar teste", tabela `push_subscriptions` (RLS própria) e rota `app/api/push/enviar/route.ts` (usa `web-push` + `SUPABASE_SERVICE_ROLE_KEY`, aceita chamada do próprio usuário autenticado ou o segredo `PUSH_API_SECRET` pra uso futuro por automações). Chaves VAPID geradas e já em `.env.local` — **preciso confirmar que as mesmas variáveis foram configuradas no Vercel** (produção), ver pendência nova na seção 7. Falta a automação que decide quando/o que mandar (lembretes 24h/2h, resumos diários) — hoje só o botão manual de teste dispara de verdade

**Comando de teste padrão (simula mensagem chegando):**
```bash
curl -X POST https://n8n.quintalzim.com.br/webhook/prontim \
  -H "Content-Type: application/json" \
  -d '{"data": {"key": {"remoteJid": "5535999999999@s.whatsapp.net"}, "message": {"conversation": "TEXTO_DE_TESTE"}}}'
```

**Lições aprendidas nesta fase:** (a) JSON body em nós HTTP do n8n deve usar "Using Fields Below", nunca JSON manual com expressões (quebra com \n e aspas da resposta da IA); (b) docker compose só funciona dentro de /opt/quintalzim; (c) chip novo conectado à Evolution sem aquecimento = banimento; (d) o ambiente de desenvolvimento (sandbox do Claude) não tem saída de rede pro VPS — testes de curl precisam ser rodados localmente/na própria VPS; (e) **erro 463 (reach-out time-lock)** — mensagem de resposta real pro celular do fundador travou em `status: 0, messageStubParameters: ["463"]` no log da Evolution, mesmo após aquecimento manual. É limite anti-abuso do próprio WhatsApp pra contato sem histórico, bem documentado em issues do Baileys/Evolution API v2.3.7. **Decisão tomada:** migrar para API oficial (Cloud API) também no número do Prontim, não só nos das Empresas — ver seção 5

---

## 7. PENDÊNCIAS E BLOQUEIOS ATUAIS

1. ~~WhatsApp banido~~ — **resolvido, número reativado.** ~~Revalidar o fluxo "Prontim - Atendimento" ponta a ponta~~ — **feito:** fluxo corrigido (instância `Prontim` com nome divergente causava 404; corpo de teste usava número placeholder inexistente) e republicado. **Novo bloqueio encontrado:** erro 463 (reach-out time-lock) ao enviar pra número real — decisão tomada de migrar o número do Prontim pra API oficial (Cloud API), não só os das Empresas. Ver seção 5 pro plano técnico
2. Registro de marca INPI (classes 35, 38, 42) — verificar e protocolar
3. ~~Reservar @quintalzim no Instagram~~ — **feito.** Facebook e Instagram do Quintalzim já criados
4. ~~Validação de campo: 5 conversas com donos de negócio na cidade-piloto~~ — **feito**, 5 conversas realizadas. Falta registrar aqui os aprendizados dessas conversas (reação ao pedido de conectar WhatsApp vs. preferência pelo Plano B, objeções, interesse) — **anotar assim que houver retorno pra não perder o insight**
5. Conta Asaas + Supabase + PostHog a criar
6. Cadastro do Quintalzim como Tech Provider na Meta (Business Verification + App Review + Access Verification) — **em andamento**, Verificação da Empresa "em análise"; processo leva dias/semanas, é o que destrava escala de 10 pra 200 onboardings de Empresa por semana. Enquanto isso não sai, Coexistence pros números das Empresas fica bloqueado
7. Acompanhar publicação das tarifas de mensagem de serviço da Meta (prometida até 1/set/2026, cobrança entra em vigor em 1/out/2026) e atualizar a planilha de custo por assinante Empresa quando sair
8. ~~Extrator de despesas (Prontim)~~ — **feito e publicado.** Ver seção 6
9. ~~Mapeamento telefone→user_id~~ — **feito e publicado.** Ver seção 6. Prontim/Extrator agora funcionam pra qualquer assinante que vincule o WhatsApp no Perfil, não só o fundador
10. Débito técnico (parcial) — apikey da Evolution (WhatsApp) ainda está hardcoded nos nodes HTTP Request do n8n; os nodes de Supabase do Extrator já foram migrados pra credencial nativa. Falta aplicar o mesmo pro apikey da Evolution (existe credencial `Header Auth account` cadastrada, só falta usar). Não bloqueia funcionamento, é risco de segurança se o workflow for exportado/compartilhado
11. ~~Memória de conversa do Prontim~~ — **feito e publicado.** Ver seção 6. Pré-requisito da Recepcionista cumprido
12. ~~Push notifications reais do PWA~~ — **infra feita.** Ver seção 6. Falta configurar `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `SUPABASE_SERVICE_ROLE_KEY` e `PUSH_API_SECRET` no ambiente de produção (Vercel) — só existem em `.env.local` local até isso ser feito
13. Automação de disparo dos push (lembretes 24h/2h, resumos diários) — a rota de envio existe (`/api/push/enviar`) mas ninguém chama ela automaticamente ainda; provável próximo passo natural depois que a Recepcionista/agendamento existir, ou via n8n com o `PUSH_API_SECRET`

---

## 8. ROADMAP

**MVP (90 dias):**
- Mês 1: portal base (PWA, login, assinatura) ✅ + concierge (placeholder, falta ligar no n8n) + calorias por foto (não iniciado) + finanças integradas ✅
- Mês 2: Vitrine + Recepcionista (com decisão de canal por Empresa — Coexistence ou Plano B) + posts + Briefings; beta fechado 10-20 usuários locais
- Mês 3: Quiz-Funil + gestão/DRE + utilitários + lançamento pago local

**Fase 2 (condicionada a base ativa):** split de pagamentos + clube de assinaturas; marketplace fitness (~100-200 assinantes/cidade); Balcão de Demandas (entregas primeiro); integrações Meta + checkout; criadores externos; API oficial WhatsApp para produção em escala (200+ onboardings/semana, pós Business Verification)

**Fase 3+:** hub modular pleno (cliente monta assinatura); expansão cidade a cidade; novos verticais

**Próximos passos imediatos de desenvolvimento (ordem sugerida):**
1. ~~Revalidar o fluxo "Prontim - Atendimento" no n8n~~ — feito
2. ~~Extrator de despesas (texto → JSON → API de finanças existente)~~ — feito, testado ponta a ponta e publicado
3. ~~Mapeamento telefone→user_id~~ — feito, testado e publicado
4. ~~Memória de conversa do Prontim (Redis no fluxo)~~ — feito, testado e publicado. Pré-requisito da Recepcionista cumprido
5. Wizard de onboarding de WhatsApp da Empresa dentro do portal (seção 10.2) — **casca pronta:** conta Empresa + explicação + checagem de WhatsApp Business construídas; falta plugar o Embedded Signup real (bloqueado pela pendência 6). ~~fallback pro Plano B~~ — **feito** (cadastro do cliente final via link `/b/slug`). ~~push notification de verdade~~ — **infra feita**, falta configurar env vars em produção (pendência 12) e a automação de disparo (pendência 13)
6. ~~Vitrine da Empresa (mini-site)~~ — **feito** (versão simples, texto puro). Ver seção 6
7. ~~Recepcionista IA (agendamento) — v1~~ — **feito**, via canal do Plano B (pedido→aprovação→aviso, sem checagem de disponibilidade nem lembrete automático ainda). Ver seção 6
8. Cadastro do Quintalzim como Tech Provider na Meta — em andamento (Verificação da Empresa em análise)

---

## 9. COMO USAR ESTE DOCUMENTO

Em novas conversas, este contexto substitui explicações. Convenções ao trabalhar no projeto:
- Classificar novos insights em: (a) público, (b) camada/pacote, (c) o que reaproveita vs. o que é novo na arquitetura
- Nunca colocar segredos/senhas neste documento — apenas referências ao gerenciador de senhas
- Comunicação da marca: sempre resultado, nunca tecnologia; tom Prontim
- Decisões de negócio já tomadas (escada de preços, split, curadoria, densidade do marketplace) não se rediscutem do zero — evoluem
- **Ao desenhar qualquer fluxo de comunicação, primeiro perguntar: isso é B2C direto ou B2B2C? A resposta muda o canal, o número e quem é o "dono" da conversa (ver seção 10)**

---

## 10. MODELOS DE NEGÓCIO E CANAIS DE COMUNICAÇÃO

Esta seção existe porque, na prática, o Quintalzim opera dois modelos de negócio diferentes sob a mesma marca, e confundi-los gera desenho de produto errado.

### 10.1 Os dois modelos

**B2C direto (assinante Pessoa Física):** o assinante fala diretamente com o Quintalzim. O Prontim é o concierge *do Quintalzim*, atendendo *o próprio cliente do Quintalzim*. Canal: chat dentro do app/PWA (principal) e/ou número de WhatsApp do Quintalzim (conveniência). Aqui não existe ambiguidade de "de quem é a conversa" — é sempre do Quintalzim.

**B2B2C (assinante Empresa, ex. barbearia, academia):** o Quintalzim vende para a Empresa (B2B), mas quem usa o Recepcionista IA no dia a dia é o **cliente final da Empresa** — alguém que não é assinante do Quintalzim, não conhece a marca, e só confia no negócio que já frequenta. Regra inegociável: **a comunicação com o cliente final tem que acontecer onde ele já está e já confia** — nunca pedir pra ele "descobrir" o Quintalzim pra marcar um corte de cabelo.

### 10.2 Caminho principal do B2B2C: WhatsApp da própria Empresa (Coexistence)

O Recepcionista IA responde a partir do número que a Empresa já usa e que os clientes dela já têm salvo. Tecnicamente, via **Coexistence** (recurso da Meta desde mai/2025): o mesmo número fica ativo ao mesmo tempo no WhatsApp Business App (o dono continua podendo responder manualmente pelo celular) e na Cloud API (de onde o Recepcionista responde). Nada se perde — nem número, nem histórico.

Pré-requisito técnico: o número precisa estar no **WhatsApp Business App** (grátis, oficial, diferente do WhatsApp comum). Quem ainda usa o WhatsApp normal migra primeiro — leva minutos, mantém histórico. Isso precisa ser o primeiro passo checado no onboarding.

Ativação, na prática: via **Embedded Signup** (Meta Tech Provider), um wizard dentro do próprio Quintalzim guia o dono: (1) explica em linguagem simples o que vai acontecer, (2) checa se já tem WhatsApp Business — se não, orienta a migração, (3) botão único abre o popup oficial da Meta (facebook.com, o dono nunca digita senha dentro do site do Quintalzim), (4) confirma código de verificação, (5) tela de sucesso. Toda a parte técnica (criar WABA, registrar número, configurar webhook) roda automática via API no backend — o dono só faz login + aceitar permissões + confirmar código.

Onboarding assistido, não deixar o dono sozinho num popup técnico: no início (fase de validação de campo), essa ativação deveria ser feita *junto* com o time do Quintalzim (ligação, WhatsApp, ou presencial), no tom "vizinho competente" da marca.

### 10.3 Plano B: cliente final vira usuário do Quintalzim (sem depender do WhatsApp da Empresa)

Pra donos resistentes a mexer no número que já usam (medo de custo, de "quebrar" algo, ou simplesmente não querer passar pelo fluxo da Meta), existe uma alternativa que não é só um substituto — é estrategicamente valiosa por si só:

**Mecânica:** a Empresa recebe um link/QR code próprio (ex. `quintalzim.com.br/b/nome-da-empresa`) pra compartilhar com os clientes dela (balcão, Instagram, WhatsApp Status). O cliente final acessa, faz um cadastro simples (nome, telefone, e-mail — sem senha complexa, pode ser magic link/OTP), e vira um usuário do Quintalzim. Daí em diante, a comunicação acontece dentro do ecossistema: **push notification do PWA** (confirmação, lembrete 24h/2h antes) e **chat web** pra tirar dúvida ou marcar horário.

**Por que isso é mais que um fallback:**
- Zero fricção técnica pro dono — não migra WhatsApp, não autoriza nada na Meta
- Lembretes e confirmações via push são **gratuitos pra sempre**, não dependem da Meta e não são afetados pela mudança de outubro/2026 (seção 10.4)
- Gera aquisição orgânica de assinantes PF: o cliente da barbearia que se cadastra já está dentro do app — é um lead quente pro resto do catálogo (finanças, calorias, etc.), sem custo de mídia
- Alimenta o Marketplace desde o primeiro dia: mesmo login que agenda corte pode descobrir o personal trainer recomendado pelo Prontim — é literalmente a visão de "super-app local" já documentada na seção 3
- Constrói a base de CRM do Quintalzim, em vez desses relacionamentos ficarem presos dentro do WhatsApp de cada negócio individual

**Trade-offs a ter em mente:**
- Fricção maior pro cliente *final* (precisa se cadastrar em algo novo, em vez de só mandar mensagem no WhatsApp que ele já usa todo dia) — taxa de adoção tende a ser menor que a do Coexistence, que é invisível pra ele
- Push web (PWA) no iOS exige iOS 16.4+ **e** o PWA instalado na tela de início — não é automático como no Android; uma fatia de usuários iOS pode não receber push se não instalar corretamente. Vale tratar isso explicitamente no onboarding do cliente final (orientar a "adicionar à tela de início")
- Depende de quão bem a própria Empresa divulga o link pros clientes dela

**Recomendação:** não tratar como "ou isso ou aquilo" — oferecer os dois caminhos em paralelo. Coexistence é o caminho de menor fricção pro cliente final e deveria ser o padrão sugerido; o Plano B é a opção pra quem tem resistência ao WhatsApp *e*, ao mesmo tempo, é uma alavanca estratégica de aquisição que vale incentivar mesmo pra quem já tem Coexistence ativo (ex.: oferecer o cadastro no app como complemento, não substituto).

### 10.4 Custo: o que muda em outubro/2026

A Meta anunciou que a partir de **1º de outubro de 2026** passa a cobrar por mensagens de serviço (respostas dentro da janela de 24h) — hoje gratuitas e ilimitadas desde nov/2024. Valores exatos por região prometidos até 1/set/2026. Isso vale só pro caminho oficial (Coexistence/Cloud API); não afeta o Plano B (push é sempre gratuito) nem o número Baileys do Prontim B2C (não passa pela Meta, mas carrega risco de banimento — trade-off já conhecido).

Mensagens por iniciativa do negócio (lembrete de horário, campanha) sempre foram pagas, mesmo antes dessa mudança — isso não é novo.

**Regra prática até lá:** manter o Recepcionista estritamente reativo (só responde quem chama primeiro) pra ficar dentro da janela de serviço gratuita enquanto durar. A partir de outubro, o custo por conversa (estimativa de referência: poucos centavos de dólar, por comparação com outros produtos de conversa da Meta) entra na conta interna do Quintalzim e é absorvido na mensalidade Empresa — nunca cobrado à parte do assinante.

### 10.5 Resumo — quem fala com quem, em qual canal

| Conversa | Modelo | Canal/Número |
|---|---|---|
| Assinante PF ↔ Prontim | B2C direto | Chat no app/PWA, ou número do Quintalzim no WhatsApp |
| Dono da Empresa ↔ Quintalzim (configurar, ver vendas, dashboard) | B2B | Dentro do app/PWA — não precisa de WhatsApp |
| Cliente final ↔ Recepcionista IA (caminho principal) | B2B2C | Número **da própria Empresa**, via Coexistence |
| Cliente final ↔ Recepcionista IA (Plano B) | B2B2C | Chat web/push do **Quintalzim**, após cadastro próprio |
