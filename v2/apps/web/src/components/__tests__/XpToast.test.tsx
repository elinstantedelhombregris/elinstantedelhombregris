import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XpToast } from '../XpToast';

import { xpEventBus } from '~/lib/xp-event-bus';


afterEach(() => {
  cleanup();
});

describe('XpToast', () => {
  it('renders the XP-only variant', async () => {
    render(<XpToast />);
    act(() => {
      xpEventBus.publish({ xpAwarded: 25, kind: 'quiz_completed', newLevel: null, newBadges: [] });
    });
    expect(await screen.findByText('+25 XP')).toBeInTheDocument();
    expect(screen.getByText('Cuestionario completado')).toBeInTheDocument();
  });

  it('renders the badge variant', async () => {
    render(<XpToast />);
    act(() => {
      xpEventBus.publish({
        xpAwarded: 10,
        kind: 'pulse_submitted',
        newLevel: null,
        newBadges: [{ slug: 'first-pulse', title: 'Voz registrada', tier: 'bronze' }],
      });
    });
    expect(await screen.findByText('Nueva insignia: Voz registrada')).toBeInTheDocument();
  });

  it('renders the level-up variant', async () => {
    render(<XpToast />);
    act(() => {
      xpEventBus.publish({ xpAwarded: 50, kind: 'goal_completed', newLevel: 3, newBadges: [] });
    });
    expect(await screen.findByText('¡Subiste al Nivel 3!')).toBeInTheDocument();
  });
});
