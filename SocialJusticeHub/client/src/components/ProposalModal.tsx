import { useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Scroll, Scale, Quote, Calendar } from 'lucide-react';
import type { FullProposal, ProposalType } from '@/lib/mandato-vivo-proposals';

interface ProposalModalProps {
  proposal: FullProposal | null;
  accent: 'amber' | 'rose' | 'emerald';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function typeIcon(type: ProposalType) {
  switch (type) {
    case 'carta':
      return Scroll;
    case 'peticion':
      return FileText;
    case 'proyecto':
      return Scale;
  }
}

const accentTokens = {
  amber: {
    text: 'text-amber-400',
    softText: 'text-amber-300/80',
    bg: 'bg-amber-500/10',
    softBg: 'bg-amber-500/[0.04]',
    border: 'border-amber-500/30',
    softBorder: 'border-amber-500/15',
    ring: 'ring-amber-500/20',
    gradient: 'from-amber-500/70 via-amber-400/30 to-transparent',
    accentLine: 'bg-amber-400/60',
  },
  rose: {
    text: 'text-rose-400',
    softText: 'text-rose-300/80',
    bg: 'bg-rose-500/10',
    softBg: 'bg-rose-500/[0.04]',
    border: 'border-rose-500/30',
    softBorder: 'border-rose-500/15',
    ring: 'ring-rose-500/20',
    gradient: 'from-rose-500/70 via-rose-400/30 to-transparent',
    accentLine: 'bg-rose-400/60',
  },
  emerald: {
    text: 'text-emerald-400',
    softText: 'text-emerald-300/80',
    bg: 'bg-emerald-500/10',
    softBg: 'bg-emerald-500/[0.04]',
    border: 'border-emerald-500/30',
    softBorder: 'border-emerald-500/15',
    ring: 'ring-emerald-500/20',
    gradient: 'from-emerald-500/70 via-emerald-400/30 to-transparent',
    accentLine: 'bg-emerald-400/60',
  },
} as const;

function kickerFor(type: ProposalType): string {
  switch (type) {
    case 'carta':
      return 'Carta ciudadana';
    case 'peticion':
      return 'Petición pública';
    case 'proyecto':
      return 'Proyecto de ley';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProposalModal({
  proposal,
  accent,
  open,
  onOpenChange,
}: ProposalModalProps) {
  const tokens = accentTokens[accent];

  // Scroll body to top when a new proposal opens
  useEffect(() => {
    if (open) {
      const el = document.getElementById('proposal-scroll');
      if (el) el.scrollTop = 0;
    }
  }, [open, proposal?.title]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && proposal && (
          <DialogPrimitive.Portal forceMount>
            {/* Backdrop */}
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>

            {/* Panel */}
            <DialogPrimitive.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-0 sm:p-6 pointer-events-none"
              >
                <div
                  className={`relative w-full max-w-3xl max-h-[100dvh] sm:max-h-[92vh] flex flex-col overflow-hidden bg-[#0b0b10] border ${tokens.softBorder} sm:rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] pointer-events-auto`}
                >
                  {/* Top accent gradient */}
                  <div
                    className={`h-[3px] bg-gradient-to-r ${tokens.gradient}`}
                  />

                  {/* Sticky header */}
                  <ProposalHeader
                    proposal={proposal}
                    tokens={tokens}
                    onClose={() => onOpenChange(false)}
                  />

                  {/* Scrollable body */}
                  <div
                    id="proposal-scroll"
                    className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 sm:py-10 space-y-10 scroll-smooth"
                  >
                    <DialogPrimitive.Description className="sr-only">
                      {proposal.convergenceHeadline}
                    </DialogPrimitive.Description>

                    <Convergence
                      proposal={proposal}
                      tokens={tokens}
                    />

                    <Diagnosis
                      proposal={proposal}
                      tokens={tokens}
                    />

                    <Foundation
                      proposal={proposal}
                      tokens={tokens}
                    />

                    <Articles
                      proposal={proposal}
                      tokens={tokens}
                    />

                    <Roadmap
                      proposal={proposal}
                      tokens={tokens}
                    />

                    <Accountability
                      proposal={proposal}
                      tokens={tokens}
                    />

                    <Closing
                      proposal={proposal}
                      tokens={tokens}
                    />
                  </div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

type Tokens = typeof accentTokens[keyof typeof accentTokens];

function ProposalHeader({
  proposal,
  tokens,
  onClose,
}: {
  proposal: FullProposal;
  tokens: Tokens;
  onClose: () => void;
}) {
  const Icon = typeIcon(proposal.type);
  return (
    <div className="relative border-b border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent px-6 sm:px-10 py-6 sm:py-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`shrink-0 w-10 h-10 rounded-full ${tokens.bg} ${tokens.border} border flex items-center justify-center`}
          >
            <Icon className={`w-4 h-4 ${tokens.text}`} />
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-mono uppercase tracking-[0.25em] ${tokens.text}`}
              >
                {kickerFor(proposal.type)}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                {proposal.level}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                {proposal.territory}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
              {proposal.title}
            </h2>
            <div className="flex items-center gap-3 text-white/40 text-xs">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {proposal.date}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>
                {proposal.voiceCount.toLocaleString('es-AR')} voces firmantes
              </span>
            </div>
          </div>
        </div>
        <DialogPrimitive.Close
          onClick={onClose}
          className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Cerrar propuesta"
        >
          <X className="w-4 h-4" />
        </DialogPrimitive.Close>
      </div>
    </div>
  );
}

function Convergence({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section className="space-y-3">
      <div className={`flex items-center gap-3`}>
        <span className={`h-px flex-1 ${tokens.softBg}`} />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
          Destinatario
        </span>
        <span className={`h-px flex-1 ${tokens.softBg}`} />
      </div>
      <p className="text-white/70 text-sm text-center font-medium">
        {proposal.addressee}
      </p>
      <div
        className={`mt-6 relative rounded-xl border ${tokens.softBorder} ${tokens.softBg} p-5 sm:p-6`}
      >
        <Quote
          className={`absolute -top-3 left-5 w-5 h-5 ${tokens.text} bg-[#0b0b10] p-0.5`}
        />
        <p className="font-serif italic text-white/90 text-base sm:text-lg leading-relaxed">
          {proposal.convergenceHeadline}
        </p>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  tokens,
}: {
  eyebrow: string;
  tokens: Tokens;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.3em] ${tokens.text}`}
      >
        {eyebrow}
      </span>
      <span className="h-px flex-1 bg-white/5" />
    </div>
  );
}

function Diagnosis({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="01 · Diagnóstico" tokens={tokens} />
      <h3 className="font-serif text-xl sm:text-2xl text-white leading-snug">
        {proposal.diagnosis.heading}
      </h3>
      <div className="space-y-4">
        {proposal.diagnosis.body.map((p, i) => (
          <p
            key={i}
            className="text-white/70 text-sm sm:text-base leading-relaxed"
          >
            {p}
          </p>
        ))}
      </div>
      {/* Facts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
        {proposal.diagnosis.facts.map((f) => (
          <div
            key={f.label}
            className={`rounded-lg border ${tokens.softBorder} ${tokens.softBg} p-3`}
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
              {f.label}
            </p>
            <p
              className={`font-serif text-lg sm:text-xl font-semibold ${tokens.text}`}
            >
              {f.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Foundation({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="02 · Fundamento" tokens={tokens} />
      <h3 className="font-serif text-xl sm:text-2xl text-white leading-snug">
        {proposal.foundation.heading}
      </h3>
      <blockquote
        className={`relative border-l-2 ${tokens.border} pl-5 py-1`}
      >
        <p className="font-serif italic text-white/85 text-base sm:text-lg leading-relaxed">
          "{proposal.foundation.principle}"
        </p>
      </blockquote>
      <div className="space-y-4">
        {proposal.foundation.body.map((p, i) => (
          <p
            key={i}
            className="text-white/70 text-sm sm:text-base leading-relaxed"
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function Articles({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow={`03 · ${proposal.articlesLabel}`}
        tokens={tokens}
      />
      <div className="space-y-4">
        {proposal.articles.map((art, i) => (
          <motion.article
            key={art.number}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 overflow-hidden"
          >
            <div
              className={`absolute top-0 bottom-0 left-0 w-[3px] ${tokens.accentLine}`}
            />
            <div className="flex items-baseline gap-3 mb-3">
              <span
                className={`font-mono text-[10px] uppercase tracking-[0.25em] ${tokens.text}`}
              >
                {art.number}
              </span>
              <span className="h-px flex-1 bg-white/5" />
            </div>
            <h4 className="font-serif text-lg sm:text-xl font-semibold text-white mb-3 leading-snug">
              {art.heading}
            </h4>
            <div className="space-y-3">
              {art.body.map((p, j) => (
                <p
                  key={j}
                  className="text-white/70 text-sm sm:text-[15px] leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
            {art.bullets && (
              <ul className="mt-4 space-y-2">
                {art.bullets.map((b, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-3 text-white/60 text-sm leading-relaxed"
                  >
                    <span
                      className={`mt-[0.6em] w-1 h-1 rounded-full ${tokens.accentLine} shrink-0`}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Roadmap({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="04 · Hoja de ruta" tokens={tokens} />
      <h3 className="font-serif text-xl sm:text-2xl text-white leading-snug">
        Hoja de ruta
      </h3>
      <ol className="relative space-y-6 pl-6 sm:pl-8">
        <span
          className={`absolute left-[7px] sm:left-[11px] top-2 bottom-2 w-px bg-gradient-to-b ${tokens.gradient}`}
        />
        {proposal.roadmap.map((step, i) => (
          <li key={i} className="relative">
            <span
              className={`absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 ${tokens.border} ${tokens.bg}`}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.25em] ${tokens.text}`}
                >
                  {step.phase}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                  {step.window}
                </span>
              </div>
              <p className="text-white/75 text-sm sm:text-[15px] leading-relaxed">
                {step.action}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Accountability({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="05 · Rendición de cuentas"
        tokens={tokens}
      />
      <h3 className="font-serif text-xl sm:text-2xl text-white leading-snug">
        {proposal.accountability.heading}
      </h3>
      <div className="space-y-4">
        {proposal.accountability.body.map((p, i) => (
          <p
            key={i}
            className="text-white/70 text-sm sm:text-base leading-relaxed"
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function Closing({
  proposal,
  tokens,
}: {
  proposal: FullProposal;
  tokens: Tokens;
}) {
  return (
    <section
      className={`rounded-2xl border ${tokens.softBorder} ${tokens.softBg} p-6 sm:p-8 space-y-4 text-center`}
    >
      <p className="font-serif italic text-white/85 text-base sm:text-lg leading-relaxed">
        {proposal.closing.callToAction}
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <span className={`h-px w-12 ${tokens.accentLine}`} />
        <span
          className={`text-[10px] font-mono uppercase tracking-[0.3em] ${tokens.text}`}
        >
          Firmantes
        </span>
        <span className={`h-px w-12 ${tokens.accentLine}`} />
      </div>
      <p className="text-white/55 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
        {proposal.closing.signatureLine}
      </p>
    </section>
  );
}
