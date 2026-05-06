import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, CheckCheck, Fingerprint, GitCompare, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";

const heroImage =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2200&q=80";

const capabilities = [
  {
    title: "Patch Locate",
    description: "通过 AST 与语义上下文定位修复点，不止是文本 diff。",
    icon: ShieldAlert,
  },
  {
    title: "Semantic Mapping",
    description: "在异构版本间建立稳定映射，减少手工对齐成本。",
    icon: GitCompare,
  },
  {
    title: "Traceable Delivery",
    description: "全流程留痕与审阅支持，适配团队协作与安全合规。",
    icon: Fingerprint,
  },
];

const flow = [
  { step: "01", title: "导入版本", detail: "填写漏洞版本、修复版本、目标版本。" },
  { step: "02", title: "结构分析", detail: "自动完成 AST 差异与语义关系建模。" },
  { step: "03", title: "生成迁移", detail: "输出迁移建议、置信度与影响范围。" },
  { step: "04", title: "验证上线", detail: "结合测试与人工审核完成最终交付。" },
];

const stats: Array<[string, string]> = [
  ["迁移时长", "-67%"],
  ["人工回归成本", "-54%"],
  ["补丁覆盖率", "99.3%"],
  ["审计可追踪性", "100%"],
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f6] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-[#121315]/65 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="size-4 text-[#f9b36c]" />
            <span>PatchFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link to="/login">登录</Link>
            </Button>
            <Button asChild className="bg-[#f9b36c] text-[#2e1e11] hover:bg-[#eea45a]">
              <Link to="/login">开始使用</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[86vh] overflow-hidden">
          <motion.img
            src={heroImage}
            alt="工程团队在办公室讨论软件系统方案"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,14,16,0.88)_16%,rgba(12,14,16,0.64)_48%,rgba(12,14,16,0.34)_100%)]" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_74%_28%,rgba(249,179,108,0.24),rgba(249,179,108,0)_50%)]"
            animate={{ opacity: [0.22, 0.34, 0.22] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto flex min-h-[86vh] w-full max-w-6xl items-end px-5 pb-14 pt-24 md:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
              <p className="text-xs uppercase tracking-[0.18em] text-[#f7c089]">Patch Migration Platform</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
                为补丁迁移提供稳定、可复盘的工程化工作流
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                面向真实代码库与复杂版本演进，降低高风险手工迁移成本，让团队在效率与可靠性之间不必二选一。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="group h-11 bg-[#f9b36c] px-6 text-[#2e1e11] hover:bg-[#eea45a]">
                  <Link to="/login">
                    进入控制台
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 border-white/45 bg-white/10 px-6 text-white hover:bg-white/18">
                  <Link to="/task-creation">查看流程</Link>
                </Button>
              </div>

              <div className="mt-11 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
                {stats.map(([label, value], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.16 + i * 0.08 }}
                    whileHover={{ y: -3, borderColor: "rgba(249,179,108,0.7)" }}
                    className="border border-white/30 bg-black/20 px-3 py-3 transition-colors"
                  >
                    <p className="text-xs text-slate-200">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-[#ddd6c8] bg-[#f1ece2]">
          <motion.div
            className="mx-auto w-full max-w-6xl px-5 py-5 md:px-8"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-sm tracking-wide text-[#5d4b31]">
              这不是宣传页 Demo，而是面向团队交付的迁移基础设施：语义分析、版本映射、流程审计，一体化完成。
            </p>
          </motion.div>
        </section>

        <section className="bg-[#f8f8f6] py-14 md:py-18">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            <div className="mb-9">
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">核心能力</h2>
              <p className="mt-2 text-sm text-slate-600">围绕工程稳定性，而不是视觉噱头。</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {capabilities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.38, delay: index * 0.06 }}
                    whileHover={{ y: -6 }}
                    className="border border-[#d9d4ca] bg-white p-6 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.65)]"
                  >
                    <motion.div
                      className="mb-4 inline-flex size-10 items-center justify-center border border-[#ebdecf] bg-[#f8f1e7]"
                      whileHover={{ rotate: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="size-5 text-[#9a5a21]" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#121417] py-14 text-slate-100 md:py-18">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            <div className="mb-8 flex items-center gap-2 text-[#f9b36c]">
              <CheckCheck className="size-4" />
              <p className="text-xs uppercase tracking-[0.16em]">Migration Workflow</p>
            </div>

            <motion.div
              className="overflow-hidden border border-white/15 bg-[#171a1f]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.35 }}
            >
              {flow.map((row, index) => (
                <motion.div
                  key={row.step}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`grid items-center gap-3 px-4 py-4 transition-colors hover:bg-white/5 md:grid-cols-12 md:px-6 ${
                    index < flow.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <div className="md:col-span-2">
                    <span className="inline-flex min-w-10 items-center justify-center border border-[#f9b36c]/45 bg-[#f9b36c]/10 px-2 py-1 text-xs font-semibold text-[#f9b36c]">
                      {row.step}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-sm font-medium text-white">{row.title}</p>
                  </div>
                  <div className="md:col-span-7">
                    <p className="text-sm text-slate-300">{row.detail}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-[#f8f8f6] py-12">
          <motion.div
            className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center md:px-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">准备开始你的第一条补丁迁移任务？</h2>
              <p className="mt-2 text-slate-600">登录后可以直接进入工作流，或从任务创建页快速试跑。</p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-slate-900 text-white hover:bg-slate-800">
                <Link to="/login">前往登录</Link>
              </Button>
              <Button asChild variant="outline" className="border-slate-300 bg-white text-slate-700 hover:border-[#c7803b] hover:text-[#9b5a22]">
                <Link to="/task-creation">
                  <CheckCheck className="size-4" />
                  进入任务创建
                </Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
