import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { Button } from '../components/ui/button';

export function WorkflowPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate workflow progression
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) {
          return prev + 1;
        }
        setIsLoading(false);
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Patch Locate',
          description: 'Analyzing vulnerability and patch differences using Abstract Syntax Tree (AST) comparison...',
          details: [
            'Parsing source code into AST structures',
            'Identifying modified nodes between versions',
            'Extracting vulnerability signature patterns',
            'Computing diff hunks and context lines',
          ],
        };
      case 2:
        return {
          title: 'Semantic Mapping',
          description: 'Establishing semantic relationships between vulnerable and target codebases...',
          details: [
            'Analyzing function signatures and dataflows',
            'Mapping variable names and types',
            'Computing semantic similarity scores',
            'Building cross-version symbol tables',
          ],
        };
      case 3:
        return {
          title: 'Patch Transfer',
          description: 'Applying patch transformations to target version using AI-guided adaptation...',
          details: [
            'Locating equivalent code regions in target',
            'Adapting patch to target context',
            'Resolving naming and structural differences',
            'Generating modified target source',
          ],
        };
      case 4:
        return {
          title: 'Verification',
          description: 'Running comprehensive tests to validate patch effectiveness...',
          details: [
            'Compiling modified target code',
            'Executing proof-of-concept exploits',
            'Running unit test suites',
            'Validating security properties',
          ],
        };
      default:
        return {
          title: '',
          description: '',
          details: [],
        };
    }
  };

  const content = getStepContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-40 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Configuration
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Patch Migration in Progress
              </h1>
              <p className="text-gray-400">
                AI-powered analysis and transformation pipeline
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Processing</span>
            </div>
          </div>
        </motion.div>

        {/* Workflow Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl"
        >
          <WorkflowProgress currentStep={currentStep} isLoading={isLoading} />
        </motion.div>

        {/* Current Step Details */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-white">{content.title}</h2>
              <p className="text-gray-400 mt-1">{content.description}</p>
            </div>
          </div>

          {/* Activity Log */}
          <div className="space-y-3 font-mono text-sm">
            {content.details.map((detail, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-white/5"
              >
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className={`w-2 h-2 rounded-full ${
                    index < content.details.length - 1 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                  }`} />
                  <span className="text-xs text-gray-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-gray-300">{detail}</span>
              </motion.div>
            ))}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                {currentStep * 25}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Complete</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {currentStep}
              </p>
              <p className="text-xs text-gray-500 mt-1">Steps Done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-400">
                {Math.floor(currentStep * 2.3)}s
              </p>
              <p className="text-xs text-gray-500 mt-1">Elapsed Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {currentStep === 4 ? '100%' : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Confidence</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {currentStep === 4 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4"
            >
              <Zap className="w-8 h-8 text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              Patch Successfully Migrated!
            </h3>
            <p className="text-gray-400 mb-6">
              All verification tests passed. The target version has been successfully patched.
            </p>
            <Button
              onClick={() => navigate('/comparison')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              View Code Comparison
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}