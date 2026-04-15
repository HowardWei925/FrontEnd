import { motion } from 'motion/react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface WorkflowStep {
  id: number;
  name: string;
  description: string;
}

const steps: WorkflowStep[] = [
  { id: 1, name: '补丁定位', description: '识别漏洞修复' },
  { id: 2, name: '语义映射', description: '分析代码结构' },
  { id: 3, name: '补丁迁移', description: '应用更改' },
  { id: 4, name: '验证', description: '测试结果' },
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
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep || (stepNumber === currentStep && !isLoading);
            const isCurrent = stepNumber === currentStep && isLoading;
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
                    relative w-12 h-12 rounded-full flex items-center justify-center mb-3 z-10 shadow-sm border border-slate-200
                    ${isCompleted ? 'bg-white' : ''}
                    ${isCurrent ? 'bg-white' : ''}
                    ${isPending ? 'bg-gray-100 border-2 border-slate-300' : ''}
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
                      <CheckCircle2 className="w-6 h-6 text-slate-900" />
                    </motion.div>
                  )}
                  {isCurrent && (
                    <>
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-900 fill-slate-900" />
                      )}
                      {/* Glow Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-300/30 blur-md"
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
                    <span className="text-sm text-gray-600">{stepNumber}</span>
                  )}
                </motion.div>

                {/* Step Info */}
                <div className="text-center">
                  <p
                    className={`text-sm mb-1 transition-colors ${
                      isCurrent ? 'text-blue-600 font-semibold' : ''
                    } ${isCompleted ? 'text-green-600' : ''} ${
                      isPending ? 'text-gray-600' : ''
                    }`}
                  >
                    {step.name}
                  </p>
                  <p
                    className={`text-xs ${
                      isCurrent ? 'text-slate-600' : 'text-gray-600'
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
