import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Certificate {
  id: number;
  certificateCode: string;
  issuedAt: string;
  quizScore?: number;
  course?: {
    id: number;
    title: string;
  };
}

interface CourseCertificateProps {
  certificate: Certificate;
  userName?: string;
}

const CourseCertificate = ({ certificate, userName }: CourseCertificateProps) => {
  const handleDownload = () => {
    // TODO: Implement PDF download
    alert('Descarga de certificado en PDF próximamente');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificado: ${certificate.course?.title}`,
        text: `He completado el curso "${certificate.course?.title}" con un score de ${certificate.quizScore}%`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-2xl mx-auto rounded-[32px] border border-border/60 bg-white/95 shadow-[0_35px_80px_rgba(15,23,42,0.08)]">
        <CardHeader className="text-center bg-white/70 backdrop-blur-sm pb-8 rounded-t-[32px]">
          <div className="mx-auto w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4 shadow-[0_15px_40px_rgba(125,91,222,0.35)]">
            <Award className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">Certificado de Completación</CardTitle>
          <p className="text-foreground/60">Este certificado acredita que</p>
        </CardHeader>

        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {userName || 'Usuario'}
            </h2>
            <p className="text-lg text-foreground/70 mb-4">
              ha completado exitosamente el curso
            </p>
            <h3 className="text-xl font-semibold text-accent mb-4">
              {certificate.course?.title}
            </h3>
            {certificate.quizScore !== undefined && (
              <p className="text-foreground/70">
                con una puntuación de <span className="font-bold">{certificate.quizScore}%</span> en el quiz final
              </p>
            )}
          </div>

          <div className="border-t border-border/50 pt-6 mb-6">
            <p className="text-sm text-foreground/50 mb-2">Código del Certificado</p>
            <p className="font-mono text-lg font-semibold text-foreground tracking-widest">
              {certificate.certificateCode}
            </p>
            <p className="text-xs text-foreground/50 mt-2">
              Fecha de emisión: {new Date(certificate.issuedAt).toLocaleDateString('es-AR')}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Descargar PDF
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCertificate;

