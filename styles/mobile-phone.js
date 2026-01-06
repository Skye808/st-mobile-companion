// ==SillyTavern Extension==
// @name         ST Mobile Companion - 单文件版
// @version      1.0.0
// @description  沉浸式微信风格小手机界面
// @author       Jasmine
// @license      MIT

(function() {
    'use strict';
    
    console.log('[ST小手机] 单文件版加载中...');
    
    // ========== 配置 ==========
    const CONFIG = {
        position: { top: '20px', right: '20px' },
        size: { width: '300px', height: '600px' },
        initialOpacity: 1,
        zIndex: 10000
    };
    
    // ========== 核心数据 ==========
    let notifications = [
        { id: 1, sender: "SillyTavern", content: "插件加载成功！", time: "刚刚", read: false },
        { id: 2, sender: "系统通知", content: "点击微信图标开始聊天", time: "刚刚", read: false }
    ];
    
    let friends = [
        { id: 'system', name: '系统助手', avatar: '', unread: 0 }
    ];
    
    let currentWechatTab = 'msglist';
    let unlockStartY = 0;
    let isUnlocking = false;
    
    // ========== 工具函数 ==========
    function updateClock() {
        const container = document.getElementById('st-mobile-container');
        if (!container) return;
        
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[now.getDay()];
        
        const clockElement = container.querySelector('#clock');
        const dateElement = container.querySelector('#date');
        
        if (clockElement) clockElement.textContent = `${hours}:${minutes}`;
        if (dateElement) dateElement.textContent = `${month}月${day}日 星期${weekDay}`;
    }
    
    function showScreen(screenId) {
        console.log('[小手机] 切换到屏幕:', screenId);
        const container = document.getElementById('st-mobile-container');
        if (!container) return;
        
        container.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        const targetScreen = container.querySelector(`#${screenId}`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
    }
    
    // ========== 好友系统 ==========
    function addFriend(name, avatarUrl = '') {
        const newFriend = {
            id: 'friend_' + Date.now(),
            name: name,
            avatar: avatarUrl,
            unread: 0,
            lastMessage: ''
        };
        friends.push(newFriend);
        renderFriendsList();
        return newFriend.id;
    }
    
    function renderFriendsList() {
        const contactsList = document.getElementById('contacts-list');
        if (!contactsList) return;
        
        contactsList.innerHTML = '';
        
        friends.forEach(friend => {
            const friendEl = document.createElement('div');
            friendEl.className = 'contact-item';
            friendEl.innerHTML = `
                <div class="contact-avatar">${friend.name.charAt(0)}</div>
                <div class="contact-name">${friend.name}</div>
            `;
            
            friendEl.addEventListener('click', () => {
                const messageList = document.getElementById('message-list');
                if (messageList) {
                    messageList.innerHTML = `<div class="message system">开始与 ${friend.name} 聊天</div>`;
                }
                switchWechatTab('msglist');
            });
            
            contactsList.appendChild(friendEl);
        });
    }
    
    function switchWechatTab(tabId) {
        currentWechatTab = tabId;
        const container = document.getElementById('st-mobile-container');
        if (!container) return;
        
        container.querySelectorAll('.wechat-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = container.querySelector(`#tab-${tabId}`);
        if (targetTab) targetTab.classList.add('active');
        
        container.querySelectorAll('.tab-bar-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });
    }
    
    // ========== 消息系统 ==========
    function parseMsgProtocol(rawText) {
        const matches = rawText.match(/<msg>(.*?)<\/msg>/g);
        if (!matches) return [];
        
        const messages = [];
        matches.forEach(match => {
            const content = match.replace(/<\/?msg>/g, '');
            const parts = content.split('|');
            if (parts.length >= 5) {
                messages.push({
                    sender: parts[0].trim(),
                    receiver: parts[1].trim(),
                    type: parts[2].trim(),
                    content: parts[3].trim(),
                    time: parts[4].trim()
                });
            }
        });
        return messages;
    }
    
    function receiveMessage(msg) {
        const messageList = document.getElementById('message-list');
        if (!messageList) return;
        
        const msgEl = document.createElement('div');
        msgEl.className = `message ${msg.sender === '用户' ? 'outgoing' : 'incoming'}`;
        msgEl.innerHTML = `
            <div class="msg-sender">${msg.sender}</div>
            <div class="msg-content">${msg.content}</div>
            <div class="msg-time">${msg.time}</div>
        `;
        
        messageList.appendChild(msgEl);
        messageList.scrollTop = messageList.scrollHeight;
        
        // 自动添加为好友
        if (!friends.some(f => f.name === msg.sender) && msg.sender !== '用户' && msg.sender !== '系统') {
            addFriend(msg.sender);
        }
    }
    
    // ========== 初始化函数 ==========
    function initMobilePhone() {
        console.log('[小手机] 初始化开始...');
        
        // 如果容器已存在，跳过
        if (document.getElementById('st-mobile-container')) {
            console.log('[小手机] 容器已存在');
            return;
        }
        
        // 创建主容器
        const container = document.createElement('div');
        container.id = 'st-mobile-container';
        container.style.cssText = `
            position: fixed;
            top: ${CONFIG.position.top};
            right: ${CONFIG.position.right};
            width: ${CONFIG.size.width};
            height: ${CONFIG.size.height};
            z-index: ${CONFIG.zIndex};
            pointer-events: auto;
            opacity: ${CONFIG.initialOpacity};
            transition: opacity 0.3s ease;
        `;
        
        // 注入HTML
        container.innerHTML = `
            <div id="lock-screen" class="screen">
                <div class="phone-frame">
                    <div class="dynamic-island"></div>
                    <div class="phone-screen">
                        <div id="clock" class="lock-screen-clock">00:00</div>
                        <div id="date" class="lock-screen-date">--月--日 星期-</div>
                        <div class="unlock-area">
                            <div class="unlock-circle" id="unlock-circle">↑</div>
                            <div class="unlock-text">向上滑动解锁</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="home-screen" class="screen" style="display:none;">
                <div class="phone-frame">
                    <div class="dynamic-island"></div>
                    <div class="phone-screen">
                        <div style="height:40px;"></div>
                        <div class="app-grid">
                            <div class="app-icon" id="wechat-icon">
                                <div class="app-icon-inner">
                                    <div class="app-icon-img" style="background:#07C160;">微</div>
                                    <div class="app-icon-label">微信</div>
                                </div>
                            </div>
                            <div class="app-icon" id="lock-icon">
                                <div class="app-icon-inner">
                                    <div class="app-icon-img" style="background:#8E8E93;">锁</div>
                                    <div class="app-icon-label">锁屏</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="chat-screen" class="screen" style="display:none;">
                <div class="phone-frame">
                    <div class="dynamic-island"></div>
                    <div class="phone-screen wechat-container">
                        <div class="wechat-top-bar">
                            <button id="back-to-home">←</button>
                            <div id="wechat-title">微信</div>
                        </div>
                        
                        <div class="wechat-tab-content">
                            <div id="tab-msglist" class="wechat-tab active">
                                <div id="message-list" class="message-list">
                                    <div class="message system">欢迎使用小手机！</div>
                                </div>
                                <div class="input-area">
                                    <input type="text" id="chat-input" placeholder="输入消息..." />
                                    <button id="send-button">发送</button>
                                </div>
                            </div>
                            
                            <div id="tab-contacts" class="wechat-tab">
                                <div class="contacts-container">
                                    <div class="add-friend-section">
                                        <input type="text" id="friend-name-input" placeholder="输入好友名字" />
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
        
        document.body.appendChild(container);
        
        // 注入样式
        injectStyles();
        
        // 添加切换按钮
        addToggleButton();
        
        // 绑定事件
        bindEvents();
        
        // 启动功能
        startClock();
        renderFriendsList();
        
        console.log('[小手机] 初始化完成！');
    }
    
    function injectStyles() {
        if (document.getElementById('st-mobile-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'st-mobile-styles';
        style.textContent = `
            #st-mobile-container * {
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
            
            .app-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                padding: 25px;
            }
            
            .app-icon {
                text-align: center;
                cursor: pointer;
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
                margin: 0 auto 8px;
            }
            
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
            
            .message-list {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                background: #1a1a1a;
            }
            
            .message {
                max-width: 80%;
                padding: 10px 15px;
                border-radius: 18px;
                margin-bottom: 10px;
                word-wrap: break-word;
            }
            
            .message.incoming {
                background: #333;
            }
            
            .message.outgoing {
                background: #3eb575;
                margin-left: auto;
            }
            
            .message.system {
                background: #444;
                text-align: center;
                font-size: 12px;
            }
            
            .input-area {
                display: flex;
                padding: 10px;
                background: #1a1a1a;
                border-top: 1px solid #333;
            }
            
            #chat-input {
                flex: 1;
                background: #333;
                border: 1px solid #444;
                border-radius: 20px;
                padding: 10px 15px;
                color: white;
            }
            
            #send-button {
                background: #3eb575;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                margin-left: 10px;
                cursor: pointer;
            }
            
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
            
            #friend-name-input {
                width: 100%;
                padding: 10px;
                background: #333;
                border: 1px solid #444;
                border-radius: 5px;
                color: white;
                margin-bottom: 10px;
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
        `;
        
        document.head.appendChild(style);
    }
    
    function addToggleButton() {
        if (document.getElementById('st-mobile-toggle')) return;
        
        const btn = document.createElement('button');
        btn.id = 'st-mobile-toggle';
        btn.innerHTML = '📱';
        btn.title = '显示/隐藏小手机';
        btn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #4CAF50;
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        btn.addEventListener('click', function() {
            const container = document.getElementById('st-mobile-container');
            if (container) {
                if (container.style.opacity === '1') {
                    container.style.opacity = '0.3';
                    container.style.pointerEvents = 'none';
                    this.style.background = '#666';
                } else {
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                    this.style.background = '#4CAF50';
                }
            }
        });
        
        document.body.appendChild(btn);
    }
    
    function bindEvents() {
        const container = document.getElementById('st-mobile-container');
        if (!container) return;
        
        // 微信图标
        const wechatIcon = container.querySelector('#wechat-icon');
        if (wechatIcon) {
            wechatIcon.addEventListener('click', () => showScreen('chat-screen'));
        }
        
        // 锁屏图标
        const lockIcon = container.querySelector('#lock-icon');
        if (lockIcon) {
            lockIcon.addEventListener('click', () => showScreen('lock-screen'));
        }
        
        // 返回按钮
        const backButton = container.querySelector('#back-to-home');
        if (backButton) {
            backButton.addEventListener('click', () => showScreen('home-screen'));
        }
        
        // 解锁按钮
        const unlockCircle = container.querySelector('#unlock-circle');
        if (unlockCircle) {
            unlockCircle.addEventListener('click', () => showScreen('home-screen'));
        }
        
        // 发送消息
        const sendBtn = container.querySelector('#send-button');
        const chatInput = container.querySelector('#chat-input');
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => {
                const text = chatInput.value.trim();
                if (text) {
                    receiveMessage({
                        sender: '用户',
                        content: text,
                        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                    });
                    chatInput.value = '';
                }
            });
        }
        
        // 添加好友
        const addFriendBtn = container.querySelector('#add-friend-btn');
        const friendNameInput = container.querySelector('#friend-name-input');
        if (addFriendBtn && friendNameInput) {
            addFriendBtn.addEventListener('click', () => {
                const name = friendNameInput.value.trim();
                if (name) {
                    addFriend(name);
                    friendNameInput.value = '';
                }
            });
        }
        
        // 标签切换
        container.querySelectorAll('.tab-bar-item').forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                if (tabId) switchWechatTab(tabId);
            });
        });
    }
    
    function startClock() {
        updateClock();
        setInterval(updateClock, 1000);
    }
    
    // ========== 启动插件 ==========
    function waitForST() {
        console.log('[小手机] 等待ST加载...');
        
        const checkInterval = setInterval(() => {
            if (document.getElementById('send_button')) {
                clearInterval(checkInterval);
                console.log('[小手机] ST已加载，启动小手机');
                setTimeout(initMobilePhone, 1000);
            }
        }, 1000);
    }
    
    // 暴露全局函数用于调试
    window.stMobilePhone = {
        init: initMobilePhone,
        version: '1.0.0'
    };
    
    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForST);
    } else {
        waitForST();
    }
    
})();
