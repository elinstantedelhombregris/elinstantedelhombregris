export const CIVIC_CATEGORY_LABELS: Record<string, string> = {
  'alimentos-secos': 'Alimentos secos',
  'alimentos-frescos': 'Frutas y verduras',
  'gas-cocina': 'Gas para cocinar',
  higiene: 'Higiene',
  'equipamiento-cocina': 'Utensilios y cocina',
  'alumbrado-publico': 'Reparación de luminarias',
  'red-comunitaria-alimentaria': 'Red alimentaria',
  food: 'Alimentación',
  housing: 'Vivienda',
  work: 'Trabajo',
  care: 'Cuidados',
  health: 'Salud',
  education: 'Educación',
  environment: 'Ambiente',
  mobility: 'Movilidad',
  safety: 'Convivencia',
  culture: 'Cultura y comunidad',
  democracy: 'Participación',
};

export const civicCategoryLabel = (key: string): string => CIVIC_CATEGORY_LABELS[key] ?? key;
