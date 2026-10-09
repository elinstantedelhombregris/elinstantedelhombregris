import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EditarAporte } from '../EditarAporte';

const m = vi.hoisted(() => ({
  get: vi.fn<() => Promise<unknown>>(),
  mutate: vi.fn(),
}));

vi.mock('~/lib/api', () => ({ api: { get: m.get } }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: { id: 1 } }) }));
vi.mock('~/lib/queries/participacion', () => ({
  useOperacionPersonal: () => ({ mutate: m.mutate, isPending: false, error: null }),
}));

const ID = '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b';

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <EditarAporte id={ID} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  m.get.mockReset();
  m.mutate.mockReset();
  m.get.mockResolvedValue({
    texto: 'Quiero una huerta en cada escuela.',
    revision: '2026-10-05T15:00:00.000Z',
    cedeLicencia: false,
    textoProtegido: false,
  });
});

describe('El editor único de un aporte propio', () => {
  it('no pide nada hasta que se abre, y al abrir explica el permiso con palabras de uso', async () => {
    montar();
    expect(m.get).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Corregir mi aporte' }));

    const texto = await screen.findByRole('textbox');
    expect(texto).toHaveValue('Quiero una huerta en cada escuela.');
    expect(
      screen.getByLabelText(
        'Dejo que cualquiera pueda leer y compartir este texto (licencia CC BY 4.0). Si no la tildás, queda reservado.',
      ),
    ).not.toBeChecked();
    expect(document.body.textContent).not.toMatch(/Cedo|revisión actual|autoría|CC BY 4\.0 para su reproducción/);
  });

  it('guarda sobre la versión que se vio y avisa que se guardó', async () => {
    m.mutate.mockImplementation((_pedido, opciones?: { onSuccess?: () => void }) => {
      opciones?.onSuccess?.();
    });
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Corregir mi aporte' }));
    const texto = await screen.findByRole('textbox');
    fireEvent.change(texto, { target: { value: 'Quiero una huerta y una biblioteca.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar la corrección' }));

    expect(m.mutate).toHaveBeenCalledWith(
      {
        metodo: 'patch',
        ruta: `/api/v1/contribuciones/${ID}`,
        cuerpo: {
          revision: '2026-10-05T15:00:00.000Z',
          texto: 'Quiero una huerta y una biblioteca.',
          cedeLicencia: true,
          aceptaPublicar: true,
        },
      },
      expect.any(Object),
    );
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Guardamos tu corrección.');
    });
    // Cerró el editor: queda el botón para volver a abrirlo.
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Corregir mi aporte' })).toBeInTheDocument();
  });

  it('«Cerrar sin guardar» cierra sin mandar nada', async () => {
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Corregir mi aporte' }));
    await screen.findByRole('textbox');
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sin guardar' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(m.mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('un texto con adhesiones queda de solo lectura y dice por qué en palabras simples', async () => {
    m.get.mockResolvedValue({
      texto: 'Una posibilidad que reservé.',
      revision: '2026-10-08T00:00:00Z',
      cedeLicencia: false,
      textoProtegido: true,
    });
    montar();
    fireEvent.click(screen.getByRole('button', { name: 'Corregir mi aporte' }));

    expect(await screen.findByRole('textbox')).toHaveAttribute('readonly');
    expect(
      screen.getByText(/Para cambiarlo, publicá un aporte nuevo\. Sí podés cambiar el permiso de uso/),
    ).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/enunciado|licencia o retirar la publicación/);
  });
});
