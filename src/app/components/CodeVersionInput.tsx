import { useState } from 'react';
import { GitBranch, Upload, Link2, ChevronDown } from 'lucide-react';
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
    gradient: 'from-red-500/20 to-red-900/10',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
  green: {
    gradient: 'from-green-500/20 to-green-900/10',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20',
    text: 'text-green-400',
    icon: 'text-green-500',
  },
  blue: {
    gradient: 'from-blue-500/20 to-blue-900/10',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
};

export function CodeVersionInput({ title, accentColor, onInputChange }: CodeVersionInputProps) {
  const [inputType, setInputType] = useState<'git' | 'upload'>('git');
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isExpanded, setIsExpanded] = useState(true);
  const styles = accentStyles[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-gradient-to-br ${styles.gradient} backdrop-blur-sm border ${styles.border} rounded-xl p-6 ${styles.glow} shadow-xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${styles.icon} animate-pulse`} />
          <h3 className={`text-lg font-semibold ${styles.text}`}>{title}</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/5 rounded transition-colors"
        >
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
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
            variant={inputType === 'git' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputType('git')}
            className={`flex-1 ${inputType === 'git' ? 'bg-white/10' : 'bg-transparent border-white/10'}`}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Git Repository
          </Button>
          <Button
            variant={inputType === 'upload' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputType('upload')}
            className={`flex-1 ${inputType === 'upload' ? 'bg-white/10' : 'bg-transparent border-white/10'}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
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
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" />
                Repository URL
              </label>
              <Input
                type="text"
                placeholder="https://github.com/user/repo.git"
                value={gitUrl}
                onChange={(e) => {
                  setGitUrl(e.target.value);
                  onInputChange?.({ type: 'git-url', value: e.target.value });
                }}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5" />
                Branch / Tag
              </label>
              <Input
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  onInputChange?.({ type: 'branch', value: e.target.value });
                }}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 focus:border-white/30"
              />
            </div>
          </motion.div>
        )}

        {/* Upload Input */}
        {inputType === 'upload' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
          >
            <Upload className={`w-8 h-8 mx-auto mb-3 ${styles.icon}`} />
            <p className="text-sm text-gray-400 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              ZIP, TAR.GZ or source files
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
