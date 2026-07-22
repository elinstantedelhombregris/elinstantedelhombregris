import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BandaCta, BotonPapel, ChipTipo, FilaIndice, Kicker, NotaDemo, Sello } from './index';

describe('Kicker', () => {
  it('renders the mono uppercase kicker with the violeta accent by default', () => {
    render(<Kicker>La prueba · 22 planes</Kicker>);
    const el = screen.getByText('La prueba · 22 planes');
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
