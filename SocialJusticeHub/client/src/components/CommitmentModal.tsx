import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, CheckCircle, Droplets, Sprout, Wind } from 'lucide-react';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (commitmentData: any) => void | Promise<void>;
  type?: 'initial' | 'intermediate' | 'public';
  title?: string;
}

type CommitmentModalType = 'initial' | 'intermediate' | 'public';

const TYPE_THEME: Record<CommitmentModalType, {
  badge: string;
  badgeClass: string;
  iconClass: string;
  iconWrapClass: string;
  buttonClass: string;
  stepClass: string;
}> = {
  initial: {
    badge: 'Semilla Inicial',
    badgeClass: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
    iconClass: 'text-emerald-200',
    iconWrapClass: 'from-emerald-500/35 to-teal-500/20 border-emerald-400/30',
    buttonClass: 'from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
    stepClass: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
  },
  intermediate: {
    badge: 'Semilla en Crecimiento',
    badgeClass: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-200',
    iconClass: 'text-cyan-200',
    iconWrapClass: 'from-cyan-500/35 to-blue-500/20 border-cyan-400/30',
    buttonClass: 'from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400',
    stepClass: 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100'
  },
  public: {
    badge: 'Semilla Pública',
    badgeClass: 'bg-orange-500/15 border-orange-400/30 text-orange-200',
    iconClass: 'text-orange-200',
    iconWrapClass: 'from-orange-500/35 to-amber-500/20 border-orange-400/30',
    buttonClass: 'from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400',
    stepClass: 'border-orange-400/50 bg-orange-500/15 text-orange-100'
  }
};

const CommitmentModal = ({
  isOpen,
  onClose,
  onCommit,
  type = 'intermediate',
  title = 'Compromiso con el Cambio'
}: CommitmentModalProps) => {
  const theme = TYPE_THEME[type as CommitmentModalType] ?? TYPE_THEME.intermediate;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commitmentData, setCommitmentData] = useState({
    personalCommitment: '',
    actionType: '',
    communityCommitment: ''
  });

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetState = () => {
    setCurrentStep(1);
    setCommitmentData({
      personalCommitment: '',
      actionType: '',
      communityCommitment: ''
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(onCommit({
        type,
        data: commitmentData,
        timestamp: new Date().toISOString()
      }));
      onClose();
      resetState();
    } catch (_error) {
      // Parent handler already communicates the reason (toast/redirect).
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open || isSubmitting) return;
    onClose();
    resetState();
  };

  const handleCancelOrBack = () => {
    if (isSubmitting) return;
    if (currentStep === 1) {
      onClose();
      resetState();
      return;
    }
    handleBack();
  };

  const canContinue = commitmentData.personalCommitment.trim().length > 0;
  const canSubmit =
    canContinue &&
    !!commitmentData.actionType &&
    commitmentData.communityCommitment.trim().length > 0;

  const steps = [
    {
      title: "Reconocer tu Poder",
      description: "El cambio empieza contigo",
      icon: <Sprout className={`w-7 h-7 ${theme.iconClass}`} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-emerald-100/75">
            Cada persona tiene el poder de crear un cambio positivo en su comunidad. 
            ¿Qué te motiva a ser parte de la transformación de Argentina?
          </p>
          <div className="space-y-2">
            <Label htmlFor="personalCommitment" className="text-emerald-50 text-sm">
              Tu compromiso personal
            </Label>
            <Textarea
              id="personalCommitment"
              value={commitmentData.personalCommitment}
              onChange={(e) => setCommitmentData({ ...commitmentData, personalCommitment: e.target.value })}
              placeholder="Ejemplo: Me comprometo a escuchar más, actuar con coherencia y sostener una acción semanal de servicio."
              className="min-h-[140px] border-emerald-500/25 bg-[#08130d] text-emerald-50 placeholder:text-emerald-200/35 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-0"
              rows={4}
              maxLength={420}
            />
            <p className="text-xs text-emerald-200/55 text-right">
              {commitmentData.personalCommitment.length}/420
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Elegir tu Acción",
      description: "El primer paso hacia el cambio",
      icon: <Droplets className={`w-7 h-7 ${theme.iconClass}`} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-emerald-100/75">
            Ahora elige una acción concreta que puedas realizar. 
            Los grandes cambios se construyen con pequeños pasos.
          </p>
          <div className="space-y-2">
            <Label htmlFor="actionType" className="text-emerald-50 text-sm">
              Tipo de acción
            </Label>
            <Select 
              value={commitmentData.actionType} 
              onValueChange={(value) => setCommitmentData({ ...commitmentData, actionType: value })}
            >
              <SelectTrigger className="h-12 border-emerald-500/25 bg-[#08130d] text-emerald-50 data-[placeholder]:text-emerald-200/45 focus:ring-emerald-400/40 focus:ring-offset-0">
                <SelectValue placeholder="Selecciona una acción" />
              </SelectTrigger>
              <SelectContent className="border-emerald-500/25 bg-[#08130d] text-emerald-50">
                <SelectItem value="community" className="focus:bg-emerald-500/20 focus:text-emerald-50">Participar en mi comunidad local</SelectItem>
                <SelectItem value="education" className="focus:bg-emerald-500/20 focus:text-emerald-50">Educar a otros sobre temas importantes</SelectItem>
                <SelectItem value="volunteer" className="focus:bg-emerald-500/20 focus:text-emerald-50">Voluntariado en organizaciones</SelectItem>
                <SelectItem value="advocacy" className="focus:bg-emerald-500/20 focus:text-emerald-50">Defender causas que me importan</SelectItem>
                <SelectItem value="environment" className="focus:bg-emerald-500/20 focus:text-emerald-50">Cuidar el medio ambiente</SelectItem>
                <SelectItem value="transparency" className="focus:bg-emerald-500/20 focus:text-emerald-50">Promover transparencia y honestidad</SelectItem>
                <SelectItem value="other" className="focus:bg-emerald-500/20 focus:text-emerald-50">Otra acción específica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="communityCommitment" className="text-emerald-50 text-sm">
              Cómo planeas implementarlo
            </Label>
            <Textarea
              id="communityCommitment"
              value={commitmentData.communityCommitment}
              onChange={(e) => setCommitmentData({ ...commitmentData, communityCommitment: e.target.value })}
              placeholder="Describe específicamente cómo vas a llevar a cabo esta acción..."
              className="min-h-[120px] border-emerald-500/25 bg-[#08130d] text-emerald-50 placeholder:text-emerald-200/35 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-0"
              rows={4}
              maxLength={360}
            />
            <p className="text-xs text-emerald-200/55 text-right">
              {commitmentData.communityCommitment.length}/360
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[680px] border-emerald-500/30 bg-[#040b07] p-0 text-emerald-50 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] [&>button]:bg-black/20 [&>button]:text-emerald-200/80 [&>button]:rounded-full [&>button]:p-1 [&>button]:right-5 [&>button]:top-5 [&>button]:hover:bg-emerald-500/20 [&>button]:hover:text-emerald-100 [&>button]:data-[state=open]:bg-transparent [&>button_svg]:h-5 [&>button_svg]:w-5">
        <div className="relative border-b border-emerald-500/20 px-6 pb-5 pt-8 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/12 via-transparent to-cyan-500/8" />
          <DialogHeader className="relative space-y-3">
            <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-semibold backdrop-blur-sm text-left ${theme.badgeClass}`}>
              <Wind className="w-3.5 h-3.5" />
              {theme.badge}
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-left">
            {title}
          </DialogTitle>
            <DialogDescription className="text-emerald-100/70 text-sm leading-relaxed text-left max-w-2xl">
              Sembrá una promesa concreta, visible y accionable. Esta semilla alimenta el semillero colectivo de transformación.
          </DialogDescription>
        </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          {/* Progress indicator */}
          <div className="grid grid-cols-2 gap-3">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`rounded-xl border px-3 py-2 transition-colors ${
                  index + 1 <= currentStep
                    ? theme.stepClass
                    : 'border-emerald-900/50 bg-[#07100b] text-emerald-200/55'
                }`}
              >
                <div className="flex items-center gap-2">
                <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    index + 1 <= currentStep
                        ? 'bg-emerald-100/20 text-emerald-50'
                        : 'bg-emerald-950/60 text-emerald-300/60'
                  }`}
                >
                  {index + 1 < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                  ) : (
                      index + 1
                  )}
                </div>
                  <p className="text-xs uppercase tracking-wider">
                    Paso {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Current step content */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#07120c] p-5 sm:p-6">
            <div className={`w-12 h-12 rounded-xl border bg-gradient-to-br ${theme.iconWrapClass} flex items-center justify-center mb-4`}>
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold text-emerald-50 mb-1">
              {currentStepData.title}
            </h3>
            <p className="text-emerald-100/65 mb-5 text-sm">
              {currentStepData.description}
            </p>
            <div className="min-h-[220px]">
              {currentStepData.content}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleCancelOrBack}
              disabled={isSubmitting}
              className="border-emerald-500/30 bg-transparent text-emerald-100 hover:bg-emerald-500/10 hover:text-emerald-50"
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </Button>

            {currentStep < 2 ? (
              <Button
                onClick={handleNext}
                disabled={isSubmitting || !canContinue}
                className={`bg-gradient-to-r ${theme.buttonClass} text-white border-0`}
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !canSubmit
                }
                className={`bg-gradient-to-r ${theme.buttonClass} text-white border-0`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Guardando...' : 'Confirmar Compromiso'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommitmentModal;
