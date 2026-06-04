import type { ChatMessage, StreamChunk, ToolCallDelta } from './agent-types';
import { toolDefinitions, executeTool } from './agent-tools';

const SYSTEM_PROMPT = `你是 PatchFlow 安全分析助手，专注于代码安全分析、漏洞分类（CWE）和补丁迁移审计。
你可以使用以下工具来辅助分析：
- analyzeAST: 分析代码的抽象语法树结构
- getPDG: 生成程序依赖图(PDG)
- getCWEInfo: 查询CWE漏洞分类信息

请用中文回答，对安全问题给出专业、准确的分析。
当用户提交代码时，主动分析其中的安全风险。`;

function getConfig() {
  const apiKey = import.meta.env.VITE_LLM_API_KEY || '';
  const baseUrl = (import.meta.env.VITE_LLM_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, '');
  const model = import.meta.env.VITE_LLM_MODEL || 'deepseek-chat';
  return { apiKey, baseUrl, model };
}

export function isRealAPIAvailable(): boolean {
  return !!getConfig().apiKey;
}

function buildMessages(messages: ChatMessage[]) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        if (m.role === 'tool') {
          return { role: 'tool', content: m.content, tool_call_id: m.toolCallId };
        }
        const base: Record<string, unknown> = { role: m.role, content: m.content };
        if (m.toolCalls && m.toolCalls.length > 0) {
          base.tool_calls = m.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          }));
        }
        return base;
      }),
  ];
}

// --- Real API streaming ---

interface RawToolCall {
  index: number;
  id?: string;
  function?: { name?: string; arguments?: string };
}

async function* streamFromAPI(
  messages: ReturnType<typeof buildMessages>,
): AsyncGenerator<StreamChunk> {
  const { apiKey, baseUrl, model } = getConfig();

  const body = JSON.stringify({
    model,
    messages,
    tools: toolDefinitions,
    stream: true,
  });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API 请求失败 (${response.status}): ${errText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const toolCallBuffers: Map<number, RawToolCall> = new Map();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') {
        yield { type: 'done' };
        return;
      }

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          yield { type: 'content', text: delta.content };
        }

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls as RawToolCall[]) {
            const existing = toolCallBuffers.get(tc.index) || { index: tc.index };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.function = { ...existing.function, name: tc.function.name };
            if (tc.function?.arguments) {
              existing.function = {
                ...existing.function,
                arguments: (existing.function?.arguments || '') + tc.function.arguments,
              };
            }
            toolCallBuffers.set(tc.index, existing);

            yield {
              type: 'tool_calls',
              toolCallDelta: {
                index: tc.index,
                id: tc.id,
                name: tc.function?.name,
                argumentsDelta: tc.function?.arguments,
              },
            };
          }
        }
      } catch {
        // skip malformed JSON lines
      }
    }
  }

  yield { type: 'done' };
}

// --- Mock streaming ---

const MOCK_RESPONSES: Record<string, string> = {
  analyzeAST:
    '## AST 分析结果\n\n我已对提供的代码进行了抽象语法树分析：\n\n' +
    '**函数识别：**\n- 检测到多个函数定义，包括主函数和辅助函数\n- 发现了典型的缓冲区操作函数调用\n\n' +
    '**风险模式：**\n- 检测到 `strcpy` 等不安全的内存操作函数\n- 存在未验证输入长度的缓冲区复制操作\n\n' +
    '**建议：** 使用 `strncpy` 等安全替代函数，并在操作前验证输入长度。',
  audit:
    '## 代码安全审计报告\n\n### 整体风险等级：⚠️ 中等风险\n\n' +
    '**发现的安全问题：**\n\n' +
    '1. **缓冲区溢出风险** (CWE-120)\n   - 位置：`strcpy` 调用处\n   - 描述：未验证输入长度即进行缓冲区复制\n   - 严重程度：高\n\n' +
    '2. **未初始化变量使用**\n   - 位置：变量声明后未赋值即使用\n   - 严重程度：中\n\n' +
    '**修复建议：**\n- 使用安全的字符串操作函数\n- 启用编译器安全选项 (-fstack-protector-all)\n- 使用 AddressSanitizer 进行运行时检测',
  default:
    '## 分析结果\n\n根据您提供的代码，我进行了安全分析：\n\n' +
    '**主要发现：**\n- 代码中存在潜在的安全风险\n- 建议使用安全的 API 替代不安全的函数\n\n' +
    '**修复建议：**\n- 对所有用户输入进行验证和过滤\n- 使用参数化查询防止注入攻击\n- 遵循最小权限原则\n\n如需更详细的分析，请提供具体的代码片段。',
  cwe:
    '## CWE 漏洞分类信息\n\n**CWE-120: 缓冲区溢出**\n\n' +
    '**描述：** 程序在将输入复制到缓冲区时，未正确验证输入长度，可能导致栈溢出或堆溢出。\n\n' +
    '**严重程度：** 严重 (CVSS 9.8)\n\n' +
    '**常见函数：** strcpy, strcat, sprintf, gets\n\n' +
    '**修复方案：**\n1. 使用 strncpy, strncat, snprintf 等安全函数\n2. 在复制前验证输入长度\n3. 启用编译器安全选项\n4. 使用 AddressSanitizer 进行运行时检测',
};

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('ast') || lower.includes('语法树') || lower.includes('分析漏洞')) return MOCK_RESPONSES.analyzeAST;
  if (lower.includes('审计') || lower.includes('安全审') || lower.includes('audit')) return MOCK_RESPONSES.audit;
  if (lower.includes('cwe') || lower.includes('漏洞类型') || lower.includes('漏洞分类')) return MOCK_RESPONSES.cwe;
  return MOCK_RESPONSES.default;
}

async function* mockStreamResponse(userMessage: string): AsyncGenerator<StreamChunk> {
  const response = getMockResponse(userMessage);
  const chars = [...response];
  for (const char of chars) {
    yield { type: 'content', text: char };
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 25));
  }
  yield { type: 'done' };
}

// --- Public API ---

export interface SendMessageOptions {
  messages: ChatMessage[];
  onContent: (text: string) => void;
  onToolCall: (delta: ToolCallDelta) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function sendMessage(options: SendMessageOptions): Promise<void> {
  const { messages, onContent, onToolCall, onDone, onError } = options;
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');

  try {
    let generator: AsyncGenerator<StreamChunk>;

    if (isRealAPIAvailable()) {
      const apiMessages = buildMessages(messages);
      generator = streamFromAPI(apiMessages);
    } else {
      generator = mockStreamResponse(lastUserMsg?.content || '');
    }

    for await (const chunk of generator) {
      switch (chunk.type) {
        case 'content':
          onContent(chunk.text!);
          break;
        case 'tool_calls':
          onToolCall(chunk.toolCallDelta!);
          break;
        case 'done':
          onDone();
          return;
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : '请求失败，请检查网络连接');
  }
}
