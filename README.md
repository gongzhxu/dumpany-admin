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
├── api/            # API 接口封装
│   ├── request.ts  # Axios 实例 + 拦截器
│   ├── auth.ts     # 登录/登出
│   ├── licenses.ts # 授权管理
│   └── orders.ts   # 订单管理
├── components/     # 组件
│   └── Layout/     # 管理后台布局（菜单、Header、Outlet）
├── hooks/          # 自定义 hooks
│   └── useAuth.ts  # 认证状态管理
├── i18n/           # 国际化
│   ├── zh.json     # 中文
│   └── en.json     # 英文
├── pages/          # 页面
│   ├── Login/      # 登录页
│   ├── Dashboard/  # 仪表盘
│   ├── Licenses/   # 授权管理
│   ├── Orders/     # 订单管理
│   ├── Admins/     # 管理员管理
│   ├── Settings/   # Swagger 账号管理
│   └── Payment/    # 支付配置（支付宝）
├── App.tsx         # 路由配置
└── main.tsx        # 入口
```

## 开发规范

- **组件**：函数组件（React.FC），hooks 放在 `hooks/` 目录
- **API 调用**：通过 `api/request.ts` 封装的 Axios 实例，自动注入 Token、处理 401
- **国际化**：所有用户可见文字使用 `t('key')`，在 `i18n/zh.json` / `en.json` 中定义
- **样式**：Ant Design 组件 + 内联样式，全局样式在 style.css
- **路由**：嵌套路由在 `App.tsx` 中配置，受 `ProtectedRoute` 保护
- **操作列**：使用 `<Button>` 而非 `<a>`，确保按钮样式一致

## 构建

```bash
docker build -t dumpany-admin .
```
