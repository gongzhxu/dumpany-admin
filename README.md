# DumpAny Admin

DumpAny 管理后台前端，基于 React + TypeScript + Ant Design。

## 技术栈

- React 18 + TypeScript
- Vite
- Ant Design 5
- i18next（中/英文）
- Axios
- dayjs

## 开发

```bash
npm run dev        # 开发服务器 :9246
npm run build      # 生产构建
```

API 代理配置在 `vite.config.ts` 中，开发模式自动代理 `/api` 到 `localhost:8080`。

## 目录结构

```
src/
├── api/               # API 接口封装
│   ├── request.ts     # Axios 实例 + 拦截器
│   └── ...
├── components/
│   └── Layout/        # 管理后台布局（菜单、Header、Outlet）
├── hooks/
│   └── useAuth.ts     # 认证状态管理
├── i18n/
│   ├── zh.json        # 中文
│   └── en.json        # 英文
├── pages/
│   ├── Dashboard/     # 仪表盘
│   ├── License/       # 授权管理
│   ├── Order/         # 订单管理
│   ├── Plan/          # 套餐管理
│   ├── Admin/         # 管理员管理
│   ├── App/           # 应用管理
│   ├── Swagger/       # Swagger 账号管理
│   ├── Payment/       # 支付配置（支付宝）
│   └── SystemConfig/  # 系统配置（通用/SMS/邮件）
├── App.tsx            # 路由配置
└── main.tsx           # 入口
```

## 开发规范

- **组件**：函数组件（React.FC），hooks 放在 `hooks/` 目录
- **API 调用**：通过 `api/request.ts` 封装的 Axios 实例，自动注入 Token、处理 401
- **国际化**：所有用户可见文字使用 `t('key')`，在 `i18n/zh.json` / `en.json` 中定义
- **样式**：Ant Design 组件 + 内联样式，全局样式在 style.css
- **路由**：嵌套路由在 `App.tsx` 中配置，受 `ProtectedRoute` 保护
- **操作列**：使用 `<Button>` 而非 `<a>`，确保按钮样式一致

## 构建验证

**修改代码后必须先本地构建再提交**，确保无 TypeScript 错误：

```bash
npm run build
# 或仅检查类型
npx tsc --noEmit
```

本地构建通过后才允许 commit + push。

## 构建

```bash
docker build -t dumpany-admin .
```
