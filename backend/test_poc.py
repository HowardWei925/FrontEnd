"""PoC 验证测试脚本"""
import requests
import json
import sys
import io

# 设置 UTF-8 输出
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

API_URL = "http://localhost:8000/api/poc/verify"

def test_poc(description, payload):
    print(f"\n{'='*50}")
    print(f"测试: {description}")
    print(f"{'='*50}")

    try:
        resp = requests.post(API_URL, json=payload, timeout=60)
        result = resp.json()

        print(f"状态: {result['status']}")
        print(f"摘要: {result['summary']}")

        for step in result.get('steps', []):
            print(f"\n  步骤: {step['name']}")
            print(f"  状态: {step['status']}")
            if step.get('command'):
                print(f"  命令: {step['command']}")
            if step.get('stdout'):
                print(f"  输出: {step['stdout'][:200]}")
            if step.get('stderr'):
                print(f"  错误: {step['stderr'][:200]}")
            print(f"  耗时: {step.get('duration', 0)}ms")

        return result['status'] == 'passed'
    except Exception as e:
        print(f"异常: {e}")
        return False


# 测试1: 简单命令
test_poc("简单命令执行", {
    "pocContent": "echo 'PoC test passed'",
    "pocType": "command"
})

# 测试2: GCC 版本检查
test_poc("GCC 版本检查", {
    "pocContent": "gcc --version | head -1",
    "pocType": "command"
})

# 测试3: Python 执行
test_poc("Python 代码执行", {
    "pocContent": "print('Hello from Python PoC')",
    "pocType": "code",
    "language": "python"
})

# 测试4: C 代码编译运行
test_poc("C 代码编译运行", {
    "pocContent": "#include <stdio.h>\nint main() { printf(\"Hello C\\n\"); return 0; }",
    "pocType": "code",
    "language": "c"
})

# 测试5: 缓冲区溢出 PoC（模拟漏洞验证）
test_poc("缓冲区溢出 PoC", {
    "pocContent": """#include <stdio.h>
#include <string.h>

int main() {
    char buf[16];
    // 尝试溢出
    memset(buf, 'A', 32);
    printf("Buffer overflow PoC executed\\n");
    return 0;
}""",
    "pocType": "code",
    "language": "c"
})

# 测试6: 带目标代码的验证
test_poc("带目标代码的补丁验证", {
    "pocContent": "#include <stdio.h>\nint main() { printf(\"PoC\\n\"); return 0; }",
    "pocType": "code",
    "language": "c",
    "targetCode": "#include <stdio.h>\nvoid safe_print() { printf(\"Safe\\n\"); }\nint main() { safe_print(); return 0; }"
})

print("\n" + "="*50)
print("所有测试完成!")
print("="*50)
