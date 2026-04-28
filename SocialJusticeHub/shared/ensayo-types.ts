export interface EnsayoCartografiaItem {
  label: string;
  blurb: string;
  href?: string;
}

export interface EnsayoCartografiaGroup {
  heading: string;
  items: EnsayoCartografiaItem[];
}

export interface EnsayoTocItem {
  id: string;
  level: 2 | 3;
  text: string;
}

export interface Ensayo {
  slug: string;
  order: number;
  type: 'ensayo' | 'carta';
  title: string;
  subtitle: string;
  opening: string;
  readingMinutes: number;
  bodyHtml: string;
  toc: EnsayoTocItem[];
  cartografia: EnsayoCartografiaGroup[];
  next?: { slug: string; title: string };
}
