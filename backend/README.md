# PoC 自动验证后端

基于 Docker 沙箱的 PoC 验证服务，用于安全执行漏洞验证命令。

## 功能

- ✅ 在隔离的 Docker 容器中执行 PoC
- ✅ 支持代码和命令两种模式
- ✅ 资源限制（CPU、内存、网络）
- ✅ 超时控制
- ✅ 结构化返回验证结果

## 前置要求

- Python 3.9+
- Docker Desktop（已安装并运行）

## 安装

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 安装依赖
pip install -r requirements.txt
```

## 启动

```bash
# 直接启动
python main.py

# 或使用 uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

启动后访问：
- API 文档：http://localhost:8000/docs
- 健康检查：http://localhost:8000/

## API 接口

### POST /api/poc/verify

验证 PoC

**请求体：**
```json
{
  "pocContent": "gcc -o test test.c && ./test",
  "pocType": "command",
  "targetCode": "#include <stdio.h>...",
  "language": "c"
}
```

**响应：**
```json
{
  "pocId": "poc-abc123",
  "status": "passed",
  "steps": [
    {
      "id": "poc-abc123-step-1",
      "name": "执行验证",
      "status": "passed",
      "command": "gcc -o test test.c && ./test",
      "stdout": "...",
      "stderr": "",
      "exitCode": 0,
      "duration": 150
    }
  ],
  "summary": "✅ 补丁验证通过：PoC 未能触发漏洞",
  "timestamp": 1718000000000
}
```

## 安全机制

| 机制 | 说明 |
|------|------|
| Docker 隔离 | 每次执行在独立容器中 |
| 网络禁用 | 容器无法访问网络 |
| 内存限制 | 最大 256MB |
| CPU 限制 | 最大 50% CPU |
| 超时控制 | 默认 30 秒 |
| 权限限制 | 非 root 用户，禁止提权 |
| 输出截断 | 防止输出过大 |

## 前端对接

在前端 `agent-tools.ts` 中替换 mock 为真实 API 调用：

```typescript
async function verifyPocApi(args: Record<string, unknown>): Promise<ToolResult> {
  const response = await fetch('http://localhost:8000/api/poc/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pocContent: args.pocContent,
      pocType: args.pocType,
      targetCode: args.targetCode,
      language: args.language || 'c'
    }),
  });

  if (!response.ok) {
    throw new Error(`验证失败: ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, data };
}
```

## 目录结构

```
backend/
├── main.py              # FastAPI 主服务
├── sandbox.py           # Docker 沙箱执行器
├── Dockerfile.sandbox   # 沙箱镜像定义
├── requirements.txt     # Python 依赖
└── README.md            # 本文件
```

## 注意事项

1. **首次启动**会自动构建 Docker 镜像，需要几分钟
2. 确保 Docker Desktop 已启动
3. 生产环境应限制 CORS 来源
4. 建议使用 HTTPS
