# 🚀 部署指南

## 步骤 1: 配置 Git（如果还没有配置）

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 步骤 2: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com/new)
2. 创建新仓库，命名为 `life-market`（或你喜欢的名字）
3. **不要**初始化 README、.gitignore 或 license（我们已经有了）

## 步骤 3: 推送代码到 GitHub

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/life-market.git

# 推送代码
git branch -M main
git push -u origin main
```

## 步骤 4: 在 Vercel 上部署

### 方法一：通过 Vercel 网站（推荐）

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New Project"
4. 选择你刚创建的 `life-market` 仓库
5. 配置项目：
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
6. 点击 "Deploy"
7. 等待部署完成（通常 1-2 分钟）

### 方法二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

## 步骤 5: 配置环境变量（可选）

如果需要使用环境变量存储 API Key：

1. 在 Vercel 项目设置中，进入 "Environment Variables"
2. 添加 `DEEPSEEK_API_KEY`（如果需要）
3. 重新部署项目

## 步骤 6: 自定义域名（可选）

1. 在 Vercel 项目设置中，进入 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS

## ✅ 完成！

部署完成后，你会获得一个类似 `https://life-market.vercel.app` 的 URL。

每次推送到 GitHub 的 main 分支，Vercel 会自动重新部署。

---

**提示**: 如果遇到部署问题，检查：
- 构建日志中的错误信息
- 环境变量是否正确配置
- Node.js 版本是否兼容（Vercel 默认使用 Node.js 20）

