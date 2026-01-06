// ==SillyTavern Extension==
// @name         ST Mobile Companion
// @version      1.0.0
// @description  沉浸式微信风格小手机界面，支持好友系统和消息协议
// @author       Jasmine
// @license      MIT

console.log('[ST小手机] 插件加载中...');

// 1. 先注入CSS样式（原来index.js中的loadStyles函数内容）
function loadStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'st-mobile-companion-styles';
    styleEl.textContent = `
        /* 这里放你原来style.css的全部内容 */
                body {
            background-color: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        }
        
        .phone-frame {
            width: 300px;
            height: 600px;
            background-color: black;
            border-radius: 25px;
            padding: 5px;
            position: relative;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        
        /* 修改 .screen 的样式 */
.screen {
    /* 移除 position: absolute; top:0; left:0; 这些覆盖全屏的属性 */
    /* 改为 flex 容器，并继承 body 的居中布局 */
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
        
        .dynamic-island {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 20px;
            background-color: #333;
            border-radius: 15px;
            z-index: 100;
        }
        
        .lock-screen-clock {
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 60px;
            font-weight: 600;
            text-align: center;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            z-index: 10;
        }
        
        .lock-screen-date {
            position: absolute;
            top: 160px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 18px;
            font-weight: 400;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            z-index: 9;
            white-space: nowrap;
            letter-spacing: 0.5px;
        }
        
/* 堆叠通知样式 */
.notification-container {
    position: absolute;
    bottom: 180px;
    left: 15px;
    right: 15px;
    max-height: 220px; /* 限制高度，可滚动 */
    overflow-y: auto;
    z-index: 8;
}
.notification-header {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-bottom: 8px;
    padding-left: 5px;
}
.notification {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 12px 15px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;
    border-left: 4px solid #07C160; /* 未读指示条 */
}
.notification.unread {
    border-left-color: #FF9500; /* 未读为橙色 */
}
.notification.read {
    opacity: 0.9;
}
.notification:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
.notification-time {
    font-size: 12px;
    color: #666;
    font-weight: normal;
    margin-left: 8px;
}
        
        /* 应用图标 */
        .notification-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #07C160, #05a050);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        /* 通知内容 */
        .notification-content {
            flex: 1;
            min-width: 0;
        }
        
        .notification-title {
            font-weight: 600;
            font-size: 14px;
            color: #000;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .notification-text {
            font-size: 13px;
            color: #666;
            line-height: 1.4;
            max-height: 2.8em;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        /* 解锁区域 */
        .unlock-area {
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            text-align: center;
            z-index: 8;
        }
        
        .unlock-circle {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(5px);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            cursor: pointer;
            transition: transform 0.3s, background 0.3s;
            user-select: none;
        }
        
        .unlock-circle:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.25);
        }
        
        .unlock-arrow {
            color: white;
            font-size: 24px;
            font-weight: 300;
        }
        
        .unlock-text {
            color: rgba(255, 255, 255, 0.8);
            font-size: 13px;
            letter-spacing: 0.5px;
        }
        
        /* === 通用手机屏幕容器 === */
.phone-screen {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    box-sizing: border-box; /* 确保尺寸计算准确 */
}

/* === 各屏幕独有的壁纸/背景 === */
/* 锁屏壁纸 */
#lock-screen .phone-screen {
    background-image: 
        linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
        url('https://files.catbox.moe/ygj80i.png'); /* 你的壁纸 */
    background-size: cover;
    background-position: center;
}

/* 主屏幕壁纸 */
#home-screen .phone-screen {
    background-image: url('https://files.catbox.moe/ygj80i.png');
    background-size: cover;           /* 或 contain，根据喜好选择 */
    background-position: center;
    background-repeat: no-repeat;
    background-color: #f2f2f7;        /* 备用背景色 */
}

/* 微信聊天界面背景 */
#chat-screen .phone-screen {
    background-color: white; /* 聊天界面纯白即可 */
}
        
        /* 滑动提示动画 */
        @keyframes slideHint {
            0% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }
        
        .unlock-arrow {
            animation: slideHint 2s infinite ease-in-out;
        }
        
/* 主屏幕样式 */
.app-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4列网格 */
    gap: 20px;
    padding: 25px;
    padding-top: 10px;
}
.app-icon {
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
}
.app-icon:hover {
    transform: scale(1.05);
}
.app-icon-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.app-icon-img {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 22px;
    margin-bottom: 8px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.app-icon-label {
    font-size: 12px;
    color: #000;
    text-align: center;
}

/* 微信聊天界面样式 */
.chat-header {
    background: linear-gradient(135deg, #07C160, #05a050);
    color: white;
    padding: 15px;
    text-align: center;
    position: relative;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}
.back-button {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
}
.chat-title {
    font-weight: 600;
    font-size: 18px;
}
.chat-subtitle {
    font-size: 12px;
    opacity: 0.9;
}
.message-list {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: #f2f2f7;
}
.message {
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 18px;
    margin-bottom: 10px;
    line-height: 1.4;
    word-wrap: break-word;
}
.message.incoming {
    background: white;
    align-self: flex-start;
    border-bottom-left-radius: 5px;
}
.message.outgoing {
    background: #07C160;
    color: white;
    align-self: flex-end;
    margin-left: auto;
    border-bottom-right-radius: 5px;
}
.message.system {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
    font-size: 12px;
    text-align: center;
    max-width: 90%;
    margin: 10px auto;
}
.input-area {
    display: flex;
    padding: 10px 15px;
    background: white;
    border-top: 1px solid #eee;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
#chat-input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 20px;
    padding: 10px 15px;
    font-size: 16px;
    outline: none;
}
#send-button {
    background: #07C160;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    cursor: pointer;
    font-weight: bold;
}
/* === 微信 - 深色主题变量 === */
.wechat-container[data-theme="dark"] {
    --bg-primary: #111111;
    --bg-secondary: #1a1a1a;
    --bg-tertiary: #252525;
    --text-primary: #e6e6e6;
    --text-secondary: #b3b3b3;
    --text-tertiary: #808080;
    --accent-green: #3EB573;         /* 你的品牌色 */
    --accent-green-dark: #2d8c57;
    --border-color: #333333;
    --item-hover-bg: rgba(255, 255, 255, 0.05);
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

/* 顶部标题栏 */
.wechat-header {
    background-color: var(--bg-secondary);
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
}
.wechat-header-title { font-weight: 600; }
.wechat-header-actions span { margin-left: 15px; cursor: pointer; }

/* 标签页内容区 */
.wechat-tab-content {
    flex: 1;
    overflow-y: auto;
}
.wechat-tab-pane {
    display: none;
    height: 100%;
}
.wechat-tab-pane.active { display: block; }

/* 底部导航栏 */
.wechat-tab-bar {
    background-color: var(--bg-secondary);
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
    border-top: 1px solid var(--border-color);
}
.tab-bar-item {
    text-align: center;
    cursor: pointer;
    color: var(--text-tertiary);
    transition: color 0.2s;
}
.tab-bar-item.active { color: var(--accent-green); }

/* === 消息列表项样式 === */
.msg-list-container { padding: 10px; }
.msg-list-item {
    display: flex;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    background-color: var(--bg-secondary);
    cursor: pointer;
    transition: background-color 0.2s;
}
.msg-list-item:hover { background-color: var(--item-hover-bg); }
.msg-list-item.unread { border-left: 3px solid var(--accent-green); }
.msg-avatar {
    width: 45px; height: 45px;
    border-radius: 6px;
    background-color: var(--bg-tertiary);
    display: flex; align-items: center; justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
}
.msg-info { flex: 1; min-width: 0; }
.msg-sender {
    font-weight: 600; margin-bottom: 4px;
    color: var(--text-primary);
}
.msg-preview {
    font-size: 0.9em; color: var(--text-secondary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.msg-time {
    font-size: 0.8em; color: var(--text-tertiary);
    position: absolute; top: 12px; right: 12px;
}
/* === 微信双标签页样式 === */
.wechat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #111;
    color: white;
}

.wechat-top-bar {
    background: #1a1a1a;
    padding: 15px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #333;
}

.wechat-top-bar button {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    margin-right: 10px;
}

#wechat-title {
    font-weight: bold;
    font-size: 18px;
    color: #3eb575;
}

.wechat-tab-content {
    flex: 1;
    overflow: hidden;
    position: relative;
}

.wechat-tab {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    flex-direction: column;
}

.wechat-tab.active {
    display: flex;
}

/* 联系人页样式 */
.contacts-container {
    padding: 15px;
    flex: 1;
    overflow-y: auto;
}

.add-friend-section {
    background: #1a1a1a;
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
}

.add-friend-section input {
    width: 100%;
    padding: 8px;
    margin-bottom: 8px;
    background: #333;
    border: 1px solid #444;
    border-radius: 5px;
    color: white;
}

#add-friend-btn {
    width: 100%;
    padding: 10px;
    background: #3eb575;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.contacts-list {
    margin-top: 10px;
}

.contact-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background: #1a1a1a;
    border-radius: 8px;
    margin-bottom: 8px;
    cursor: pointer;
}

.contact-avatar {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: #3eb575;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-weight: bold;
}

.contact-name {
    flex: 1;
}

.contact-menu {
    color: #888;
    padding: 5px;
}

/* 底部标签栏 */
.wechat-tab-bar {
    display: flex;
    background: #000;
    border-top: 1px solid #333;
    padding: 5px 0;
}

.tab-bar-item {
    flex: 1;
    text-align: center;
    padding: 8px;
    cursor: pointer;
    opacity: 0.7;
}

.tab-bar-item.active {
    opacity: 1;
    color: #3eb575;
}

.tab-icon {
    font-size: 20px;
}

.tab-label {
    font-size: 10px;
    margin-top: 2px;
}
        /* 注意：不要包含 <style> 标签，只放CSS内容 */
    `;
    document.head.appendChild(styleEl);
    console.log('[ST小手机] 样式已注入');
}

// 2. 创建容器并注入HTML
function createMobileContainer() {
    console.log('[ST小手机] 创建容器...');
    
    // 检查是否已存在容器
    if (document.getElementById('st-mobile-companion-container')) {
        console.log('[ST小手机] 容器已存在，跳过创建');
        return false;
    }
    
    // 创建主容器
    const container = document.createElement('div');
    container.id = 'st-mobile-companion-container';
    
    // 基础样式
    Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '300px',
        height: '600px',
        zIndex: '10000',
        pointerEvents: 'none',
        opacity: '0.7',
        transition: 'opacity 0.3s ease'
    });
    
    // 插入HTML结构 - 这里放你的template.html内容
    container.innerHTML = `
        <!-- 第一屏：锁屏界面 -->
        <div id="lock-screen" class="screen">
            <div class="phone-frame">
                <div class="dynamic-island"></div>
                <div class="phone-screen">
                    <div id="clock" class="lock-screen-clock">00:00</div>
                    <div id="date" class="lock-screen-date">MM月DD日 星期X</div>
                    <div id="notification-container" class="notification-container"></div>
                    <div class="unlock-area">
                        <div class="unlock-circle" id="unlock-circle">
                            <div class="unlock-arrow">↑</div>
                        </div>
                        <div class="unlock-text">向上滑动解锁</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 第二屏：主屏幕 -->
        <div id="home-screen" class="screen" style="display: none;">
            <div class="phone-frame">
                <div class="dynamic-island"></div>
                <div class="phone-screen" style="border-radius: 20px;">
                    <div style="height: 40px;"></div>
                    <div class="app-grid">
                        <div class="app-icon" data-app="wechat">
                            <div class="app-icon-inner">
                                <div class="app-icon-img" style="background: linear-gradient(135deg, #07C160, #05a050);">微</div>
                                <div class="app-icon-label">微信</div>
                            </div>
                        </div>
                        <div class="app-icon" id="back-to-lock">
                            <div class="app-icon-inner">
                                <div class="app-icon-img" style="background: linear-gradient(135deg, #8E8E93, #6C6C70);">锁</div>
                                <div class="app-icon-label">锁屏</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 第三屏：微信应用（双标签页） -->
        <div id="chat-screen" class="screen" style="display: none;">
            <div class="phone-frame">
                <div class="dynamic-island"></div>
                <div class="phone-screen wechat-container">
                    <div class="wechat-top-bar">
                        <button id="back-to-home">←</button>
                        <div id="wechat-title">微信</div>
                    </div>
                    
                    <div class="wechat-tab-content">
                        <div id="tab-msglist" class="wechat-tab active">
                            <div id="message-list" class="message-list"></div>
                            <div class="input-area">
                                <input type="text" id="chat-input" placeholder="输入消息..." />
                                <button id="send-button">发送</button>
                            </div>
                        </div>
                        
                        <div id="tab-contacts" class="wechat-tab">
                            <div class="contacts-container">
                                <div class="add-friend-section">
                                    <input type="text" id="friend-name-input" placeholder="输入好友名字" />
                                    <input type="text" id="friend-avatar-input" placeholder="头像URL（可选）" />
                                    <button id="add-friend-btn">添加好友</button>
                                </div>
                                <div id="contacts-list" class="contacts-list"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="wechat-tab-bar">
                        <div class="tab-bar-item active" data-tab="msglist">
                            <div class="tab-icon">💬</div>
                            <div class="tab-label">消息</div>
                        </div>
                        <div class="tab-bar-item" data-tab="contacts">
                            <div class="tab-icon">👥</div>
                            <div class="tab-label">联系人</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(container);
    console.log('[ST小手机] 界面容器已注入');
    return true;
}

// 3. 添加切换按钮
function addToggleButton() {
    // 避免重复添加
    if (document.getElementById('st-mobile-companion-toggle')) {
        return;
    }
    
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'st-mobile-companion-toggle';
    toggleBtn.innerHTML = '📱';
    toggleBtn.title = '显示/隐藏小手机';
    
    // 按钮样式
    Object.assign(toggleBtn.style, {
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '25px',
        background: '#666',
        color: 'white',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: '10001',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        transition: 'background 0.3s ease'
    });
    
    // 切换功能
    toggleBtn.addEventListener('click', function() {
        const container = document.getElementById('st-mobile-companion-container');
        if (!container) return;
        
        if (container.style.pointerEvents === 'none') {
            // 显示
            container.style.pointerEvents = 'auto';
            container.style.opacity = '1';
            this.style.background = '#4CAF50';
            this.title = '隐藏小手机';
        } else {
            // 隐藏
            container.style.pointerEvents = 'none';
            container.style.opacity = '0.7';
            this.style.background = '#666';
            this.title = '显示小手机';
        }
    });
    
    document.body.appendChild(toggleBtn);
    console.log('[ST小手机] 切换按钮已添加');
}

// 4. 初始化插件（主函数）
function initMobilePlugin() {
    console.log('[ST小手机] 开始初始化插件...');
    
    try {
        // 1. 注入样式
        loadStyles();
        
        // 2. 创建容器
        if (!createMobileContainer()) {
            console.log('[ST小手机] 容器创建失败或已存在');
            return;
        }
        
        // 3. 添加切换按钮
        addToggleButton();
        
        // 4. 加载核心逻辑（app.js）
        loadCoreLogic();
        
        console.log('[ST小手机] 插件初始化完成');
    } catch (error) {
        console.error('[ST小手机] 初始化失败:', error);
    }
}

// 5. 加载核心逻辑（app.js内容）
function loadCoreLogic() {
    // 创建script标签加载app.js
    const script = document.createElement('script');
    script.src = './scripts/extensions/third-party/st-mobile-companion/app.js';
    script.onload = function() {
        console.log('[ST小手机] 核心逻辑加载完成');
        
        // 检查app.js中的initApp函数是否存在
        if (typeof initApp === 'function') {
            console.log('[ST小手机] 启动小手机逻辑...');
            
            // 延迟一点时间，确保DOM完全渲染
            setTimeout(() => {
                try {
                    initApp();
                    console.log('[ST小手机] 小手机逻辑启动成功');
                } catch (error) {
                    console.error('[ST小手机] 启动小手机逻辑失败:', error);
                }
            }, 500);
        } else {
            console.error('[ST小手机] initApp函数未定义');
        }
    };
    
    script.onerror = function(error) {
        console.error('[ST小手机] 加载核心逻辑失败:', error);
    };
    
    document.head.appendChild(script);
}

// 6. 等待SillyTavern加载完成
function waitForSillyTavern() {
    console.log('[ST小手机] 等待SillyTavern加载...');
    
    let checkCount = 0;
    const maxChecks = 30; // 30秒超时
    
    const checkInterval = setInterval(() => {
        checkCount++;
        
        // 检查SillyTavern是否已加载
        if (document.getElementById('send_button') || window.SillyTavern) {
            clearInterval(checkInterval);
            console.log('[ST小手机] SillyTavern已加载，开始初始化插件');
            initMobilePlugin();
        } else if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            console.warn('[ST小手机] SillyTavern加载超时，但仍尝试初始化插件');
            initMobilePlugin();
        }
    }, 1000);
}

// 7. 使用jQuery等待页面完全加载（如果可用）
if (typeof jQuery !== 'undefined') {
    jQuery(() => {
        console.log('[ST小手机] 页面DOM已就绪');
        waitForSillyTavern();
    });
} else {
    // 如果没有jQuery，使用DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[ST小手机] DOMContentLoaded事件触发');
            waitForSillyTavern();
        });
    } else {
        console.log('[ST小手机] DOM已就绪，直接启动');
        waitForSillyTavern();
    }
}

// 8. 暴露给全局，方便调试
window.stMobileCompanion = {
    version: '1.0.0',
    initialize: initMobilePlugin,
    reload: function() {
        console.log('[ST小手机] 手动重新加载');
        initMobilePlugin();
    }
};

console.log('[ST小手机] 插件脚本加载完成');            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '300px',
            height: '600px',
            zIndex: '10000',
            pointerEvents: 'none',
            opacity: '0.7',
            transition: 'opacity 0.3s ease'
        });
        
        // 4. 插入HTML结构
        container.innerHTML = `
            <!-- 锁屏界面 -->
            <div id="lock-screen" class="screen">
                <div class="phone-frame">
                    <div class="dynamic-island"></div>
                    <div class="phone-screen">
                        <div id="clock" class="lock-screen-clock">00:00</div>
                        <div id="date" class="lock-screen-date">--月--日 星期-</div>
                        <div id="notification-container" class="notification-container">
                            <div class="notification-header">通知</div>
                            <div class="notification unread">
                                <div class="notification-icon">微</div>
                                <div class="notification-content">
                                    <div class="notification-title">ST手机插件<span class="notification-time">加载中</span></div>
                                    <div class="notification-text">请等待初始化完成...</div>
                                </div>
                            </div>
                        </div>
                        <div class="unlock-area">
                            <div class="unlock-circle" id="unlock-circle">↑</div>
                            <div class="unlock-text">向上滑动解锁</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 主屏幕 -->
            <div id="home-screen" class="screen" style="display:none;">
                <div class="phone-frame">
                    <div class="dynamic-island"></div>
                    <div class="phone-screen" style="background:#f2f2f7;border-radius:20px;">
                        <div style="height:40px;"></div>
                        <div class="app-grid">
                            <div class="app-icon" data-app="wechat">
                                <div class="app-icon-inner">
                                    <div class="app-icon-img" style="background:linear-gradient(135deg, #07C160, #05a050);">微</div>
                                    <div class="app-icon-label">微信</div>
                                </div>
                            </div>
                            <div class="app-icon" id="back-to-lock">
                                <div class="app-icon-inner">
                                    <div class="app-icon-img" style="background:linear-gradient(135deg, #8E8E93, #6C6C70);">锁</div>
                                    <div class="app-icon-label">锁屏</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 微信界面 -->
            <div id="chat-screen" class="screen" style="display:none;">
                <div class="phone-frame">
                    <div class="dynamic-island"></div>
                    <div class="phone-screen" style="background:white;border-radius:20px;display:flex;flex-direction:column;">
                        <div class="chat-header">
                            <button class="back-button" id="back-to-home">←</button>
                            <div class="chat-title">微信</div>
                            <div class="chat-subtitle">ST手机插件</div>
                        </div>
                        <div id="message-list" class="message-list">
                            <div class="message system">欢迎使用ST手机插件！点击发送按钮测试聊天功能。</div>
                        </div>
                        <div class="input-area">
                            <input type="text" id="chat-input" placeholder="输入消息..." />
                            <button id="send-button">发送</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 5. 添加到页面
        document.body.appendChild(container);
        console.log('[ST Mobile Companion] 界面容器已注入');
        
        // 6. 添加切换按钮
        addToggleButton();
        
        // 7. 自动加载CSS（简化版）
        loadStyles();
        
        // 8. 脚本已通过manifest自动加载，这里只记录
        console.log('[ST Mobile Companion] 插件初始化完成');
    }
    
    function addToggleButton() {
        // 避免重复添加
        if (document.getElementById('st-mobile-companion-toggle')) {
            return;
        }
        
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'st-mobile-companion-toggle';
        toggleBtn.innerHTML = '📱';
        toggleBtn.title = '显示/隐藏小手机';
        
        // 按钮样式
        Object.assign(toggleBtn.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            background: '#666',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: '10001',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            transition: 'background 0.3s ease'
        });
        
        // 切换功能
        toggleBtn.addEventListener('click', function() {
            const container = document.getElementById('st-mobile-companion-container');
            if (!container) return;
            
            if (container.style.pointerEvents === 'none') {
                // 显示
                container.style.pointerEvents = 'auto';
                container.style.opacity = '1';
                this.style.background = '#4CAF50';
                this.title = '隐藏小手机';
            } else {
                // 隐藏
                container.style.pointerEvents = 'none';
                container.style.opacity = '0.7';
                this.style.background = '#666';
                this.title = '显示小手机';
            }
        });
        
        document.body.appendChild(toggleBtn);
        console.log('[ST Mobile Companion] 切换按钮已添加');
    }
    
    function loadStyles() {
        // 创建style标签
        const styleEl = document.createElement('style');
        styleEl.id = 'st-mobile-companion-styles';
        
        // 这里先注入最小化样式，完整样式在styles.css中
        styleEl.textContent = `
            #st-mobile-companion-container * {
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .phone-frame {
                width: 100%;
                height: 100%;
                background: black;
                border-radius: 25px;
                padding: 5px;
                position: relative;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            
            .phone-screen {
                width: 100%;
                height: 100%;
                border-radius: 20px;
                overflow: hidden;
                position: relative;
            }
            
            #lock-screen .phone-screen {
                background: linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), 
                            url('https://files.catbox.moe/ygj80i.png');
                background-size: cover;
                background-position: center;
                color: white;
            }
            
            .screen {
                width: 100%;
                height: 100%;
                display: none;
            }
            
            #lock-screen {
                display: flex;
            }
            
            .lock-screen-clock {
                position: absolute;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 60px;
                font-weight: 600;
                text-align: center;
                text-shadow: 0 2px 8px rgba(0,0,0,0.5);
            }
            
            .lock-screen-date {
                position: absolute;
                top: 160px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 18px;
                text-align: center;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }
            
            .notification-container {
                position: absolute;
                bottom: 180px;
                left: 15px;
                right: 15px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .notification {
                background: rgba(255,255,255,0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 12px 15px;
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                cursor: pointer;
                border-left: 4px solid #07C160;
            }
            
            .notification.unread {
                border-left-color: #FF9500;
            }
            
            .notification-icon {
                width: 40px;
                height: 40px;
                background: #07C160;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                margin-right: 12px;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                color: #000;
            }
            
            .notification-text {
                font-size: 13px;
                color: #666;
            }
            
            .notification-time {
                font-size: 12px;
                color: #666;
                margin-left: 8px;
                font-weight: normal;
            }
            
            .notification-header {
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                margin-bottom: 8px;
                padding-left: 5px;
            }
            
            .unlock-area {
                position: absolute;
                bottom: 40px;
                left: 0;
                right: 0;
                text-align: center;
            }
            
            .unlock-circle {
                width: 60px;
                height: 60px;
                background: rgba(255,255,255,0.15);
                backdrop-filter: blur(5px);
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                cursor: pointer;
                color: white;
                font-size: 24px;
            }
            
            .unlock-text {
                color: rgba(255,255,255,0.8);
                font-size: 13px;
            }
            
            .app-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                padding: 25px;
                padding-top: 10px;
            }
            
            .app-icon {
                text-align: center;
                cursor: pointer;
            }
            
            .app-icon-inner {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .app-icon-img {
                width: 60px;
                height: 60px;
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 22px;
                margin-bottom: 8px;
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            }
            
            .app-icon-label {
                font-size: 12px;
                color: #000;
            }
            
            .chat-header {
                background: linear-gradient(135deg, #07C160, #05a050);
                color: white;
                padding: 15px;
                text-align: center;
                position: relative;
            }
            
            .back-button {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
            }
            
            .chat-title {
                font-weight: 600;
                font-size: 18px;
            }
            
            .chat-subtitle {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .message-list {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                background: #f2f2f7;
            }
            
            .message {
                max-width: 70%;
                padding: 10px 15px;
                border-radius: 18px;
                margin-bottom: 10px;
                line-height: 1.4;
            }
            
            .message.system {
                background: rgba(0,0,0,0.05);
                color: #666;
                font-size: 12px;
                text-align: center;
                max-width: 90%;
                margin: 10px auto;
            }
            
            .message.outgoing {
                background: #07C160;
                color: white;
                margin-left: auto;
            }
            
            .message.incoming {
                background: white;
            }
            
            .input-area {
                display: flex;
                padding: 10px 15px;
                background: white;
                border-top: 1px solid #eee;
            }
            
            #chat-input {
                flex: 1;
                border: 1px solid #ddd;
                border-radius: 20px;
                padding: 10px 15px;
                font-size: 16px;
                outline: none;
            }
            
            #send-button {
                background: #07C160;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                margin-left: 10px;
                cursor: pointer;
                font-weight: bold;
            }
            
            @keyframes slideHint {
                0% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0); }
            }
            
            .unlock-circle {
                animation: slideHint 2s infinite ease-in-out;
            }
        `;
        
        document.head.appendChild(styleEl);
        console.log('[ST Mobile Companion] 基础样式已注入');
    }

})();
