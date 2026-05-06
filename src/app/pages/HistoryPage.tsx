import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Code,
  Filter,
  History,
  LoaderCircle,
  Search,
  XCircle,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface TaskHistory {
  id: string;
  taskName: string;
  vulnerableVersion: string;
  patchedVersion: string;
  targetVersion: string;
  status: 'success' | 'failed' | 'running';
  timestamp: string;
  duration: string;
  successRate?: number;
}

const mockHistory: TaskHistory[] = [
  {
    id: 'task-001',
    taskName: 'CVE-2024-1234 缓冲区溢出补丁迁移',
    vulnerableVersion: 'libssl 1.0.2',
    patchedVersion: 'libssl 1.0.2k',
    targetVersion: 'libssl 1.1.1',
    status: 'success',
    timestamp: '2026-04-22 14:32',
    duration: '2分45秒',
    successRate: 98,
  },
  {
    id: 'task-002',
    taskName: '认证绕过漏洞修复迁移',
    vulnerableVersion: 'webapp v2.3.1',
    patchedVersion: 'webapp v2.3.2',
    targetVersion: 'webapp v3.0.0',
    status: 'success',
    timestamp: '2026-04-21 09:15',
    duration: '3分12秒',
    successRate: 95,
  },
  {
    id: 'task-003',
    taskName: 'SQL 注入防护补丁迁移',
    vulnerableVersion: 'backend v1.5.0',
    patchedVersion: 'backend v1.5.1',
    targetVersion: 'backend v2.0.0',
    status: 'failed',
    timestamp: '2026-04-20 16:47',
    duration: '1分58秒',
    successRate: 62,
  },
  {
    id: 'task-004',
    taskName: 'XSS 漏洞补丁迁移',
    vulnerableVersion: 'frontend v4.2.0',
    patchedVersion: 'frontend v4.2.1',
    targetVersion: 'frontend v5.0.0',
    status: 'running',
    timestamp: '2026-04-22 15:10',
    duration: '1分23秒',
  },
  {
    id: 'task-005',
    taskName: '竞态条件修复补丁迁移',
    vulnerableVersion: 'kernel 5.10.0',
    patchedVersion: 'kernel 5.10.1',
    targetVersion: 'kernel 5.15.0',
    status: 'success',
    timestamp: '2026-04-19 11:28',
    duration: '4分05秒',
    successRate: 100,
  },
  {
    id: 'task-006',
    taskName: '内存泄漏修复补丁迁移',
    vulnerableVersion: 'service v1.8.2',
    patchedVersion: 'service v1.8.3',
    targetVersion: 'service v2.1.0',
    status: 'success',
    timestamp: '2026-04-18 13:52',
    duration: '2分31秒',
    successRate: 93,
  },
];

export function HistoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return mockHistory;
    }

    return mockHistory.filter(
      (task) =>
        task.taskName.toLowerCase().includes(keyword) ||
        task.vulnerableVersion.toLowerCase().includes(keyword) ||
        task.patchedVersion.toLowerCase().includes(keyword) ||
        task.targetVersion.toLowerCase().includes(keyword),
    );
  }, [searchQuery]);

  const getStatusIcon = (status: TaskHistory['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'running':
        return <LoaderCircle className="w-5 h-5 text-cyan-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TaskHistory['status']) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
            成功
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="border-rose-200 bg-rose-50 text-rose-700">
            失败
          </Badge>
        );
      case 'running':
        return (
          <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700">
            进行中
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRateColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-600';
    if (rate >= 70) return 'text-orange-500';
    return 'text-rose-500';
  };

  const handleTaskClick = (task: TaskHistory) => {
    if (task.status === 'running') {
      navigate('/workflow');
      return;
    }

    navigate('/comparison');
  };

  const successCount = mockHistory.filter((task) => task.status === 'success').length;
  const failedCount = mockHistory.filter((task) => task.status === 'failed').length;
  const runningCount = mockHistory.filter((task) => task.status === 'running').length;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-cyan-50/60 rounded-full blur-2xl"
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
        className="absolute bottom-20 left-20 w-96 h-96 bg-orange-50/60 rounded-full blur-2xl"
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Button
            onClick={() => navigate('/task-creation')}
            variant="ghost"
            className="mb-6 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Button>

          <div className="flex items-center gap-3 mb-3">
            <History className="w-9 h-9 text-cyan-600" />
            <h1 className="text-4xl font-bold text-slate-900">历史记录</h1>
          </div>
          <p className="text-slate-600 text-lg">
            查看补丁移植任务的执行历史、状态和关键版本信息
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col sm:flex-row gap-4 sm:items-center"
        >
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="搜索任务名称或版本号"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10 border-slate-200 bg-white text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <Button
            variant="outline"
            className="border-slate-300 text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            筛选
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">总任务数</p>
            <p className="text-3xl font-bold text-cyan-600">{mockHistory.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">成功</p>
            <p className="text-3xl font-bold text-emerald-600">{successCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">失败</p>
            <p className="text-3xl font-bold text-rose-600">{failedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">进行中</p>
            <p className="text-3xl font-bold text-orange-500">{runningCount}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredHistory.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              onMouseEnter={() => setHoveredCard(task.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handleTaskClick(task)}
              className="group relative cursor-pointer"
            >
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-cyan-400 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getStatusIcon(task.status)}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-900">
                          {task.taskName}
                        </h3>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {task.timestamp}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-4 h-4" />
                          {task.duration}
                        </div>
                        {typeof task.successRate === 'number' && (
                          <div className="flex items-center gap-2">
                            <span>成功率:</span>
                            <span className={getRateColor(task.successRate)}>
                              {task.successRate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ x: hoveredCard === task.id ? 5 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-rose-500" />
                    <div>
                      <p className="text-xs text-slate-400">漏洞版本</p>
                      <p className="text-sm text-slate-700 font-mono">{task.vulnerableVersion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-slate-400">修复版本</p>
                      <p className="text-sm text-slate-700 font-mono">{task.patchedVersion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-600" />
                    <div>
                      <p className="text-xs text-slate-400">目标版本</p>
                      <p className="text-sm text-slate-700 font-mono">{task.targetVersion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">没有找到匹配的历史任务</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}