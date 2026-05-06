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
          title: '补丁定位 (Patch Locate)',
          description: '使用抽象语法树 (AST) 对比分析漏洞和补丁差异...',
          details: [
            '将源码解析为 AST 结构',
            '识别版本间修改的节点',
            '提取漏洞特征模式',
            '计算差异块与上下文代码',
          ],
        };
      case 2:
        return {
          title: '语义映射 (Semantic Mapping)',
          description: '在漏洞版本与目标代码库之间建立语义联系...',
          details: [
            '分析函数签名和数据流',
            '映射变量名和类型',
            '计算语义相似度评分',
            '构建跨版本符号表',
          ],
        };
      case 3:
        return {
          title: '补丁迁移 (Patch Transfer)',
          description: '使用 AI 引导的自适应调整，将补丁转换应用到目标版本...',
          details: [
            '定位目标代码中的等效区域',
            '将补丁调整以适应目标上下文',
            '解决命名和结构的差异',
            '生成修改后的目标源码',
          ],
        };
      case 4:
        return {
          title: '验证 (Verification)',
          description: '运行综合测试以验证补丁有效性...',
          details: [
            '编译修改后的目标代码',
            '执行概念验证 (PoC) 漏洞利用',
            '运行单元测试集',
            '验证安全属性',
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
    <div className="min-h-screen bg-white  relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
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
            onClick={() => navigate('/task-creation')}
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回配置页
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                补丁移植正在进行中
              </h1>
              <p className="text-slate-600">
                AI 驱动的分析和转换流水线
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">处理中</span>
            </div>
          </div>
        </motion.div>

        {/* Workflow Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 mb-8 shadow-lg"
        >
          <WorkflowProgress currentStep={currentStep} isLoading={isLoading} />
        </motion.div>

        {/* Current Step Details */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-white rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{content.title}</h2>
              <p className="text-slate-600 mt-1">{content.description}</p>
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
                className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className={`w-2 h-2 rounded-full ${
                    index < content.details.length - 1 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                  }`} />
                  <span className="text-xs text-gray-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-slate-600">{detail}</span>
              </motion.div>
            ))}
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {currentStep * 25}%
              </p>
              <p className="text-xs text-gray-600 mt-1">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {currentStep}
              </p>
              <p className="text-xs text-gray-600 mt-1">已完成步骤</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">
                {Math.floor(currentStep * 2.3)}s
              </p>
              <p className="text-xs text-gray-600 mt-1">用时</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {currentStep === 4 ? '100%' : '—'}
              </p>
              <p className="text-xs text-gray-600 mt-1">置信度</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {currentStep === 4 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white border border-green-400 rounded-2xl p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4"
            >
              <Zap className="w-8 h-8 text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              补丁移植成功！
            </h3>
            <p className="text-slate-600 mb-6">
              所有验证测试均已通过。目标版本已成功应用补丁。
            </p>
            <Button
              onClick={() => navigate('/comparison')}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-900"
            >
              查看代码对比
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}