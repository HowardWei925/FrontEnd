import { useState } from 'react';
import { GitBranch, Upload, Link2, ChevronDown, FileCode } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface CodeVersionInputProps {
  title: string;
  accentColor: 'red' | 'green' | 'blue';
  onInputChange?: (data: { type: string; value: string }) => void;
}

const accentStyles = {
  red: {
    gradient: 'from-red-100 to-red-50',
    border: 'border-red-200',
    glow: 'shadow-sm',
    text: 'text-red-700',
    icon: 'text-red-600',
  },
  green: {
    gradient: 'from-green-100 to-green-50',
    border: 'border-green-200',
    glow: 'shadow-sm',
    text: 'text-green-700',
    icon: 'text-green-600',
  },
  blue: {
    gradient: 'from-blue-100 to-blue-50',
    border: 'border-blue-200',
    glow: 'shadow-sm',
    text: 'text-blue-700',
    icon: 'text-blue-600',
  },
};

export function CodeVersionInput({ title, accentColor, onInputChange }: CodeVersionInputProps) {
  const [inputType, setInputType] = useState<'git' | 'upload'>('git');
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [filePath, setFilePath] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const styles = accentStyles[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-white border ${styles.border} rounded-xl p-6 ${styles.glow} shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${styles.icon} animate-pulse`} />
          <h3 className={`text-lg font-semibold ${styles.text}`}>{title}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white rounded transition-colors"
        >
          <ChevronDown
            className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
          />
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {/* Input Type Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputType('git')}
            className={`flex-1 ${inputType === 'git' ? 'bg-slate-100 text-slate-900 border-transparent hover:bg-slate-200 shadow-none' : 'bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50 shadow-none'}`}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Git 仓库
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputType('upload')}
            className={`flex-1 ${inputType === 'upload' ? 'bg-slate-100 text-slate-900 border-transparent hover:bg-slate-200 shadow-none' : 'bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50 shadow-none'}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            上传
          </Button>
        </div>

        {/* Git Input */}
        {inputType === 'git' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" />
                仓库链接 (URL)
              </label>
              <Input
                type="text"
                placeholder="https://github.com/user/repo.git"
                value={gitUrl}
                onChange={(e) => {
                  setGitUrl(e.target.value);
                  onInputChange?.({ type: 'git-url', value: e.target.value });
                }}
                className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 shadow-none transition-colors rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  分支 / 标签
                </label>
                <Input
                  type="text"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    onInputChange?.({ type: 'branch', value: e.target.value });
                  }}
                  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 shadow-none transition-colors rounded-md"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5" />
                  文件路径
                </label>
                <Input
                  type="text"
                  placeholder="src/main.c"
                  value={filePath}
                  onChange={(e) => {
                    setFilePath(e.target.value);
                    onInputChange?.({ type: 'file-path', value: e.target.value });
                  }}
                  className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 shadow-none transition-colors rounded-md"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload Input */}
        {inputType === 'upload' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-lg p-8 text-center hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 ${styles.icon}`} />
            <p className="text-sm text-slate-600 mb-1">
              点击上传或拖拽文件到此处
            </p>
            <p className="text-xs text-gray-600">
              支持 ZIP, TAR.GZ 压缩包或散列源代码文件
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
