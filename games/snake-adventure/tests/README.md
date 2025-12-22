# Snake Adventure - Tests

测试框架：Vitest

## 安装依赖

```bash
cd /home/wxcd/mgame/games/snake-adventure
npm install
```

## 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 可视化界面
npm run test:ui
```

## 测试文件

### BuffManager.test.js
测试buff系统：
- ✅ 分数倍数器
- ✅ 速度提升
- ✅ 磁铁效果
- ✅ 连击系统
- ✅ 多个buff同时激活

### CollisionManager.test.js
测试优化后的碰撞检测：
- ✅ 空间分区网格
- ✅ 边界碰撞检测
- ✅ 蛇与蛇碰撞
- ✅ 食物收集检测
- ✅ O(n²) → O(n) 性能优化验证

### RenderManager.test.js
测试渲染优化：
- ✅ 边界缓存（400绘制 → 1绘制）
- ✅ 视口裁剪（跳过屏幕外星星）
- ✅ 磁铁范围渲染
- ✅ 连击显示
- ✅ 暂停遮罩

## 覆盖率目标

- 语句覆盖率: >80%
- 分支覆盖率: >75%
- 函数覆盖率: >85%
- 行覆盖率: >80%

## 性能基准

CollisionManager应该通过以下性能测试：
- 100条蛇：< 16ms/frame (60 FPS)
- 网格构建：< 5ms
- 碰撞检查：O(n) 复杂度
