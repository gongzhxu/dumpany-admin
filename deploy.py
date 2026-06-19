#!/usr/bin/env python3
"""
dumpany-admin 部署脚本

用法:
    python deploy.py build               构建 Docker 镜像
    python deploy.py up                  滚动更新所有实例 (admin1 → admin2)
    python deploy.py up admin1           重启单实例
    python deploy.py up admin2           重启单实例
"""

import os
import subprocess
import sys
import time
from pathlib import Path

SERVICE = "admin"
IMAGE = "dumpany-admin"
COMPOSE_FILE = os.environ.get("COMPOSE_FILE", os.path.expanduser("~/dumpany-basic/docker-compose.yml"))
PORT_MAP = {"admin1": 3003, "admin2": 3004}

G = "\033[32m"
Y = "\033[33m"
R = "\033[0m"
B = "\033[1m"


def run(cmd, cwd=None, check=True):
    print(f"  {Y}$ {cmd}{R}")
    r = subprocess.run(cmd, shell=True, cwd=cwd or str(Path.cwd()))
    if check and r.returncode != 0:
        sys.exit(r.returncode)
    return r


def build():
    print(f"\n{B}========== 构建 {SERVICE} 镜像 =========={R}")
    print("  ⬇️  拉取最新代码...")
    run("git checkout -- . 2>/dev/null || true", check=False)
    run("git pull")
    # 可选复制 favicon
    favicon = os.path.expanduser("~/dumpany-desktop/assets/images/appicon/appicon.svg")
    if os.path.isfile(favicon):
        os.makedirs("public", exist_ok=True)
        run(f"cp -f {favicon} public/favicon.svg", check=False)
    print("  🐳 构建镜像...")
    run(f"docker build --pull=false --progress=plain -t {IMAGE} .")
    print(f"  {G}✅ {SERVICE} 镜像构建完成{R}")


def health_check(inst, timeout=30):
    port = PORT_MAP[inst]
    url = f"http://localhost:{port}/"
    print(f"  等待健康检查: {url}")
    for i in range(1, timeout // 2 + 1):
        time.sleep(2)
        r = subprocess.run(f"curl -sf {url}", shell=True, capture_output=True)
        if r.returncode == 0:
            print(f"  {G}✅ 健康检查通过{R}")
            return True
        if i == 1:
            print(f"  📋 容器状态:")
            subprocess.run(f"docker ps -a --filter name=dumpany-{inst} --format 'table {{.Names}}\t{{.Status}}'", shell=True, check=False)
        print(f"  ⏳ 第 {i} 次检查未通过，等待中...")
    print(f"  {R}❌ 健康检查超时{R}")
    return False


def up_instance(inst):
    print(f"\n{B}========== 更新 {inst} =========={R}")
    run(f"docker compose -f {COMPOSE_FILE} up -d --no-deps --force-recreate {inst}")
    print(f"  📦 {inst} 容器已启动")
    if health_check(inst):
        print(f"  {G}✅ {inst} 就绪{R}")
        return True
    print(f"  {R}❌ {inst} 部署失败{R}")
    subprocess.run(f"docker logs --tail 20 dumpany-{inst} 2>/dev/null || true", shell=True)
    return False


def up(target=None):
    if not target or target == SERVICE:
        for inst in ["admin1", "admin2"]:
            if not up_instance(inst):
                return False
    else:
        if not up_instance(target):
            return False
    return True


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "build":
        build()
    elif sys.argv[1] == "up":
        target = sys.argv[2] if len(sys.argv) > 2 else None
        ok = up(target)
        sys.exit(0 if ok else 1)
    else:
        print(f"用法: python deploy.py {{build|up [instance]}}")
        print("  build                构建 Docker 镜像")
        print("  up                   滚动更新 admin1 → admin2")
        print("  up admin1|admin2     重启指定实例")
        sys.exit(1)
