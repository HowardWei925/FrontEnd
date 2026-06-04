import type { OpenAIToolDefinition, ToolResult } from './agent-types';

export const toolDefinitions: OpenAIToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'analyzeAST',
      description: '分析代码的抽象语法树结构，识别关键函数、变量和控制流',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: '源代码内容' },
          language: { type: 'string', description: '编程语言 (c, cpp, java, python)' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPDG',
      description: '生成程序依赖图(PDG)，分析数据流和控制依赖关系',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string', description: '源代码内容' },
          focusFunction: { type: 'string', description: '重点关注的函数名' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCWEInfo',
      description: '查询CWE漏洞分类信息，返回漏洞类型、严重程度和修复建议',
      parameters: {
        type: 'object',
        properties: {
          cweId: { type: 'string', description: 'CWE编号，如 CWE-120' },
          codeContext: { type: 'string', description: '相关代码上下文' },
        },
        required: ['cweId'],
      },
    },
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockCWEData: Record<string, unknown> = {
  'CWE-120': {
    cweId: 'CWE-120',
    name: '缓冲区溢出 (Buffer Copy without Checking Size)',
    description:
      '程序在将输入复制到缓冲区时，未正确验证输入长度，可能导致栈溢出或堆溢出，攻击者可利用此漏洞执行任意代码。',
    severity: 'critical',
    cvssScore: 9.8,
    affectedFunctions: ['strcpy', 'strcat', 'sprintf', 'gets'],
    recommendations: [
      '使用 strncpy、strncat、snprintf 等安全函数替代',
      '在复制前验证输入长度不超过目标缓冲区大小',
      '启用编译器安全选项：-fstack-protector-all、-D_FORTIFY_SOURCE=2',
      '使用 AddressSanitizer 进行运行时检测',
    ],
  },
  'CWE-79': {
    cweId: 'CWE-79',
    name: '跨站脚本攻击 (XSS)',
    description:
      '应用程序将未经过滤或转义的用户输入直接嵌入到网页输出中，攻击者可注入恶意脚本窃取用户凭证或劫持会话。',
    severity: 'high',
    cvssScore: 8.1,
    affectedFunctions: ['innerHTML', 'document.write', 'eval'],
    recommendations: [
      '对所有用户输入进行 HTML 实体编码',
      '使用 Content Security Policy (CSP) 限制脚本来源',
      '采用安全的模板引擎（自动转义输出）',
      '避免使用 innerHTML，改用 textContent 或安全的 DOM API',
    ],
  },
  'CWE-89': {
    cweId: 'CWE-89',
    name: 'SQL 注入 (SQL Injection)',
    description:
      '应用程序将用户输入直接拼接到 SQL 查询语句中，攻击者可构造恶意输入操纵数据库查询，导致数据泄露或篡改。',
    severity: 'critical',
    cvssScore: 9.8,
    affectedFunctions: ['exec', 'query', 'execute', 'raw'],
    recommendations: [
      '使用参数化查询（Prepared Statements）替代字符串拼接',
      '实施输入验证和白名单过滤',
      '遵循最小权限原则，限制数据库用户权限',
      '使用 ORM 框架自动生成安全的 SQL 查询',
    ],
  },
  'CWE-416': {
    cweId: 'CWE-416',
    name: '释放后使用 (Use After Free)',
    description:
      '程序在释放内存后继续使用该指针，可能导致程序崩溃或被攻击者利用执行任意代码。',
    severity: 'critical',
    cvssScore: 8.8,
    affectedFunctions: ['free', 'delete', 'realloc'],
    recommendations: [
      '释放内存后立即将指针置为 NULL',
      '使用智能指针管理动态内存',
      '启用编译器的 UAF 检测选项',
      '使用 Valgrind 或 AddressSanitizer 进行检测',
    ],
  },
  'CWE-22': {
    cweId: 'CWE-22',
    name: '路径遍历 (Path Traversal)',
    description:
      '应用程序未正确过滤用户提供的文件路径，攻击者可通过 ../ 等特殊字符访问受限目录外的文件。',
    severity: 'high',
    cvssScore: 7.5,
    affectedFunctions: ['open', 'readFile', 'fopen', 'include'],
    recommendations: [
      '对用户输入的路径进行规范化处理并验证是否在允许的目录内',
      '使用白名单限制可访问的文件范围',
      '避免将用户输入直接传递给文件系统操作函数',
      '使用 chroot 或容器隔离文件系统访问',
    ],
  },
};

function mockAnalyzeAST(args: Record<string, unknown>): ToolResult {
  const code = (args.code as string) || '';
  const funcs = code.match(/\w+\s*\([^)]*\)\s*\{/g) || [];
  const vars = code.match(/\b(int|char|float|double|void|long|short|unsigned)\s+\w+/g) || [];

  return {
    success: true,
    data: {
      functions: funcs.map((f) => f.replace(/\s*\{/, '').trim()),
      variables: vars.map((v) => v.trim()),
      controlFlow: {
        ifBlocks: (code.match(/\bif\s*\(/g) || []).length,
        loops: (code.match(/\b(for|while|do)\b/g) || []).length,
        switchCases: (code.match(/\bswitch\s*\(/g) || []).length,
      },
      complexity: funcs.length > 5 ? 'high' : funcs.length > 2 ? 'medium' : 'low',
      riskPatterns: [
        ...(code.includes('strcpy') ? ['使用不安全的 strcpy 函数'] : []),
        ...(code.includes('sprintf') ? ['使用不安全的 sprintf 函数'] : []),
        ...(code.includes('gets') ? ['使用不安全的 gets 函数'] : []),
        ...(code.includes('malloc') && !code.includes('free')
          ? ['可能存在内存泄漏：malloc 未对应 free']
          : []),
      ],
    },
  };
}

function mockGetPDG(args: Record<string, unknown>): ToolResult {
  const code = (args.code as string) || '';
  const focus = (args.focusFunction as string) || 'main';

  return {
    success: true,
    data: {
      nodes: [
        { id: 'n1', statement: '变量声明', type: 'declaration' },
        { id: 'n2', statement: `${focus}() 调用`, type: 'call' },
        { id: 'n3', statement: '条件判断', type: 'condition' },
        { id: 'n4', statement: '数据处理', type: 'assignment' },
        { id: 'n5', statement: '返回结果', type: 'return' },
      ],
      edges: [
        { source: 'n1', target: 'n2', type: 'data', label: '变量传递' },
        { source: 'n2', target: 'n3', type: 'control', label: '返回值判断' },
        { source: 'n3', target: 'n4', type: 'control', label: '条件为真' },
        { source: 'n4', target: 'n5', type: 'data', label: '结果输出' },
      ],
      dataDependencies: code.includes('buf')
        ? [
            {
              from: '输入缓冲区',
              to: '处理函数',
              variable: 'buf',
              risk: '未验证输入长度可能导致缓冲区溢出',
            },
          ]
        : [],
      controlDependencies: [
        { from: '循环控制', to: '迭代体', condition: '循环条件' },
      ],
    },
  };
}

function mockGetCWEInfo(args: Record<string, unknown>): ToolResult {
  const cweId = (args.cweId as string).toUpperCase();
  const data = mockCWEData[cweId];

  if (data) {
    return { success: true, data };
  }

  return {
    success: true,
    data: {
      cweId,
      name: `未知漏洞类型`,
      description: `暂无 ${cweId} 的详细信息，请参考 MITRE CWE 官方数据库。`,
      severity: 'medium',
      cvssScore: 5.0,
      affectedFunctions: [],
      recommendations: ['请参考 CWE 官方文档获取详细修复建议'],
    },
  };
}

const mockExecutors: Record<string, (args: Record<string, unknown>) => ToolResult> = {
  analyzeAST: mockAnalyzeAST,
  getPDG: mockGetPDG,
  getCWEInfo: mockGetCWEInfo,
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  await delay(300 + Math.random() * 500);
  const executor = mockExecutors[name];
  if (!executor) {
    return { success: false, data: null, error: `未知工具: ${name}` };
  }
  return executor(args);
}
