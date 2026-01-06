// ========== ST Mobile Companion - 插件入口 ==========
(function() {
    'use strict';
    
    console.log('[ST Mobile Companion] 插件加载中...');
    
    // 1. 等待ST主界面
    let checkCount = 0;
    const checkSTLoaded = setInterval(() => {
        checkCount++;
        
        if (document.getElementById('send_button')) {
            clearInterval(checkSTLoaded);
            initPlugin();
        } else if (checkCount > 30) { // 30秒后超时
            clearInterval(checkSTLoaded);
            console.warn('[ST Mobile Companion] ST界面加载超时，但仍尝试初始化插件');
            initPlugin();
        }
    }, 1000);
    
    function initPlugin() {
        console.log('[ST Mobile Companion] 开始初始化插件...');
        
        // 2. 检查是否已存在容器
        if (document.getElementById('st-mobile-companion-container')) {
            console.log('[ST Mobile Companion] 容器已存在，跳过初始化');
            return;
        }
        
        // 3. 创建主容器
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