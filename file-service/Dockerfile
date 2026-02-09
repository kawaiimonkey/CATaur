# --- 第一阶段：构建环境 ---
FROM node:24-alpine AS builder

# 安装 sharp 编译所需的底层依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

WORKDIR /app

# 先复制依赖文件，利用 Docker 缓存层
COPY package*.json ./

# 安装所有依赖（包括开发依赖以编译代码）
RUN npm install

# 复制所有源代码
COPY . .

# 执行 NestJS 构建（生成 dist 目录）
RUN npm run build

# --- 第二阶段：运行环境 ---
FROM node:24-alpine

# 在运行阶段也需要 vips 库来支持 sharp
RUN apk add --no-cache vips

WORKDIR /app

# 从构建阶段复制 node_modules 和 dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 设置生产环境变量
ENV NODE_ENV=production

# 暴露 NestJS 默认端口
EXPOSE 3000

# 启动应用
CMD ["node", "dist/main"]