import type { OpenAIToolDefinition, ToolResult, VerificationStep } from './agent-types';

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
  {
    type: 'function',
    function: {
      name: 'runCommand',
      description: '在目标编译/测试环境中执行 shell 命令。可用于编译代码、运行 PoC 漏洞复现脚本、执行单元测试等。返回命令的退出码、标准输出和标准错误。',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: '要执行的 shell 命令' },
          description: { type: 'string', description: '命令目的说明（如：编译漏洞版本、运行 PoC、测试补丁后版本）' },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'adjustDiff',
      description: '根据用户的修改需求，对补丁 diff 进行调整。返回修改后的新 diff 和变更说明。',
      parameters: {
        type: 'object',
        properties: {
          originalDiff: { type: 'string', description: '当前的 diff 内容' },
          userRequest: { type: 'string', description: '用户的修改需求描述' },
        },
        required: ['originalDiff', 'userRequest'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'verifyPoc',
      description: '验证 PoC（概念验证）是否能触发漏洞。用于确认补丁的有效性。返回编译、执行、安全检查等步骤的结果。',
      parameters: {
        type: 'object',
        properties: {
          pocContent: { type: 'string', description: 'PoC 代码内容或验证命令' },
          pocType: { type: 'string', description: 'PoC 类型：code（代码）或 command（命令）' },
          targetCode: { type: 'string', description: '目标代码（打了补丁后的版本）' },
        },
        required: ['pocContent'],
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

function mockVerifyPoc(args: Record<string, unknown>): ToolResult {
  const pocContent = (args.pocContent as string) || '';
  const pocType = (args.pocType as string) || 'command';

  const steps: VerificationStep[] = [];
  const lower = pocContent.toLowerCase();

  // Step 1: 编译（如果是代码）
  if (pocType === 'code' || lower.includes('gcc') || lower.includes('compile')) {
    steps.push({
      id: 'step-1',
      name: '编译目标代码',
      status: 'passed',
      command: 'gcc -o target target.c -fstack-protector-all',
      stdout: '',
      stderr: '',
      exitCode: 0,
      duration: 1200,
    });
  }

  // Step 2: 执行 PoC
  steps.push({
    id: `step-${steps.length + 1}`,
    name: '执行 PoC 验证',
    status: 'passed',
    command: pocType === 'command' ? pocContent : './poc_exploit',
    stdout: 'PoC 执行完成\n检测到边界检查生效，输入被安全截断\n程序正常退出，未触发崩溃',
    stderr: '',
    exitCode: 0,
    duration: 150,
  });

  // Step 3: 检查安全性
  steps.push({
    id: `step-${steps.length + 1}`,
    name: '安全检查',
    status: 'passed',
    command: 'echo "Checking for vulnerabilities..."',
    stdout: '未检测到内存损坏\n栈保护 canary 完整\nASLR 正常工作',
    stderr: '',
    exitCode: 0,
    duration: 80,
  });

  const allPassed = steps.every(s => s.status === 'passed');

  return {
    success: true,
    data: {
      pocId: `poc-${Date.now()}`,
      status: allPassed ? 'passed' : 'failed',
      steps,
      summary: allPassed
        ? '✅ 补丁验证通过：PoC 未能触发漏洞，补丁有效防御了攻击'
        : '❌ 补丁验证失败：PoC 成功触发漏洞，补丁可能无效',
      timestamp: Date.now(),
    },
  };
}

const mockExecutors: Record<string, (args: Record<string, unknown>) => ToolResult> = {
  analyzeAST: mockAnalyzeAST,
  getPDG: mockGetPDG,
  getCWEInfo: mockGetCWEInfo,
  runCommand: mockRunCommand,
  adjustDiff: mockAdjustDiff,
  verifyPoc: mockVerifyPoc,
};

function mockRunCommand(args: Record<string, unknown>): ToolResult {
  const command = (args.command as string) || '';
  const cmd = command.toLowerCase().trim();

  // 编译命令
  if (cmd.startsWith('gcc') || cmd.startsWith('g++') || cmd.startsWith('make') || cmd.startsWith('cc')) {
    if (cmd.includes('-o')) {
      return {
        success: true,
        data: {
          exitCode: 0,
          stdout: '',
          stderr: '',
          duration: 1200,
        },
      };
    }
    return {
      success: true,
      data: { exitCode: 0, stdout: '', stderr: '', duration: 800 },
    };
  }

  // 执行命令（漏洞复现）
  if (cmd.startsWith('./') || cmd.startsWith('python') || cmd.startsWith('bash') || cmd.startsWith('sh ')) {
    if (cmd.includes('exploit') || cmd.includes('poc') || cmd.includes('payload') || cmd.includes('$(python')) {
      return {
        success: true,
        data: {
          exitCode: 139,
          stdout: 'Segmentation fault (core dumped)',
          stderr: '',
          duration: 150,
        },
      };
    }
    if (cmd.includes('patched') || cmd.includes('fixed') || cmd.includes('safe')) {
      return {
        success: true,
        data: {
          exitCode: 0,
          stdout: 'Program executed successfully. Input was safely handled.',
          stderr: '',
          duration: 100,
        },
      };
    }
    return {
      success: true,
      data: { exitCode: 0, stdout: 'Execution completed.', stderr: '', duration: 200 },
    };
  }

  // 测试命令
  if (cmd.includes('test') || cmd.includes('assert') || cmd.includes('check')) {
    return {
      success: true,
      data: { exitCode: 0, stdout: 'All tests passed (3/3)', stderr: '', duration: 500 },
    };
  }

  // 通用命令
  return {
    success: true,
    data: { exitCode: 0, stdout: `Command executed: ${command}`, stderr: '', duration: 300 },
  };
}

function mockAdjustDiff(args: Record<string, unknown>): ToolResult {
  const originalDiff = (args.originalDiff as string) || '';
  const userRequest = (args.userRequest as string) || '';
  const req = userRequest.toLowerCase();

  let newDiff = originalDiff;
  const changes: string[] = [];

  if (req.includes('snprintf') || req.includes('安全') || req.includes('safe')) {
    newDiff = originalDiff
      .replace(/strcpy/g, 'snprintf')
      .replace(/strncpy/g, 'snprintf');
    changes.push('将字符串复制函数替换为 snprintf，增加长度限制参数');
  }

  if (req.includes('空指针') || req.includes('null') || req.includes('nullptr')) {
    if (!newDiff.includes('NULL')) {
      newDiff = newDiff.replace(/^(\+.*\))\s*\{/gm, '$1 {\n+    if (input == NULL) return;');
      changes.push('在函数入口增加空指针检查');
    }
  }

  if (req.includes('长度') || req.includes('len') || req.includes('size')) {
    if (!newDiff.includes('sizeof')) {
      newDiff = newDiff.replace(/strcpy\((\w+),\s*(\w+)\)/g, 'strncpy($1, $2, sizeof($1) - 1)');
      changes.push('增加缓冲区长度检查，使用 sizeof 限制复制长度');
    }
  }

  if (changes.length === 0) {
    changes.push(`根据需求"${userRequest}"调整了补丁`);
    newDiff = originalDiff;
  }

  return {
    success: true,
    data: {
      newDiff,
      changes,
      reasoning: `用户要求：${userRequest}。已对 diff 进行相应调整。`,
    },
  };
}

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
