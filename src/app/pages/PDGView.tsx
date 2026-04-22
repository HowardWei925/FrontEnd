import { motion } from 'motion/react';

export function PDGView() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">🔗 依赖关系示意图</h2>
        <div className="flex justify-center">
          <div className="space-y-2">
            <div className="rounded-lg bg-blue-100 p-3 text-center">
              <code>int ret = 0;</code>
              <div className="text-gray-400 text-xs">↓ 数据依赖</div>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3 text-center">
              <code>if (!rval)</code>
              <div className="text-gray-400 text-xs">↓ 控制依赖</div>
            </div>
            <div className="rounded-lg bg-green-100 p-3 text-center">
              <code>bsg_job_done(...)</code>
              <div className="text-gray-400 text-xs">↓ 数据依赖</div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3 text-center">
              <code>return rval</code>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">📋 依赖关系说明</h2>
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr><th className="p-2 text-left">源语句</th><th className="p-2 text-left">目标语句</th><th className="p-2 text-left">依赖类型</th><th className="p-2 text-left">说明</th></tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="p-2 font-mono text-xs">int ret = 0;</td><td className="p-2 font-mono text-xs">if (!rval)</td><td className="p-2">数据依赖</td><td className="p-2">rval 的值影响条件判断</td></tr>
            <tr><td className="p-2 font-mono text-xs">if (!rval)</td><td className="p-2 font-mono text-xs">bsg_job_done(...)</td><td className="p-2">控制依赖</td><td className="p-2">条件为真时执行</td></tr>
            <tr><td className="p-2 font-mono text-xs">bsg_job_done(...)</td><td className="p-2 font-mono text-xs">return rval</td><td className="p-2">数据依赖</td><td className="p-2">返回值依赖执行结果</td></tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border bg-blue-50 p-4">
        <p className="text-sm text-blue-700">💡 PDG 图说明：节点代表程序语句，箭头表示依赖关系（数据依赖或控制依赖）。</p>
        <p className="mt-2 text-xs text-gray-500">⏳ 完整功能待后端对接，当前为示例数据</p>
      </div>
    </div>
  );
}