# dumpany-admin 开发规范

## 构建验证

**修改代码后必须先本地构建再提交**，确保无 TypeScript 错误：

```bash
npm run build
# 或仅检查类型
npx tsc --noEmit
```

本地构建通过后才允许 commit + push。

## 技术栈

- React 19, TypeScript, Vite
- Ant Design 6, Axios, react-router-dom v7
- i18next (中英文), dayjs
