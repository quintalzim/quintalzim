# QUINTALZIM — Documento de Contexto do Projeto

*Versão 6.0 — julho/2026. Este documento dá contexto completo a qualquer nova conversa. Atualizar ao fim de sessões que mudem decisões, arquitetura ou estado.*

---

## 1. O QUE É O QUINTALZIM

Portal único (super app PWA) por assinatura para pessoas e pequenas empresas de **cidades pequenas do Brasil**. O cliente paga o portal, não cada item: dentro dele há apps, ferramentas de IA, automações, conteúdos e serviços, com uma IA concierge que entende a dor e monta a solução.

**Fundador:** empreendedor solo, usando IA em todo o processo de construção. Possuía um SaaS de finanças pessoais separado (JadeOne) — já migrado para dentro do Quintalzim como módulo "Quintal de Finanças" (ver seção 6). Objetivo: MRR significativo (referência: ~R$ 19 mil em 12-18 meses), não unicórnio.

**Marca:**
- Nome: **Quintalzim** (domínio quintalzim.com.br registrado; DNS no Cloudflare)
- Concierge/mascote: **Prontim** — a voz da IA. Confirma tarefas com "Prontim ✅"
- Slogan (proposta): "Resolve no Quintalzim"
- Tom de voz: vizinho competente do interior — simples, caloroso, direto, sem tecniquês. Nunca vende "IA/tecnologia"; vende o resultado ("responda seus clientes 24h")
- Identidade visual: verde-folha + terracota/laranja, toque de amarelo em CTAs, tipografia arredondada (Baloo 2 títulos + Nunito texto), fundo papel #FBF7EC. Fugir do azul-tech. Tokens: verde #3F6B34, verde-escuro #2E4F26, terracota #C4693B, amarelo #F2B33D, tinta #33402B
- **Logo definido:** "Q" ornamental em cobre+verde (estilo clássico/premium) com lockup horizontal "Quintalzim / Resolve no Quintalzim". Equilíbrio da marca: logo elegante + voz leve do Prontim. Arte no repositório (public/) e recorte do Q para avatares
- Slogan oficial: "Resolve no Quintalzim"
- Assinatura visual da landing: varal com cartões pendurados (prendedores amarelos)
- E-mails: contato@quintalzim.com.br (caixa real na Hostinger, SMTP smtp.hostinger.com:465 configurado no n8n) + meuquintalzim@gmail.com (cadastros diversos)

**Princípios inegociáveis:**
1. Curadoria de tudo (conteúdo honesto; nunca promessas de enriquecimento fácil)
2. Dado único, várias bocas: informação entra uma vez, sai em todas as interfaces
3. Confiança em cidade pequena se constrói com prova local; um incidente queima a marca
4. Limites de uso justos por plano + modelos de IA baratos para volume (proteção de margem)

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

Custo estimado de IA por assinante ativo: PF R$ 3–8/mês; Empresa R$ 10–30/mês.

---

## 3. CATÁLOGO — MÓDULOS DEFINIDOS

**Padrão arquitetural de todos os módulos:** motor com API + interface conversacional (WhatsApp) por cima + dashboard visual.

### Lado Pessoa Física
- **Quintal de Finanças** (ex-JadeOne): motor+dashboard React já migrado para o Supabase do Quintalzim; WhatsApp vira interface ("almocei, gastei 25" → registrado; consultas com contexto; resumos proativos). O n8n pode escrever direto nas tabelas (`transactions` etc.) — dispensa API intermediária
- **Calorias por foto:** foto do prato → IA conta calorias. O "wow" de demonstração
- **Quiz-Funil saúde/fitness** (estilo BetterMe): jornada visual → diagnóstico → oferta personalizada → plano real de hábitos com check-ins no WhatsApp. Motor genérico em JSON, replicável (quiz finanças, diagnóstico do negócio). Funil principal de aquisição PF
- **Briefings Inteligentes:** resumo diário por temas no WhatsApp (com opção áudio), cruzando dados pessoais. Arquitetura um-para-muitos: 1 workflow por tema gera resumo-base (1 chamada cara/dia), distribuição personaliza com Haiku. Custo ≈ zero por assinante. Isca: 7 dias grátis
- **Utilitários** (regra: máx 2-3 dias de produção cada; 1-2/semana pós-lançamento): conversor extrato→Excel (alimenta finanças/DRE), calculadoras (juros, dívidas, preço de serviço), gerador de recibos, gerador de bio/legenda. Funções: volume percebido, aquisição orgânica (versão grátis limitada), moeda de promoção

### Lado Empresa — esteira "Vitrine do Cliente" (espinha dorsal)
Cinco camadas empilháveis; cada uma cria necessidade da próxima:
1. **Presença:** mini-site multi-tenant gerado por IA (portal.com.br/nome-do-negocio)
2. **Atendimento:** Recepcionista IA — conversa e agendamento em chat web próprio (Vitrine + rota /app/prontim do portal), NÃO em conversa de WhatsApp de duas vias (decisão de arquitetura — ver seção 5.1). Alerta ao dono → confirmação em 1 toque vira venda. WhatsApp entra só como notificação de mão única (confirmação + lembretes anti-falta 24h/2h), número único do Quintalzim, mensagem categoria "utilidade" — sem ambiguidade de roteamento
3. **Conteúdo:** posts automáticos diários com dados reais da Vitrine/catálogo
4. **Gestão:** vendas → relatórios → despesas (mesmo motor das finanças PF) → DRE explicado em linguagem humana
5. **Catálogo & Loja:** produtos com estoque (serviços têm agenda/capacidade, não estoque); comércio conversacional — botão "Pedir pelo WhatsApp", Recepcionista conhece o catálogo. Checkout online = Fase 2. Integração prioritária: catálogo WhatsApp Business; Meta Commerce depois (validar APIs antes de prometer)

Briefing empresarial diário (7h: agenda, vendas de ontem, dica de post) em todos os pacotes Empresa. Argumento de venda do Completo: substitui site+social media+secretária+gestão+contador (R$ 800–1.500/mês separado).

### Marketplace (dois modos, um guarda-chuva)
- **Perfis fixos:** estreia com personal trainers no vertical fitness (demanda já existe via quiz). IA recomenda no momento certo do plano de hábitos. Profissional evolui de "item do catálogo" para cliente Empresa
- **Balcão de Demandas:** pedido pontual em linguagem natural → IA estrutura (o quê, onde, quando, valor oferecido) → transmite via WhatsApp por categoria+raio → interessados → escolha por perfil/avaliação
- **Proteções:** verificação de cadastro (doc+selfie; categorias sensíveis exigem comprovação, ex. CREF), avaliação mútua real, recomendação por critério transparente, somos ponte não empregador. **Ativação por densidade:** cidade a cidade, categoria a categoria (entregas primeiro), nunca aberto geral

### Concierge (transversal)
A pessoa conversa, não navega. Roteia para todos os módulos. Quiz = mesmo motor em formato visual.

---

## 4. PAGAMENTOS

- **MVP:** assinaturas via Asaas (Pix recorrente/cartão/boleto). Pagamentos cliente-final↔negócio ficam FORA da plataforma
- **Fase 2:** split na origem via gateway (subcontas Asaas via API). NUNCA intermediar dinheiro (imposto só sobre comissão, sem risco regulatório). Comissão 2-3% negócios / 5-8% perfis / 8-12% demandas

---

## 5. STACK E ARQUITETURA

| Camada | Ferramenta | Status |
|---|---|---|
| Frontend/portal | Next.js (App Router, TS, Tailwind) no GitHub (quintalzim/quintalzim) + deploy automático Vercel | ✅ No ar em quintalzim.com.br |
| Backend | Supabase (região São Paulo) — Auth completo em produção + SMTP próprio | ✅ Funcionando |
| Automações | n8n self-hosted | ✅ Rodando |
| WhatsApp | Evolution API v2.3.7 | ✅ Rodando (sem número conectado) |
| IA | API Anthropic: Haiku (volume), Sonnet (concierge/visão) | ✅ Key ativa |
| Pagamentos | Asaas | A criar conta |
| Métricas | PostHog | A configurar |
| E-mail transacional | SMTP Hostinger via n8n (contato@quintalzim.com.br) | ✅ Funcionando |
| Vitrines | Next.js multi-tenant (1 código, N clientes) | A construir |

**Decisões técnicas tomadas:**
- Imagem Docker da Evolution: `evoapicloud/evolution-api` (o repo `atendai/` foi descontinuado). Fixar versão, não usar :latest
- Caddy para HTTPS automático (não Nginx/Certbot)
- WhatsApp: Evolution (não-oficial) para dev/testes/baixo volume; **avaliar WhatsApp Business Cloud API oficial para clientes em produção (Fase 2)** — decisão tomada após banimento do chip de teste
- Aquecimento de chip obrigatório: usar como humano 3-7 dias antes de conectar; responder > iniciar; nunca disparar frio

---

## 5.1 DECISÃO DE ARQUITETURA — WHATSAPP NA RECEPCIONISTA (jul/2026)

**Problema identificado:** o modelo original (Recepcionista conversando via WhatsApp) esbarra em três riscos sérios ao pensar em múltiplos clientes Empresa reais:
1. Número dedicado por cliente → risco de banimento espalhado por cada negócio (Meta pune automação não-oficial; mesmo em modo oficial, burocracia de conta Business Manager por cliente)
2. Número único compartilhado entre todos os negócios → ambiguidade de roteamento (cliente manda "oi" sem contexto, sistema não sabe para qual negócio é)
3. Possível fim da janela de resposta gratuita de 24h a partir de out/2026 (fonte não-oficial, precisa confirmação na documentação da Meta antes de fechar preço)

**Decisão adotada:** separar as 3 funções que estavam misturadas sob "WhatsApp":
- **Conversa/triagem com IA** → sai do WhatsApp, vira chat web próprio (widget na Vitrine de cada negócio + rota /app/prontim do portal). Zero ambiguidade (a pessoa já está na página do negócio certo), zero risco de banimento, zero burocracia de conta Meta para o cliente.
- **Motor de agendamento** → já era nosso (Supabase), não depende de WhatsApp.
- **Notificação (confirmação/lembrete)** → único uso de WhatsApp que sobra, mão única, número único do Quintalzim, mensagem categoria "utilidade" (mais barata, sem exigir conversa de duas vias, sem ambiguidade porque já nasce endereçada a um agendamento existente).

**Despacho/disparo de promoções:** mesma lógica — não tem problema de ambiguidade (remetente e lista são sempre conhecidos), encaixa direto no número único do Quintalzim.

**Caminho futuro (não decidido, não é MVP):** se/quando houver 5-10+ negócios Empresa pagantes validados, avaliar virar **Meta Tech Provider** (programa oficial com Embedded Signup) para oferecer número dedicado por cliente com onboarding simplificado (poucos cliques, sem o dono criar conta Business Manager manualmente) — nesse ponto a ambiguidade desaparece estruturalmente. Processo de aprovação como Tech Provider leva semanas — investimento que só compensa com demanda comprovada.

**Nova peça de catálogo decorrente:** Painel de Descoberta (`/app/descobrir`) — índice público de todas as Vitrines ativas, buscável por categoria/cidade; o Concierge vira interface de busca desse índice. Fase pós-MVP (precisa massa crítica de Vitrines).

**Ordem de construção acordada:** telas e funções primeiro (com dados mock/manuais), automações (n8n, notificações WhatsApp, Despacho) por último — reduz dependência de infraestrutura externa durante a fase de validação de UX/fluxo.

## 6. INFRAESTRUTURA ATUAL (o que existe e funciona)

- **VPS:** Hostinger KVM 1, Ubuntu 24.04, IP **195.200.5.79**, hostname srv1841198. Firewall UFW: 22/80/443. Docker + Gerenciador Docker + detector de malware ativos
- **Projeto na VPS:** `/opt/quintalzim` — docker-compose.yml com 5 serviços rodando: caddy, postgres:16 (bancos: n8n, evolution), redis:7, n8n, evolution v2.3.7. Segredos em `.env` (N8N_ENCRYPTION_KEY, EVOLUTION_API_KEY, POSTGRES_PASSWORD) — valores no gerenciador de senhas do fundador, NUNCA neste documento
- **DNS (Cloudflare, plano Free, nameservers delegados pelo registro.br):** A records para @, www, n8n, evo → 195.200.5.79, todos DNS only (nuvem cinza). HTTPS emitido e funcionando
- **n8n:** https://n8n.quintalzim.com.br — conta admin criada; licença gratuita de recursos avançados solicitada
- **Evolution:** https://evo.quintalzim.com.br (manager em /manager, login com a API key)
- **Workflow existente:** "Prontim - Atendimento" (publicado): Webhook POST /webhook/prontim → Anthropic "Message a model" (claude-haiku-4-5, role System com personalidade do Prontim + role User com `{{ $json.body.data.message.conversation }}`) → HTTP Request POST http://evolution:8080/message/sendText/prontim (header apikey; body "Using Fields Below": number = `{{ $('Webhook').item.json.body.data.key.remoteJid }}`, text = `{{ $json.content[0].text }}`)
- **Teste validado via curl:** webhook e Claude funcionam ponta a ponta; Prontim respondeu no personagem. Envio final pendente por falta de número conectado
- **Workflow "Lista de Espera" (publicado):** Webhook POST /webhook/lista-espera (CORS Allowed Origins *) recebe email+origem em x-www-form-urlencoded → Send Email via SMTP Hostinger avisa contato@quintalzim.com.br de cada inscrito. Testado e funcionando
- **Site em produção:** quintalzim.com.br e www na Vercel (DNS: A @ → 76.76.21.21, www → Vercel, nuvem cinza; e-mail Hostinger MX/DKIM/SPF/DMARC preservados). Repositório GitHub conta "quintalzim". Fluxo: push no main = deploy automático. Landing "Vem aí" com hero, varal de cartões, captura de e-mail (posta no webhook lista-espera), seção Prontim (mockup WhatsApp), seção "Um quintal, dois portões", footer. Desenvolvimento via Claude Code (app desktop) na pasta do repositório
- **Fundação Next.js criada via Claude Code:** design system (tokens da marca), rotas /, /entrar, /app (início, catálogo, prontim, perfil), clientes Supabase, PWA manifest, componentes base (Botao, Card, Campo, Selo)
- **Auth Supabase completo e validado em produção:** login e-mail+senha, cadastro (nome em user_metadata), magic link, reset de senha, proteção de rotas /app/* via middleware, /app/perfil com logout. Fluxo de e-mails no formato token_hash direto ao callback (`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup|recovery|magiclink`) — imune a scanners de e-mail e a abrir o link em outro navegador/dispositivo. Callback trata code E token_hash; type=recovery SEMPRE cai em /redefinir-senha (ignora next); signup/magiclink → /app/inicio. Templates de e-mail do Supabase traduzidos (corpo E subject) e SMTP próprio configurado (contato@quintalzim.com.br via smtp.hostinger.com:465; rate limit elevado ~30/h)
- **Domínio canônico:** quintalzim.com.br (Production na Vercel); www → 308 redirect para o raiz; www em CNAME cname.vercel-dns.com no Cloudflare. Redirect URLs no Supabase incluem raiz/**, www/**, *.vercel.app/** e localhost
- **contato@quintalzim.com.br promovido a caixa real** na Hostinger (era alias — alias não autentica SMTP; lição aplicada no n8n e no Supabase)
- **MIGRAÇÃO JADEONE CONCLUÍDA (Fase 1):** banco do SaaS de finanças (13 tabelas: profiles, categories, transactions, budgets, goals, goal_contributions, plans, subscriptions, credit_cards, invoices, card_expenses, card_installments, account_balance) migrado do Supabase antigo (rqnmysdmapbehtbequob) para o Supabase Quintalzim (rzwgkbekhtkstixtytyw) via pg_dump/psql (Docker postgres:17 na VPS, connection via Session Pooler — conexão direta é IPv6 e a VPS não fala IPv6). UUID do usuário trocado via sed (727 registros). Policies RLS (padrão auth.uid()=user_id) migraram intactas. Trigger on_auth_user_created→handle_new_user() recriado no banco novo; on_auth_user_subscription NÃO recriado (esteira Mercado Pago, morre na Fase 2). Dumps em /opt/quintalzim/migracao na VPS. App repointed (.env.local com URL/anon key do Quintalzim; .env antigo versionado no git — chaves antigas expostas mas projeto será aposentado; NUNCA colocar valores novos no .env). Validado: app local roda contra o banco novo (URL nas requests + transação-teste gravada só no banco novo). Repositório local: C:\JadeOne\jadefinanceiro-spa
- **Quintal de Finanças — estado do repo:** rotas TanStack em src/routes/ (mistura de flat _app.xxx.tsx e pasta _app/ para cartões — padrão válido); limpos: import fantasma, rotas duplicadas, cópias órfãs
- **FASE 2 CONCLUÍDA:** Mercado Pago extirpado (Netlify Functions, rotas planos/assinatura-sucesso, painel /admin removidos; tabelas plans/subscriptions preservadas no banco para referência futura). Acesso = usuário autenticado (TODO gating por assinatura do portal na fase Asaas). Cadastro removido do módulo — contas nascem só no portal (link "Ela nasce no Quintalzim" no login). Gestão de conta centralizada: trocar senha/dados saíram do módulo, item "Minha conta 🌱" aponta ao perfil do portal. Boas-vindas sem trial/planos. git rm --cached .env aplicado
- **FASE 3 CONCLUÍDA:** repo transferido para conta GitHub quintalzim como quintal-financas (pasta local C:\Quintalzim\quintal-financas); Netlify aposentada; deploy na Vercel com vercel.json (rewrite SPA) e env vars VITE_*; no ar em **financas.quintalzim.com.br** (CNAME cname.vercel-dns.com, nuvem cinza; Redirect URL adicionada no Supabase). Pele Quintalzim aplicada (verde #3F6B34, terracota, fundo papel; "JadeOne"→"Quintal de Finanças" em telas, title, manifest PWA). Botão "Voltar ao Quintalzim 🌱"; logout = "Sair do Quintalzim"
- **SSO PORTAL→MÓDULO FUNCIONANDO:** card "Quintal de Finanças" em /app/catalogo do portal obtém a sessão (getSession) e abre financas.quintalzim.com.br/#access_token=...&refresh_token=... (tokens no fragmento, nunca vão ao servidor); receptor no main.tsx do módulo processa o hash ANTES do RouterProvider (await setSession + replaceState + splash "Abrindo seu Quintal... 🌱"), com fallback ao login local. Lição: guard de rota executava antes do receptor e descartava o fragmento — processamento SSO deve ser bloqueante e anterior ao roteador
- **Portal atualizado:** /app/perfil completo (editar nome + alterar senha com feedback Prontim ✅); /app/catalogo real com card ativo de Finanças + cards "Em breve" (Calorias por Foto, Briefings do Dia, Prontim no WhatsApp)

**Comando de teste padrão (simula mensagem chegando):**
```bash
curl -X POST https://n8n.quintalzim.com.br/webhook/prontim \
  -H "Content-Type: application/json" \
  -d '{"data": {"key": {"remoteJid": "5535999999999@s.whatsapp.net"}, "message": {"conversation": "TEXTO_DE_TESTE"}}}'
```

**Lições aprendidas nesta fase:** (a) JSON body em nós HTTP do n8n deve usar "Using Fields Below", nunca JSON manual com expressões (quebra com \n e aspas da resposta da IA); (b) docker compose só funciona dentro de /opt/quintalzim; (c) chip novo conectado à Evolution sem aquecimento = banimento; (d) aliases de e-mail não autenticam SMTP — usar caixas reais; (e) Supabase free sem SMTP próprio limita e-mails a ~2-4/h (erro "muitos pedidos" + 500 no signup); (f) links de auth por ConfirmationURL quebram com scanners de e-mail e troca de navegador — usar token_hash direto no callback; (g) Gmail agrupa e-mails de mesmo subject na mesma thread (testes confundem — traduzir subject e limpar thread); (h) atenção a aspas em templates HTML (parâmetro fora do href quebra o link); (i) www e raiz são origens distintas para Redirect URLs — definir domínio canônico com 308 na Vercel; (j) pg_dump precisa de versão >= à do servidor — usar docker run postgres:17 na VPS; (k) VPS Hostinger não fala IPv6 — sempre Session Pooler do Supabase, nunca conexão direta; (l) reescritas automáticas de ferramentas de IA podem deixar imports fantasmas, arquivos duplicados e cópias fora de routes/ — ao depurar "duplicate declaration", conferir SEMPRE se o arquivo editado é o que o bundler compila (caminho completo!) e datar/comparar duplicatas antes de apagar; (m) commit imediato após estados bons do repo; (n) SSO entre subdomínios com mesmo Supabase: tokens via fragmento de URL + setSession — e o receptor DEVE rodar antes do roteador/guards, senão o redirect descarta o fragmento; (o) integração GitHub↔Vercel é por app instalado na conta — repos novos exigem liberar Repository access; (p) gestão de conta e cadastro pertencem ao portal, módulos só consomem a sessão (fronteira limpa de módulo).

---

## 7. PENDÊNCIAS E BLOQUEIOS ATUAIS

1. **WhatsApp banido:** chip de teste banido pela Meta logo após conexão. Análise solicitada (ou: novo chip com aquecimento de 3-7 dias). Bloqueia apenas o envio final — desenvolvimento segue via curl
2. Registro de marca INPI (classes 35, 38, 42) — verificar e protocolar
3. Reservar @quintalzim no Instagram (se ainda não feito)
4. Validação de campo: 5 conversas com donos de negócio na cidade-piloto (antes de construir a esteira Empresa)
5. Conta Asaas + PostHog a criar (Supabase ✅ completo)
6. Divulgar a landing para começar a lista de espera (decisão pendente do fundador)

---

## 8. ROADMAP

**MVP (90 dias):**
- Mês 1: portal base (PWA, login, assinatura) + concierge + calorias por foto + finanças integradas
- Mês 2: Vitrine + Recepcionista + posts + Briefings; beta fechado 10-20 usuários locais
- Mês 3: Quiz-Funil + gestão/DRE + utilitários + lançamento pago local

**Fase 2 (condicionada a base ativa):** split de pagamentos + clube de assinaturas; marketplace fitness (~100-200 assinantes/cidade); Balcão de Demandas (entregas primeiro); integrações Meta + checkout; criadores externos; API oficial WhatsApp para produção

**Fase 3+:** hub modular pleno (cliente monta assinatura); expansão cidade a cidade; novos verticais

**Migração JadeOne → Quintal de Finanças:** ✅ Fase 1 (banco+repoint) | ✅ Fase 2 (Mercado Pago removido, conta centralizada no portal) | ✅ Fase 3 (financas.quintalzim.com.br na Vercel + pele Quintalzim + SSO do catálogo) | Fase 4 (próxima): extrator de despesas WhatsApp escrevendo direto em transactions

**Próximos passos imediatos de desenvolvimento (ordem sugerida):**
1. Extrator de despesas (texto → JSON → INSERT direto em transactions via n8n) — testável via curl; Fase 4 da migração
2. Memória de conversa do Prontim (Redis/Postgres no fluxo) — pré-requisito da Recepcionista
3. Chip novo aquecido (3-7 dias de uso humano) para reconectar o Prontim ao WhatsApp
4. Módulo Calorias por Foto (o "wow" PF) — segue o padrão do catálogo já estabelecido
5. Conta Asaas (assinatura do portal + gating dos módulos)

**Divisão de trabalho estabelecida:** decisões/especificações/prompts + n8n/infra/marketing = conversas neste projeto Claude; código do site = Claude Code (app desktop) na pasta do repositório. Fluxo: especifica aqui → executa no Code → resultado/erros voltam aqui.

---

## 9. COMO USAR ESTE DOCUMENTO

Em novas conversas, este contexto substitui explicações. Convenções ao trabalhar no projeto:
- Classificar novos insights em: (a) público, (b) camada/pacote, (c) o que reaproveita vs. o que é novo na arquitetura
- Nunca colocar segredos/senhas neste documento — apenas referências ao gerenciador de senhas
- Comunicação da marca: sempre resultado, nunca tecnologia; tom Prontim
- Decisões de negócio já tomadas (escada de preços, split, curadoria, densidade do marketplace) não se rediscutem do zero — evoluem
