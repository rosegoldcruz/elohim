<div align="center" width="100%">
    <img src="./saasfly-logo.svg" width="128" alt="" />
</div>

# Saasfly </br>

[![GitHub Actions工作流状态][check-workflow-badge]][check-workflow-badge-link] [![GitHub许可证][github-license-badge]][github-license-badge-link]  [![Discord][discord-badge]][discord-badge-link] [![Saasfly][made-by-nextify-badge]][made-by-nextify-badge-link]
[![English](https://img.shields.io/badge/-English-grey.svg)](README.md)


一个易于使用、企业级的Next.js样板。

您不再需要购买模板; Saasfly提供了一个完整的开源解决方案,用于快速轻松地构建SaaS应用程序。

> **[Nextify](https://nextify.ltd)** 提供完整的企业SaaS解决方案。如果您有兴趣讨论您的项目,或者您只是想与我们交谈,请随时与我们联系[contact@nextify.ltd](mailto:contact@nextify.ltd)。

> ❤️ 我们为**非营利组织提供免费的技术支持和部署服务**。
>
> 🙌 从我们的开源项目中获得的**所有利润将完全用于支持开源计划和慈善事业**。

## ⚡ 在线演示

亲自试一试吧!

演示服务器1(位置:美国华盛顿): <https://show.saasfly.io>

演示服务器2(位置:日本东京): <https://demo.saasfly.io>

查看更多文档请访问 <https://document.saasfly.io>

## 🌟 Star历史

[![Star History Chart](https://api.star-history.com/svg?repos=saasfly/saasfly&type=Timeline)](https://star-history.com/#saasfly/saasfly&Timeline)

## 赞助商

<table>
  <tr >
    <td>
      <a href="https://www.twillot.com/">
        <picture>
          <img alt="Take Control of All Your Twitter Assets" src="/twillot.png">
        </picture>
      </a>
    </td>
    <td>
      <a href="https://www.setupyourpay.com/" title="如何注册美国公司进行收款">
        <picture>
          <img alt="全球收款手册" src="/setupyourpay.png">
        </picture>
      </a>
    </td>
  <tr >
    <td >
      <a href="mailto:contact@nextify.ltd">
        赞助我们
      </a>
    </td>
  </tr>
</table>


## 🚀 入门指南

### 🖱 一键模板

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsaasfly%2Fsaasfly&env=NEXT_PUBLIC_APP_URL,NEXTAUTH_URL,NEXTAUTH_SECRET,STRIPE_API_KEY,STRIPE_WEBHOOK_SECRET,POSTGRES_URL,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,RESEND_API_KEY,RESEND_FROM&install-command=bun%20install&build-command=bun%20run%20build&root-directory=apps%2Fnextjs)

### 📋 前提条件

开始之前,请确保您已安装以下内容:

1. [Bun](https://bun.sh/) & [Node.js](https://nodejs.org/) & [Git](https://git-scm.com/)

    1. Linux

    ```bash
      curl -sL https://gist.github.com/tianzx/874662fb204d32390bc2f2e9e4d2df0a/raw -o ~/downloaded_script.sh && chmod +x ~/downloaded_script.sh && source ~/downloaded_script.sh 
    ```

    2. MacOS

    ```bash
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"  
      brew install git
      brew install oven-sh/bun/bun
      brew install nvm
    ```

2. [PostgreSQL](https://www.postgresql.org/)
    1. 您可以使用Vercel Postgres或本地PostgreSQL服务器(在.env.local中添加POSTGRES_URL环境变量)
       ```bash
          POSTGRES_URL = ''
       ```

### 安装

要开始使用此样板,我们提供两个选项:

1. 使用`bun create`命令(🌟强烈推荐🌟):

```bash
bun create saasfly
```

2. 手动克隆存储库:

```bash
git clone https://github.com/saasfly/saasfly.git
cd saasfly 
bun install  
```

### 设置

按照以下步骤设置您的项目:

1. 设置环境变量:

```bash
cp .env.example .env.local 
// (在运行此命令之前,您必须准备一个数据库)
bun db:push  
```

2. 运行开发服务器:

```bash
bun run dev:web
```

3. 在浏览器中打开[http://localhost:3000](http://localhost:3000)查看结果。

4. （可选的 Alpha 功能）`bun run tailwind-config-viewer` 在你的浏览器中打开 [http://localhost:3333](http://localhost:3333) 查看你的 Tailwind CSS 配置。

### 其他说明

在 2025 年 6 月 1 日之后，我们将使用 Clerk 作为默认的身份验证提供商。

你可以在这里找到 NextAuth 的实现方案 （ https://github.com/saasfly/saasfly/tree/feature-nextauth ）。

## 🥺 项目路线图

1. 管理仪表板页面(处于alpha阶段!!!)
    2. 目前仅提供静态页面,我们计划与无头架构CMS集成
    3. 您可以提供管理员账号,在.env.local中更改**ADMIN_EMAIL="admin@aeon.ai,root@aeon.ai"**,然后访问host:port/admin/dashboard
    4. 基于安全考虑,我们暂时不提供在线演示。
2. 多语言READEME
3. TODO

## ⭐ 特性

### 🐭 框架

- **[Next.js](https://nextjs.org/)** - React 网络框架 (使用**App Directory**)
- **[NextAuth.js](https://next-auth.js.org/)** - 用于Next.js的身份验证
- **[Kysely](https://kysely.dev/)** - 用于TypeScript的类型安全SQL查询构建器
- **[Prisma](https://www.prisma.io/)** - 用于Node.js和TypeScript的下一代ORM,用作架构管理工具
- **[React-email](https://react.email/)** - 一个React渲染器,用于使用React组件创建漂亮的电子邮件

### 🐮 平台

- **[Clerk](https://go.clerk.com/uKDp7Au)** - 最全面的用户管理平台
- **[Vercel](https://vercel.com/)** – 轻松部署您的Next.js应用
- **[Stripe](https://stripe.com/)** – 面向互联网企业的支付处理
- **[Resend](https://resend.com/)** – 面向开发人员的电子邮件营销平台

### 🐯 企业功能

- **[i18n](https://nextjs.org/docs/app/building-your-application/routing/internationalization)** - 对国际化的支持
- **[SEO](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)** - 搜索引擎优化
- **[MonoRepo](https://turbo.build/)** - Monorepo以更好地管理代码
- **[T3 Env](https://env.t3.gg/)** - 轻松管理您的环境变量

### 🐰 数据获取

- **[trpc](https://trpc.io/)** – 轻松创建端到端类型安全API
- **[tanstack/react-query](https://react-query.tanstack.com/)** – 在React中用于获取、缓存和更新异步数据的钩子

### 🐲 全局状态管理

- **[Zustand](https://zustand.surge.sh/)** – 适用于React的小型、快速且可扩展的状态管理

### 🐒 UI

- **[Tailwind CSS](https://tailwindcss.com/)** – 用于快速UI开发的实用程序优先CSS框架
- **[Shadcn/ui](https://ui.shadcn.com/)** – 使用Radix UI和Tailwind CSS构建的可重用组件
- **[Framer Motion](https://framer.com/motion)** – 适用于React的动画库,可轻松为组件添加动画
- **[Lucide](https://lucide.dev/)** – 简单美观、像素完美的图标
- **[next/font](https://nextjs.org/docs/basic-features/font-optimization)** – 优化自定义字体并删除外部网络请求以提高性能

### 🐴 代码质量

- **[TypeScript](https://www.typescriptlang.org/)** – 端到端类型安全的静态类型检查器
- **[Prettier](https://prettier.io/)** – 用于一致代码风格的固执的代码格式化程序
- **[ESLint](https://eslint.org/)** – 适用于Next.js和TypeScript的可插拔linter
- **[Husky](https://typicode.github.io/husky)** – 轻松使用Git钩子

### 🐑 性能

- **[Vercel Analytics](https://vercel.com/analytics)** – 用于Next.js应用的实时性能指标
- **[bun.sh](https://bun.sh/)** – npm的替代品,用于更快、更可靠的包管理

### 🐘 数据库

- **[PostgreSQL](https://www.postgresql.org/)** – 世界上最先进的开源数据库

## 📦 应用和软件包

- `web`: 主要的Next.js应用程序
- `ui`: 共享UI组件
- `db`: 数据库模式和工具
- `auth`: 身份验证实用程序
- `email`: 电子邮件模板和实用程序

## 📜 许可证

本项目采用MIT许可证。有关更多信息,请参阅[LICENSE](./LICENSE)文件。

## 🙏 致谢

本项目的灵感来自shadcn的[Taxonomy](https://github.com/shadcn-ui/taxonomy)和t3-oss的[create-t3-turbo](https://github.com/t3-oss/create-t3-turbo)。

<!-- 徽章和链接 -->

[check-workflow-badge]: https://img.shields.io/github/actions/workflow/status/saasfly/saasfly/ci.yml?label=ci
[github-license-badge]: https://img.shields.io/badge/License-MIT-green.svg
[discord-badge]: https://img.shields.io/discord/1204690198382911488?color=7b8dcd&link=https%3A%2F%2Fsaasfly.io%2Fdiscord
[made-by-nextify-badge]: https://img.shields.io/badge/made_by-nextify-blue?color=FF782B&link=https://nextify.ltd/

[check-workflow-badge-link]: https://github.com/saasfly/saasfly/actions/workflows/check.yml
[github-license-badge-link]: https://github.com/saasfly/saasfly/blob/main/LICENSE
[discord-badge-link]: https://discord.gg/8SwSX43wnD
[made-by-nextify-badge-link]: https://nextify.ltd