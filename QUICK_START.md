# ⚡ 快速部署指南

## 一键部署到 Vercel

### 方法 1: 通过 GitHub（推荐）

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建新仓库，然后执行：
   git remote add origin https://github.com/YOUR_USERNAME/life-market.git
   git branch -M main
   git push -u origin main
   ```

2. **在 Vercel 部署**
   - 访问 https://vercel.com
   - 点击 "Add New Project"
   - 导入 GitHub 仓库
   - 点击 "Deploy"（无需配置，自动检测 Next.js）

### 方法 2: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel

# 生产环境部署
vercel --prod
```

## 配置环境变量（可选）

如果需要使用自己的 DeepSeek API Key：

1. 在 Vercel 项目设置 → Environment Variables
2. 添加变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: 你的 API Key
3. 重新部署

## 完成！

部署完成后，访问 Vercel 提供的 URL 即可使用。

---

**注意**: 代码中已包含默认 API Key，可以直接使用。如需更换，请使用环境变量。

