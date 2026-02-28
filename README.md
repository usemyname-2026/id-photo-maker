# 自动证件照制作

基于 Next.js + Tailwind CSS 的 Web 版证件照制作工具，使用 Remove.bg API 自动去除背景。

## 功能

- 上传照片，自动去除背景
- 支持红、蓝、白三种背景色
- 常用尺寸：一寸、两寸、小一寸、大一寸
- 一键下载标准尺寸证件照

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Key

1. 前往 [Remove.bg](https://www.remove.bg/api) 注册并获取 API Key
2. 复制 `.env.local.example` 为 `.env.local`
3. 填入你的 API Key：

```
REMOVE_BG_API_KEY=你的API密钥
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

## 技术栈

- **Next.js 14** - React 框架
- **Tailwind CSS** - 样式
- **Remove.bg API** - 背景去除

## 项目结构

```
id-photo-maker/
├── src/
│   ├── app/
│   │   ├── api/remove-bg/   # 去背景 API 路由
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx        # 主页面
│   └── lib/
│       └── constants.ts    # 尺寸、颜色配置
├── .env.local.example
├── package.json
└── README.md
```

## 注意事项

- Remove.bg 免费版有 API 调用次数限制
- 建议使用光线充足、人脸清晰的照片以获得最佳效果
