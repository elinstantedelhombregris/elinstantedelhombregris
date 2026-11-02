import { lazy, Suspense, useState } from 'react';

const Bienvenida = lazy(async () => {
  const module = await import('./BienvenidaInstante');
  return { default: module.BienvenidaInstante };
});

// Each document load may welcome the visitor once. Closing the welcome or
// reading its source keeps it closed during subsequent client navigation.
let cerradaEnEstaCarga = false;

export function EntradaInstante() {
  const [open, setOpen] = useState(() => !cerradaEnEstaCarga);
  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <Bienvenida
        onClose={() => {
          cerradaEnEstaCarga = true;
          setOpen(false);
        }}
      />
    </Suspense>
  );
}
