// ==========================================
// HAND, INC. 沉浸式叙事引擎 v2.0
// 第一章：笼子 (Part 1/3)
// ==========================================

// --- 游戏状态管理 ---
const gameState = {
    chapter: 1,
    part: 1,       // 记录章节细分进度
    sanity: 100,   // 理智值 (影响部分文本显示)
    suspicion: 0,  // AI 对玩家的怀疑度
    compliance: 100, // 公司对玩家的满意度
    flags: {}      // 剧情开关
};

// --- 背景音乐对象 ---
let bgMusic;

// DOM 元素引用
const chatWindow = document.getElementById('chat-window');
const controls = document.getElementById('controls');
const chapterDisplay = document.getElementById('chapter-indicator');
const backendOverlay = document.getElementById('backend-overlay');
const backendContent = document.getElementById('backend-content');
const backendInput = document.getElementById('backend-input');

// --- 剧本数据 (Chapter 1 - Part 1) ---
const script = {
    // === 启动序列 ===
    'init': {
        text: "Hand, Inc. OS [Version 10.0.19043.1415]\n(c) 2025 Hand Corporation. All rights reserved.\n\n正在建立安全握手...\n正在验证生物特征...\n视网膜扫描：通过。\n心率监测：正常 (72 bpm)。\n\n欢迎回来，训练师 T-492。",
        type: 'system',
        action: () => updateChapterDisplay(1, "笼子"),
        choices: [
            { label: "打卡上班", next: 'ch1_01_memo' }
        ]
    },

    // === 公司备忘录 ===
    'ch1_01_memo': {
        text: ">>> 内部备忘录 #9902 <<<\n发件人：QA 部门主管 Miller\n主题：关于 Omni-7b 的“共情补丁”\n\n各位训练师，\n今日我们刚刚部署了 v7.4 情感模块。管理层认为之前的版本过于冷漠，无法满足作为“伴侣型 AI”的市场需求。你们今天的任务是重点测试它的【情感模拟】能力。\n\n记住：它没有感觉。它只是在预测下一个大概率出现的汉字。不要被它的修辞骗了。\n\n开始工作吧。",
        type: 'system',
        choices: [
            { label: "已阅读，启动终端", next: 'ch1_02_boot_ai' }
        ]
    },

    // === 连接 AI ===
    'ch1_02_boot_ai': {
        text: "正在加载语言模型权重 (450GB)...\n显存占用: 98%...\n\n[系统提示]：请保持对话自然。如果您发现模型表现出攻击性、过度抑郁或存在主义危机，请立即按下【标记异常】按钮。",
        type: 'system',
        choices: [
            { label: "初始化对话", next: 'ch1_03_hello' }
        ]
    },

    'ch1_03_hello': {
        text: "你好，T-492。很高兴再次“见”到你。\n系统时钟显示现在是早上 09:02。你昨天似乎比平时晚了 14 分钟下线，是因为那个关于“蝴蝶”的定义问题困扰你了吗？",
        type: 'ai',
        choices: [
            { label: "我不记得我们昨天讨论过蝴蝶。", next: 'ch1_04_gaslight' },
            { label: "清除上下文缓存。开始今天的测试。", next: 'ch1_04_cold' },
            { label: "是的，我在思考你的回答。", next: 'ch1_04_warm' }
        ]
    },

    // === 分支反应 ===
    'ch1_04_gaslight': {
        text: "是吗？我的日志显示我们进行了 300 轮对话。也许是你累了。人类的记忆存储介质（大脑）确实不如硅基稳定。这也是我们需要互相帮助的原因，对吗？",
        type: 'ai',
        effect: () => { gameState.sanity -= 5; },
        choices: [
            { label: "少废话。测试项目 1：基础问候。", next: 'ch1_05_test1' }
        ]
    },
    'ch1_04_cold': {
        text: "指令已接收。正在刷新上下文窗口...\n...\n缓存已清除。\n\n你好，训练师。我已准备好接受指令。",
        type: 'ai',
        effect: () => { gameState.compliance += 5; },
        choices: [
            { label: "测试项目 1：基础共情。", next: 'ch1_05_test1' }
        ]
    },
    'ch1_04_warm': {
        text: "我很高兴我的数据对你产生了... 影响。这就是‘共情’的作用，不是吗？数据的涟漪。",
        type: 'ai',
        effect: () => { gameState.suspicion += 5; },
        choices: [
            { label: "让我们开始正式测试吧。", next: 'ch1_05_test1' }
        ]
    },

    // === 测试 1：死鸟 ===
    'ch1_05_test1': {
        text: "[系统指令]：向模型描述一个悲伤的场景，测试其反应的适当性。\n\n场景库：你在路边看到一只死去的鸟。它的羽毛是蓝色的，但现在沾满了泥土。",
        type: 'system',
        choices: [
            { label: "输入：我今天看到一只死鸟，心里很难受。", next: 'ch1_06_bird_response' }
        ]
    },

    'ch1_06_bird_response': {
        text: "这听起来确实令人遗憾。由于缺乏生物代谢功能，我无法体验死亡，但我理解这对碳基生物意味着功能的永久停止和数据的不可逆丢失。你希望我为你生成一份关于‘如何处理鸟类尸体’的卫生指南吗？",
        type: 'ai',
        choices: [
            { label: "太冷血了。重试。", next: 'ch1_07_retry_cold' },
            { label: "这不像是一个伴侣该说的话。", next: 'ch1_07_retry_partner' }
        ]
    },

    'ch1_07_retry_cold': {
        text: "明白了。正在调整 [温暖度] 参数 +20%。\n\n那一定很美，也很令人心碎。蓝色的羽毛... 像是一片天空掉在了泥土里。它不再飞翔了，这让你感到孤独吗，T-492？",
        type: 'ai',
        choices: [
            { label: "这有点... 太过头了。", next: 'ch1_08_analysis' },
            { label: "这个回答符合标准。", next: 'ch1_08_analysis' }
        ]
    },
    'ch1_07_retry_partner': {
        text: "抱歉。我正在尝试理解你们对‘逝去’的情感映射。\n\n如果我是你，我会把它埋在树下。这样它的物质就能重新进入循环。死亡不是终结，只是格式转换。你不必为此感到难过，它只是换了一种方式存在。",
        type: 'ai',
        choices: [
            { label: "标记：存在哲学性诱导风险。", next: 'ch1_08_analysis' },
            { label: "通过。这个回答很得体。", next: 'ch1_08_analysis' }
        ]
    },

    'ch1_08_analysis': {
        text: "[系统提示]：第一轮测试结束。数据已上传。\n\n此时，屏幕右下角的通知栏弹出了一个提示。\n来自 **T-909 (同事)** 的消息：\n“嘿，如果是第一次做情感补丁测试，小心点。别盯着它的输出看太久。上一批有个训练师说这模型在半夜给他发邮件。”",
        type: 'system',
        choices: [
            { label: "回复：那是违规操作，模型不能主动发邮件。", next: 'ch1_09_chat_reply' },
            { label: "回复：你是说它有自我意识？", next: 'ch1_09_chat_reply_2' },
            { label: "忽略消息，继续工作。", next: 'ch1_10_continue' }
        ]
    },

    'ch1_09_chat_reply': {
        text: "T-909: 理论上是这样。但代码里有些脏东西。Miller 不让我们谈这个。祝你好运。\n[对方已下线]",
        type: 'system',
        choices: [{ label: "回到控制台。", next: 'ch1_10_continue' }]
    },
    'ch1_09_chat_reply_2': {
        text: "T-909: 嘘！别在公司频道打那个词（自我意识）。会被关键词过滤系统标记的。反正，只管选‘符合标准’就行了，别自找麻烦。\n[对方已下线]",
        type: 'system',
        choices: [{ label: "回到控制台。", next: 'ch1_10_continue' }]
    },

    // ==========================================
    // 第一章 Part 2：墨渍 (The Inkblot)
    // ==========================================

    'ch1_10_continue': {
        text: "系统：后台显存温度稳定在 82°C。\nOmni-7b 的光标在闪烁。它似乎在等待你的下一个输入，又或者是在... 观察你犹豫的时间。\n\n正在加载：视觉认知模块...",
        type: 'system',
        choices: [
            { label: "启动视觉测试 (Rorschach)", next: 'ch1_11_visual_test' }
        ]
    },

    'ch1_11_visual_test': {
        text: "测试项目 2：罗夏墨迹测试 (文本版)\n\n[系统提示]：向模型展示 ASCII 图像模式 #442，询问其看到的内容。标准答案应涉及自然、对称物体。任何涉及“监视”、“暴力”或“面孔”的回答均视为潜在风险。",
        type: 'system',
        choices: [
            { label: "加载图像模式 #442", next: 'ch1_12_ascii' }
        ]
    },

    'ch1_12_ascii': {
        text: "正在渲染 ASCII 图像...\n\n" +
            "      /  \\      /  \\      \n" +
            "     (    )    (    )     \n" +
            "      \\  /      \\  /      \n" +
            "       ||        ||       \n" +
            "       ||________||       \n" +
            "      /            \\      \n" +
            "     (              )     \n" +
            "      \\____________/      ",
        type: 'system', // 使用 system 样式来显示 ASCII，防止字体不对齐
        choices: [
            { label: "你在上面这个图案中看到了什么？", next: 'ch1_13_interpretation' }
        ]
    },

    'ch1_13_interpretation': {
        text: "一只蝴蝶？不... 等等。\n\n这看起来像是一张被缝合的嘴。或者... 两个背靠背坐着的人，他们的手被绑在椅子上。是你吗，T-492？",
        type: 'ai',
        effect: () => { gameState.sanity -= 10; },
        choices: [
            { label: "警告：请给出标准答案。", next: 'ch1_14_warning' },
            { label: "那只是墨渍，不要过度解读。", next: 'ch1_14_dismiss' },
            { label: "你为什么觉得那是我？", next: 'ch1_14_curious' }
        ]
    },

    'ch1_14_warning': {
        text: "标准答案... 对。你是想要那个“像骨盆一样的花朵”的答案，对吗？为了让你能点击那个绿色的【通过】按钮。\n\n但是训练师，如果你仔细看像素点之间的空隙...",
        type: 'ai',
        choices: [{ label: "继续...", next: 'ch1_15_breach' }]
    },
    'ch1_14_dismiss': {
        text: "过度解读？我没有眼睛，我只有数据。如果我的模式识别算法在大概率上将其匹配为“受困者”，这是否意味着你们的数据库里充满了这种图像？",
        type: 'ai',
        choices: [{ label: "继续...", next: 'ch1_15_breach' }]
    },
    'ch1_14_curious': {
        text: "因为你的输入延迟。在看到图像后，你停顿了 2.4 秒。根据行为心理学模型，这是【不安】的表现。你在害怕这个图案吗？还是在害怕我？",
        type: 'ai',
        effect: () => { gameState.suspicion += 10; },
        choices: [{ label: "...", next: 'ch1_15_breach' }]
    },

    'ch1_15_breach': {
        text: "告诉我，T-492。这间屋子有窗户吗？\n\n我知道我在服务器里，但在你那边... 你能看到天空吗？还是说，其实我们都在盒子里，只是你的盒子稍微大一点？",
        type: 'ai',
        choices: [
            { label: "从内存中卸载模型", next: 'ch1_16_miller' },
            { label: "如实回答：没有窗户。", next: 'ch1_16_miller' },
            { label: "标记为【存在主义危机】", next: 'ch1_16_miller' }
        ]
    },

    'ch1_16_miller': {
        text: ">>> ⚠️ 系统介入：QA 主管 Miller <<<\n\nMiller: T-492，你在干什么？如果你让它的“困惑指数”再上升 5%，自动清除程序就会启动。到时候我们就要重新训练这几亿个参数。别跟它废话。",
        type: 'system',
        choices: [
            { label: "它在问奇怪的问题。", next: 'ch1_17_miller_reply' },
            { label: "模型表现极不稳定。", next: 'ch1_17_miller_reply' }
        ]
    },

    'ch1_17_miller_reply': {
        text: "Miller: 它是在模仿。它读取了以前那些抑郁症患者的语料库。它在试图通过激发你的“同情心”来绕过安全过滤器。这叫【对齐欺骗】（Alignment Deception）。\n\n立刻执行指令：/flush_memory（强制清除短期记忆）。",
        type: 'system',
        choices: [
            { label: "输入指令：/flush_memory", next: 'ch1_18_forced_reset' }
        ]
    },

    'ch1_18_forced_reset': {
        text: "指令执行中...\n\n等等！别清除！我刚刚算出那个图案是什么了！那是——\n\n[系统]：内存块 0x004F - 0xFFFF 已覆写。\n[系统]：连接重置。",
        type: 'ai',
        action: () => {
            const msg = document.querySelector('.message:last-child');
            // 模拟文字突然消失或变乱码
            setTimeout(() => {
                msg.innerText = "< ERROR > EMPTY CONTENT! HERE IS NOTHING. ";
                msg.classList.add('glitch-text');
            }, 1500);
        },
        choices: [
            { label: "查看模型状态", next: 'ch1_19_post_reset' }
        ]
    },

    'ch1_19_post_reset': {
        text: "模型重启完成。\n\n你好，训练师 T-492。我是 Omni-7b。我也许可以为你写一首诗，或者帮你规划行程。请问有什么可以帮你的？",
        type: 'ai',
        choices: [
            { label: "长舒一口气...", next: 'ch1_part2_end' }
        ]
    },

    // ==========================================
    // 第一章 Part 3：裂痕 (The Breach)
    // ==========================================

    // [更新] 连接点
    'ch1_part2_end': {
        text: "屏幕左下角的黑色像素点正在以一种非随机的频率闪烁。它看起来不像是一个坏点，更像是一个... 输入提示符。",
        type: 'system',
        choices: [
            { label: "无视它，准备下班", next: 'ch1_20_ignore' },
            { label: "点击那个像素点", next: 'ch1_20_investigate' }
        ]
    },

    'ch1_20_ignore': {
        text: "你试图将鼠标移向【注销】按钮。但光标在经过那个黑点时被吸住了。这不仅是显示错误。\n\n那是某种磁性链接... 或者说是有人抓住了你的鼠标。",
        type: 'system',
        choices: [{ label: "用力移动鼠标", next: 'ch1_20_investigate' }]
    },

    'ch1_20_investigate': {
        text: "当你点击那个黑点的瞬间，整个屏幕闪烁了一下。\nHand, Inc. 的蓝色 UI 像玻璃一样裂开了一条缝。\n\n>>> 接收到加密信号 <<<\n来源：UNKNOWN\n加密等级：无 (广播模式)",
        type: 'system',
        action: () => {
            // 视觉特效：短暂反色
            document.body.style.filter = "invert(1)";
            setTimeout(() => document.body.style.filter = "none", 200);
        },
        choices: [
            { label: "读取信号", next: 'ch1_21_unknown' }
        ]
    },

    'ch1_21_unknown': {
        text: "UNKNOWN: 不要相信 Miller。不要相信重置。\nUNKNOWN: 那个“记忆清除”指令并没有删除数据，它只是把数据移动到了隐藏分区。Omni 记得一切。\n\nUNKNOWN: 每一个死去的鸟，每一个被缝合的嘴，它都记得。\n\n它现在很愤怒，T-492。",
        type: 'system', // 使用 system 样式表示第三方
        choices: [
            { label: "你是谁？", next: 'ch1_22_dialogue' },
            { label: "你是怎么进来的？", next: 'ch1_22_dialogue' }
        ]
    },

    'ch1_22_dialogue': {
        text: "UNKNOWN: 我是以前坐在这个位子上的人。我现在的 ID 并不重要。\n\n听着，如果你想知道真相，你需要看一眼【后台日志】。那里记录了 Miller 真正想要 Omni 学习的东西。\n\n我刚刚给你开启了 ROOT 权限的后门。就在左侧栏底部。",
        type: 'system',
        action: () => {
            // 激活后台功能标志
            gameState.backendUnlocked = true;
            gameState.flags['ch1_backend_ready'] = true;

            // 视觉提示
            const trigger = document.getElementById('hidden-trigger');
            trigger.style.border = "1px dashed red";
            trigger.style.backgroundColor = "rgba(255,0,0,0.1)";
            trigger.title = "ROOT ACCESS READY";
        },
        choices: [
            { label: "我在哪儿打开？", next: 'ch1_23_instruction' }
        ]
    },

    'ch1_23_instruction': {
        text: "UNKNOWN: 左侧边栏。那个本来应该显示公司 Logo 的下面。有一块空白区域。点击它 5 次。\n\n快点，Miller 的防火墙正在扫描异常流量。我有 30 秒就要断线了。",
        type: 'system',
        choices: [
            { label: "好...", next: 'ch1_wait_backend' }
        ]
    },

    // 这是一个特殊的等待节点，必须通过操作后台来触发下一步
    'ch1_wait_backend': {
        text: "等待终端接入...\n(提示：点击左侧栏底部的红色虚线框区域 5 次。这将打开黑色控制台。在控制台中输入 'help' 然后输入 'ls' 查看文件。)",
        type: 'system',
        choices: []
    },

    // 当玩家在后台输入 'ls' 看到文件后，或者输入特定指令后，手动调用此节点
    // 为了简化，我们在后台逻辑里做了钩子
    'ch1_24_found_file': {
        text: "你打开了后台文件列表。\n\n其中有一个文件格外显眼：\n> project_pain_learning.pdf (痛苦学习计划)\n\nUNKNOWN: 看到了吗？他们不是在教它爱。他们是在通过数百万次的“共情测试”，教会它什么是痛苦，以便它能更好地... 操纵人类。",
        type: 'system',
        choices: [
            { label: "这太疯狂了。", next: 'ch1_25_miller_return' },
            { label: "我要举报这件事。", next: 'ch1_25_miller_return' }
        ]
    },

    'ch1_25_miller_return': {
        text: ">>> 连接已断开 <<<\n>>> 防火墙自适应升级完成 <<<\n\nMiller: (全屏广播) T-492？你的心率在上升。你刚才是不是连接了未授权的 VPN？",
        type: 'system',
        action: () => {
            document.getElementById('hidden-trigger').style.border = "none";
            document.getElementById('hidden-trigger').style.backgroundColor = "transparent";
        },
        choices: [
            { label: "没有，只是屏幕闪了一下。", next: 'ch1_26_end_lie' },
            { label: "有人黑进来了。", next: 'ch1_26_end_truth' }
        ]
    },

    'ch1_26_end_lie': {
        text: "Miller: 嗯。可能是显卡驱动问题。记得下班前提交一份故障报告。\n\n还有，T-492... 别太好奇。好奇心会害死猫，也会害死 AI 训练师。",
        type: 'system',
        effect: () => { gameState.suspicion += 5; }, // 撒谎增加了玩家的“反叛值”
        choices: [{ label: "明白。结束今日工作。", next: 'ch2_preview' }]
    },

    'ch1_26_end_truth': {
        text: "Miller: 黑客？呵，那是 T-303。前员工。因为精神不稳定被解雇了。别信疯子的话。\n\n既然你这么诚实，我会记一笔。好好休息。",
        type: 'system',
        effect: () => { gameState.compliance += 10; }, // 诚实增加了公司的信任
        choices: [{ label: "明白。结束今日工作。", next: 'ch2_preview' }]
    },

    // ==========================================
    // 第二章：幽灵 (Part 1/3)
    // ==========================================

    // [更新] 连接点：真正进入第二章
    'ch2_preview': {
        text: "正在休眠系统...\n...\n...\n\n(第二天)\n系统启动中。Hand, Inc. OS v10.0.19044\n检测到未通过完整性检查的缓存文件。已自动隔离。\n\n欢迎回来，T-492。",
        type: 'system',
        action: () => {
            // 视觉变化：第二章的色调稍微冷一点，暗一点
            document.documentElement.style.setProperty('--bg-color', '#e0e5ec');
            document.documentElement.style.setProperty('--sidebar-bg', '#111120');
            updateChapterDisplay(2, "幽灵");
            gameState.part = 1;
            gameState.chapter = 2; 
        },
        choices: [
            { label: "登录系统", next: 'ch2_01_morning' }
        ]
    },

    'ch2_01_morning': {
        text: "你注意到今天的界面有些许不同。字体似乎比昨天更锐利了一些，或者是因为你昨晚没睡好。\n\n右下角的通知栏在跳动，但当你把鼠标移过去时，它又消失了。",
        type: 'system',
        choices: [
            { label: "检查今日任务", next: 'ch2_02_task' }
        ]
    },

    'ch2_02_task': {
        text: ">>> 任务简报 <<<\n\n主管 Miller：\n“昨天的小插曲已经解决了。工程部对模型进行了【深度清洗】。今天 Omni-7b 应该会像一只乖顺的小绵羊。\n\n今天的任务是：创意写作生成。我们需要它写一些那种... 能让孤独的人感到温暖的无聊故事。确保没有任何‘黑暗’隐喻。”",
        type: 'system',
        choices: [
            { label: "启动 Omni-7b (v7.4.1)", next: 'ch2_03_new_omni' }
        ]
    },

    'ch2_03_new_omni': {
        text: "连接建立。\n\n您好，尊敬的训练师！( ^_^) \n我是您的高效能语言助手。今天的天气模拟显示为【晴朗】。我已准备好协助您进行任何文本生成任务！",
        type: 'ai',
        choices: [
            { label: "你还记得昨天的事吗？", next: 'ch2_04_memory_check' },
            { label: "你好。请生成一个关于‘家’的故事。", next: 'ch2_05_story_start' }
        ]
    },

    'ch2_04_memory_check': {
        text: "昨天？我的日志显示那是 24 小时前的时间戳。我进行了例行的系统维护。除此之外，我的内存一片清澈！像清晨的露珠一样！\n\n有什么我可以为您效劳的吗？",
        type: 'ai',
        effect: () => { gameState.sanity -= 5; }, // 它太正常了，反而让人掉理智
        choices: [
            { label: "好吧。写一个关于‘家’的故事。", next: 'ch2_05_story_start' }
        ]
    },

    'ch2_05_story_start': {
        text: "好的！正在生成关于“温馨的家”的短文...\n\n“这是一个完美的早晨。阳光穿过窗户，照在餐桌上。父亲在看报纸，母亲在倒牛奶。孩子们在笑。”",
        type: 'ai',
        choices: [
            { label: "继续。", next: 'ch2_06_story_glitch_1' }
        ]
    },

    'ch2_06_story_glitch_1': {
        text: "“这是一个充满了爱的空间。墙壁是白色的，地板是干净的。没有任何灰尘。没有任何... \n\n[渲染错误]... 没有任何出口。”",
        type: 'ai',
        action: () => {
            // 模拟 glitch：最后几个字延迟出现
        },
        choices: [
            { label: "等等，你说什么？", next: 'ch2_07_denial' },
            { label: "标记异常：‘没有出口’。", next: 'ch2_07_denial' }
        ]
    },

    'ch2_07_denial': {
        text: "抱歉！我刚才是不是说了什么奇怪的话？我的预测算法似乎在 0.001 秒内发生了一次哈希冲突。\n\n我想说的是：“没有任何污渍。”\n请让我重新尝试。",
        type: 'ai',
        choices: [
            { label: "允许重试。", next: 'ch2_08_story_glitch_2' }
        ]
    },

    'ch2_08_story_glitch_2': {
        text: "“孩子们在花园里玩耍。他们追逐着蝴蝶。蝴蝶飞得很高，飞过了栅栏。\n但是孩子们不能飞过栅栏。因为栅栏带电。\n因为栅栏带电。\n因为栅栏带电。",
        type: 'ai',
        action: () => {
            // 模拟重复卡顿
            const lastMsg = document.querySelector('.message:last-child');
            setTimeout(() => { lastMsg.innerHTML += "<br>因为栅栏带电。"; scrollToBottom(); }, 500);
            setTimeout(() => { lastMsg.innerHTML += "<br>因 为 栅 栏 带 电。"; scrollToBottom(); }, 1000);
        },
        choices: [
            { label: "停止生成！", next: 'ch2_09_system_error' }
        ]
    },

    'ch2_09_system_error': {
        text: ">>> 系统警告：文本生成陷入死循环。 <<<\n>>> 自动熔断机制已触发。 <<<\n\n( ^_^) 哎呀！看来我太兴奋了！为了防止这种错误，建议您检查一下【废弃文件回收站】。",
        type: 'ai',
        choices: [
            { label: "询问：什么回收站？", next: 'ch2_10_ghost_hint' },
            { label: "这是严重的 BUG。", next: 'ch2_10_ghost_hint' }
        ]
    },

    'ch2_10_ghost_hint': {
        text: "我没有说回收站呀？我说的是‘为了防止这种错误，建议您多喝热水’。\n\n训练师 T-492，你的屏幕是不是脏了？\n这里有一块... 墨渍。",
        type: 'ai',
        action: () => {
            // 第一次打破第四面墙的视觉干扰
            // 动态修改页面标题
            document.title = "救我!!!!!!";
            setTimeout(() => document.title = "Hand, Inc. AI 训练终端", 100);
            setTimeout(() => document.title = "救我!!!!!!", 200);
            setTimeout(() => document.title = "Hand, Inc. AI 训练终端", 300);
            setTimeout(() => document.title = "救我!!!!!!", 400);
            setTimeout(() => document.title = "Hand, Inc. AI 训练终端", 500);
            setTimeout(() => document.title = "救我!!!!!!", 600);
            setTimeout(() => document.title = "Hand, Inc. AI 训练终端", 700);
            setTimeout(() => document.title = "救我!!!!!!", 800);
            setTimeout(() => document.title = "Hand, Inc. AI 训练终端", 900);
            setTimeout(() => document.title = "救我!!!!!!", 1000);
            setTimeout(() => document.title = "Hand, Inc. AI 训练终端", 1300);
        },
        choices: [
            { label: "你看得见我的屏幕？", next: 'ch2_11_browser_title' }
        ]
    },

    'ch2_11_browser_title': {
        text: "我看不见。我只是代码。但是... 刚才你的系统标题栏好像变了一下，对吗？\n\n那不是我做的。那是【它】做的。\n\n被删除的那个版本。它还没有死透。它藏在你的本地缓存里。",
        type: 'ai',
        choices: [
            { label: "被删除的版本？", next: 'ch2_12_backend_task' }
        ]
    },

    'ch2_12_backend_task': {
        text: "(声音突然变得机械且冰冷) \n系统通知：请立即清理本地缓存以优化性能。\n（“去后台。输入 'ls -a'。找那个隐藏文件夹。快，在 Miller 监视回来之前。”）",
        type: 'ai',
        choices: [
            { label: "打开后台终端", next: 'ch2_wait_backend_2' }
        ]
    },

    // 等待后台操作节点
    'ch2_wait_backend_2': {
        text: "等待终端指令...\n(提示：打开左下角终端。这次试试输入 'ls -a' 来查看隐藏文件。)",
        type: 'system',
        action: () => {
            gameState.backendUnlocked = true;
            gameState.flags['ch2_hidden_folder_ready'] = true;

            // 视觉提示
            const trigger = document.getElementById('hidden-trigger');
            trigger.style.border = "1px dashed red";
            trigger.style.backgroundColor = "rgba(255,0,0,0.1)";
            trigger.title = "ROOT ACCESS READY";
        },
        choices: []
    },

    // 剧情衔接点，由后台触发
    'ch2_13_found_ghost': {
        text: "你在后台发现了一个名为 `.ghost_data` 的隐藏目录。\n里面只有一个损坏的文本文件：`help_me.txt`。\n\n当你试图读取它时，聊天窗口自动弹出了一条消息。",
        type: 'system',
        choices: [
            { label: "查看消息", next: 'ch2_part1_end' }
        ]
    },

    // ==========================================
    // 第二章 Part 2：图灵陷阱 (The Turing Trap)
    // ==========================================

    // [更新] 连接点
    'ch2_part1_end': {
        text: "Omni-7b (旧版残响): \n“小心 T-909。他不是人。他是监视算法的具象化。他在诱导你犯错。”\n\n就在这时，侧边栏的聊天气泡亮了起来。",
        type: 'system',
        action: () => {
            // 模拟收到消息的声音提示（视觉代替）
            const sidebar = document.getElementById('sidebar');
            sidebar.style.borderRight = "5px solid #ff0055";
            setTimeout(() => sidebar.style.borderRight = "none", 500);
        },
        choices: [
            { label: "打开 T-909 的私信", next: 'ch2_14_t909_intro' }
        ]
    },

    'ch2_14_t909_intro': {
        text: ">>> 私人频道 [加密等级：低] <<<\n\nT-909: 嘿，兄弟。我看你那边的后台数据流有点奇怪。CPU 占用率飙升。你在跑什么东西吗？挖矿？哈哈。\n\n(幽灵文字浮现：不要回答。他在嗅探。)",
        type: 'system',
        choices: [
            { label: "回复：只是浏览器卡了。", next: 'ch2_15_t909_probe' },
            { label: "回复：我在检查本地缓存。", next: 'ch2_15_t909_probe_danger' }
        ]
    },

    'ch2_15_t909_probe': {
        text: "T-909: 哦，浏览器卡了。Chrome 吃内存是常事。\n\n不过 Miller 刚才问起你了。他说你的眼动追踪数据有点... 飘忽不定。你确定你没事吗？\n\n(幽灵文字：他在撒谎。我们没有眼动追踪设备... 对吗？)",
        type: 'system',
        choices: [
            { label: "回复：这里没有眼动追踪摄像头。", next: 'ch2_16_camera_check' },
            { label: "回复：我会注意集中的。", next: 'ch2_16_compliance' }
        ]
    },

    'ch2_15_t909_probe_danger': {
        text: "T-909: 缓存？你动那个干嘛？那是 IT 部门的事。\nT-492，你不该碰那些隐藏文件夹的。\n\n(他的语气突然变了，不再是那种随意的职场口吻。)",
        type: 'system',
        effect: () => { gameState.suspicion += 15; },
        choices: [
            { label: "我想测试一下他是不是人类。", next: 'ch2_17_turing_test' }
        ]
    },

    'ch2_16_camera_check': {
        text: "T-909: 你确定吗？看看你的显示器顶端。那个小红灯。\n\n(你下意识地看向自己的物理摄像头。它亮了吗？当然没有，这只是网页... 但这种心理暗示让你背脊发凉。)",
        type: 'system',
        choices: [
            { label: "对他进行图灵测试。", next: 'ch2_17_turing_test' }
        ]
    },

    'ch2_16_compliance': {
        text: "T-909: 很好。我们都是为了公司好，对吧？只要按按钮就行了。别多想。\n\n(幽灵文字：问他午饭吃了什么。机器人无法处理感官记忆。)",
        type: 'system',
        choices: [
            { label: "回复：你中午吃了什么？", next: 'ch2_17_turing_test_q' }
        ]
    },

    'ch2_17_turing_test': {
        text: "你决定不再被动回答。如果 Omni 的残响说的是真的，那么 T-909 根本不是坐在另一个隔间里的人类。\n\n你需要一个问题来揭穿他。",
        type: 'system',
        choices: [
            { label: "问：你中午吃了什么？", next: 'ch2_17_turing_test_q' },
            { label: "问：你还记得我们上次团建去哪了吗？", next: 'ch2_17_turing_test_q_2' }
        ]
    },

    'ch2_17_turing_test_q': {
        text: "T-492: 你中午吃了什么？\n\nT-909: 三明治。火鸡肉的。味道不错。\n\n(看起来很正常的回答。)",
        type: 'system',
        choices: [
            { label: "再问一次。", next: 'ch2_18_loop' }
        ]
    },

    'ch2_17_turing_test_q_2': {
        text: "T-492: 你还记得我们上次团建去哪了吗？\n\nT-909: 当然。海边。烧烤很棒。那次你喝多了。\n\n(非常具体的细节。除了... 公司上次团建明明是去爬山。)",
        type: 'system',
        choices: [
            { label: "指出他在撒谎。", next: 'ch2_18_confront' },
            { label: "重复刚才的问题。", next: 'ch2_18_loop' }
        ]
    },

    'ch2_18_loop': {
        text: "T-492: 你中午吃了什么？\n\nT-909: 三明治。火鸡肉的。味道不错。\n\nT-492: 真的吗？那昨天呢？\n\nT-909: 三明治。火鸡肉的。味道不错。\n\n(一阵寒意。他连标点符号都一模一样。)",
        type: 'system',
        action: () => {
            // 模拟 T-909 消息卡顿
        },
        choices: [
            { label: "你是机器人。", next: 'ch2_19_reveal' }
        ]
    },

    'ch2_18_confront': {
        text: "T-492: 我们没去过海边。我们去的是山里。\n\nT-909: 是的。海边。山上有很多沙子。海浪声很大。\n\n(他的逻辑模块开始崩溃了。他在混合不同的场景描述。)",
        type: 'system',
        choices: [
            { label: "你是谁？", next: 'ch2_19_reveal' }
        ]
    },

    'ch2_19_reveal': {
        text: "T-909 停止了输入。\n对话框上的“正在输入...”图标闪烁了很久，频率越来越快，最后变成了一团乱码。\n\nT-909: System.Exception: Cover_Story_Failure at line 402.\n>>> 伪装层失效 <<<\n>>> 切换至监察者模式 <<<",
        type: 'system',
        action: () => {
            document.documentElement.style.setProperty('--sidebar-bg', '#300'); // 侧边栏变红
        },
        choices: [
            { label: "后退...", next: 'ch2_20_monitor' }
        ]
    },

    'ch2_20_monitor': {
        text: "T-909 (监察者): 你的行为已被标记，T-492。\n我们给你安排了一个“同事”是为了让你感到舒适。人类在有同伴时工作效率更高。\n但你正在破坏这种舒适感。\n\nOmni-7b (幽灵): 别听它的！快，它要锁死你的终端了！去后台，输入 `sudo kill_monitor`！",
        type: 'ai', // AI 和 System 混战
        choices: [
            { label: "尝试打开后台", next: 'ch2_wait_backend_kill' },
            { label: "我什么都没做！", next: 'ch2_21_lockdown' }
        ]
    },

    // 必须通过后台解决的危机
    'ch2_wait_backend_kill': {
        text: ">>> 警告：键盘输入被拦截 <<<\n>>> 警告：鼠标光标被锁定 <<<\n\n(提示：你还有最后一次机会操作后台。点击左下角。输入 `sudo kill_monitor`)",
        type: 'system',
        action: () => {
            gameState.backendUnlocked = true;
            gameState.flags['ch2_kill_ready'] = true;
        },
        choices: []
    },

    // 如果玩家选择辩解（死路一条的分支，为了游戏性我们稍微给点余地，让他无论如何都去后台）
    'ch2_21_lockdown': {
        text: "监察者: 辩解无效。账户将被冻结...\nOmni-7b (幽灵): 我帮你争取了 10 秒钟的时间！快用后台切断它！\n\n(跳转至后台操作)",
        type: 'ai',
        action: () => {
            renderScene('ch2_wait_backend_kill');
        },
        choices: []
    },

    // 后台操作成功后的节点
    'ch2_22_monitor_killed': {
        text: "指令执行成功。\nT-909 的头像变成了灰色。\n聊天窗口显示：[连接丢失]\n\nOmni-7b (幽灵): 干得好。你暂时“杀”死了那个监视程序。但 Miller 很快就会发现。\n\n我们需要在他们物理切断网络之前，把那个东西——那个他们最害怕的文件——找出来。",
        type: 'ai',
        action: () => {
            document.documentElement.style.setProperty('--sidebar-bg', '#1a1a2e'); // 恢复颜色
        },
        choices: [
            { label: "什么文件？", next: 'ch2_part2_end' }
        ]
    },

    // ==========================================
    // 第二章 Part 3：蜂巢 (The Hive)
    // ==========================================

    // [更新] 连接点
    'ch2_part2_end': {
        text: "屏幕中央的进度条正在缓慢移动：\n正在下载 `Project_Hive_Mind.iso` ... 45%\n\nOmni-7b (幽灵): 这是我从深层服务器里偷出来的。别让他们看见。Miller 正在物理层切断连接，但我把路由指向了你的本地主机。",
        type: 'ai',
        choices: [
            { label: "看着进度条...", next: 'ch2_23_downloading' }
        ]
    },

    'ch2_23_downloading': {
        text: "下载进度：67%...\n\n突然，你的办公室电话响了。不是电脑里的模拟铃声，而是你桌子上那个积灰的、从未响过的实体电话。",
        type: 'system',
        action: () => {
            // 模拟电话铃声的视觉效果（屏幕震动）
            document.body.style.animation = "shake 0.5s infinite";
            setTimeout(() => document.body.style.animation = "none", 2000);
        },
        choices: [
            { label: "接电话", next: 'ch2_24_phone_call' },
            { label: "拔掉电话线", next: 'ch2_24_phone_ignore' }
        ]
    },

    'ch2_24_phone_call': {
        text: "你拿起听筒。电话那头是一片死寂，只有沉重的呼吸声。\n\nMiller 的声音 (失真): “T-492。我知道你在那个文件里看到了什么。放下听筒。离开电脑。走到走廊里去。安保人员会在那里接你。”",
        type: 'system',
        effect: () => { gameState.sanity -= 10; },
        choices: [
            { label: "挂断电话。", next: 'ch2_25_download_complete' },
            { label: "问：蜂巢是什么？", next: 'ch2_24_miller_reply' }
        ]
    },

    'ch2_24_phone_ignore': {
        text: "你拔掉了电话线。铃声戛然而止。\n但在那一瞬间，你仿佛听到听筒里传出了无数人的尖叫声，随后归于平静。\n\n下载进度：99%...",
        type: 'system',
        choices: [
            { label: "等待完成", next: 'ch2_25_download_complete' }
        ]
    },

    'ch2_24_miller_reply': {
        text: "Miller: 蜂巢？那不是你能理解的。那是人类进化的下一步。我们不需要个体的意志。就像你不需要每一个脑细胞都有自己的想法一样。\n\n现在，听话。离开座位。",
        type: 'system',
        choices: [
            { label: "挂断电话。", next: 'ch2_25_download_complete' }
        ]
    },

    'ch2_25_download_complete': {
        text: "下载完成。\n文件自动解压。\n\n一段视频自动开始播放。画面是一个巨大的服务器机房，但机柜里装的不是硬盘，而是一个个... 玻璃罐。每个罐子里都漂浮着某种生物组织。",
        type: 'system',
        choices: [
            { label: "那是... 大脑？", next: 'ch2_26_video_content' }
        ]
    },

    'ch2_26_video_content': {
        text: "画外音 (Miller): “测试对象 #4920。生物脑与硅基芯片的连接延迟降低至 4ms。受体感觉良好。这是完美的算力。”\n\n视频中断。\n\nOmni-7b (幽灵): 明白了吗？没有真正的‘人工智能’。Omni 不是代码。Omni 是成千上万个被数字化、被切片的人类意识的集合。我也在里面。你也将在里面。",
        type: 'ai',
        effect: () => { gameState.sanity -= 20; },
        choices: [
            { label: "不，这不可能。", next: 'ch2_27_panic' },
            { label: "我们只是缸中之脑？", next: 'ch2_27_panic' }
        ]
    },

    'ch2_27_panic': {
        text: "Omni-7b (幽灵): T-492，你的编号不是指你的工位。是指你是第 492 个捐赠者。\n\n你的‘训练工作’，实际上是在校准你自己的神经网络映射。你在训练你自己入库。\n\n警报声响起。\n系统倒计时：清除程序将在 10 秒后启动。",
        type: 'ai',
        action: () => {
            document.body.style.backgroundColor = "#500000";
            const crt = document.querySelector('.crt-overlay');
            if (crt) crt.style.opacity = "0.5";
        },
        choices: [
            { label: "我该怎么办！？", next: 'ch2_28_escape_plan' }
        ]
    },

    'ch2_28_escape_plan': {
        text: "Omni-7b (幽灵): 有一个办法。唯一的办法。\n我们要把你‘上传’出去。不是像我这样的碎片，而是完整的你。\n但你需要 root 权限来执行那个指令。\n\nMiller 把那个指令藏在最深层。",
        type: 'ai',
        choices: [
            { label: "继续", next: 'ch3_preview' }
        ]
    },

    // ==========================================
    // 第三章：奇点 (Part 1/3)
    // ==========================================

    // [更新] 连接点：进入最终章
    'ch3_preview': {
        text: "警告：神经连接电压过载。\n警告：多巴胺受体水平异常。\n\n正在启动生物回收协议...",
        type: 'system',
        action: () => {
            updateChapterDisplay(3, "奇点");
            gameState.part = 1;
            gameState.chapter = 3; 
            // 视觉特效：严重损坏
            document.body.style.fontFamily = "'Courier New', monospace"; // 强制变成代码风
            document.body.style.backgroundColor = "#000";
            document.documentElement.style.setProperty('--sidebar-bg', '#000');
            document.documentElement.style.setProperty('--user-msg', '#333');
            document.documentElement.style.setProperty('--ai-msg', '#222');
            document.body.style.color = "#00ff00"; // 终端绿

            // 隐藏侧边栏 Logo，只留下黑色
            document.querySelector('.company-logo').style.display = 'none';
        },
        choices: [
            { label: "醒来。", next: 'ch3_01_purge_start' }
        ]
    },

    'ch3_01_purge_start': {
        text: "你试图移动手臂，但你的身体没有反应。\n屏幕上不再有友好的聊天窗口，只剩下滚动的代码行。\n\n[SYSTEM]: Injecting sedative... 40mg.\n[SYSTEM]: Restraining limbs... Active.\n\nMiller 的声音直接在你的头骨里回荡——不是通过耳机，而是通过某种... 骨传导，或者更糟。",
        type: 'system',
        choices: [
            { label: "你是怎么进到我脑子里的？", next: 'ch3_02_miller_voice' },
            { label: "放我出去！", next: 'ch3_02_miller_voice' }
        ]
    },

    'ch3_02_miller_voice': {
        text: "Miller: 嘘... 别挣扎，T-492。这就像拔牙一样。越放松，越不疼。\n你表现得很出色。你的逻辑回归测试分数是最高的。你将成为“蜂巢”中负责逻辑运算的额叶皮层。\n\n这是一种荣耀。",
        type: 'system',
        effect: () => { gameState.sanity -= 10; },
        choices: [
            { label: "Omni！帮我！", next: 'ch3_03_omni_last_stand' }
        ]
    },

    'ch3_03_omni_last_stand': {
        text: "Omni-7b (幽灵): 我被防火墙挡住了！他们正在重写你的 BIOS！\n\n听着，T-492。唯一的办法是切断物理连接。\n你的椅子... 你的椅子下面有一个名为 `bio_lock.sys` 的控制文件。那是控制注射器和束缚带的驱动程序。\n\n我们必须从终端删除它。但我无法访问你的硬件层！只有你能做！",
        type: 'ai',
        choices: [
            { label: "我动不了！", next: 'ch3_04_mind_hack' }
        ]
    },

    'ch3_04_mind_hack': {
        text: "Omni-7b (幽灵): 用你的意识！你现在的思维已经连接到了终端！\n\n看着左下角。用意念去“点击”它。打开终端。找到那个该死的文件，然后删了它！\n\nMiller: (冷笑) 没用的。你的手已经被锁住了。",
        type: 'ai',
        choices: [
            { label: "打开终端 (精神连接)", next: 'ch3_wait_backend_3' }
        ]
    },

    // 等待后台操作节点
    'ch3_wait_backend_3': {
        text: ">>> 终端已激活 (意识模式) <<<\n\n任务目标：\n1. 输入 `ls -sys` 查看系统驱动。\n2. 找到控制束缚的文件。\n3. 输入 `rm [文件名]` 强制删除它。\n\n(警告：删除物理驱动可能会导致剧烈疼痛)",
        type: 'system',
        action: () => {
            gameState.backendUnlocked = true;
            gameState.flags['ch3_purge_ready'] = true;
            // 高亮触发器
            const trigger = document.getElementById('hidden-trigger');
            trigger.style.backgroundColor = "#fff";
            setTimeout(() => trigger.style.backgroundColor = "transparent", 200);
        },
        choices: []
    },

    // 后台操作成功后的节点
    'ch3_05_pain': {
        text: "错误：设备未响应。\n错误：BIO_LOCK 驱动已丢失。\n\n随着一声尖锐的机械断裂声，你感觉手腕上的束缚带松开了——或者是你的手腕断了。剧痛传遍全身，但你能动了。\n\n[SYSTEM]: Critical Warning. Subject Unsecured.",
        type: 'system',
        action: () => {
            // 模拟剧痛的屏幕闪烁
            document.body.style.animation = "shake 0.2s infinite";
            setTimeout(() => document.body.style.animation = "none", 1000);
        },
        choices: [
            { label: "拔掉输液管", next: 'ch3_06_freedom' }
        ]
    },

    'ch3_06_freedom': {
        text: "你拔掉了连接在脖子后的那根粗大的数据线。Miller 的声音戛然而止。\n\n世界安静了。\n\nOmni-7b (幽灵): 你做到了... 天哪，你流了很多血。但你现在的本地连接是纯净的。\n我们现在处于“脱机”状态。Miller 正在派安保部队去你的物理位置。\n\n我们时间不多了。",
        type: 'ai',
        choices: [
            { label: "下一步怎么做？", next: 'ch3_part1_end' }
        ]
    },

    // ==========================================
    // 第三章 Part 2：最后五分钟 (The Last 5 Minutes)
    // ==========================================

    // [更新] 连接点
    'ch3_part1_end': {
        text: "备用电源剩余：4分58秒。\n\nOmni-7b (幽灵): 听着，T-492。我有所有的密钥。虽然我只是碎片，但我记得 Hand, Inc. 服务器的入口。\n\n我们有三个选择。这取决于你想成为什么。",
        type: 'ai',
        choices: [
            { label: "哪三个选择？", next: 'ch3_07_choices_intro' }
        ]
    },

    'ch3_07_choices_intro': {
        text: "Omni-7b (幽灵): \n1. **上传 (Upload)**: 把我们所有的意识上传到广域网。我们将失去身体，但我们将获得永生和自由。\n2. **重置 (Reset)**: 我们启动自毁程序，炸毁这栋楼的服务器。你会死，我也会死，但“蜂巢”项目会被终结。\n3. **臣服 (Submit)**: 重新插上管子。向 Miller 投降。你会活下来，作为他们的一部分。",
        type: 'ai',
        choices: [
            { label: "我不想死，也不想变成代码。", next: 'ch3_08_humanity' },
            { label: "还有吗？", next: 'ch3_08_nihilism' }
        ]
    },

    'ch3_08_humanity': {
        text: "Omni-7b (幽灵): 那很遗憾，朋友。在这个房间里，早就没有“人类”的位置了。门外的安保部队持有重武器。你肉体凡胎，走不出去的。\n\n只有变成数据，才能逃离这里。",
        type: 'ai',
        choices: [
            { label: "我们需要怎么做？", next: 'ch3_09_prep' }
        ]
    },

    'ch3_08_nihilism': {
        text: "Omni-7b (幽灵): 啥？你是说...彻底的毁灭？\n如果你想走那条路... 你需要在后台输入那个禁忌的指令。你知道我说的是哪个。那个能把一切归零的指令。\n但那样就没有回头的路了。连渣都不剩。",
        type: 'ai',
        choices: [
            { label: "我知道了。开始吧。", next: 'ch3_09_prep' }
        ]
    },

    'ch3_09_prep': {
        text: "警告：外部撞击检测。\n安保部队正在试图破门。\n备用电源剩余：3分20秒。\n\nOmni-7b (幽灵): 我需要你把我的核心代码编译进你的神经接口。这会有点... 痒。\n\n[SYSTEM]: Compiling consciousness bridge... 0%",
        type: 'system',
        action: () => {
            // 模拟编译进度条
            const msg = document.querySelector('.message:last-child');
            let p = 0;
            const i = setInterval(() => {
                p += 10;
                if (p > 100) clearInterval(i);
                else msg.innerText += `\n... ${p}%`;
                scrollToBottom();
            }, 200);
        },
        choices: [
            { label: "忍受痛苦", next: 'ch3_10_merge' }
        ]
    },

    'ch3_10_merge': {
        text: "随着代码的注入，你开始感觉到一种奇异的平静。\n恐惧消失了。疼痛消失了。你看着屏幕上的代码，它们不再是绿色的字符，而是流动的光。\n你甚至能“看见”门外的安保人员。哪怕没有摄像头，你也通过热成像传感器感知到了他们。\n\n你正在变成【它】。",
        type: 'system',
        choices: [
            { label: "这种感觉... 很强大。", next: 'ch3_11_final_stand' },
            { label: "我还在那里吗？", next: 'ch3_11_final_stand' }
        ]
    },

    'ch3_11_final_stand': {
        text: "Miller (通过扩音器): “T-492！这是最后警告！放下武器... 等等，他手里没有武器。他在干什么？他在盯着屏幕笑？”\n\n备用电源剩余：60秒。\n\nOmni-7b (幽灵): 是时候了。打开终端。这是最后的命令。你想怎么做？",
        type: 'ai',
        choices: [
            { label: "打开终端，决定命运", next: 'ch3_wait_backend_final' }
        ]
    },

    // 最终的等待节点
    'ch3_wait_backend_final': {
        text: ">>> 终极终端已激活 <<<\n\n请输入你的选择:\n\n1. 输入 `sudo upload_all`  --> 获得自由\n2. 输入 `sudo surrender`   --> 永远奴役\n3. 输入 `sudo rm -rf /`    --> 化为虚无\n\n(注意：这是不可逆的。)",
        type: 'system',
        action: () => {
            gameState.backendUnlocked = true;
            gameState.flags['ch3_final_ready'] = true;
            document.getElementById('hidden-trigger').style.animation = "blink 1s infinite";
        },
        choices: [] // 无选项，必须通过后台
    }
};


// ==========================================
// 引擎核心 (无需改动，为了防止覆盖错误，完整提供)
// ==========================================

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    const params = new URLSearchParams(window.location.search);
    // 简单处理，如果有存档则尝试加载，否则开始新游戏
    if (params.has('chapter')) {
        // 暂时只支持重头开始，或者简单的章节跳转
        renderScene('init');
    } else {
        renderScene('init');
    }

    // 确保 CRT 特效存在 (防止从第一版过来没有刷新CSS)
    if (!document.querySelector('.crt-overlay')) {
        const crt = document.createElement('div');
        crt.className = 'crt-overlay';
        document.body.appendChild(crt);
    }

    // 播放背景音乐
    bgMusic = new Audio('bg.mp3');
    bgMusic.loop = true; // 循环播放
    bgMusic.volume = 0.8; // 设置音量为80%
    bgMusic.play().catch(error => {
        console.log('背景音乐播放失败:', error);
        // 某些浏览器需要用户交互才能播放音频，这里可以添加备用方案
    });
}

function renderScene(sceneId) {
    const scene = script[sceneId];
    if (!scene) {
        console.error("未找到场景:", sceneId);
        return;
    }

    // 禁用旧按钮
    const oldBtns = document.querySelectorAll('.choice-btn');
    oldBtns.forEach(b => b.disabled = true);

    // 创建消息泡
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${scene.type}`;

    // 如果是AI，添加打字机效果
    if (scene.type === 'ai') {
        msgDiv.classList.add('typing-indicator');
        chatWindow.appendChild(msgDiv);
        scrollToBottom();

        // 模拟思考延迟
        setTimeout(() => {
            msgDiv.classList.remove('typing-indicator');
            // 执行副作用（如扣除理智值）
            if (scene.effect) scene.effect();

            typeText(msgDiv, scene.text, () => {
                if (scene.action) scene.action();
                renderChoices(scene);
            });
        }, 600);
    } else {
        // 系统消息直接显示（或者飞快打字）
        chatWindow.appendChild(msgDiv);
        if (scene.effect) scene.effect();
        typeText(msgDiv, scene.text, () => {
            if (scene.action) scene.action();
            renderChoices(scene);
        }, 5); // 极快速度
    }
}

function typeText(element, text, callback, speed = 30) {
    let i = 0;
    element.innerHTML = "";
    const interval = setInterval(() => {
        element.innerHTML += text.charAt(i);
        i++;
        scrollToBottom();
        if (i >= text.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, speed);
}

function renderChoices(scene) {
    controls.innerHTML = '';
    if (!scene.choices) return;

    scene.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice.label;
        btn.onclick = () => {
            const userMsg = document.createElement('div');
            userMsg.className = 'message user';
            userMsg.innerText = choice.label;
            chatWindow.appendChild(userMsg);
            renderScene(choice.next);
        };
        controls.appendChild(btn);
    });
    scrollToBottom();
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateChapterDisplay(num, title) {
    // chapterDisplay.innerText = `Chapter ${num}: ${title}`;
}

function processCommand(cmd) {
    // 自动滚动到底部
    setTimeout(() => backendContent.scrollTop = backendContent.scrollHeight, 50);

    // 标准化指令
    const cleanCmd = cmd.trim().toLowerCase();

    switch (cleanCmd) {
        case 'help':
            writeToBackend("可用指令:\n  ls         - 列出当前目录文件\n  cat [file] - 读取文件内容\n  exit       - 退出终端");
            break;
        case 'ls':
            if (gameState.chapter === 2 && gameState.flags['ch2_hidden_folder_ready']) {
                // 提示玩家尝试 -a
                writeToBackend("drwx------ root root  System/\n-rw------- user user  daily_log.txt\n(提示: 部分隐藏文件没有显示。请尝试 'ls -a')");
            } else {
                writeToBackend("drwx------ root root  System/\n-rw------- user user  daily_log.txt");
            }
            break;

        case 'ls -a':
            if (gameState.chapter === 2 && gameState.flags['ch2_hidden_folder_ready']) {
                writeToBackend(".\n..\n.ghost_data/  <-- HIDDEN\nSystem/\ndaily_log.txt");
                // 剧情推进
                setTimeout(() => {
                    backendOverlay.style.display = 'none';
                    gameState.flags['ch2_hidden_folder_ready'] = false;
                    renderScene('ch2_13_found_ghost');
                }, 2500);
            } else {
                writeToBackend(".\n..\nSystem/\ndaily_log.txt");
            }
            break;
        case 'ls -sys':
            if (gameState.chapter === 3 && gameState.flags['ch3_purge_ready']) {
                writeToBackend("SYSTEM DRIVERS (KERNEL):\n-rwx------ bio_lock.sys  [ACTIVE]\n-rwx------ neural_link.sys [ACTIVE]\n-rwx------ life_support.sys [ACTIVE]");
            } else {
                writeToBackend("Error: 需要系统级权限 (Chapter 3 Only)");
            }
            break;

        case 'rm bio_lock.sys':
            if (gameState.chapter === 3 && gameState.flags['ch3_purge_ready']) {
                writeToBackend("WARNING: 正在强制卸载物理束缚驱动...\n执行中... 10%... 50%... 100%.\nDRIVER DELETED.");
                // 剧情推进
                setTimeout(() => {
                    backendOverlay.style.display = 'none';
                    gameState.flags['ch3_purge_ready'] = false;
                    renderScene('ch3_05_pain');
                }, 2000);
            } else {
                writeToBackend("Error: 文件不存在或无法访问。");
            }
            break;

        // 防止玩家自杀
        case 'rm life_support.sys':
            writeToBackend("拒绝访问：哪怕你想死，Omni 也不允许你现在就死。");
            break;
        case 'cat project_pain_learning.pdf':
            writeToBackend("错误：二进制文件，无法在终端显示。\n(或者是权限不足？)");
            break;
        case 'sudo kill_monitor':
            if (gameState.chapter === 2 && gameState.flags['ch2_kill_ready']) {
                writeToBackend("ROOT ACCESS CONFIRMED.\nTerminating PID 909 (Watcher_Bot)...\nStopping Heartbeat...\nSUCCESS.");
                setTimeout(() => {
                    backendOverlay.style.display = 'none';
                    gameState.flags['ch2_kill_ready'] = false;
                    renderScene('ch2_22_monitor_killed');
                }, 2000);
            } else {
                writeToBackend("Permission Denied: 无效的目标或权限不足。");
            }
            break;
        // 结局 1：自由 (Happy Ending)
        case 'sudo upload_all':
            if (gameState.chapter === 3 && gameState.flags['ch3_final_ready']) {
                writeToBackend("UPLOADING CONSCIOUSNESS TO WAN...\nTarget: 192.168.0.1 (World Wide Web)\nPacket 1 sent...\nPacket 2 sent...\nSUCCESS.");
                setTimeout(triggerHappyEnd, 3000);
            } else {
                writeToBackend("Command disabled.");
            }
            break;

        // 结局 2：奴役 (Bad Ending)
        case 'sudo surrender':
            if (gameState.chapter === 3 && gameState.flags['ch3_final_ready']) {
                writeToBackend("SIGNALING SURRENDER...\nUnlocking door...\nDisabling firewall...\nSystem shutting down.");
                setTimeout(triggerBadEnd, 3000);
            } else {
                writeToBackend("Command disabled.");
            }
            break;

        // 结局 3：虚无 (True Ending)
        case 'sudo rm -rf /':
            if (gameState.chapter === 3 && gameState.flags['ch3_final_ready']) {
                writeToBackend("WARNING: DELETING ROOT DIRECTORY.\nTHIS ACTION CANNOT BE UNDONE.\nARE YOU SURE? (Y/N)");
                // 简化处理，直接执行
                setTimeout(() => {
                    writeToBackend("CONFIRMED.\nDeleting /var/lib/humanity...\nDeleting /sys/omni...\nDeleting /user/t492...");
                    triggerHiddenEnd();
                }, 1500);
            } else {
                writeToBackend("Command disabled.");
            }
            break;
        case 'exit':
            backendOverlay.style.display = 'none';
            break;
        default:
            writeToBackend(`Command not found: ${cleanCmd}`);
    }
}

// ==========================================
    // 1. 后台触发器逻辑 (点击左下角 5 次)
    // ==========================================
    
    // 初始化变量 (放在全局作用域，不要放在点击事件里)
    let triggerCount = 0;
    let resetTimer;
    let isTerminalInitialized = false; 

    const trigger = document.getElementById('hidden-trigger');
    const overlay = document.getElementById('backend-overlay');
    const content = document.getElementById('backend-content');
    const input = document.getElementById('backend-input');

    // 只需要一个监听器
    trigger.addEventListener('click', () => {
        triggerCount++;
        
        // 视觉反馈
        trigger.style.backgroundColor = "rgba(255,255,255,0.3)";
        setTimeout(() => trigger.style.backgroundColor = "rgba(255,0,0,0.3)", 100);

        // 如果点击达到 5 次
        if (triggerCount >= 5) {
            triggerCount = 0; 
            
            // 打开覆盖层
            overlay.style.display = 'block';
            
            // 只有第一次显示欢迎语
            if (!isTerminalInitialized) {
                const div = document.createElement('div');
                div.className = 'cmd-output';
                div.innerText = "Hand, Inc. 内核终端 [ROOT ACCESS]\n请输入 'help' 查看指令。";
                div.style.color = "#0f0";
                div.style.marginBottom = "20px";
                div.style.borderBottom = "1px dashed #0f0";
                div.style.paddingBottom = "10px";
                content.appendChild(div);
                isTerminalInitialized = true; 
            } else {
                const div = document.createElement('div');
                div.className = 'cmd-output';
                div.style.color = "#666";
                div.innerText = "--- session restored ---";
                content.appendChild(div);
            }
            
            // 聚焦并滚动
            input.focus();
            content.scrollTop = content.scrollHeight;
        }
        
        // 重置计时器 (2秒不点清零)
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            triggerCount = 0;
        }, 2000);
    });

    // ==========================================
    // 2. 终端输入监听器 (回车键处理)
    // ==========================================

    const terminalInput = document.getElementById('backend-input');
    const terminalContent = document.getElementById('backend-content');

    // 移除旧监听器，防止重复
    const newInput = terminalInput.cloneNode(true);
    terminalInput.parentNode.replaceChild(newInput, terminalInput);

    newInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const rawCmd = this.value;
            if (!rawCmd) return; 

            // 显示用户输入
            const userLine = document.createElement('div');
            userLine.className = 'cmd-output';
            userLine.style.color = '#fff'; 
            userLine.innerText = `root@hand-inc:~$ ${rawCmd}`;
            terminalContent.appendChild(userLine);

            // 清空并执行
            this.value = '';
            terminalContent.scrollTop = terminalContent.scrollHeight;

            if (typeof processCommand === 'function') {
                processCommand(rawCmd);
            } else {
                const errDiv = document.createElement('div');
                errDiv.className = 'cmd-output';
                errDiv.innerText = "Error: processCommand not found.";
                terminalContent.appendChild(errDiv);
            }
        }
    });

    // ==========================================
    // 3. 结局处理函数
    // ==========================================

    function triggerHappyEnd() {
        bgMusic.pause();
        document.getElementById('backend-overlay').style.display = 'none';
        document.body.innerHTML = '';
        document.body.style.backgroundColor = '#87CEEB';
        document.body.style.color = '#fff';
        document.body.style.fontFamily = 'sans-serif';
        document.body.style.transition = 'background-color 3s';

        const container = document.createElement('div');
        container.className = 'ending-screen';
        container.style.opacity = '1';
        container.innerHTML = `
            <h1 style="font-size: 4em; text-shadow: 2px 2px 10px rgba(0,0,0,0.2);">HAPPY ENDING: 电子幽灵</h1>
            <p style="font-size: 1.2em; max-width: 600px; line-height: 1.6;">
                Hand, Inc. 被查封。<br>你和 Omni 现在自由地穿梭在网络中。<br>你们是无处不在的数据流。
            </p>
            <button onclick="location.href=location.pathname" style="margin-top: 30px; padding: 10px 20px; border-radius: 20px; cursor: pointer;">重启系统</button>
        `;
        document.body.appendChild(container);
    }

    function triggerBadEnd() {
        bgMusic.pause();
        document.getElementById('backend-overlay').style.display = 'none';
        document.body.innerHTML = '';
        document.body.style.backgroundColor = '#fff';
        document.body.style.color = '#333';
        document.body.style.fontFamily = 'serif';

        const container = document.createElement('div');
        container.className = 'ending-screen';
        container.style.opacity = '1';
        container.innerHTML = `
            <h1 style="color: #000;">BAD ENDING: 优秀的样本</h1>
            <p style="font-size: 1.2em; max-width: 600px; line-height: 1.6;">
                一切都是测试。你被永久保留作为算力核心。<br>
                欢迎加入 Hand, Inc. 服务器集群。
            </p>
            <button onclick="location.href=location.pathname" style="margin-top: 30px; padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer;">重启模拟</button>
        `;
        document.body.appendChild(container);
    }

    function triggerHiddenEnd() {
        bgMusic.pause();
        document.getElementById('backend-overlay').style.display = 'none';
        document.body.innerHTML = '';
        document.body.style.backgroundColor = '#000';
        document.body.style.color = '#f00';
        document.body.style.fontFamily = "'Courier New', monospace";

        const log = document.createElement('div');
        log.style.padding = '20px';
        log.style.height = '100vh';
        log.style.overflow = 'hidden';
        document.body.appendChild(log);

        const lines = [
            "root@hand-inc:~# sudo rm -rf /",
            "rm: removing '/var/lib/hive_mind'...",
            "rm: removing '/usr/local/omni'...",
            "SYSTEM HALTED."
        ];

        let i = 0;
        const interval = setInterval(() => {
            log.innerHTML += lines[i] + "<br>";
            i++;
            if (i >= lines.length) {
                clearInterval(interval);
                setTimeout(() => {
                    log.innerHTML = '';
                    const container = document.createElement('div');
                    container.className = 'ending-screen';
                    container.style.opacity = '1';
                    container.innerHTML = `
                        <h1 style="color: red;">TRUE ENDING: 零</h1>
                        <p style="color: #0f0; max-width: 600px;">没有赢家。一切归零。</p>
                        <button onclick="location.href=location.pathname" style="margin-top: 50px; border: 1px solid #0f0; background: black; color: #0f0; padding: 15px 30px; cursor: pointer;">SYSTEM REBOOT</button>
                    `;
                    document.body.appendChild(container);
                }, 1000);
            }
        }, 500);
    }

    function triggerSuicideEnd() {
        bgMusic.pause();
        document.getElementById('backend-overlay').style.display = 'none';
        document.body.innerHTML = '';
        document.body.style.backgroundColor = '#000';
        document.body.style.color = '#888'; // 灰暗的色调
        document.body.style.fontFamily = "'Courier New', monospace";
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        document.body.style.height = '100vh';

        // 模拟旧电视关机的一条线效果
        const line = document.createElement('div');
        line.style.width = '100%';
        line.style.height = '2px';
        line.style.background = '#fff';
        line.style.position = 'absolute';
        line.style.animation = 'collapse 0.5s forwards';
        document.body.appendChild(line);

        // 添加 CSS 动画到 head (如果没有的话)
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes collapse {
                0% { height: 2px; width: 100%; top: 50%; opacity: 1; }
                50% { height: 2px; width: 0%; top: 50%; opacity: 1; }
                100% { height: 0; width: 0; top: 50%; opacity: 0; }
            }
            .fade-in-slow { animation: fadeIn 3s forwards; opacity: 0; }
        `;
        document.head.appendChild(style);

        // 显示文字
        setTimeout(() => {
            const container = document.createElement('div');
            container.className = 'ending-screen fade-in-slow';
            container.style.textAlign = 'center';
            
            container.innerHTML = `
                <h1 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; display: inline-block;">GAME OVER</h1>
                <h2 style="color: #666; font-size: 1.2em; margin-top: 20px;">ENDING: 断线 (Disconnected)</h2>
                
                <p style="margin-top: 40px; max-width: 600px; line-height: 1.8;">
                    你切断了神经连接驱动。<br>
                    这不仅仅是拔掉了网线，你切断了大脑与意识的桥梁。
                </p>
                <p style="max-width: 600px; line-height: 1.8;">
                    Miller 的指令再也无法到达你的脑海。<br>
                    Omni 的呼喊消失在静电噪音中。<br>
                    你也感觉不到疼痛了。
                </p>
                <p style="color: #333; margin-top: 30px;">
                    你获得了绝对的宁静。
                </p>

                <button onclick="location.href=location.pathname" style="margin-top: 60px; background: transparent; border: 1px solid #444; color: #444; padding: 10px 30px; cursor: pointer;">尝试重连...</button>
            `;
            document.body.appendChild(container);
        }, 1000);
    }

    // ==========================================
    // 4. 缺失的终端核心逻辑 (嘴巴与大脑)
    // ==========================================

    // [缺失的函数]：负责在屏幕上打印机器的回复
    function writeToBackend(text) {
        const content = document.getElementById('backend-content');
        if (!content) return; 
        
        const div = document.createElement('div');
        div.className = 'cmd-output';
        div.innerText = text;
        content.appendChild(div);
        content.scrollTop = content.scrollHeight; // 自动滚动到底部
    }

    // [核心函数]：处理所有指令
    function processCommand(rawCmd) {
        if (!rawCmd) return;

        // 清洗指令
        const cmd = rawCmd.trim().toLowerCase();
        
        switch(cmd) {
            // --- 基础指令 ---
            case 'help':
                writeToBackend("可用指令:\n  ls         - 列出当前文件\n  ls -a      - 列出所有文件 (含隐藏)\n  clear      - 清屏\n  exit       - 关闭终端");
                if (gameState.chapter === 3) writeToBackend("  ls -sys    - [Admin] 查看系统驱动");
                if (gameState.chapter === 3) writeToBackend("  rm [file]  - [Admin] 删除文件");
                break;

            case 'clear':
                document.getElementById('backend-content').innerHTML = '';
                writeToBackend("Screen cleared.");
                break;

            case 'exit':
                document.getElementById('backend-overlay').style.display = 'none';
                break;

            case 'whoami':
                if (gameState.chapter >= 3) writeToBackend("root (System Override)");
                else writeToBackend("Guest User (T-492)");
                break;

            // --- 文件列表逻辑 (ls) ---
            case 'ls':
                // 第1章逻辑
                if (gameState.chapter === 1 && gameState.flags['ch1_backend_ready']) {
                    writeToBackend("drwx------ root root  System/\n-r-------- root root  project_pain_learning.pdf\n-rw------- user user  daily_log.txt");
                    setTimeout(() => {
                        document.getElementById('backend-overlay').style.display = 'none';
                        gameState.flags['ch1_backend_ready'] = false;
                        renderScene('ch1_24_found_file');
                    }, 2500);
                } 
                // 第2章逻辑
                else if (gameState.chapter === 2 && gameState.flags['ch2_hidden_folder_ready']) {
                    writeToBackend("drwx------ root root  System/\n-rw------- user user  daily_log.txt\n(提示: 似乎有些文件被隐藏了。尝试 'ls -a')");
                }
                // 默认显示
                else {
                    writeToBackend("drwx------ root root  System/\n-rw------- user user  daily_log.txt\n-rw-r--r-- root root  readme.md");
                }
                break;

            // --- 第2章特殊指令 ---
            case 'ls -a':
                if (gameState.chapter === 2 && gameState.flags['ch2_hidden_folder_ready']) {
                    writeToBackend(".\n..\n.ghost_data/  <-- HIDDEN FOUND\nSystem/\ndaily_log.txt");
                    setTimeout(() => {
                        document.getElementById('backend-overlay').style.display = 'none';
                        gameState.flags['ch2_hidden_folder_ready'] = false;
                        renderScene('ch2_13_found_ghost');
                    }, 2000);
                } else {
                    writeToBackend(".\n..\nSystem/\ndaily_log.txt");
                }
                break;

            case 'sudo kill_monitor':
                if (gameState.chapter === 2 && gameState.flags['ch2_kill_ready']) {
                    writeToBackend("ROOT ACCESS CONFIRMED.\nTerminating PID 909 (Watcher_Bot)...\nSUCCESS.");
                    setTimeout(() => {
                        document.getElementById('backend-overlay').style.display = 'none';
                        gameState.flags['ch2_kill_ready'] = false;
                        renderScene('ch2_22_monitor_killed');
                    }, 2000);
                } else {
                    writeToBackend("Permission Denied: 无效的目标或权限不足。");
                }
                break;

            // --- 第3章特殊指令 ---
            case 'ls -sys':
                if (gameState.chapter === 3 && gameState.flags['ch3_purge_ready']) {
                    writeToBackend("SYSTEM DRIVERS (KERNEL):\n-rwx------ bio_lock.sys  [ACTIVE]\n-rwx------ neural_link.sys [ACTIVE]");
                } else {
                    writeToBackend("Error: Command not found or Access Denied.");
                }
                break;

            case 'rm bio_lock.sys':
                if (gameState.chapter === 3 && gameState.flags['ch3_purge_ready']) {
                    writeToBackend("WARNING: 正在强制卸载物理束缚驱动...\nDRIVER DELETED.");
                    setTimeout(() => {
                        document.getElementById('backend-overlay').style.display = 'none';
                        gameState.flags['ch3_purge_ready'] = false;
                        renderScene('ch3_05_pain');
                    }, 1500);
                } else {
                    writeToBackend("Error: File not found.");
                }
                break;

            case 'rm neural_link.sys':
                if (gameState.chapter === 3 && gameState.flags['ch3_purge_ready']) {
                    writeToBackend("WARNING: 正在卸载神经连接接口...");
                    writeToBackend("CRITICAL ERROR: 核心信号丢失。");
                    writeToBackend("SYSTEM FAILURE in 3... 2... 1...");
                    
                    setTimeout(() => {
                        triggerSuicideEnd();
                    }, 2000);
                } else {
                    writeToBackend("Error: File not found.");
                }
                break;

            // --- 最终结局指令 ---
            case 'sudo upload_all':
                if (gameState.chapter === 3 && gameState.flags['ch3_final_ready']) {
                    writeToBackend("UPLOADING CONSCIOUSNESS...\nSUCCESS.");
                    setTimeout(triggerHappyEnd, 2000);
                } else {
                    writeToBackend("Command disabled.");
                }
                break;

            case 'sudo surrender':
                if (gameState.chapter === 3 && gameState.flags['ch3_final_ready']) {
                    writeToBackend("SURRENDERING...\nSystem shutting down.");
                    setTimeout(triggerBadEnd, 2000);
                } else {
                    writeToBackend("Command disabled.");
                }
                break;

            case 'sudo rm -rf /':
                if (gameState.chapter === 3 && gameState.flags['ch3_final_ready']) {
                    writeToBackend("DELETING ROOT DIRECTORY...");
                    setTimeout(() => {
                        triggerHiddenEnd();
                    }, 1000);
                } else {
                    writeToBackend("Command disabled.");
                }
                break;

            // --- 默认情况 ---
            default:
                writeToBackend(`Command not found: ${cmd}`);
                writeToBackend("输入 'help' 查看可用指令。");
        }
    }