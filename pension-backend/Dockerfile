# 使用官方 Python 轻量级镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 1. 先复制依赖文件 (利用 Docker 缓存机制加速构建)
COPY requirements.txt .

# 2. 安装依赖 (使用清华源加速，虽然云端通常很快，但为了保险)
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.cloud.tencent.com/pypi/simple

# 3. 复制所有代码文件到容器中
COPY . .

# 暴露 80 端口 (微信云托管默认监听端口)
EXPOSE 80

# 启动命令：使用 gunicorn 生产级服务器
# -w 1: 开启1个 worker 进程 (MVP足够了)
# -b :80: 绑定到 80 端口
CMD ["gunicorn", "-w", "1", "-b", ":80", "main:app"]