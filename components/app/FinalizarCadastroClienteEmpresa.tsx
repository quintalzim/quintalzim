// Deprecado: substituído por FinalizarVinculoCliente (components/public),
// montado em /b/[slug], e pelo gate de acesso restrito em app/app/layout.tsx
// (que já cobre o convite "conhecer o Quintalzim" via DesbloquearPortalCompleto).
// Não removido fisicamente porque este ambiente não permite deletar arquivos;
// mantido como no-op pra não quebrar o build. Pode ser apagado manualmente.
export default function FinalizarCadastroClienteEmpresa() {
  return null;
}
