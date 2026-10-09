import { VincularAportesIdeales } from '@/components/civic/VincularAportesIdeales';
import type { EspacioPersonal } from '@v2/shared';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonTinta, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import { IDEAL_API, esErrorDeSesion, leerIdeal, escribirIdeal, mensajeDeRed } from '@/civic/ideal';

type Cuenta = { id: number; name: string; email: string };
type Aviso = { id: string; titulo: string; href: string; leidoEn: string | null };
/**
 * Qué se sabe de la sesión al abrir la pantalla. `sinSesion` es sólo un 401; una falla de red o un
 * 5xx es `falla`: la sesión puede seguir vigente, así que no se la borra ni se pide ingresar de nuevo.
 */
type Lectura = 'cargando' | 'lista' | 'sinSesion' | 'falla';
export default function EspacioIdeal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const generacion = useRef(0);
  const [user, setUser] = useState<Cuenta | null>(null);
  const [espacio, setEspacio] = useState<EspacioPersonal | null>(null);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [ticket, setTicket] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [lectura, setLectura] = useState<Lectura>('cargando');
  const limpiar = () => {
    setUser(null);
    setEspacio(null);
    setAvisos([]);
  };
  const cargar = useCallback(() => {
    const actual = ++generacion.current;
    setLectura((l) => (l === 'lista' ? l : 'cargando'));
    void leerIdeal<{ user: Cuenta }>('/api/auth/me')
      .then(async (u) => {
        const [s, a, vigente] = await Promise.all([
          leerIdeal<EspacioPersonal>('/api/v1/mi-espacio'),
          leerIdeal<Aviso[]>('/api/v1/mi-espacio/avisos'),
          leerIdeal<{ user: Cuenta }>('/api/auth/me'),
        ]);
        if (actual !== generacion.current) return;
        // La cuenta cambió entre una lectura y otra: no se muestra mezclada, se vuelve a leer.
        if (vigente.user.id !== u.user.id) {
          setLectura('falla');
          return;
        }
        setUser(u.user);
        setEspacio(s);
        setAvisos(a);
        setLectura('lista');
      })
      .catch((e: unknown) => {
        if (actual !== generacion.current) return;
        if (esErrorDeSesion(e)) {
          limpiar();
          setLectura('sinSesion');
        } else setLectura('falla');
      });
    return () => {
      generacion.current++;
    };
  }, []);
  useFocusEffect(cargar);
  const ingresar = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const u = await escribirIdeal<{ user?: Cuenta; needsTwoFactor?: boolean; ticket?: string }>(
        '/api/auth/login',
        { identifier, password },
      );
      setPassword('');
      if (u.needsTwoFactor) {
        setTicket(u.ticket ?? '');
        return;
      }
      if (u.user) setUser(u.user);
      cargar();
    } catch (e) {
      setError(mensajeDeRed(e));
    } finally {
      setBusy(false);
    }
  };
  const verificar = async () => {
    setBusy(true);
    setError('');
    try {
      await escribirIdeal('/api/auth/2fa/verify', { ticket, code: codigo });
      setTicket('');
      setCodigo('');
      cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos verificar el segundo paso.');
    } finally {
      setBusy(false);
    }
  };
  const abrir = (ruta: string) => {
    if (IDEAL_API) void WebBrowser.openBrowserAsync(IDEAL_API + ruta);
  };
  const salir = async () => {
    generacion.current++;
    try {
      await escribirIdeal('/api/auth/logout', {});
      limpiar();
      setLectura('sinSesion');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cerrar la sesión.');
    }
  };
  const marcar = async (id: string) => {
    try {
      await escribirIdeal('/api/v1/mi-espacio/avisos/' + id + '/leido', {});
      setAvisos((xs) =>
        xs.map((x) => (x.id === id ? { ...x, leidoEn: new Date().toISOString() } : x)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos marcar el aviso.');
    }
  };
  return (
    <ScrollView
      className="bg-papel flex-1"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <BotonTinta etiqueta="Volver" variante="fantasma" onPress={() => router.back()} />
      <Kicker className="mt-7">Continuidad sin perder la voz</Kicker>
      <TituloAnton tamano="lg" className="mt-3">
        Mi espacio.
      </TituloAnton>
      <Text className="font-archivo text-tinta-75 mt-4 text-sm leading-6">
        Tus aportes compartidos con cuenta pueden volver a vos desde otro dispositivo. Los
        borradores de la app siguen locales; ingresar no publica ni vincula automáticamente la
        bitácora anterior.
      </Text>
      {lectura === 'falla' && (
        <PapelCard className="mt-6 gap-4 p-5">
          <Text accessibilityRole="alert" className="font-archivo text-tinta text-sm leading-6">
            No pudimos leer tu espacio. Revisá la conexión y probá de nuevo.
          </Text>
          <BotonTinta
            etiqueta="Reintentar"
            onPress={() => {
              cargar();
            }}
          />
        </PapelCard>
      )}
      {user ? (
        <>
          <Text className="font-archivo-bold text-tinta mt-6 text-base">
            {user.name} · cuenta privada
          </Text>
          <VincularAportesIdeales key={user.id} usuario={user.id} actualizado={cargar} />
          <View className="mt-5 gap-4">
            {espacio?.aportes.map((a) => (
              <PapelCard key={a.id} className="gap-3 p-5">
                <Text className="font-archivo text-tinta text-sm leading-6">
                  {a.texto || 'Aporte retirado.'}
                </Text>
                <Text className="font-space text-tinta-50 text-xs">
                  {a.tipo} · {a.estado}
                </Text>
                <BotonTinta
                  etiqueta="Abrir y gestionar mi aporte"
                  variante="fantasma"
                  onPress={() => abrir('/senal/' + a.id)}
                />
              </PapelCard>
            ))}
          </View>
          {espacio?.aportes.length === 0 && (
            <Text className="font-archivo text-tinta mt-5 text-sm">
              Todavía no hay aportes asociados a esta cuenta.
            </Text>
          )}
          <TituloAnton tamano="md" className="mt-8">
            Los procesos que seguís.
          </TituloAnton>
          <View className="mt-5 gap-3">
            {espacio?.seguimientos.map((s) => (
              <BotonTinta
                key={s.id}
                etiqueta={s.titulo}
                variante="fantasma"
                onPress={() => abrir(s.href)}
              />
            ))}
          </View>
          <TituloAnton tamano="md" className="mt-8">
            Lo que cambió.
          </TituloAnton>
          <View className="mt-5 gap-4">
            {avisos.map((a) => (
              <PapelCard key={a.id} className="gap-3 p-5">
                <Text className="font-archivo text-tinta text-sm">{a.titulo}</Text>
                <BotonTinta
                  etiqueta="Ver novedad"
                  variante="fantasma"
                  onPress={() => abrir(a.href)}
                />
                {!a.leidoEn && (
                  <BotonTinta
                    etiqueta="Marcar leído"
                    variante="fantasma"
                    onPress={() => {
                      void marcar(a.id);
                    }}
                  />
                )}
              </PapelCard>
            ))}
          </View>
          <View className="mt-8 gap-3">
            <BotonTinta
              etiqueta="Cuenta, descarga y preferencias en la web"
              variante="fantasma"
              onPress={() => abrir('/mi-espacio')}
            />
            <BotonTinta
              etiqueta="Cerrar sesión de v2 en la app"
              variante="fantasma"
              onPress={() => {
                void salir();
              }}
            />
          </View>
        </>
      ) : lectura === 'cargando' ? (
        <Text accessibilityLiveRegion="polite" className="font-archivo text-tinta-75 mt-6 text-sm">
          Abriendo tu espacio…
        </Text>
      ) : lectura === 'falla' ? null : ticket ? (
        <PapelCard className="mt-6 gap-4 p-5">
          <Text className="font-archivo-bold text-tinta text-base">
            El segundo paso cuida tu cuenta.
          </Text>
          <TextInput
            accessibilityLabel="Código de dos pasos"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            value={codigo}
            onChangeText={setCodigo}
            className="border-tinta font-archivo text-tinta border p-3"
          />
          <BotonTinta
            etiqueta="Verificar mi acceso"
            cargando={busy}
            disabled={codigo.trim().length < 6}
            onPress={() => {
              void verificar();
            }}
          />
          <BotonTinta
            etiqueta="Volver al ingreso"
            variante="fantasma"
            onPress={() => setTicket('')}
          />
        </PapelCard>
      ) : (
        <PapelCard className="mt-6 gap-4 p-5">
          <Text className="font-archivo-bold text-tinta text-base">Ingresar a v2</Text>
          <TextInput
            accessibilityLabel="Correo o usuario de v2"
            autoCapitalize="none"
            autoComplete="username"
            value={identifier}
            onChangeText={setIdentifier}
            className="border-tinta font-archivo text-tinta border p-3"
          />
          <TextInput
            accessibilityLabel="Contraseña de v2"
            secureTextEntry
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
            className="border-tinta font-archivo text-tinta border p-3"
          />
          <BotonTinta
            etiqueta="Ingresar a mi espacio"
            cargando={busy}
            disabled={!identifier || !password}
            onPress={() => {
              void ingresar();
            }}
          />
          <BotonTinta
            etiqueta="Crear cuenta o ingresar con dos pasos en la web"
            variante="fantasma"
            onPress={() => abrir('/ingresar?volver=%2Fmi-espacio')}
          />
        </PapelCard>
      )}
      {!!error && (
        <Text accessibilityRole="alert" className="font-archivo text-sello mt-5 text-sm">
          {error}
        </Text>
      )}
      <View className="mt-8">
        <BotonTinta
          etiqueta="Ver borradores de este dispositivo"
          variante="fantasma"
          onPress={() => router.push('/campanas')}
        />
      </View>
    </ScrollView>
  );
}
