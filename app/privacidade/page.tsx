import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Quintalzim",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          <Link href="/" className="font-titulo text-sm font-semibold text-verde-escuro">
            Quintalzim
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Política de Privacidade</h1>
          <p className="mt-1 text-sm text-tinta-suave">Última atualização: setembro de 2026.</p>
        </div>

        <div className="flex flex-col gap-5 text-sm leading-relaxed text-tinta">
          <p>
            Esta política explica, em linguagem simples, quais dados o Quintalzim coleta, para que
            usa cada um deles e quais direitos você tem sobre eles, em conformidade com a Lei Geral
            de Proteção de Dados (LGPD).
          </p>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">1. Quem somos</h2>
            <p>
              O Quintalzim (quintalzim.com.br) é um portal por assinatura para pessoas e pequenos
              negócios de cidades pequenas do Brasil. Dúvidas sobre privacidade podem ser enviadas
              para <span className="font-medium">meuquintalzim@gmail.com</span>.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">2. Quais dados coletamos</h2>
            <p>Dependendo de como você usa o Quintalzim, podemos coletar:</p>
            <ul className="ml-5 list-disc">
              <li>Dados de cadastro: nome, e-mail e número de WhatsApp;</li>
              <li>
                Dados de uso do assistente (Prontim): mensagens de texto, áudio (transcrito
                automaticamente) e fotos enviadas pelo WhatsApp ou pelo chat do portal, quando você
                usa essas funções;
              </li>
              <li>
                Dados financeiros que você mesmo cadastra no Quintal de Finanças (lançamentos de
                receitas e despesas, categorias, valores);
              </li>
              <li>
                Dados de negócio, se você cadastra uma Empresa: nome do negócio, endereço, horário
                de funcionamento, agendamentos recebidos e dados de contato dos seus clientes finais;
              </li>
              <li>
                Respostas de quizzes (ex: diagnóstico de saúde/hábitos) e o contato informado ao
                final;
              </li>
              <li>
                Dados técnicos de notificação (inscrição de push do navegador), usados só pra te
                mandar avisos que você mesmo ativou.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">3. Para que usamos esses dados</h2>
            <ul className="ml-5 list-disc">
              <li>Fornecer as funções que você pediu (registrar despesa por WhatsApp, calcular calorias de uma foto, gerar diagnósticos e resumos personalizados);</li>
              <li>Mandar notificações que você ativou (lembretes de agendamento, resumos diários);</li>
              <li>Permitir que um negócio cadastrado no Quintalzim atenda os próprios clientes finais (agendamentos, avisos);</li>
              <li>Melhorar e corrigir o funcionamento do produto;</li>
              <li>Cumprir obrigações legais, quando aplicável.</li>
            </ul>
            <p>Nunca vendemos seus dados a terceiros nem os usamos para publicidade de terceiros.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">4. Com quem compartilhamos</h2>
            <p>Usamos fornecedores de tecnologia pra operar o Quintalzim, que processam dados em nosso nome, sob contrato:</p>
            <ul className="ml-5 list-disc">
              <li><span className="font-medium">Meta/WhatsApp</span> — para envio e recebimento de mensagens, quando você interage com o Prontim ou com o Recepcionista de uma Empresa pelo WhatsApp;</li>
              <li><span className="font-medium">Anthropic (Claude) e Groq</span> — para gerar respostas de IA e transcrever áudios enviados;</li>
              <li><span className="font-medium">Supabase</span> — para armazenamento seguro de banco de dados e autenticação;</li>
              <li><span className="font-medium">Vercel</span> — para hospedagem do portal.</li>
            </ul>
            <p>Não compartilhamos seus dados com outras empresas para fins comerciais próprios delas.</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">5. Por quanto tempo guardamos</h2>
            <p>
              Guardamos seus dados enquanto sua conta estiver ativa, ou pelo tempo necessário para
              cumprir a finalidade que motivou a coleta ou uma obrigação legal. Você pode pedir a
              exclusão da sua conta e dos seus dados a qualquer momento.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">6. Seus direitos</h2>
            <p>
              Você pode, a qualquer momento, pedir para confirmar quais dados temos sobre você,
              corrigir dados incorretos, pedir a exclusão da sua conta, ou retirar consentimentos
              (como desativar notificações push, que você pode fazer direto no Perfil do app).
              Pra exercer qualquer um desses direitos, escreva para
              <span className="font-medium"> meuquintalzim@gmail.com</span>.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">7. Segurança</h2>
            <p>
              Usamos práticas padrão de mercado para proteger seus dados (conexão criptografada,
              controle de acesso por usuário) e trabalhamos continuamente pra reduzir riscos, mas
              nenhum sistema é 100% livre de falhas — se identificarmos um incidente relevante,
              avisaremos as pessoas afetadas.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-titulo text-base font-bold text-tinta">8. Alterações desta política</h2>
            <p>
              Podemos atualizar esta política conforme o Quintalzim evolui. Mudanças relevantes
              serão comunicadas dentro do próprio portal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
