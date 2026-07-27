/**
 * Tipos del Protocolo Vivo — el vocabulario compartido de misiones,
 * pulsos y oficios. Motor puro: nada de React, nada de DB.
 */
export type EstadoMision =
  | 'propuesta' | 'equipo' | 'activa' | 'verificacion' | 'resuelta' | 'abandonada';

export type TipoMision = 'relevamiento' | 'obra' | 'diseno';

export type Gobernanza = 'coordinada' | 'consentimiento';

export type RolMiembro = 'coordinador' | 'miembro';
