import React from 'react';

type StudyStep = 'video' | 'quiz' | 'reflection';

interface StageStepperProps {
  currentStep: StudyStep;
}

const StageStepper: React.FC<StageStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 'video', label: 'Vídeo', icon: 'play-circle' },
    { id: 'quiz', label: 'Quiz', icon: 'help-circle' },
    { id: 'reflection', label: 'Reflexão', icon: 'pen-square' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const progressPercentage = currentStepIndex > 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="relative flex justify-between items-start">
        {/* Background line */}
        <div className="absolute left-0 top-6 w-full h-1 bg-gray-600" />
        {/* Progress line */}
        <div 
            className="absolute left-0 top-6 h-1 bg-green-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.id} className="z-10 flex flex-col items-center text-center w-20">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive ? 'bg-blue-600 border-blue-400 scale-110' : ''}
                  ${isCompleted ? 'bg-green-600 border-green-400' : ''}
                  ${!isActive && !isCompleted ? 'bg-gray-700 border-gray-500' : ''}
                `}
              >
                <i data-lucide={isCompleted ? 'check' : step.icon} className="w-6 h-6 text-white"></i>
              </div>
              <p
                className={`mt-2 text-sm font-semibold transition-colors duration-300
                  ${isActive ? 'text-blue-300' : ''}
                  ${isCompleted ? 'text-green-300' : ''}
                  ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StageStepper;
