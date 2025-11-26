import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface QuizQuestionProps {
  question: Question;
  answer?: any;
  onChange: (answer: any) => void;
  showResult?: boolean;
}

const QuizQuestion = ({ question, answer, onChange, showResult = false }: QuizQuestionProps) => {
  const options = question.options ? JSON.parse(question.options) : [];
  const correctAnswer = JSON.parse(question.correctAnswer);
  const isCorrect = showResult && JSON.stringify(answer) === JSON.stringify(correctAnswer);

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={answer !== undefined ? String(answer) : ''}
            onValueChange={(value) => onChange(value)}
            disabled={showResult}
          >
            {options.map((option: string, index: number) => {
              const isSelected = answer === index || answer === String(index);
              const isCorrectOption = showResult && (
                (Array.isArray(correctAnswer) && correctAnswer.includes(index)) ||
                (!Array.isArray(correctAnswer) && correctAnswer === index)
              );

              return (
                <div key={index} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={String(index)} 
                    id={`option-${index}`}
                    className={cn(
                      "mt-1",
                      showResult && isCorrectOption && "border-green-600"
                    )}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className={cn(
                      "flex-1 cursor-pointer p-3 rounded-lg border-2 transition-colors",
                      isSelected && !showResult && "border-blue-500 bg-blue-50",
                      showResult && isCorrectOption && "border-green-500 bg-green-50",
                      showResult && isSelected && !isCorrectOption && "border-red-500 bg-red-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrectOption && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {showResult && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        );

      case 'true_false':
        return (
          <RadioGroup
            value={answer !== undefined ? String(answer) : ''}
            onValueChange={(value) => onChange(value === 'true')}
            disabled={showResult}
          >
            <div className="space-y-3">
              {['Verdadero', 'Falso'].map((option, index) => {
                const boolValue = index === 0;
                const isSelected = answer === boolValue;
                const isCorrectOption = showResult && correctAnswer === boolValue;

                return (
                  <div key={index} className="flex items-start space-x-3">
                    <RadioGroupItem 
                      value={String(boolValue)} 
                      id={`tf-${index}`}
                      className={cn(
                        "mt-1",
                        showResult && isCorrectOption && "border-green-600"
                      )}
                    />
                    <Label
                      htmlFor={`tf-${index}`}
                      className={cn(
                        "flex-1 cursor-pointer p-3 rounded-lg border-2 transition-colors",
                        isSelected && !showResult && "border-blue-500 bg-blue-50",
                        showResult && isCorrectOption && "border-green-500 bg-green-50",
                        showResult && isSelected && !isCorrectOption && "border-red-500 bg-red-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showResult && isCorrectOption && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        );

      case 'short_answer':
        return (
          <Input
            type="text"
            value={answer || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={showResult}
            placeholder="Escribe tu respuesta aquí..."
            className={cn(
              "w-full",
              showResult && isCorrect && "border-green-500 bg-green-50",
              showResult && !isCorrect && "border-red-500 bg-red-50"
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 flex-1">
              {question.question}
            </h3>
            {showResult && (
              <div className="ml-4">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Puntos: {question.points}
          </p>
        </div>

        <div className="space-y-4">
          {renderQuestion()}
        </div>

        {showResult && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">Explicación:</p>
            <p className="text-sm text-blue-800">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizQuestion;

