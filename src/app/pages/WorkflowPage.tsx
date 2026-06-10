import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, ArrowRight, CheckCircle2, XCircle, Shield, RotateCcw, Edit3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { Button } from '../components/ui/button';
import type { PocInput as PocInputType, PocVerificationResult } from '../lib/agent-types';
import { executeTool } from '../lib/agent-tools';

// 模拟的目标代码（实际应该从补丁移植结果获取）
const MOCK_TARGET_CODE = `#include <stdio.h>
#include <string.h>

void handle_data(char *user_input) {
    char temp_buf[64];
    // AI-migrated patch applied here
    strncpy(temp_buf, user_input, sizeof(temp_buf) - 1);
    temp_buf[sizeof(temp_buf) - 1] = '\\0';
    log_message("Data: %s\\n", temp_buf);
}

int main(int argc, char **argv) {
    if (argc < 2) return 1;
    handle_data(argv[1]);
    return 0;
}`;

export function WorkflowPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pocInputs, setPocInputs] = useState<PocInputType[]>([]);
  const [pocResults, setPocResults] = useState<PocVerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const targetCode = MOCK_TARGET_CODE;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 读取 PoC 输入
  useEffect(() => {
    const stored = sessionStorage.getItem('poc_inputs');
    if (stored) {
      try {
        setPocInputs(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  // 执行 PoC 验证
  const runPocVerification = async () => {
    if (pocInputs.length === 0) return;

    setIsVerifying(true);
    const results: PocVerificationResult[] = [];

    for (const poc of pocInputs) {
      const result = await executeTool('verifyPoc', {
        pocContent: poc.content,
        pocType: poc.type,
        targetCode: targetCode,
      });
      if (result.success) {
        results.push(result.data as PocVerificationResult);
      }
      setPocResults([...results]);
    }

    setIsVerifying(false);

    // 存储结果
    sessionStorage.setItem('poc_results', JSON.stringify(results));
    sessionStorage.setItem('target_code', targetCode);
  };

  // 工作流进度
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) {
          return prev + 1;
        }
        // 到达第4步，停止定时器
        clearInterval(timer);
        setIsLoading(false);
        setIsDone(true);
        return prev;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // 完成后：有 PoC 就验证，没有就跳转
  useEffect(() => {
    if (!isDone) return;

    if (pocInputs.length > 0) {
      runPocVerification();
    } else {
      // 没有 PoC，延迟跳转
      const timer = setTimeout(() => {
        navigate('/semantic-mapping');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDone]);

  // PoC 验证通过后自动跳转
  useEffect(() => {
    const allPassed = pocResults.length > 0 && pocResults.every(r => r.status === 'passed');
    if (allPassed) {
      const timer = setTimeout(() => {
        navigate('/semantic-mapping');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pocResults, navigate]);

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
          description: pocInputs.length > 0
            ? (isVerifying ? `正在执行 ${pocInputs.length} 个 PoC 验证...` : '验证完成')
            : '补丁迁移完成',
          details: pocInputs.length > 0
            ? pocInputs.map((p, i) => `PoC #${i + 1}: ${p.description || p.content.substring(0, 50)}...`)
            : ['补丁已成功移植到目标版本'],
        };
      default:
        return { title: '', description: '', details: [] };
    }
  };

  const content = getStepContent();
  const allPassed = pocResults.length > 0 && pocResults.every(r => r.status === 'passed');
  const hasFailed = pocResults.some(r => r.status === 'failed');

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <motion.div
        className="absolute top-40 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Button onClick={() => navigate('/task-creation')} variant="ghost" className="mb-6 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回配置页
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {isDone && pocInputs.length === 0 ? '补丁移植完成' : '补丁移植正在进行中'}
              </h1>
              <p className="text-slate-600">AI 驱动的分析和转换流水线</p>
            </div>
            {!isDone && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400 rounded-lg">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700">处理中</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Workflow Progress */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="bg-gray-50/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 mb-8 shadow-lg">
          <WorkflowProgress currentStep={currentStep} isLoading={isLoading} />
        </motion.div>

        {/* Current Step Details */}
        <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="bg-white backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-white rounded-full" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{content.title}</h2>
              <p className="text-slate-600 mt-1">{content.description}</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-sm">
            {content.details.map((detail, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.2 }}
                className="flex items-start gap-3 p-3 bg-slate-50/50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <div className={`w-2 h-2 rounded-full ${index < content.details.length - 1 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                  <span className="text-xs text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <span className="text-slate-600">{detail}</span>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{currentStep * 25}%</p>
              <p className="text-xs text-gray-600 mt-1">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{currentStep}</p>
              <p className="text-xs text-gray-600 mt-1">已完成步骤</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{Math.floor(currentStep * 2.3)}s</p>
              <p className="text-xs text-gray-600 mt-1">用时</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{currentStep === 4 ? '100%' : '—'}</p>
              <p className="text-xs text-gray-600 mt-1">置信度</p>
            </div>
          </div>
        </motion.div>

        {/* ===== 完成后的结果区域 ===== */}
        {currentStep === 4 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 space-y-4">

            {/* --- 没有 PoC：自动跳转提示 --- */}
            {pocInputs.length === 0 && (
              <div className="bg-white border border-emerald-400 rounded-2xl p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-emerald-600 mb-2">补丁移植成功！</h3>
                <p className="text-slate-600 mb-4">正在跳转到语义映射分析...</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/semantic-mapping')} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                    查看语义映射分析 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button onClick={() => navigate('/comparison')} variant="outline">
                    查看代码对比 <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* --- 有 PoC：验证结果 --- */}
            {pocInputs.length > 0 && pocResults.length > 0 && (
              <>
                {/* 验证结果列表 */}
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-lg font-semibold text-slate-900">PoC 验证结果</h3>
                </div>
                {pocResults.map((result) => (
                  <div key={result.pocId} className={`p-4 rounded-xl border-2 ${
                    result.status === 'passed' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {result.status === 'passed' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                      <span className={`font-medium ${result.status === 'passed' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {result.status === 'passed' ? '补丁有效' : '补丁无效'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{result.summary}</p>
                    {result.status === 'failed' && result.steps && (
                      <div className="mt-3 p-3 bg-red-100 rounded-lg">
                        <p className="text-xs font-medium text-red-700 mb-1">失败详情：</p>
                        {result.steps.filter(s => s.status === 'failed').map(step => (
                          <p key={step.id} className="text-xs text-red-600">• {step.name}: {step.stderr || step.error || '未知错误'}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* 验证通过 → 进入后续分析 */}
                {allPassed && (
                  <div className="bg-white border border-emerald-400 rounded-2xl p-6 text-center mt-4">
                    <h3 className="text-xl font-bold text-emerald-600 mb-2">补丁验证通过！</h3>
                    <p className="text-slate-600 mb-4">所有 PoC 均未触发漏洞，补丁有效。</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/semantic-mapping')} className="bg-cyan-600 hover:bg-cyan-500 text-white">
                        查看语义映射分析 <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button onClick={() => navigate('/comparison')} variant="outline">
                        查看代码对比 <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 验证失败 → 提供迭代选项 */}
                {hasFailed && (
                  <div className="bg-white border border-red-400 rounded-2xl p-6 mt-4">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-red-600 mb-2">补丁验证失败</h3>
                      <p className="text-slate-600">PoC 触发了漏洞，你可以选择：</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => {
                        sessionStorage.setItem('agent_context', JSON.stringify({
                          mode: 'adjust',
                          diff: { before: [], after: [] },
                          targetCode,
                          pocInputs,
                          pocResults,
                        }));
                        navigate('/agent');
                      }} className="group bg-white border-2 border-orange-200 hover:border-orange-400 rounded-xl p-5 text-left transition-all hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-10 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
                            <Edit3 className="size-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">修改/微调补丁</h3>
                            <p className="text-xs text-slate-500">用 AI 调整补丁代码</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">通过对话告诉 AI 修改需求，多轮迭代直到补丁有效。</p>
                      </button>
                      <button onClick={() => {
                        sessionStorage.removeItem('poc_inputs');
                        sessionStorage.removeItem('poc_results');
                        navigate('/task-creation');
                      }} className="group bg-white border-2 border-purple-200 hover:border-purple-400 rounded-xl p-5 text-left transition-all hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-10 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
                            <RotateCcw className="size-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">重写 PoC</h3>
                            <p className="text-xs text-slate-500">修改验证命令或代码</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">返回任务配置页，重新编写 PoC 验证代码。</p>
                      </button>
                    </div>
                    <Button onClick={() => navigate('/comparison')} variant="outline" className="w-full mt-4">
                      跳过验证，查看代码对比 <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* 有 PoC 但还在验证中 */}
            {pocInputs.length > 0 && isVerifying && pocResults.length === 0 && (
              <div className="bg-white border border-blue-200 rounded-2xl p-6 text-center">
                <Zap className="w-8 h-8 text-blue-500 animate-pulse mx-auto mb-3" />
                <p className="text-slate-600">正在执行 PoC 验证，请稍候...</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
