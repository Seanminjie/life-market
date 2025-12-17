# 🔮 人生大盘 (Life Market)

> 基于 AI 和传统八字命理的金融终端风格人生 K 线可视化工具

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ 功能特点

1. **人生 K 线图** - 将 0-80 岁的人生运势以股票 K 线图形式可视化展示
2. **八字命理分析** - 基于生辰八字、大运流年、五行十神计算人生指数
3. **AI 招股说明书** - 使用 DeepSeek API 生成专业的《人生招股说明书》
4. **分享卡片** - 生成精美的分享卡片，包含人生总估值和标签
5. **金融终端风格** - 深色主题，荧光绿配色，专业的金融数据展示

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 技术栈

- **框架**: Next.js 16.0.10
- **语言**: TypeScript 5.0
- **样式**: Tailwind CSS 4.0
- **图表**: ECharts + echarts-for-react
- **命理库**: lunar-javascript
- **AI**: DeepSeek API

## 🎯 核心功能

### 1. 八字计算
- 自动从出生日期时间计算八字
- 分析五行能量和十神强弱
- 计算大运和流年影响

### 2. K 线数据生成
- 基于八字、大运、流年生成 80 年 K 线数据
- 考虑天干相生相克关系
- 模拟人生不同阶段的起伏

### 3. 可视化展示
- 专业的 K 线图（上涨绿、下跌红）
- 统计面板（总涨幅、波动率等）
- 核心事件预测
- 分享卡片生成

### 4. AI 报告生成
- 集成 DeepSeek API
- 生成《人生招股说明书》
- 包含核心业务、好运年、风险提示、投资建议

## 📁 项目结构

```
life-market/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── result/            # 结果页面
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── LifeKLine.tsx     # K 线图组件
│   └── ShareCard.tsx     # 分享卡片组件
├── lib/                   # 工具函数
│   ├── engine.ts         # K 线数据生成引擎
│   └── prompt.ts         # Prompt 生成工具
└── types/                 # TypeScript 类型定义
```

## 🔧 环境配置

### DeepSeek API Key

在 `app/api/generate-report/route.ts` 中配置你的 DeepSeek API Key：

```typescript
const DEEPSEEK_API_KEY = 'your-api-key-here';
```

或者使用环境变量（推荐）：

```bash
# .env.local
DEEPSEEK_API_KEY=your-api-key-here
```

## 🌐 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（如需要）
4. 一键部署

### 其他平台

项目基于 Next.js，可以部署到任何支持 Next.js 的平台：
- Vercel（推荐）
- Netlify
- Railway
- 自建服务器

## 📝 使用说明

1. **输入信息** - 在首页填写姓名、出生日期和时间
2. **开始复盘** - 点击"开始复盘"按钮
3. **查看 K 线** - 自动生成 80 年人生 K 线图
4. **生成报告** - 点击"生成报告"获取 AI 分析
5. **分享卡片** - 查看并分享你的人生大盘卡片

## 🎨 设计特色

- **深色金融终端风格** - 背景色 #0a0a0a
- **荧光绿主题** - 主色调 #00ff41
- **跌停红** - 下跌颜色 #ff3b30
- **等宽字体** - 专业的金融数据展示

## 📚 参考

- [lifekline](https://github.com/curionox/lifekline) - 参考项目
- [lunar-javascript](https://github.com/6tail/lunar-javascript) - 农历八字库
- [ECharts](https://echarts.apache.org/) - 图表库

## ⚠️ 免责声明

本项目仅供娱乐与文化研究，命运掌握在自己手中。切勿迷信，请理性看待分析结果。

## 📄 License

MIT License

---

**人生大盘** - 用金融的眼光看人生，用数据的方式理解命运。
