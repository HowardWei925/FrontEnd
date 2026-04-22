import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeftRight, ArrowRight, Play, Shield, Sparkles } from 'lucide-react';
import { CodeVersionInput } from '../components/CodeVersionInput';
import { Button } from '../components/ui/button';

export function TaskCreationPage() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleStartMigration = () => {
    navigate('/workflow');
  };

  return (
    <div className="min-h-screen bg-white  relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-50/50 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-orange-50/50 rounded-full blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative pt-14 sm:pt-0"
        >
          <Button
            onClick={() => navigate('/history')}
            variant="outline"
            className="absolute right-0 top-0 border-slate-300 bg-white/90 text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
          >
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            历史记录
          </Button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-cyan-600" />
            <h1 className="text-5xl font-bold text-slate-900">
              AI 补丁移植系统
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            通过先进的语义分析和 AI 驱动的转换，自动在不同代码版本之间移植安全补丁
          </p>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-slate-600">系统在线</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-slate-600">AI 驱动分析</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              配置代码版本
            </h2>
            <p className="text-slate-600">
              提供漏洞版本、修复版本和目标版本，以进行自动补丁移植
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CodeVersionInput
              title="漏洞版本 (Vulnerable)"
              accentColor="red"
            />
            <CodeVersionInput
              title="修复版本 (Patched)"
              accentColor="green"
            />
            <CodeVersionInput
              title="目标版本 (Target)"
              accentColor="blue"
            />
          </div>
        </div>

        {/* Start Migration Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleStartMigration}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative px-12 py-6 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-medium"
          >
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-xl hidden"
              animate={{
                scale: isHovered ? 1.1 : 1,
                opacity: isHovered ? 0.7 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            />
            
            <span className="relative flex items-center gap-3">
              <Play className="w-5 h-5" />
              开始补丁移植
              <motion.div
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </span>
          </Button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16"
        >
          {[
            { label: 'Patch Locate', value: 'AST Analysis' },
            { label: 'Semantic Map', value: 'AI-Driven' },
            { label: 'Transfer', value: 'Automated' },
            { label: 'Verification', value: 'Multi-Test' },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white backdrop-blur-sm border border-slate-200 rounded-lg p-4 hover:border-cyan-400 transition-colors"
            >
              <p className="text-xs text-gray-600 mb-1">{item.label}</p>
              <p className="text-sm text-cyan-600 font-semibold">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}