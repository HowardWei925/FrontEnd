"""
PoC 自动验证后端服务
基于 FastAPI + Docker 沙箱
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dataclasses import asdict

from sandbox import SandboxExecutor


# ============ 数据模型 ============

class PocVerifyRequest(BaseModel):
    """PoC 验证请求"""
    pocContent: str
    pocType: str = "command"  # "command" | "code"
    targetCode: Optional[str] = None
    language: str = "c"  # 代码语言：c, cpp, python, bash


class PocVerifyResponse(BaseModel):
    """PoC 验证响应"""
    pocId: str
    status: str  # "passed" | "failed" | "error"
    steps: list
    summary: str
    timestamp: int


# ============ 应用初始化 ============

app = FastAPI(
    title="PoC 自动验证服务",
    description="在 Docker 沙箱中安全执行 PoC 验证",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 沙箱执行器（启动时初始化）
executor: Optional[SandboxExecutor] = None


@app.on_event("startup")
async def startup_event():
    """启动时初始化沙箱"""
    global executor
    try:
        executor = SandboxExecutor()
        print("✅ Sandbox executor initialized")
    except Exception as e:
        print(f"⚠️ Failed to initialize sandbox: {e}")
        print("   PoC verification will not be available")


# ============ API 路由 ============

@app.get("/")
async def root():
    """健康检查"""
    return {
        "service": "PoC 自动验证服务",
        "status": "running",
        "sandbox_available": executor is not None
    }


@app.post("/api/poc/verify", response_model=PocVerifyResponse)
async def verify_poc(request: PocVerifyRequest):
    """
    验证 PoC

    在 Docker 沙箱中执行 PoC 代码或命令，验证补丁有效性。

    - **pocContent**: PoC 代码内容或验证命令
    - **pocType**: PoC 类型，"code"（代码）或 "command"（命令）
    - **targetCode**: 目标代码（打了补丁后的版本），可选
    - **language**: 编程语言，pocType=code 时使用
    """
    if executor is None:
        raise HTTPException(
            status_code=503,
            detail="沙箱未初始化，无法执行 PoC 验证"
        )

    try:
        result = executor.verify_poc(
            poc_content=request.pocContent,
            poc_type=request.pocType,
            target_code=request.targetCode,
            language=request.language
        )

        return PocVerifyResponse(
            pocId=result.poc_id,
            status=result.status,
            steps=result.steps,
            summary=result.summary,
            timestamp=result.timestamp
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"验证执行失败: {str(e)}"
        )


@app.get("/api/poc/health")
async def health_check():
    """详细健康检查"""
    return {
        "status": "healthy",
        "sandbox": {
            "available": executor is not None,
            "image": executor.image_name if executor else None
        }
    }


# ============ 启动入口 ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
