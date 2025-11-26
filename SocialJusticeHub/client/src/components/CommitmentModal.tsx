import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Target, Users, ArrowRight, CheckCircle } from 'lucide-react';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (commitmentData: any) => void;
  type?: 'initial' | 'intermediate' | 'public';
  title?: string;
}

const CommitmentModal = ({
  isOpen,
  onClose,
  onCommit,
  type = 'intermediate',
  title = 'Compromiso con el Cambio'
}: CommitmentModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleSubmit = () => {
    onCommit({
      type,
      data: commitmentData,
      timestamp: new Date().toISOString()
    });
    onClose();
    setCurrentStep(1);
    setCommitmentData({
      personalCommitment: '',
      actionType: '',
      communityCommitment: ''
    });
  };

  const steps = [
    {
      title: "Reconocer tu Poder",
      description: "El cambio empieza contigo",
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Cada persona tiene el poder de crear un cambio positivo en su comunidad. 
            ¿Qué te motiva a ser parte de la transformación de Argentina?
          </p>
          <div>
            <Label htmlFor="personalCommitment">Tu compromiso personal</Label>
            <Textarea
              id="personalCommitment"
              value={commitmentData.personalCommitment}
              onChange={(e) => setCommitmentData({ ...commitmentData, personalCommitment: e.target.value })}
              placeholder="Por ejemplo: 'Me comprometo a ser más consciente de mi impacto en la comunidad y a tomar acciones concretas para mejorarla'"
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      )
    },
    {
      title: "Elegir tu Acción",
      description: "El primer paso hacia el cambio",
      icon: <Target className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Ahora elige una acción concreta que puedas realizar. 
            Los grandes cambios se construyen con pequeños pasos.
          </p>
          <div>
            <Label htmlFor="actionType">Tipo de acción</Label>
            <Select 
              value={commitmentData.actionType} 
              onValueChange={(value) => setCommitmentData({ ...commitmentData, actionType: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecciona una acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="community">Participar en mi comunidad local</SelectItem>
                <SelectItem value="education">Educar a otros sobre temas importantes</SelectItem>
                <SelectItem value="volunteer">Voluntariado en organizaciones</SelectItem>
                <SelectItem value="advocacy">Defender causas que me importan</SelectItem>
                <SelectItem value="environment">Cuidar el medio ambiente</SelectItem>
                <SelectItem value="transparency">Promover transparencia y honestidad</SelectItem>
                <SelectItem value="other">Otra acción específica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="communityCommitment">Cómo planeas implementarlo</Label>
            <Textarea
              id="communityCommitment"
              value={commitmentData.communityCommitment}
              onChange={(e) => setCommitmentData({ ...commitmentData, communityCommitment: e.target.value })}
              placeholder="Describe específicamente cómo vas a llevar a cabo esta acción..."
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Formulario de compromiso personal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current step content */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentStepData.description}
            </p>
          </div>

          <div className="min-h-[200px]">
            {currentStepData.content}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </Button>

            {currentStep < 2 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !commitmentData.personalCommitment.trim()) ||
                  (currentStep === 2 && (!commitmentData.actionType || !commitmentData.communityCommitment.trim()))
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Compromiso
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommitmentModal;