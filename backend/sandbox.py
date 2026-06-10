"""
Docker 沙箱执行器
在隔离容器中安全执行 PoC 验证命令
"""

import docker
import time
import uuid
import os
import base64
from typing import Optional
from dataclasses import dataclass, asdict


@dataclass
class ExecutionResult:
    """命令执行结果"""
    exit_code: int
    stdout: str
    stderr: str
    duration: int  # 毫秒
    timed_out: bool = False


@dataclass
class VerificationStep:
    """验证步骤"""
    id: str
    name: str
    status: str  # pending | running | passed | failed | error
    command: Optional[str] = None
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exitCode: Optional[int] = None
    duration: Optional[int] = None
    error: Optional[str] = None


@dataclass
class VerificationResult:
    """完整验证结果"""
    poc_id: str
    status: str  # passed | failed | error
    steps: list
    summary: str
    timestamp: int


class SandboxExecutor:
    """Docker 沙箱执行器"""

    def __init__(self, image_name: str = "poc-sandbox"):
        self.image_name = image_name
        self.client = docker.from_env()
        self._ensure_image()

    def _ensure_image(self):
        """确保沙箱镜像存在"""
        try:
            self.client.images.get(self.image_name)
        except docker.errors.ImageNotFound:
            print(f"Building sandbox image: {self.image_name}")
            dockerfile_path = os.path.dirname(os.path.abspath(__file__))
            self.client.images.build(
                path=dockerfile_path,
                dockerfile="Dockerfile.sandbox",
                tag=self.image_name,
                rm=True
            )
            print(f"Image {self.image_name} built successfully")

    def execute_command(
        self,
        command: str,
        timeout: int = 30,
        memory_limit: str = "256m",
        cpu_period: int = 100000,
        cpu_quota: int = 50000
    ) -> ExecutionResult:
        """在沙箱中执行命令"""
        start_time = time.time()
        container = None

        try:
            container = self.client.containers.run(
                self.image_name,
                command=f"/bin/bash -c {self._escape_command(command)}",
                detach=True,
                mem_limit=memory_limit,
                cpu_period=cpu_period,
                cpu_quota=cpu_quota,
                network_disabled=True,
                read_only=False,
                tmpfs={"/tmp": "size=64m"},
                security_opt=["no-new-privileges"],
                cap_drop=["ALL"],
            )

            result = container.wait(timeout=timeout)
            stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
            stderr = container.logs(stdout=False, stderr=True).decode("utf-8", errors="replace")
            duration = int((time.time() - start_time) * 1000)

            return ExecutionResult(
                exit_code=result.get("StatusCode", -1),
                stdout=self._truncate_output(stdout),
                stderr=self._truncate_output(stderr),
                duration=duration
            )

        except docker.errors.ContainerError as e:
            duration = int((time.time() - start_time) * 1000)
            return ExecutionResult(
                exit_code=e.exit_status,
                stdout="",
                stderr=self._truncate_output(str(e)),
                duration=duration
            )

        except Exception as e:
            duration = int((time.time() - start_time) * 1000)
            is_timeout = "timeout" in str(e).lower() or "timed out" in str(e).lower()
            return ExecutionResult(
                exit_code=-1,
                stdout="",
                stderr=self._truncate_output(str(e)),
                duration=duration,
                timed_out=is_timeout
            )

        finally:
            if container:
                try:
                    container.remove(force=True)
                except:
                    pass

    def _escape_command(self, command: str) -> str:
        """转义命令中的特殊字符"""
        escaped = command.replace("'", "'\\''")
        return f"'{escaped}'"

    def _truncate_output(self, output: str, max_lines: int = 100, max_chars: int = 10000) -> str:
        """截断过长的输出"""
        if len(output) > max_chars:
            output = output[:max_chars] + "\n... (输出被截断)"
        lines = output.split("\n")
        if len(lines) > max_lines:
            output = "\n".join(lines[:max_lines]) + "\n... (输出被截断)"
        return output.strip()

    def verify_poc(
        self,
        poc_content: str,
        poc_type: str = "command",
        target_code: Optional[str] = None,
        language: str = "c"
    ) -> VerificationResult:
        """验证 PoC"""
        poc_id = f"poc-{uuid.uuid4().hex[:12]}"
        steps = []

        # 构建组合命令（在同一容器中执行所有操作）
        combined_cmd = "set -e; "

        if poc_type == "code":
            file_ext = {"c": ".c", "cpp": ".cpp", "python": ".py", "bash": ".sh"}.get(language, ".c")
            poc_file = f"poc{file_ext}"
            encoded = base64.b64encode(poc_content.encode()).decode()

            # 写入 PoC 文件
            combined_cmd += f"python3 -c \"import base64; open('{poc_file}','wb').write(base64.b64decode('{encoded}'))\"; "

            # 编译（如果是编译型语言）
            if language in ["c", "cpp"]:
                compiler = "gcc" if language == "c" else "g++"
                combined_cmd += f"{compiler} -o poc_exploit {poc_file} -fno-stack-protector; "
                exec_cmd = "./poc_exploit"
            elif language == "python":
                exec_cmd = f"python3 {poc_file}"
            else:
                exec_cmd = f"bash {poc_file}"
        else:
            exec_cmd = poc_content

        # 写入目标代码（如果有）
        if target_code:
            encoded_target = base64.b64encode(target_code.encode()).decode()
            combined_cmd += f"python3 -c \"import base64; open('target.c','wb').write(base64.b64decode('{encoded_target}'))\"; "
            combined_cmd += "gcc -o target target.c -fstack-protector-all; "

        # 执行 PoC
        combined_cmd += exec_cmd

        # 一次性执行
        result = self.execute_command(combined_cmd, timeout=30)

        steps.append(VerificationStep(
            id=f"{poc_id}-step-1",
            name="编译并执行 PoC",
            status="passed" if result.exit_code == 0 else "failed",
            command=exec_cmd,
            stdout=result.stdout,
            stderr=result.stderr,
            exitCode=result.exit_code,
            duration=result.duration
        ))

        # 判断最终状态
        all_passed = all(s.status == "passed" for s in steps)
        return VerificationResult(
            poc_id=poc_id,
            status="passed" if all_passed else "failed",
            steps=[asdict(s) for s in steps],
            summary="✅ 补丁验证通过：PoC 未能触发漏洞，补丁有效防御了攻击" if all_passed
            else "❌ 补丁验证失败：PoC 成功触发漏洞，补丁可能无效",
            timestamp=int(time.time() * 1000)
        )
