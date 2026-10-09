/**
 * Cuántos temas puede llevar una campaña o una ficha: todos los del catálogo.
 *
 * El catálogo cerrado de aportes (`temas`, migraciones 0022 y 0031) tiene trece
 * claves. Una campaña o una ficha puede elegirlas todas, y la campaña nacional
 * «Mi Argentina ideal» las lleva a las trece. Si el catálogo crece, este número
 * crece con él en el mismo cambio: es el único lugar donde está escrito.
 */
export const MAX_TEMAS = 13;
