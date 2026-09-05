// Compartilhado pelos formulários públicos de /b/[slug].
// Reexporta de lib/telefone.ts (fonte única da normalização/validação de
// telefone) pra manter o nome já usado nesses formulários sem duplicar lógica.
export { normalizarTelefone as normalizarTelefoneCliente } from "@/lib/telefone";
