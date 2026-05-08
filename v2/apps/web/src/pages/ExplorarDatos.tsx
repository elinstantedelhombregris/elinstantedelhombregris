/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-explicit-any */
// react-map-gl/maplibre's TS types are noisy under strict + react-19
// candidate types. The library is mature and well-tested at runtime;
// we relax type-safety inside this file only.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';
import { default as MapDefault, Marker as MarkerDefault } from 'react-map-gl/maplibre';
const Map = MapDefault as any;
const Marker = MarkerDefault as any;

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/lib/api';
import { readCsrfToken, useAuth } from '~/lib/auth';

interface Province {
  id: number;
  name: string;
  isoCode: string | null;
  latitude: string | null;
  longitude: string | null;
}
interface ProvincesResponse {
  provinces: Province[];
}

interface ByProvince {
  provinceId: number | null;
  count: number;
}
interface AggResponse {
  byProvince: ByProvince[];
}

const ARGENTINA_CENTER = { latitude: -38.0, longitude: -63.5, zoom: 3.5 };

export function ExplorarDatos() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [submittedAs, setSubmittedAs] = useState('');

  const provincesQuery = useQuery<ProvincesResponse>({
    queryKey: ['open-data', 'provinces'],
    queryFn: () => api.get<ProvincesResponse>('/api/open-data/provinces'),
  });

  const aggQuery = useQuery<AggResponse>({
    queryKey: ['open-data', 'dreams', 'by-province'],
    queryFn: () => api.get<AggResponse>('/api/open-data/dreams/by-province'),
  });

  const submitMutation = useMutation({
    mutationFn: async () =>
      api.post(
        '/api/open-data/dreams',
        {
          body,
          provinceId: provinceId ?? undefined,
          submittedAs: !user && submittedAs ? submittedAs : undefined,
        },
        { csrfToken: readCsrfToken() },
      ),
    onSuccess: () => {
      setBody('');
      void queryClient.invalidateQueries({ queryKey: ['open-data', 'dreams'] });
    },
  });

  const provinces = provincesQuery.data?.provinces ?? [];
  const counts = new Map((aggQuery.data?.byProvince ?? []).map((c) => [c.provinceId, c.count]));
  const totalDreams = (aggQuery.data?.byProvince ?? []).reduce((s, c) => s + c.count, 0);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">La radiografía</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight">
          <span className="gradient-text">Lo que sueña el país.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Cada punto es un sueño compartido por alguien de la red.{' '}
          {totalDreams > 0 ? `${String(totalDreams)} sueños registrados.` : 'Sé el primero.'}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <section className="glass overflow-hidden rounded-2xl">
          <div className="h-[480px]">
            <Map
              initialViewState={ARGENTINA_CENTER}
              mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            >
              {provinces.map((p) => {
                if (!p.latitude || !p.longitude) return null;
                const count = counts.get(p.id) ?? 0;
                const size = Math.min(8 + count * 2, 36);
                return (
                  <Marker
                    key={p.id}
                    latitude={Number(p.latitude)}
                    longitude={Number(p.longitude)}
                    anchor="center"
                  >
                    <div
                      className="flex items-center justify-center rounded-full border border-iris-violet/60 bg-iris-violet/30 text-[10px] font-mono text-foreground"
                      style={{ width: size, height: size }}
                      title={`${p.name}: ${String(count)}`}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </Marker>
                );
              })}
            </Map>
          </div>
        </section>

        <aside className="glass rounded-2xl p-6">
          <h2 className="mb-4 font-serif text-xl font-semibold">Compartí tu sueño</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (body.trim()) submitMutation.mutate();
            }}
          >
            <div>
              <Label htmlFor="dream-body">¿Qué soñás para Argentina?</Label>
              <textarea
                id="dream-body"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                }}
                placeholder="Soñá grande. Soñá en concreto. Soñá lo que quieras."
                className="min-h-[120px] w-full rounded-md border border-white/10 bg-white/5 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                maxLength={2000}
                required
              />
            </div>
            <div>
              <Label htmlFor="dream-province">Provincia (opcional)</Label>
              <select
                id="dream-province"
                value={provinceId ?? ''}
                onChange={(e) => {
                  setProvinceId(e.target.value === '' ? null : Number(e.target.value));
                }}
                className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm"
              >
                <option value="" className="bg-background">
                  Sin especificar
                </option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id} className="bg-background">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {!user ? (
              <div>
                <Label htmlFor="dream-submitted-as">Tu nombre o seudónimo (opcional)</Label>
                <Input
                  id="dream-submitted-as"
                  value={submittedAs}
                  onChange={(e) => {
                    setSubmittedAs(e.target.value);
                  }}
                  placeholder="Anónimo"
                  maxLength={80}
                />
              </div>
            ) : null}
            <Button type="submit" disabled={submitMutation.isPending || !body.trim()} className="w-full">
              {submitMutation.isPending ? 'Enviando…' : 'Compartir mi sueño'}
            </Button>
            {submitMutation.isSuccess ? (
              <p className="text-center text-xs text-green-400">¡Gracias! Tu sueño quedó en la red.</p>
            ) : null}
          </form>
        </aside>
      </div>
    </main>
  );
}

export default ExplorarDatos;
