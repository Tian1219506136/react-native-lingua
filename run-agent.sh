#!/bin/bash
# Lingua Vision Agent 一键启动(含代理)
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890
cd "$(dirname "$0")/vision-agent"
exec .venv/bin/python agent.py serve --host 127.0.0.1 --port 8799 --no-splash --http-log-level info
