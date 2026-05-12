/**
 * Tiny singleton event bus for XP events. The API response interceptor
 * pushes onto it whenever a response data payload includes an xpEvent
 * field. <XpToast/> subscribes and renders queued toasts.
 *
 * Singleton (not React context) so the API client — which has no
 * React access — can publish.
 */
export interface XpEvent {
  xpAwarded: number;
  kind: string;
  newLevel: number | null;
  newBadges: { slug: string; title: string; tier: string }[];
}

type Listener = (evt: XpEvent) => void;

class XpEventBus {
  private readonly listeners = new Set<Listener>();
  publish(evt: XpEvent): void {
    for (const l of this.listeners) l(evt);
  }
  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  }
}

export const xpEventBus = new XpEventBus();
