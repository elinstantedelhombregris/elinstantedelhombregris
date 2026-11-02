import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'wouter';

import portrait from './hombre-gris.webp';
import { instantes } from './instantes';
import { useRetrato } from './useRetrato';
import './bienvenida.css';

import type { Instante } from './instantes';

import { cn } from '~/lib/utils';

interface Props {
  onClose: () => void;
  initialId?: string;
}

export function BienvenidaInstante({ onClose, initialId }: Props) {
  const [instante, setInstante] = useState<Instante>(() => {
    const initial = initialId ? instantes.find((entry) => entry.id === initialId) : undefined;
    const random = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    return initial ?? instantes[random % instantes.length] ?? instantes[0];
  });
  const [paused, setPaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const label = useId(),
    quoteId = useId();
  const reduced = useReducedMotion();
  const { figure, image, canvas, ready, quieto } = useRetrato(instante, paused);
  const highlight = instante.quote.indexOf(instante.highlight);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const next = () => {
    const index = instantes.findIndex((entry) => entry.id === instante.id);
    setInstante(instantes[(index + 1) % instantes.length] ?? instantes[0]);
  };

  return (
    <dialog
      ref={dialog}
      className="pt-app"
      data-layout={instante.layout}
      data-instante={instante.id}
      aria-labelledby={label}
      aria-describedby={quoteId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="pt-modal">
        <header className="pt-header">
          <Link
            className="pt-wordmark"
            href="/"
            onClick={onClose}
            aria-label="Ir a la portada de ¡BASTA!"
          >
            <span>¡</span>BASTA<span>!</span>
          </Link>
          <div className="pt-header-title">
            <span>EL INSTANTE DEL HOMBRE GRIS</span>
            <span>{instante.name}</span>
          </div>
          <button
            type="button"
            className="pt-close"
            onClick={onClose}
            aria-label="Cerrar e ir a la landing"
          >
            ×
          </button>
        </header>
        <div className="pt-content">
          <div ref={figure} className="pt-figure">
            <img
              ref={image}
              className="pt-poster"
              src={portrait}
              hidden={ready}
              alt="El Hombre Gris, representado como una trama de tinta."
            />
            <canvas
              key={instante.id}
              ref={canvas}
              className="pt-particles"
              hidden={!ready}
              aria-hidden="true"
            />
            <p className="pt-image-hint">
              {quieto || !ready ? (
                'El Hombre Gris.'
              ) : (
                <>
                  <span className="pt-desktop-hint">Mové la tinta con el cursor.</span>
                  <span className="pt-mobile-hint">Tocá la trama.</span>
                </>
              )}
            </p>
          </div>
          <motion.div
            key={instante.id}
            className="pt-message"
            aria-live="polite"
            initial={reduced ? false : { opacity: 0.55, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.32, ease: 'easeOut' }}
          >
            <p id={label} className="pt-kicker">
              UN INSTANTE PARA VOS
            </p>
            <blockquote
              id={quoteId}
              className={cn('pt-quote', instante.quote.length > 85 && 'pt-long')}
            >
              <span aria-hidden="true">«</span>
              {instante.quote.slice(0, highlight)}
              <span className="pt-emphasis">{instante.highlight}</span>
              {instante.quote.slice(highlight + instante.highlight.length)}
              <span aria-hidden="true">»</span>
            </blockquote>
            <div className="pt-source">
              <span className="pt-source-family">{instante.family}</span>
              <Link className="pt-source-link" href={instante.url} onClick={onClose}>
                {instante.sourceTitle} <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="pt-actions">
              <Link className="pt-read" href={instante.url} onClick={onClose}>
                Leer el texto <span aria-hidden="true">→</span>
              </Link>
              <button type="button" className="pt-continue" onClick={onClose}>
                Seguir mi camino <span aria-hidden="true">→</span>
              </button>
            </div>
          </motion.div>
        </div>
        <footer className="pt-footer">
          <span className="pt-edition">
            {instante.id} / {instantes.length}
          </span>
          {ready && !quieto ? (
            <button
              type="button"
              onClick={() => {
                setPaused((value) => !value);
              }}
              aria-pressed={paused}
            >
              {paused ? 'Reanudar imagen' : 'Pausar imagen'}
            </button>
          ) : null}
          <button type="button" onClick={next}>
            Otro instante <span aria-hidden="true">→</span>
          </button>
        </footer>
        <div className="pt-grain" aria-hidden="true" />
      </section>
    </dialog>
  );
}
