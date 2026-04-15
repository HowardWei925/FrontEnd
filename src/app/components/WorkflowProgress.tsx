import { motion } from 'motion/react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface WorkflowStep {
  id: number;
  name: string;
  description: string;
}

const steps: WorkflowStep[] = [
  { id: 1, name: 'Patch Locate', description: 'Identifying vulnerability fix' },
  { id: 2, name: 'Semantic Mapping', description: 'Analyzing code structure' },
  { id: 3, name: 'Patch Transfer', description: 'Applying changes' },
  { id: 4, name: 'Verification', description: 'Testing results' },
];

interface WorkflowProgressProps {
  currentStep: number;
  isLoading?: boolean;
}

export function WorkflowProgress({ currentStep, isLoading = false }: WorkflowProgressProps) {
  return (
    <div className="w-full">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isPending = stepNumber > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center flex-1"
              >
                {/* Step Circle */}
                <motion.div
                  className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center mb-3 z-10
                    ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600' : ''}
                    ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-purple-600' : ''}
                    ${isPending ? 'bg-gray-800 border-2 border-white/20' : ''}
                  `}
                  animate={{
                    scale: isCurrent && isLoading ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isCurrent && isLoading ? Infinity : 0,
                  }}
                >
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                  {isCurrent && (
                    <>
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Circle className="w-6 h-6 text-white fill-white" />
                      )}
                      {/* Glow Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-500/50 blur-xl"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    </>
                  )}
                  {isPending && (
                    <span className="text-sm text-gray-500">{stepNumber}</span>
                  )}
                </motion.div>

                {/* Step Info */}
                <div className="text-center">
                  <p
                    className={`text-sm mb-1 transition-colors ${
                      isCurrent ? 'text-blue-400 font-semibold' : ''
                    } ${isCompleted ? 'text-green-400' : ''} ${
                      isPending ? 'text-gray-500' : ''
                    }`}
                  >
                    {step.name}
                  </p>
                  <p
                    className={`text-xs ${
                      isCurrent ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
