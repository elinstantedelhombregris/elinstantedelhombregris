import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, Database, Users, Lock, Globe, Scale, FileText, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const PoliticaPrivacidad = () => {
  const lastUpdated = '10 de marzo de 2026';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">Documento Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Política de Privacidad y<br />
              <span className="text-blue-400">Uso de Datos</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Última actualización: {lastUpdated}
            </p>
          </motion.div>

          {/* Content */}
          <div className="space-y-12">

            {/* Principio fundamental */}
            <Section
              icon={<Heart className="w-5 h-5 text-rose-400" />}
              title="Principio Fundamental"
            >
              <p>
                El Instante del Hombre Gris es un movimiento de código abierto nacido en Argentina
                y para el pueblo argentino. Creemos que los datos generados por la comunidad son un
                bien colectivo y deben permanecer accesibles, transparentes y al servicio del bien común.
              </p>
            </Section>

            {/* Titularidad */}
            <Section
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              title="1. Titularidad de los Datos"
            >
              <p>
                Todos los datos subidos, generados o contribuidos a esta plataforma pertenecen al
                pueblo argentino. Esto significa que:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>Ninguna entidad privada, corporación o individuo puede reclamar propiedad exclusiva sobre los datos colectivos.</li>
                <li>Los datos son considerados un recurso comunitario abierto, administrado bajo los principios del movimiento.</li>
                <li>Toda persona con un propósito legítimo — investigación, periodismo, activismo social, desarrollo comunitario, educación u otro fin de bien público — puede acceder a los datos agregados y anonimizados.</li>
              </ul>
            </Section>

            {/* Compromiso de no venta */}
            <Section
              icon={<Lock className="w-5 h-5 text-amber-400" />}
              title="2. Compromiso de No Comercialización"
            >
              <p>Nos comprometemos de forma irrevocable a que:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>Nunca venderemos, licenciaremos ni comercializaremos datos personales o colectivos a terceros.</li>
                <li>Nunca utilizaremos los datos para publicidad dirigida, perfilado comercial ni ningún fin de lucro.</li>
                <li>Nunca compartiremos datos identificables con gobiernos, empresas o cualquier entidad sin el consentimiento explícito e informado del usuario.</li>
                <li>Cualquier cambio a esta política será comunicado con al menos 30 días de anticipación y requerirá aprobación de la comunidad.</li>
              </ul>
            </Section>

            {/* Datos que recopilamos */}
            <Section
              icon={<Database className="w-5 h-5 text-blue-400" />}
              title="3. Datos que Recopilamos"
            >
              <p>En el marco de la plataforma, podemos recopilar:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li><strong className="text-white">Datos de registro:</strong> nombre de usuario, correo electrónico y ubicación geográfica general (opcional).</li>
                <li><strong className="text-white">Datos de participación:</strong> respuestas a evaluaciones, compromisos asumidos, aportes a iniciativas comunitarias y contenido generado por el usuario.</li>
                <li><strong className="text-white">Datos de uso:</strong> información técnica anónima sobre la navegación en la plataforma para mejorar la experiencia del usuario.</li>
              </ul>
              <p className="mt-4">
                No recopilamos datos sensibles (origen étnico, orientación sexual, afiliación política,
                datos biométricos ni información financiera) salvo que el usuario decida compartirlos
                voluntariamente en espacios comunitarios.
              </p>
            </Section>

            {/* Acceso abierto */}
            <Section
              icon={<Globe className="w-5 h-5 text-cyan-400" />}
              title="4. Acceso Abierto y Transparencia"
            >
              <p>
                Siguiendo los principios del movimiento de código abierto y datos abiertos:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>Los datos agregados y anonimizados estarán disponibles públicamente a través de la plataforma y, cuando sea viable, mediante una API abierta.</li>
                <li>Cualquier persona puede solicitar acceso a los datos para fines de investigación, periodismo, desarrollo social, educación u otros propósitos de bien público.</li>
                <li>Los datos individuales identificables solo serán accesibles por el propio usuario, quien podrá exportarlos, modificarlos o eliminarlos en cualquier momento.</li>
                <li>Publicaremos informes periódicos de transparencia detallando qué datos se recopilan, cómo se utilizan y quién ha solicitado acceso.</li>
              </ul>
            </Section>

            {/* Derechos del usuario */}
            <Section
              icon={<Scale className="w-5 h-5 text-purple-400" />}
              title="5. Derechos del Usuario"
            >
              <p>
                De conformidad con la Ley 25.326 de Protección de Datos Personales de la
                República Argentina y su decreto reglamentario, cada usuario tiene derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li><strong className="text-white">Acceso:</strong> solicitar y obtener información sobre los datos personales almacenados en la plataforma.</li>
                <li><strong className="text-white">Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                <li><strong className="text-white">Supresión:</strong> solicitar la eliminación de sus datos personales en cualquier momento.</li>
                <li><strong className="text-white">Portabilidad:</strong> exportar sus datos en un formato estándar y legible por máquinas.</li>
                <li><strong className="text-white">Oposición:</strong> oponerse al tratamiento de sus datos en circunstancias específicas.</li>
                <li><strong className="text-white">Revocación del consentimiento:</strong> retirar su consentimiento en cualquier momento sin que ello afecte la licitud del tratamiento previo.</li>
              </ul>
              <p className="mt-4 text-slate-400 text-sm">
                La Dirección Nacional de Protección de Datos Personales (DNPDP), órgano de control de la
                Ley 25.326, tiene la atribución de atender denuncias y reclamos en relación con el
                incumplimiento de las normas sobre protección de datos personales.
              </p>
            </Section>

            {/* Seguridad */}
            <Section
              icon={<Shield className="w-5 h-5 text-green-400" />}
              title="6. Seguridad de los Datos"
            >
              <p>Implementamos medidas técnicas y organizativas para proteger los datos, incluyendo:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>Cifrado en tránsito (HTTPS/TLS) y en reposo para datos sensibles.</li>
                <li>Acceso restringido a datos personales solo al equipo técnico necesario.</li>
                <li>Auditorías periódicas de seguridad del código fuente (al ser proyecto open source, cualquier persona puede auditar el código).</li>
                <li>Anonimización y agregación de datos antes de su publicación abierta.</li>
              </ul>
            </Section>

            {/* Código abierto */}
            <Section
              icon={<FileText className="w-5 h-5 text-orange-400" />}
              title="7. Naturaleza de Código Abierto"
            >
              <p>
                Esta plataforma es un proyecto de código abierto. Esto implica que:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>El código fuente es público y auditable por cualquier persona.</li>
                <li>Las prácticas de manejo de datos pueden ser verificadas directamente en el código.</li>
                <li>La comunidad puede proponer mejoras a esta política a través del repositorio del proyecto.</li>
                <li>Cualquier vulnerabilidad de seguridad puede ser reportada de forma responsable por la comunidad.</li>
              </ul>
            </Section>

            {/* Cookies */}
            <Section
              icon={<Database className="w-5 h-5 text-slate-400" />}
              title="8. Cookies y Tecnologías de Seguimiento"
            >
              <p>Utilizamos únicamente cookies técnicas esenciales para el funcionamiento de la plataforma:</p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>Cookies de sesión para mantener el inicio de sesión del usuario.</li>
                <li>Cookies de preferencias para recordar configuraciones de la interfaz.</li>
                <li>Analíticas anónimas para comprender el uso general de la plataforma y mejorar la experiencia.</li>
              </ul>
              <p className="mt-3">
                No utilizamos cookies de terceros con fines publicitarios ni de seguimiento comercial.
              </p>
            </Section>

            {/* Menores */}
            <Section
              icon={<Shield className="w-5 h-5 text-pink-400" />}
              title="9. Protección de Menores"
            >
              <p>
                La plataforma está diseñada para mayores de 16 años. No recopilamos
                intencionalmente datos de menores de esa edad. Si tomamos conocimiento de que
                hemos recopilado datos de un menor sin el consentimiento parental adecuado,
                eliminaremos dicha información de forma inmediata.
              </p>
            </Section>

            {/* Jurisdicción */}
            <Section
              icon={<Scale className="w-5 h-5 text-blue-400" />}
              title="10. Legislación Aplicable y Jurisdicción"
            >
              <p>
                Esta política se rige por las leyes de la República Argentina, en particular:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>Ley 25.326 de Protección de Datos Personales y su decreto reglamentario 1558/2001.</li>
                <li>Disposiciones de la Dirección Nacional de Protección de Datos Personales (DNPDP).</li>
                <li>Artículo 43, tercer párrafo de la Constitución Nacional Argentina (Habeas Data).</li>
              </ul>
              <p className="mt-3">
                Cualquier controversia será sometida a los tribunales ordinarios de la Ciudad
                Autónoma de Buenos Aires, República Argentina.
              </p>
            </Section>

            {/* Contacto */}
            <Section
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              title="11. Contacto"
            >
              <p>
                Para ejercer tus derechos, realizar consultas o reportar incidencias
                relacionadas con tus datos personales, podés contactarnos a través de:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3 text-slate-300">
                <li>La sección de contacto en la plataforma.</li>
                <li>El repositorio del proyecto en GitHub (para cuestiones técnicas y de código).</li>
                <li>Los canales comunitarios del movimiento.</li>
              </ul>
            </Section>

            {/* Cierre */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16 p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
            >
              <p className="text-slate-300 text-lg font-light italic">
                "Los datos del pueblo son del pueblo. Transparencia, soberanía y bien común
                son los pilares de nuestra política de datos."
              </p>
              <p className="text-slate-500 text-sm mt-4">
                — El Instante del Hombre Gris, movimiento de código abierto
              </p>
            </motion.div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
    className="space-y-4"
  >
    <div className="flex items-center gap-3">
      {icon}
      <h2 className="text-xl md:text-2xl font-serif font-bold">{title}</h2>
    </div>
    <div className="text-slate-300 leading-relaxed pl-8 space-y-3">
      {children}
    </div>
  </motion.section>
);

export default PoliticaPrivacidad;
