import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X } from 'lucide-react';
import { useState } from 'react';

export function FloatingAgentButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  // 在 Agent 页面本身不显示
  if (location.pathname === '/agent') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-200 rounded-xl shadow-lg p-4 w-64"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-md bg-cyan-100 flex items-center justify-center">
                  <Bot className="size-3.5 text-cyan-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">AI 安全助手</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              漏洞类型分析 · 代码安全审计 · CWE 查询
            </p>
            <button
              onClick={() => {
                setExpanded(false);
                navigate('/agent');
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              打开分析助手
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="size-12 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={expanded ? { rotate: 0 } : { rotate: 0 }}
      >
        <Bot className="size-5" />
      </motion.button>
    </div>
  );
}
