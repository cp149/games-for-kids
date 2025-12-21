# Logger使用指南

通用日志工具，自动区分开发/生产环境。

## 特性

✅ **自动环境检测**
- `localhost`, `127.0.0.1`, `file://` → 开发环境（打印日志）
- GitHub Pages, 自定义域名 → 生产环境（静默）

✅ **非侵入式**
- 无需修改现有代码
- 只需引入脚本，替换`console`为`Logger`

✅ **调试开关**
- 生产环境加`?debug=true`强制开启日志

## 快速开始

### 1. 引入脚本

```html
<!-- 在其他脚本之前引入 -->
<script src="../../lib/utils/Logger.js"></script>
```

### 2. 替换console调用

**Before (旧代码):**
```javascript
console.log('Game started');
console.warn('Low FPS detected');
console.error('Failed to load asset');
```

**After (新代码):**
```javascript
Logger.log('Game started');
Logger.warn('Low FPS detected');
Logger.error('Failed to load asset');
```

### 3. 部署

无需任何额外操作，部署到生产环境后自动静默。

## API

### 基础日志

```javascript
Logger.log('Normal log');           // 开发环境显示
Logger.info('Information');         // 开发环境显示
Logger.warn('Warning message');     // 开发环境显示
Logger.error('Error occurred');     // 总是显示（包括生产）
Logger.debug('Debug details');      // 开发环境显示
```

### 分组日志

```javascript
Logger.group('Game Initialization');
Logger.log('Loading assets...');
Logger.log('Setting up physics...');
Logger.groupEnd();
```

### 表格显示

```javascript
const scores = [
    { player: 'Alice', score: 100 },
    { player: 'Bob', score: 85 }
];
Logger.table(scores);
```

### 性能计时

```javascript
Logger.time('level-load');
// ... load level ...
Logger.timeEnd('level-load');  // Outputs: level-load: 123.45ms
```

### 断言

```javascript
Logger.assert(score > 0, 'Score should be positive');
```

### 强制日志（慎用）

```javascript
// 即使在生产环境也显示
Logger.forceLog('Critical system message');
```

## 环境检测

### 自动检测规则

**开发环境**（日志启用）:
- `localhost`
- `127.0.0.1`
- `file://` 协议
- `*.local` 域名
- 包含 `dev.` 或 `test.` 的域名

**生产环境**（日志静默）:
- GitHub Pages (`*.github.io`)
- 自定义域名
- 其他所有域名

### 手动调试

生产环境需要临时调试？在URL添加参数：

```
https://yourgame.com?debug=true
```

## 迁移现有代码

### 全局替换（推荐）

使用IDE全局搜索替换：

1. **搜索**: `console\.log`
2. **替换**: `Logger.log`
3. **重复**：对 `info`, `warn`, `error`, `debug`

### 渐进式迁移

新代码使用`Logger`，旧代码保留`console`，逐步替换。

### 批量替换脚本

```bash
# Linux/Mac
find games -name "*.js" -exec sed -i 's/console\.log/Logger.log/g' {} +
find games -name "*.js" -exec sed -i 's/console\.warn/Logger.warn/g' {} +
find games -name "*.js" -exec sed -i 's/console\.error/Logger.error/g' {} +
```

## 最佳实践

### ✅ 推荐

```javascript
// 使用有意义的日志消息
Logger.log('Snake collision detected at', { x: 100, y: 200 });

// 使用分组组织复杂日志
Logger.group('Player Actions');
Logger.log('Jump initiated');
Logger.log('Velocity:', velocity);
Logger.groupEnd();

// 错误总是用error级别
Logger.error('Failed to load texture:', error);
```

### ❌ 避免

```javascript
// 不要在生产关键路径使用forceLog
Logger.forceLog('Every frame update');  // 会污染生产日志

// 不要记录敏感信息
Logger.log('User password:', password);  // 安全风险

// 不要过度记录
for (let i = 0; i < 10000; i++) {
    Logger.log(i);  // 性能问题
}
```

## 示例：Snake Adventure集成

```html
<!-- games/snake-adventure/index.html -->
<script src="../lib/utils/Logger.js"></script>
<script src="js/config.js"></script>
<script src="js/classes/SnakeGame.js"></script>
```

```javascript
// games/snake-adventure/js/classes/SnakeGame.js
start() {
    Logger.log('Game started');
    this.state = 'playing';
    // ...
}

gameOver() {
    Logger.warn('Game over! Score:', this.score);
    this.state = 'gameover';
    // ...
}

update(deltaTime) {
    if (deltaTime > 0.1) {
        Logger.warn('High delta time detected:', deltaTime);
    }
    // ...
}
```

## 环境信息

```javascript
// 获取当前环境
const env = Logger.getEnvironment();  // 'development' or 'production'

if (env === 'development') {
    // 开发专用功能
    enableDevTools();
}
```

## 性能影响

### 开发环境
- 每条日志 ~0.1ms（可忽略）
- 建议：关键循环内避免日志

### 生产环境
- **零性能影响**（所有日志调用立即返回）
- 代码体积：~3KB（压缩后 ~1KB）

## 常见问题

### Q: 需要修改构建配置吗？
A: 不需要，纯运行时解决方案。

### Q: 如何在生产环境临时开启日志？
A: 添加URL参数 `?debug=true`

### Q: error级别为什么总是显示？
A: 错误信息对调试生产问题很重要，但应谨慎使用。

### Q: 能否禁用error自动显示？
A: 可以修改 `Logger.js` 的 `error()` 方法添加环境检查。

### Q: 是否支持颜色输出？
A: 是，开发环境自动添加时间戳和颜色标识。

## 高级用法

### 自定义环境检测

修改 `Logger.js` 的 `detectEnvironment()`:

```javascript
detectEnvironment() {
    // 自定义逻辑
    return window.MY_APP_ENV === 'dev';
}
```

### 日志级别过滤

```javascript
// 只显示warn和error
if (level !== 'warn' && level !== 'error') return;
```

### 远程日志收集（生产环境）

```javascript
error(...args) {
    // 发送到日志服务
    if (!this.isDevelopment) {
        sendToLogService({ level: 'error', message: args });
    }
    console.error(...args);
}
```

## 总结

**使用Logger的三个步骤**:
1. `<script src="../lib/utils/Logger.js"></script>`
2. `console.log` → `Logger.log`
3. 完成！部署后自动静默

**零配置，零依赖，零性能损耗。**
