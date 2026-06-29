# 📖 英语小灶 EnglishBuddy

专为农村初中生设计的免费英语学习PWA应用

## 🌐 在线体验

**访问地址**: https://246040.github.io/english/

> 添加到主屏幕，像APP一样使用！

## ✨ 特性

- 🎯 **水平评估** - 智能诊断学习起点
- 📚 **词汇学习** - 闪卡记忆 + 间隔复习
- ✍️ **拼写练习** - 听写单词巩固记忆
- 🎮 **配对游戏** - 寓教于乐学单词
- 📝 **测验系统** - 即时反馈掌握程度
- 📕 **错题本** - 针对性复习薄弱环节
- 📖 **语法练习** - 系统学习语法知识
- 🐱 **虚拟宠物** - 学习越多宠物越开心
- 🏆 **成就系统** - 解锁徽章获得激励
- 📊 **学习统计** - 可视化进度追踪

## 🚀 快速开始

### 方法1：使用http-server（推荐）

```bash
# 安装http-server（仅需一次）
npm install -g http-server

# 启动服务器
cd d:\english
http-server -p 8000

# 在浏览器打开
# http://localhost:8000
```

### 方法2：使用Python

```bash
# Python 3
cd d:\english
python -m http.server 8000

# 在浏览器打开
# http://localhost:8000
```

### 方法3：直接双击

在某些浏览器中，可以直接双击 `index.html` 打开（可能受CORS限制）

## 🧪 自动化测试

项目包含完整的自动化测试套件：

```bash
# 安装依赖
cd d:\english
npm install

# 运行完整测试
node full-test.mjs

# 运行调试测试
node debug-assess.mjs

# 查看测试报告
# 打开 TEST-REPORT.md
```

### 测试覆盖
- ✅ 所有页面导航
- ✅ 用户注册流程
- ✅ 水平评估系统
- ✅ 数据持久化
- ✅ 模块加载

## 📁 项目结构

```
english/
├── index.html              # 主HTML文件
├── manifest.json           # PWA配置
├── sw.js                   # Service Worker
├── css/
│   └── style.css          # 全局样式
├── js/
│   ├── app.js             # 主应用入口
│   ├── storage.js         # 数据存储
│   ├── router.js          # 路由管理
│   ├── ui.js              # UI组件
│   ├── assessment.js      # 水平评估
│   ├── vocab-learner.js   # 词汇学习
│   ├── quiz-engine.js     # 测验引擎
│   ├── spelling.js        # 拼写练习
│   ├── match-game.js      # 配对游戏
│   ├── mistake-book.js    # 错题本
│   ├── grammar.js         # 语法练习
│   ├── daily-mission.js   # 每日任务
│   ├── profile.js         # 个人中心
│   ├── pet.js             # 虚拟宠物
│   ├── tts.js             # 语音朗读
│   └── data/
│       ├── vocab-data.js  # 词汇数据
│       ├── quiz-data.js   # 测验题库
│       └── grammar-data.js # 语法数据
└── test files...          # 测试脚本
```

## 💾 数据存储

应用使用LocalStorage存储所有数据：
- `eb_user` - 用户信息
- `eb_word_states` - 单词学习状态
- `eb_stats` - 学习统计
- `eb_mission` - 每日任务
- `eb_quiz_history` - 测验历史
- `eb_study_days` - 学习日历

## 📱 PWA功能

- ✅ 离线缓存（Service Worker）
- ✅ 添加到主屏幕
- ✅ 独立窗口运行
- ✅ 主题色配置

## 🎓 适用人群

- 农村初中生（初一、初二、初三）
- 英语基础薄弱需要补习的学生
- 希望在暑假弯道超车的学生
- 每天只有15分钟学习时间的学生

## 🔧 技术栈

- **前端**: 原生JavaScript (ES6+ Modules)
- **样式**: 纯CSS（CSS变量 + 动画）
- **数据**: LocalStorage
- **PWA**: Service Worker + Manifest
- **测试**: Playwright + Node.js

## 📄 浏览器兼容性

- ✅ Chrome 80+
- ✅ Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ 移动浏览器

## 🐛 测试状态

**最新测试**: 2026-06-29  
**测试结果**: ✅ **所有测试通过**

查看详细测试报告: [TEST-REPORT.md](TEST-REPORT.md)

## 📝 开发说明

### 添加新单词
编辑 `js/data/vocab-data.js`

### 添加新题目
编辑 `js/data/quiz-data.js`

### 修改样式
编辑 `css/style.css`

### 调试
打开浏览器开发者工具（F12）查看控制台

## 🎯 学习建议

1. **每天15分钟** - 坚持比一次学很多更重要
2. **先评估后学习** - 从适合的难度开始
3. **及时复习** - 系统会提醒你复习单词
4. **多玩游戏** - 配对游戏、拼写练习巩固记忆
5. **查看错题本** - 重点攻克薄弱环节

## 📧 问题反馈

如有问题或建议，欢迎通过以下方式联系：
- GitHub Issues
- 项目讨论区

## 📄 许可证

本项目为教育用途开发，免费使用。

---

**祝学习进步！每天进步一点点，开学惊艳所有人！** 🌻✨
