import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Recibo } from '../Recibo';

import type { CampanaDeAporte } from '../FraseCampana';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

const m = vi.hoisted(() => ({ user: null as null | { id: number } }));
vi.mock('~/lib/auth/use-auth', () => ({ useAuth: () => ({ user: m.user, isLoading: false }) }));
vi.mock('~/components/participacion/Seguir', () => ({
  Seguir: ({ objeto }: { objeto: string }) => <p>Seguir {objeto}</p>,
}));

const recibo: ReciboParticipacion = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  estado: 'enviada',
  tipo: 'sueño',
  precisionPublicada: 'province',
  yaExistia: false,
  avisos: [],
};
const nacional: CampanaDeAporte = {
  id: 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f',
  slug: 'mi-argentina-ideal',
  revision: 1,
  contrato: {
    titulo: 'Mi Argentina ideal',
    responsable: 'Equipo ¡BASTA!',
    fechaDevolucion: '2099-12-20',
  },
};
const otra: CampanaDeAporte = {
  id: 'af81507f-f3fb-4a80-99f3-28f0f2377947',
  slug: 'cuidar-la-comunidad',
  revision: 3,
  contrato: {
    titulo: 'Cuidar en nuestra comunidad ideal',
    responsable: 'Equipo de cuidado',
    fechaDevolucion: '2099-11-05',
  },
};

beforeEach(() => {
  m.user = null;
});

describe('Recibo del aporte', () => {
  it('abre con un solo titular, dice lo que se puede hacer y lo que no promete', () => {
    render(<Recibo recibo={recibo} campana={null} textoVisible={false} />);
    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Tu aporte quedó publicado.' })).toHaveFocus();
    expect(
      screen.getByText(
        'Ya podés verlo, corregirlo o retirarlo. No es un acuerdo ni un compromiso de nadie.',
      ),
    ).toBeInTheDocument();
  });

  it('con la campaña nacional dice quién la coordina y cuándo devuelve, con los datos de la campaña', () => {
    render(<Recibo recibo={recibo} campana={nacional} textoVisible={false} />);
    expect(
      screen.getByText(
        'Tu aporte entró en la campaña nacional «Mi Argentina ideal». Equipo ¡BASTA!, que la coordina, va a publicar una devolución el 20 de diciembre de 2099 con lo que se leyó.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(`Seguir ${nacional.id}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la campaña y su devolución' })).toHaveAttribute(
      'href',
      '/campanas/mi-argentina-ideal?edicion=1',
    );
  });

  it('con otra campaña usa su nombre, su responsable y su fecha', () => {
    render(<Recibo recibo={recibo} campana={otra} textoVisible={false} />);
    expect(
      screen.getByText(
        'Tu aporte entró en la campaña «Cuidar en nuestra comunidad ideal». Equipo de cuidado, que la coordina, va a publicar una devolución el 5 de noviembre de 2099 con lo que se leyó.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/campaña nacional/)).not.toBeInTheDocument();
  });

  it('sin campaña no promete respuesta, no ofrece seguir y manda a mirar las campañas abiertas', () => {
    render(<Recibo recibo={recibo} campana={null} textoVisible={false} />);
    expect(
      screen.getByText(
        'Tu aporte quedó publicado en el mapa. Por ahora no está en ninguna campaña, así que nadie se comprometió a responderlo.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Seguir /)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'mirá las campañas abiertas' })).toHaveAttribute(
      'href',
      '/campanas',
    );
  });

  it('si el aporte ya existía lo dice y no finge que es nuevo', () => {
    render(<Recibo recibo={{ ...recibo, yaExistia: true }} campana={null} textoVisible={false} />);
    expect(
      screen.getByText('Ya habíamos recibido este aporte; no lo duplicamos.'),
    ).toBeInTheDocument();
  });

  it('habla de lugar y de aporte, no de ámbito ni de señal', () => {
    const { container } = render(
      <Recibo recibo={recibo} campana={null} textoVisible={false} territorio="Mendoza" />,
    );
    // Las palabras de la leyenda del mapa: una sola forma de decir la precisión.
    expect(container).toHaveTextContent('Lugar: Mendoza. Precisión: a nivel provincia.');
    expect(container).toHaveTextContent(
      'El texto quedó reservado: el aporte cuenta sin exponer tus palabras.',
    );
    expect(container.textContent).not.toMatch(/ámbito|señal|voz\b|voces|reflexión/i);
  });

  it.each([
    ['exact', 'en su punto exacto'],
    ['100m', 'a ±100 m'],
    ['500m', 'a ±500 m'],
    ['neighborhood', 'en su barrio'],
    ['city', 'en el centro de su localidad'],
    ['province', 'a nivel provincia'],
  ])('dice la precisión «%s» con la etiqueta compartida', (precisionPublicada, etiqueta) => {
    const { container } = render(
      <Recibo
        recibo={{ ...recibo, precisionPublicada }}
        campana={null}
        textoVisible={false}
        territorio="Mendoza"
      />,
    );
    expect(container).toHaveTextContent(`Precisión: ${etiqueta}.`);
    expect(container).not.toHaveTextContent('ubicación protegida');
  });

  it('sin lugar dice solo «Lugar: todo el país.» y no inventa una precisión', () => {
    // El servidor devuelve `province` por defecto aunque no haya provincia: no es un dato.
    const { container } = render(<Recibo recibo={recibo} campana={null} textoVisible={false} />);
    expect(container).toHaveTextContent('Lugar: todo el país.');
    expect(container).not.toHaveTextContent(/Precisión/);
    expect(container).not.toHaveTextContent('a nivel provincia');
  });

  it('quien no ingresó va a «Guardar en mi espacio» y vuelve a Mi espacio al terminar', () => {
    render(<Recibo recibo={recibo} campana={null} textoVisible={false} />);
    expect(screen.getByRole('link', { name: 'Guardar en mi espacio' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fmi-espacio',
    );
  });

  it('la línea de «todavía no hay otros» solo aparece cuando se sabe que es cierta', () => {
    const vista = render(<Recibo recibo={recibo} campana={null} textoVisible={false} />);
    expect(screen.queryByText(/Todavía no hay otros aportes/)).not.toBeInTheDocument();
    vista.rerender(
      <Recibo recibo={recibo} campana={null} textoVisible={false} otrosParecidos={3} />,
    );
    expect(screen.queryByText(/Todavía no hay otros aportes/)).not.toBeInTheDocument();
    vista.rerender(
      <Recibo recibo={recibo} campana={null} textoVisible={false} otrosParecidos={0} />,
    );
    expect(
      screen.getByText('Todavía no hay otros aportes como el tuyo en este lugar.'),
    ).toBeInTheDocument();
  });

  it('ofrece verlo en el mapa, ver la Radiografía y sumar otro aporte', () => {
    const alMapa = vi.fn();
    const sumarOtro = vi.fn();
    render(
      <Recibo
        recibo={recibo}
        campana={null}
        textoVisible={false}
        alMapa={alMapa}
        sumarOtro={sumarOtro}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Verlo en el mapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sumar otro aporte' }));
    expect(alMapa).toHaveBeenCalledOnce();
    expect(sumarOtro).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Ver la Radiografía' })).toHaveAttribute(
      'href',
      '/la-radiografia',
    );
  });

  it('sin quien cierre el panel, «Verlo en el mapa» es un enlace al mapa', () => {
    render(<Recibo recibo={recibo} campana={null} textoVisible={false} />);
    expect(screen.getByRole('link', { name: 'Verlo en el mapa' })).toHaveAttribute(
      'href',
      '/el-mapa#instrumento',
    );
  });

  it('el recibo distingue a quien ingresó de quien no', () => {
    const vista = render(<Recibo recibo={recibo} campana={null} textoVisible />);
    expect(screen.getByRole('link', { name: 'Guardar en mi espacio' })).toHaveAttribute(
      'href',
      '/ingresar?volver=%2Fmi-espacio',
    );
    expect(screen.getByText(/Este navegador conserva la autoría/)).toBeInTheDocument();
    m.user = { id: 1 };
    vista.rerender(<Recibo recibo={recibo} campana={null} textoVisible />);
    expect(screen.getByRole('link', { name: 'Volver a mi espacio' })).toBeInTheDocument();
    expect(screen.queryByText(/Este navegador conserva la autoría/)).not.toBeInTheDocument();
  });
});
