// ========== ST Mobile Companion - 核心逻辑 (插件版) ==========
// 注意：所有DOM操作都限定在插件容器 #st-mobile-companion-container 内

// ========== 核心工具函数 ==========
function updateClock() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const clockElement = container.querySelector('#clock');
    const dateElement = container.querySelector('#date');
    
    if (clockElement) {
        clockElement.textContent = `${hours}:${minutes}`;
    }
    
    if (dateElement) {
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[now.getDay()];
        dateElement.textContent = `${month}月${day}日 星期${weekDay}`;
    }
}

// ========== 通知系统 ==========
let notifications = [
    { id: 1, sender: "SillyTavern", content: "插件加载成功！", time: "刚刚", read: false },
    { id: 2, sender: "系统通知", content: "点击微信图标开始聊天", time: "刚刚", read: false }
];

function renderNotifications() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const notificationContainer = container.querySelector('#notification-container');
    if (!notificationContainer) return;
    
    notificationContainer.innerHTML = '<div class="notification-header">通知</div>';
    
    notifications.sort((a, b) => b.id - a.id).forEach(msg => {
        const notiEl = document.createElement('div');
        notiEl.className = `notification ${msg.read ? 'read' : 'unread'}`;
        notiEl.innerHTML = `
            <div class="notification-icon">微</div>
            <div class="notification-content">
                <div class="notification-title">${msg.sender}<span class="notification-time">${msg.time}</span></div>
                <div class="notification-text">${msg.content}</div>
            </div>
        `;
        notiEl.addEventListener('click', () => {
            msg.read = true;
            notiEl.classList.replace('unread', 'read');
            showScreen('chat-screen');
        });
        notificationContainer.appendChild(notiEl);
    });
}

function receiveNewMessage(sender, content) {
    const newId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    const newMsg = {
        id: newId,
        sender: sender,
        content: content,
        time: new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0'),
        read: false
    };
    notifications.unshift(newMsg);
    renderNotifications();
    console.log(`[小手机] 新消息来自 ${sender}: ${content}`);
}

// ========== 屏幕管理 ==========
function showScreen(screenId) {
    console.log('[小手机] 切换到屏幕:', screenId);
    
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) {
        console.error('[小手机] 未找到插件容器！');
        return;
    }
    
    // 隐藏所有屏幕
    container.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    // 显示目标屏幕
    const targetScreen = container.querySelector(`#${screenId}`);
    if (targetScreen) {
        targetScreen.style.display = 'flex';
    }
    
    // 特别处理：切回锁屏时重置状态
    if (screenId === 'lock-screen') {
        resetLockScreen();
    }
}

// ========== 解锁功能 ==========
let unlockStartY = 0;
let isUnlocking = false;

function resetLockScreen() {
    console.log('[小手机] 重置锁屏状态');
    
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const unlockCircle = container.querySelector('#unlock-circle');
    const phoneScreen = container.querySelector('#lock-screen .phone-screen');
    
    if (phoneScreen) {
        phoneScreen.style.transition = 'none';
        phoneScreen.style.transform = 'translateY(0)';
        void phoneScreen.offsetHeight;
    }
    
    if (unlockCircle) {
        unlockCircle.style.transform = 'scale(1)';
    }
    
    isUnlocking = false;
    unlockStartY = 0;
}

function bindUnlockEvents() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) {
        setTimeout(bindUnlockEvents, 100);
        return;
    }
    
    const unlockCircle = container.querySelector('#unlock-circle');
    if (!unlockCircle) {
        setTimeout(bindUnlockEvents, 100);
        return;
    }
    
    // 触摸开始
    unlockCircle.addEventListener('touchstart', function(e) {
        if (isUnlocking) return;
        unlockStartY = e.touches[0].clientY;
        isUnlocking = true;
        this.style.transform = 'scale(1.1)';
        e.preventDefault();
    });
    
    // 触摸移动
    document.addEventListener('touchmove', function(e) {
        if (!isUnlocking) return;
        const currentY = e.touches[0].clientY;
        const deltaY = unlockStartY - currentY;
        
        if (deltaY > 0) {
            const progress = Math.min(deltaY / 100, 1);
            unlockCircle.style.transform = `scale(${1.1 - progress * 0.2})`;
            
            if (deltaY >= 100) {
                unlockToHomeScreen();
                isUnlocking = false;
            }
        }
    });
    
    // 触摸结束
    document.addEventListener('touchend', function() {
        if (!isUnlocking) return;
        isUnlocking = false;
        unlockCircle.style.transform = 'scale(1)';
    });
    
    console.log('[小手机] 解锁事件绑定完成');
}

function unlockToHomeScreen() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const phoneScreen = container.querySelector('#lock-screen .phone-screen');
    if (!phoneScreen) return;
    
    phoneScreen.style.transition = 'transform 0.5s ease';
    phoneScreen.style.transform = 'translateY(-100vh)';
    
    setTimeout(() => {
        showScreen('home-screen');
        setTimeout(resetLockScreen, 50);
    }, 500);
}

// ========== 聊天功能 ==========
function addMessageToChat(text, type) {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const messageList = container.querySelector('#message-list');
    if (!messageList) return;
    
    const msgEl = document.createElement('div');
    msgEl.className = `message ${type}`;
    msgEl.textContent = text;
    messageList.appendChild(msgEl);
    messageList.scrollTop = messageList.scrollHeight;
}

function sendMessage() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const input = container.querySelector('#chat-input');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text) return;
    
    addMessageToChat(text, 'outgoing');
    input.value = '';
    
    // 模拟回复
    setTimeout(() => {
        addMessageToChat('这是来自SillyTavern的测试回复。', 'incoming');
    }, 1000);
}

// ========== 绑定事件 ==========
function bindEvents() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) {
        setTimeout(bindEvents, 100);
        return;
    }
    
    // 绑定屏幕切换
    const wechatIcon = container.querySelector('.app-icon[data-app="wechat"]');
    const lockIcon = container.querySelector('#back-to-lock');
    const backButton = container.querySelector('#back-to-home');
    
    if (wechatIcon) wechatIcon.addEventListener('click', () => showScreen('chat-screen'));
    if (lockIcon) lockIcon.addEventListener('click', () => showScreen('lock-screen'));
    if (backButton) backButton.addEventListener('click', () => showScreen('home-screen'));
    
    // 绑定聊天发送
    const sendBtn = container.querySelector('#send-button');
    const chatInput = container.querySelector('#chat-input');
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    console.log('[小手机] 所有事件绑定完成');
}

// ========== 好友系统 ==========
let friends = [
    { id: 'system', name: '系统助手', avatar: '', unread: 0 }
];

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
    console.log('[小手机] 添加好友:', name);
    return newFriend.id;
}

function renderFriendsList() {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const contactsList = container.querySelector('#contacts-list');
    if (!contactsList) return;
    
    contactsList.innerHTML = '';
    
    friends.forEach(friend => {
        const friendEl = document.createElement('div');
        friendEl.className = 'contact-item';
        friendEl.dataset.friendId = friend.id;
        
        // 头像显示
        let avatarHtml = friend.avatar 
            ? `<div class="contact-avatar" style="background-image:url('${friend.avatar}')"></div>`
            : `<div class="contact-avatar">${friend.name.charAt(0)}</div>`;
        
        friendEl.innerHTML = `
            ${avatarHtml}
            <div class="contact-name">${friend.name}</div>
            <div class="contact-menu" onclick="showFriendMenu('${friend.id}', event)">⋮</div>
        `;
        
        // 点击好友跳转到聊天
        friendEl.addEventListener('click', (e) => {
            if (!e.target.classList.contains('contact-menu')) {
                switchToChatWith(friend.id);
            }
        });
        
        contactsList.appendChild(friendEl);
    });
}

function showFriendMenu(friendId, event) {
    event.stopPropagation();
    console.log('显示好友菜单:', friendId);
    // 这里可以添加删除好友等功能
    alert(`好友菜单: ${friendId}\n后续可以添加删除、换头像等功能`);
}

function switchToChatWith(friendId) {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return;
    
    console.log(`切换到与 ${friend.name} 的聊天`);
    // 这里可以清空消息列表，加载历史消息等
    // 现在先简单显示
    const container = document.getElementById('st-mobile-companion-container');
    const messageList = container.querySelector('#message-list');
    if (messageList) {
        messageList.innerHTML = `<div class="message system">开始与 ${friend.name} 聊天</div>`;
    }
    
    // 切换到消息页
    switchWechatTab('msglist');
}

// ========== 标签页切换 ==========
let currentWechatTab = 'msglist';

function switchWechatTab(tabId) {
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    // 更新当前标签
    currentWechatTab = tabId;
    
    // 隐藏所有标签页
    container.querySelectorAll('.wechat-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示目标标签页
    const targetTab = container.querySelector(`#tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 更新标签栏激活状态
    container.querySelectorAll('.tab-bar-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });
    
    // 更新标题
    const titles = { 'msglist': '微信', 'contacts': '联系人' };
    const titleEl = container.querySelector('#wechat-title');
    if (titleEl) titleEl.textContent = titles[tabId] || '微信';
}

// ========== <msg>协议解析器 ==========
function parseMsgProtocol(rawText) {
    // 查找所有<msg>标签
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

// 监听页面变化，抓取<msg>标签
function startMsgMonitor() {
    console.log('[小手机] 开始监控<msg>标签');
    
    // 这里需要与SillyTavern集成，暂时用模拟
    setInterval(() => {
        // 模拟从ST聊天框抓取内容
        const stChat = document.querySelector('#chat');
        if (stChat) {
            const text = stChat.textContent || stChat.innerText;
            const messages = parseMsgProtocol(text);
            
            messages.forEach(msg => {
                // 检查发送方是否是好友
                const isFriend = friends.some(f => f.name === msg.sender);
                if (!isFriend && msg.sender !== '系统') {
                    addFriend(msg.sender); // 自动添加为好友
                }
                
                // 显示消息
                receiveMessage(msg);
            });
        }
    }, 3000); // 每3秒检查一次
}

function receiveMessage(msg) {
    console.log(`收到消息: ${msg.sender} -> ${msg.receiver}: ${msg.content}`);
    
    // 添加到消息列表
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) return;
    
    const messageList = container.querySelector('#message-list');
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
}

// ========== 初始化 ==========
function initApp() {
    console.log('[小手机] 开始初始化...');
    
    // 检查容器是否存在
    const container = document.getElementById('st-mobile-companion-container');
    if (!container) {
        console.warn('[小手机] 容器未找到，延迟重试...');
        setTimeout(initApp, 200);
        return;
    }
    
    // 1. 启动时钟
    updateClock();
    setInterval(updateClock, 1000);
    
    // 2. 渲染通知
    renderNotifications();
    
    // 3. 绑定事件
    bindEvents();
    bindUnlockEvents();
    
    // 4. 初始化好友列表
    renderFriendsList();
    
    // 5. 绑定添加好友按钮
    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendNameInput = document.getElementById('friend-name-input');
    const friendAvatarInput = document.getElementById('friend-avatar-input');
    
    if (addFriendBtn && friendNameInput) {
        addFriendBtn.addEventListener('click', () => {
            const name = friendNameInput.value.trim();
            const avatar = friendAvatarInput.value.trim();
            
            if (name) {
                addFriend(name, avatar);
                friendNameInput.value = '';
                friendAvatarInput.value = '';
            }
        });
    }
    
    // 6. 绑定标签切换
    const tabItems = document.querySelectorAll('.tab-bar-item');
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            if (tabId) {
                switchWechatTab(tabId);
            }
        });
    });
    
    // 7. 启动消息监控
    setTimeout(startMsgMonitor, 2000);
    
    // 8. 测试：模拟消息
    setTimeout(() => {
        receiveNewMessage('系统', '小手机插件已就绪！');
    }, 1500);
    
    console.log('[小手机] 初始化完成！');
}

// ========== 启动 ==========
// 等待容器完全注入后初始化
setTimeout(initApp, 500);