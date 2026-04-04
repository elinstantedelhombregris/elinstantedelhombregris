import StoryScroll from './StoryScroll';

interface ComunidadSectionProps {
  ayudaCompartirPost: any | null;
  posts: any[];
  onNavigateToPost: (id: number) => void;
  onNavigate: (path: string) => void;
}

export default function ComunidadSection({ ayudaCompartirPost, posts, onNavigateToPost, onNavigate }: ComunidadSectionProps) {
  // Filter out the featured post and mission posts from regular display
  const regularPosts = posts.filter((p: any) =>
    p.type !== 'mission' &&
    p.id !== ayudaCompartirPost?.id
  );

  return (
    <>
      <StoryScroll
        ayudaCompartirPost={ayudaCompartirPost}
        onNavigateToPost={onNavigateToPost}
      />

      {/* Future user-created posts would display here */}
      {regularPosts.length > 0 && (
        <section className="py-8 border-t border-white/5">
          <div className="container-content">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-slate-500 mb-6">Iniciativas de la Tribu</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Render regular posts here using the existing card pattern */}
              {/* For now, this section is empty since we cleaned old posts */}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
