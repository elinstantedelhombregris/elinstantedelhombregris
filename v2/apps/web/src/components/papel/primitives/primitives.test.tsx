import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RitoTinta } from './RitoTinta';

import {
  BandaCta,
  BotonPapel,
  ChipTipo,
  FilaIndice,
  FilaIndiceExpandible,
  Kicker,
  NotaDemo,
  Sello,
} from './index';

describe('Kicker', () => {
  it('renders the mono uppercase kicker with the violeta accent by default', () => {
    render(<Kicker>El ejemplo · 22 planes</Kicker>);
    const el = screen.getByText('El ejemplo · 22 planes');
    expect(el.className).toMatch(/text-violeta/);
    expect(el.className).toMatch(/uppercase/);
    expect(el.className).toMatch(/tracking-\[0\.16em\]/);
  });

  it('maps color to the semantic accent token', () => {
    render(<Kicker color="papel">§ 02 — El origen</Kicker>);
    expect(screen.getByText('§ 02 — El origen').className).toMatch(/text-papel\b/);
  });
});

describe('BotonPapel', () => {
  it('renders the violeta variant by default', () => {
    render(<BotonPapel>Etiqueta →</BotonPapel>);
    const btn = screen.getByRole('button', { name: 'Etiqueta →' });
    expect(btn.className).toMatch(/bg-violeta/);
  });

  it('disabled uses tinta-30 text/border, never opacity', () => {
    render(<BotonPapel disabled>No disponible</BotonPapel>);
    const btn = screen.getByRole('button', { name: 'No disponible' });
    expect(btn).toBeDisabled();
    expect(btn.className).toMatch(/text-tinta-30/);
    expect(btn.className).toMatch(/border-tinta-30/);
    expect(btn.className).toMatch(/cursor-not-allowed/);
    expect(btn.className).not.toMatch(/opacity-/);
  });

  it('loading replaces the label with the blink cursor and disables the button', () => {
    render(<BotonPapel loading>Enviar</BotonPapel>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('▌');
    expect(btn.querySelector('.anim-blink-cursor')).not.toBeNull();
  });

  it('accepts standard button props like onClick, type and aria-label', () => {
    const handleClick = vi.fn();
    render(
      <BotonPapel type="submit" onClick={handleClick} aria-label="Confirmar">
        Ok
      </BotonPapel>,
    );
    const btn = screen.getByRole('button', { name: 'Confirmar' });
    expect(btn).toHaveAttribute('type', 'submit');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

describe('Sello', () => {
  it('rotates -4deg by default and enters with the stampin animation', () => {
    render(<Sello color="rojo">No es doctrina</Sello>);
    const el = screen.getByText('No es doctrina');
    expect(el.className).toMatch(/anim-stampin/);
    expect(el.style.transform).toBe('rotate(-4deg)');
  });

  it('accepts an explicit rotate override in degrees', () => {
    render(
      <Sello color="rojo" rotate={-8}>
        El instante es ahora
      </Sello>,
    );
    expect(screen.getByText('El instante es ahora').style.transform).toBe('rotate(-8deg)');
  });

  it('maps color to the semantic border/text token', () => {
    render(<Sello color="verde">Logrado</Sello>);
    expect(screen.getByText('Logrado').className).toMatch(/text-verde/);
  });
});

describe('ChipTipo', () => {
  it('renders inactive with a plain tinta border and no semantic fill', () => {
    render(<ChipTipo tipo="basta" />);
    const chip = screen.getByText('basta');
    expect(chip.className).toMatch(/border-tinta\b/);
    expect(chip.className).not.toMatch(/bg-sello/);
  });

  it('active fills with the semantic color for the voice type', () => {
    render(<ChipTipo tipo="sueño" active />);
    const chip = screen.getByText('sueño');
    expect(chip.className).toMatch(/bg-violeta/);
    expect(chip.className).toMatch(/text-papel/);
  });
});

describe('NotaDemo', () => {
  it('renders exactly the demo-data note', () => {
    render(<NotaDemo />);
    expect(screen.getByText('* datos de demostración')).toBeInTheDocument();
  });
});

describe('FilaIndice', () => {
  it('renders a wouter Link with the index row content and href', () => {
    render(<FilaIndice num="01" titulo="PLANDEM" href="/planes/plandem" />);
    const link = screen.getByRole('link', { name: /PLANDEM/ });
    expect(link).toHaveAttribute('href', '/planes/plandem');
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(link.className).toMatch(/grid-cols-\[56px_1fr_40px\]/);
  });
});

describe('FilaIndiceExpandible', () => {
  it('cerrada: renderiza un button con aria-expanded=false, aria-controls, glifo + y sin panel en el DOM', () => {
    render(
      <FilaIndiceExpandible
        num="01"
        encabezado="PLANSAL"
        abierta={false}
        onToggle={vi.fn()}
        idPanel="panel-plansal"
      >
        Contenido del pliegue
      </FilaIndiceExpandible>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    expect(btn).toHaveAttribute('aria-controls', 'panel-plansal');
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.queryByText('Contenido del pliegue')).not.toBeInTheDocument();
  });

  it('abierta: aria-expanded=true, glifo − violeta, panel con id + anim-fadeup-rapido y children visibles', () => {
    render(
      <FilaIndiceExpandible
        num="01"
        encabezado="PLANSAL"
        abierta
        onToggle={vi.fn()}
        idPanel="panel-plansal"
      >
        Contenido del pliegue
      </FilaIndiceExpandible>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    const glifo = screen.getByText('−');
    expect(glifo.className).toMatch(/text-violeta/);
    const panel = screen.getByText('Contenido del pliegue').closest('#panel-plansal');
    expect(panel).not.toBeNull();
    expect(panel?.className).toMatch(/anim-fadeup-rapido/);
  });

  it('interacción: click en el botón llama onToggle una vez', () => {
    const handleToggle = vi.fn();
    render(
      <FilaIndiceExpandible
        num="01"
        encabezado="PLANSAL"
        abierta={false}
        onToggle={handleToggle}
        idPanel="panel-plansal"
      >
        Contenido del pliegue
      </FilaIndiceExpandible>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalledOnce();
  });

  it('el glifo es aria-hidden — el estado lo anuncia aria-expanded', () => {
    render(
      <FilaIndiceExpandible
        num="01"
        encabezado="PLANSAL"
        abierta={false}
        onToggle={vi.fn()}
        idPanel="panel-plansal"
      >
        Contenido del pliegue
      </FilaIndiceExpandible>,
    );
    expect(screen.getByText('+')).toHaveAttribute('aria-hidden');
  });
});

describe('BandaCta', () => {
  it('renders a full-bleed section with the fondo color', () => {
    render(
      <BandaCta fondo="violeta">
        <p>Tu voz pesa.</p>
      </BandaCta>,
    );
    const text = screen.getByText('Tu voz pesa.');
    expect(text.closest('section')?.className).toMatch(/bg-violeta/);
  });

  it('supports the tinta fondo', () => {
    render(
      <BandaCta fondo="tinta">
        <p>Otro cierre.</p>
      </BandaCta>,
    );
    expect(screen.getByText('Otro cierre.').closest('section')?.className).toMatch(/bg-tinta/);
  });
});

describe('RitoTinta', () => {
  it('entinta cada letra con delays escalonados y hace caer los signos al final en violeta', () => {
    const { container } = render(
      <h1 aria-label="¡BASTA!">
        <RitoTinta lineas={['¡BASTA!']} />
      </h1>,
    );

    const letras = Array.from(container.querySelectorAll<HTMLElement>('.anim-inkfill'));
    expect(letras.map((el) => el.textContent)).toEqual(['B', 'A', 'S', 'T', 'A']);
    expect(letras.map((el) => el.style.animationDelay)).toEqual([
      '0.1s',
      '0.145s',
      '0.19s',
      '0.235s',
      '0.28s',
    ]);

    const signos = Array.from(container.querySelectorAll<HTMLElement>('.anim-vpop'));
    expect(signos.map((el) => el.textContent)).toEqual(['¡', '!']);
    for (const signo of signos) {
      expect(signo).toHaveClass('text-violeta');
      expect(signo.style.animationDelay).toBe('0.525s');
    }
  });

  it('queda oculto para tecnología asistiva — el aria-label lo pone el llamador', () => {
    render(
      <h1 aria-label="Se diseña.">
        <RitoTinta lineas={['Se diseña.']} />
      </h1>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Se diseña.' })).toBeInTheDocument();
  });

  it('tono="claro" entinta hacia inkfill-claro y cae en violeta-claro (El mandato, página oscura)', () => {
    const { container } = render(
      <h1 aria-label="¡BASTA!">
        <RitoTinta lineas={['¡BASTA!']} tono="claro" />
      </h1>,
    );

    const letras = Array.from(container.querySelectorAll<HTMLElement>('.anim-inkfill-claro'));
    expect(letras.map((el) => el.textContent)).toEqual(['B', 'A', 'S', 'T', 'A']);
    expect(container.querySelectorAll('.anim-inkfill')).toHaveLength(0);

    const signos = Array.from(container.querySelectorAll<HTMLElement>('.anim-vpop'));
    expect(signos.map((el) => el.textContent)).toEqual(['¡', '!']);
    for (const signo of signos) {
      expect(signo).toHaveClass('text-violeta-claro');
      expect(signo.className.split(' ')).not.toContain('text-violeta');
    }
  });

  it('sin tono conserva anim-inkfill/text-violeta (regresión — default sigue siendo "tinta")', () => {
    const { container } = render(
      <h1 aria-label="¡BASTA!">
        <RitoTinta lineas={['¡BASTA!']} />
      </h1>,
    );

    expect(container.querySelectorAll('.anim-inkfill-claro')).toHaveLength(0);
    const signos = Array.from(container.querySelectorAll<HTMLElement>('.anim-vpop'));
    for (const signo of signos) {
      expect(signo).toHaveClass('text-violeta');
      expect(signo.className).not.toMatch(/text-violeta-claro/);
    }
  });
});
