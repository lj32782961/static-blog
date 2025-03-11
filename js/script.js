document.addEventListener('DOMContentLoaded', () => {
    // 导航菜单展开/收起
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-menu .nav-list');
    const navLinks = document.querySelectorAll('.nav-list li a');
    // 检查元素是否存在
    if (menuToggle && navList) {
        // 点击菜单按钮切换菜单显示
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡到document
            navList.classList.toggle('active');
        });

        // 点击菜单内的链接关闭菜单
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
            });
        });

        // 点击页面空白处关闭菜单
        document.addEventListener('click', (e) => {
            // 如果点击的不是菜单本身或菜单按钮，则关闭菜单
            if (!navList.contains(e.target) && !menuToggle.contains(e.target)) {
                navList.classList.remove('active');
            }
        });
        
    }


    // 主页加载
    if (document.querySelector('.article-blocks')) {
        loadHomeBlocks();
        setupSearch();
    }

    // “查看更多”页面加载
    if (document.querySelector('.full-list') && typeof currentCategory !== 'undefined') {
        loadFullList(currentCategory);
    }

    // 主页block加载
    function loadHomeBlocks() {
        const blocks = document.querySelectorAll('.block');
        blocks.forEach(block => {
            const category = block.id;
            fetch(`data/${category}.json`)
                .then(response => {
                    if (!response.ok) throw new Error('文件不存在');
                    return response.json();
                })
                .then(articles => {
                    const articleList = block.querySelector('.article-list');
                    articleList.innerHTML = '';
                    if (articles.length === 0) {
                        articleList.innerHTML = '<li>暂无文章</li>';
                        block.querySelector('.more-link').style.display = 'none';
                        return;
                    }
                    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
                    const latestArticles = articles.slice(0, 10);
                    latestArticles.forEach(article => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                        <i class="bullet">•</i>
                        <a href="data/${article.url}">${article.title}</a>
                        <span class="article-date">${article.date}</span>
                    `;
                        articleList.appendChild(li);
                    });
                    block.querySelector('.more-link').style.display = articles.length > 10 ? 'block' : 'none';
                })
                .catch(() => {
                    const articleList = block.querySelector('.article-list');
                    articleList.innerHTML = '<li>暂无文章</li>';
                    block.querySelector('.more-link').style.display = 'none';
                });
        });
    }

    // “查看更多”页面分页加载
    function loadFullList(category) {
        const articleList = document.querySelector(`#${category}-list`);
        const prevBtn = document.querySelector('#prev-page');
        const nextBtn = document.querySelector('#next-page');
        const pageInfo = document.querySelector('#page-info');
        const itemsPerPage = 10;
        let currentPage = 1;

        // 清空列表，防止显示上一次数据
        articleList.innerHTML = '';

        fetch(`../data/${category}.json`)
            .then(response => {
                if (!response.ok) throw new Error('文件不存在');
                return response.json();
            })
            .then(articles => {
                if (articles.length === 0) {
                    articleList.innerHTML = '<li>暂无文章</li>';
                    pageInfo.textContent = '第 1 页 / 共 1 页';
                    prevBtn.disabled = true;
                    nextBtn.disabled = true;
                    return;
                }

                articles.sort((a, b) => new Date(b.date) - new Date(a.date));

                function renderPage(page) {
                    articleList.innerHTML = '';
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;
                    const paginatedArticles = articles.slice(start, end);
                    
                    paginatedArticles.forEach(article => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                        <i class="bullet">•</i>
                        <a href="${article.url}">${article.title}</a>
                        <span class="article-date">${article.date}</span>
                    `;
                        articleList.appendChild(li);
                    });
                    
                    const totalPages = Math.ceil(articles.length / itemsPerPage);
                    pageInfo.textContent = `第 ${page} 页 / 共 ${totalPages} 页`;
                    prevBtn.disabled = page === 1;
                    nextBtn.disabled = page === totalPages;
                }

                prevBtn.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderPage(currentPage);
                    }
                });

                nextBtn.addEventListener('click', () => {
                    if (currentPage < Math.ceil(articles.length / itemsPerPage)) {
                        currentPage++;
                        renderPage(currentPage);
                    }
                });

                renderPage(currentPage);
            })
            .catch(() => {
                articleList.innerHTML = '<li>暂无文章</li>';
                pageInfo.textContent = '第 1 页 / 共 1 页';
                prevBtn.disabled = true;
                nextBtn.disabled = true;
            });
    }

    // 搜索功能
    function setupSearch() {
        const searchInput = document.querySelector('#search-input');
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const blocks = document.querySelectorAll('.block');
            blocks.forEach(block => {
                const category = block.id;
                fetch(`data/${category}.json`)
                    .then(response => {
                        if (!response.ok) throw new Error('文件不存在');
                        return response.json();
                    })
                    .then(articles => {
                        const articleList = block.querySelector('.article-list');
                        articleList.innerHTML = '';
                        const filteredArticles = articles.filter(article => 
                            article.title.toLowerCase().includes(query)
                        ).slice(0, 10);
                        if (filteredArticles.length === 0) {
                            articleList.innerHTML = '<li>无匹配文章</li>';
                        } else {
                            filteredArticles.forEach(article => {
                                const li = document.createElement('li');
                                li.innerHTML = `<a href="${article.url}">${article.title}</a>`;
                                articleList.appendChild(li);
                            });
                        }
                    })
                    .catch(() => {
                        const articleList = block.querySelector('.article-list');
                        articleList.innerHTML = '<li>暂无文章</li>';
                    });
            });
        });
    }
});



        //自定义 菜单
        let selectedText = '';
        const contextMenu = document.getElementById('contextMenu');
        const copyMessage = document.getElementById('copyMessage');
        const translatePopup = document.getElementById('translatePopup');
        // const translateTextarea = translatePopup.querySelector('textarea');
        const translationResult = document.getElementById('translationResult');
        let lastPosition = { x: 0, y: 0 };
        let touchTimer;

        // PC端事件
        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // 移动端事件
        document.addEventListener('touchstart', startTouch);
        document.addEventListener('touchend', endTouch);
        document.addEventListener('touchmove', cancelTouch);

        function startTouch(event) {
            touchTimer = setTimeout(() => {
                handleSelection(event);
            }, 500);
        }

        function endTouch(event) {
            clearTimeout(touchTimer);
            handleSelection(event);
        }

        function cancelTouch() {
            clearTimeout(touchTimer);
        }

        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            // 新增判断：检测选区是否在翻译弹窗内
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                if (translatePopup.contains(container)) {
                    contextMenu.style.display = 'none'; // 确保隐藏菜单
                    return; // 直接返回不处理
                }
            }
            
            if (!selectedText || contextMenu.style.display !== 'block') return;

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const anchorX = (rect.left + rect.right) / 2;
            const anchorY = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
            lastPosition = { x: anchorX, y: anchorY };

            contextMenu.innerHTML = `
                <div class="menu-item" onclick="copyText(this)" data-selected="${selectedText}">复制</div>
                <div class="menu-divider">|</div>
                <div class="menu-item" onclick="translateText(this)" data-selected="${selectedText}">翻译</div>
            `;
            smartPosition(contextMenu, anchorX, anchorY);
        });

        function handleSelection(event) {
            const selection = window.getSelection();
            selectedText = selection.toString().trim();

            // 新增判断：检测事件目标是否在翻译弹窗内，如果在，则不弹出自定义菜单
            if (event.target && translatePopup.contains(event.target)) {
                return;
            }
            if (!selectedText) {
                contextMenu.style.display = 'none';
                // translatePopup.style.display = 'none';
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const eventPos = getEventPosition(event);

            let anchorX = eventPos.x;
            let anchorY = rect.top < window.innerHeight / 2 ? rect.bottom : rect.top;
            if (rect.width === 0 && rect.height === 0) {
                anchorX = eventPos.x;
                anchorY = eventPos.y;
            } else {
                anchorX = (rect.left + rect.right) / 2;
            }

            contextMenu.innerHTML = `
                <div class="menu-item" onclick="copyText(this)" data-selected="${selectedText}">复制</div>
                <div class="menu-divider">|</div>
                <div class="menu-item" onclick="translateText(this)" data-selected="${selectedText}">翻译</div>
            `;
            smartPosition(contextMenu, anchorX, anchorY);
            lastPosition = { x: anchorX, y: anchorY };
            // translatePopup.style.display = 'none';
        }

        function smartPosition(element, anchorX, anchorY) {
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        
            // 判断是否为移动端（可根据需求调整阈值）
            const isMobile = viewport.width <= 768; // 常见移动端断点
        
            element.style.display = 'block';
            const menuRect = element.getBoundingClientRect();
        
            if (isMobile && element.id === 'translatePopup') {
                // 移动端翻译弹窗特殊处理
                element.style.position = 'fixed';
                element.style.top = '50%';
                element.style.left = '50%';
                element.style.transform = 'translate(-50%, -50%)';
                element.style.maxWidth = '90vw';
                element.style.maxHeight = '80vh';
                element.style.overflowY = 'auto';
                return; // 直接返回不执行后续定位逻辑
            } else {
                // 恢复默认定位方式
                element.style.position = 'absolute';
                element.style.transform = 'none';
            }
        
            // 原有PC端定位逻辑
            let top = anchorY - menuRect.height - 30;
            let direction = 'up';
            if (top < 30 || anchorY > viewport.height / 2) {
                top = anchorY + 30;
                direction = 'down';
            }
            top = Math.max(30, Math.min(top, viewport.height - menuRect.height - 30));
            let left = anchorX - menuRect.width / 2;
            left = Math.max(10, Math.min(left, viewport.width - menuRect.width - 10));
        
            element.style.top = `${top + window.scrollY}px`;
            element.style.left = `${left + window.scrollX}px`;
            element.className = direction === 'up' ? 'upward' : '';
        
            // 通用尺寸限制
            element.style.maxHeight = `${Math.min(600, viewport.height - 60)}px`;
            element.style.maxWidth = `${Math.min(500, viewport.width - 40)}px`;
        }

        function getEventPosition(event) {
            if (event.type === 'touchend' || event.type === 'touchstart') {
                const touch = event.changedTouches[0] || event.touches[0];
                return { x: touch.clientX, y: touch.clientY };
            }
            return { x: event.clientX, y: event.clientY };
        }

        
        //全局点击事件监听，用于在点击非菜单/弹窗区域时关闭它们
        document.addEventListener('click', (e) => {
            // 判断点击目标是否既不在上下文菜单内，也不在翻译弹窗内
            if (!contextMenu.contains(e.target) && !translatePopup.contains(e.target)) {
                // 隐藏上下文菜单
                contextMenu.style.display = 'none';
                // 隐藏翻译弹窗
                translatePopup.style.display = 'none';
            }
        });
        // 阻止翻译弹窗内的点击事件冒泡
        translatePopup.addEventListener('click', (e) => {
                e.stopPropagation();
        });
        // 阻止翻译弹窗的所有触摸事件冒泡
        translatePopup.addEventListener('touchstart', (e) => e.stopPropagation());
        translatePopup.addEventListener('touchmove', (e) => e.stopPropagation());
        translatePopup.addEventListener('touchend', (e) => e.stopPropagation());


        // 窗口大小变化时重新定位
        window.addEventListener('resize', () => {
            if (contextMenu.style.display === 'block') {
                smartPosition(contextMenu, lastPosition.x, lastPosition.y);
            }
            if (translatePopup.style.display === 'block') {
                smartPosition(translatePopup, lastPosition.x, lastPosition.y);
            }
        });

        //          * 初始化时阻止菜单内点击事件冒泡
//         * 
//         * 功能说明：
//         * 1. 在页面DOM加载完成后执行
//         * 2. 为自定义菜单(contextMenu)添加点击事件监听器
//         * 3. 阻止菜单内部的点击事件冒泡到父元素或文档
//         * 
//         * 实现逻辑：
//         * - 使用 DOMContentLoaded 事件确保DOM完全加载后再绑定事件
//         * - 使用 stopPropagation() 方法阻止事件冒泡
//         * 
//         * 作用：
//         * - 防止菜单内部的点击事件触发全局点击事件处理器
//         * - 避免菜单在点击内部选项时意外关闭
//         * 
//         * 注意：
//         * - 需要与全局点击事件处理器配合使用
//         * - 确保菜单内部的点击操作不会影响外部逻辑
//         */
        document.addEventListener('DOMContentLoaded', () => {
            // 为自定义菜单添加点击事件监听器
            contextMenu.addEventListener('click', (e) => {
                // 阻止事件冒泡，避免触发父元素或文档的点击事件
                e.stopPropagation();
            });
        });

        // 复制
        function copyText(element) {
            const selectedText = element.dataset.selected;
            element.classList.add('clicked');
            setTimeout(() => element.classList.remove('clicked'), 300);

            if (!selectedText) {
                alert('没有选中文本可复制');
                contextMenu.style.display = 'none';
                return;
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(selectedText)
                    .then(() => {
                        showCopySuccess();
                    })
                    .catch(err => {
                        console.error('Clipboard API 复制失败:', err);
                        fallbackCopy(selectedText);
                    });
            } else {
                fallbackCopy(selectedText);
            }
        }

        function fallbackCopy(text) {
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showCopySuccess();
                } else {
                    alert('复制失败，请手动复制');
                }
            } catch (err) {
                alert('复制失败，请手动复制');
            }
            document.body.removeChild(tempInput);
        }

        function showCopySuccess() {
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2000);
            contextMenu.style.display = 'none';
        }

        // 在全局添加翻译状态标识
        let isTranslating = false;

        // 翻译功能
        async function translateText(element) {
            if (isTranslating) return;
            const selectedText = element.dataset.selected.trim();//trim() 方法去掉了字符串开头和结尾的空格符（包括空格、制表符和换行符）。

            if (!selectedText) {
                showTranslationResult('⚠️ 请输入要翻译的内容');
                return;
            }

            try{
                isTranslating = true;
                element.classList.add('loading');
                contextMenu.style.display = 'none';

                // 调用Gemini API，调用翻译函数
                // console.log(`在function translateText-selectedText: ${selectedText}`);
                const translated = await translateWithGemini(selectedText);
                showTranslationResult(translated);

            }catch(error){
                console.log('翻译失败：',error);
                showTranslationResult(`⚠️ 翻译失败: ${error.message}`);
            } finally{
                isTranslating = false;
                element.classList.remove('loading');
            }
            
            element.classList.add('clicked');
            setTimeout(() => element.classList.remove('clicked'), 300);
            
            contextMenu.style.display = 'none';
            // translateTextarea.value = translated;
            // translatePopup.style.display = 'block';
            // smartPosition(translatePopup, lastPosition.x, lastPosition.y);
            
            element.addEventListener('click', (e) => e.stopPropagation());
        }

        function closeTranslatePopup() {
            translatePopup.style.display = 'none';
        }

        // 统一显示翻译结果
        function showTranslationResult(result) {
            // // translateTextarea.value = result;
            translationResult.innerHTML = result;  // 使用innerHTML而不是value
            translatePopup.style.display = 'block';
            smartPosition(translatePopup, lastPosition.x, lastPosition.y);
        }


        const contentLang = document.querySelector('meta[name="content-lang"]').content;
        // 专用翻译API调用函数
        async function translateWithGemini(text) {
        // async function translateWithGemini(text, retryCount = 2) {//retryCount = 2有点多余
            try {
                // const targetLang = navigator.language.startsWith('zh') ? '英文' : '简体中文';
                // const prompt = `请将以下内容翻译为${targetLang}，只需返回译文不要任何解释：\n"${text}"`;
                // ，英文，德语的另外两种语言并给出该对应语言的例句以及例句的中文翻译。按照以下格式输出：\n检测到的语言：中文 \n**翻译：** \n* **英文:** stapler \n* **例句:** I need a stapler to fasten these papers together. 我需要一个订书机来把这些纸订在一起。\n* **德文:** Hefter \n* **例句:** Der Hefter ist kaputt. 订书机坏了。
                let symbol = "#";
            let prompt = symbol + text + symbol

            if (contentLang === "中文") {
                prompt = prompt + `翻译${symbol}中的内容，并严格按照以下格式输出：
            **原文：** ${text}
            **语言：**${contentLang}
            ----------------------------------
            **德语：**
            **翻译：**
            **例句：**
            **例句中文翻译：**
            ----------------------------------
            **英语：**
            **翻译：**
            **例句：**
            **例句中文翻译：**
            `;
            }else if (contentLang === "英语"){
                prompt = prompt + `翻译${symbol}中的内容，并严格按照以下格式输出：
            **原文：** ${text}
            **语言：**${contentLang}
            ----------------------------------
            **德语：**
            **翻译：**
            **例句：**
            **例句中文翻译：**
            ----------------------------------
            **中文：**
            **翻译：**
            **例句：** (可选，如无例句可不提供)
            **例句中文翻译：** (可选，如无例句可不提供)
            `;
            }else if (contentLang ==="德语"){
                prompt = prompt + `翻译${symbol}中的内容，并严格按照以下格式输出：
            **原文：** ${text}
            **语言：**${contentLang}
            ----------------------------------
            **翻译：**
            **例句1：**
            **例句1中文翻译：**
            **例句2：**
            **例句2中文翻译：**
            ----------------------------------
            **中文精讲：** (请提供详细解释，包含语法点和文化背景等)
            ----------------------------------
            **英语：**
            **翻译：**
            **例句：**
            **例句中文翻译：**
            `;
            }
            // console.log(prompt);

                const responseText = await sendMessageToAPI(prompt);
                
                // 清理响应内容
                let cleanedText = responseText
                    .replace(/["“”]/g, '')
                    .replace(/^\s*Translation:\s*/i, '')
                    .trim();

                try {
                    const htmlText = marked.parse(cleanedText);
                    // 使用 DOMPurify 消毒 HTML
                    const sanitizedHtml = DOMPurify.sanitize(htmlText);
                    return sanitizedHtml;
                } catch (markdownError) {
                    console.error("Markdown 解析错误:", markdownError);
                    return `<p>Markdown 解析错误: ${markdownError.message}</p>`; // 返回错误信息
                }
            } catch (error) {
                // if (retryCount > 0) {
                //     console.log(`剩余重试次数: ${retryCount}`);
                //     await new Promise(resolve => setTimeout(resolve, 1000));
                //     return translateWithGemini(text, retryCount - 1);
                // }
                throw new Error(`翻译失败: ${error.message}`);
            }
        }

        async function sendMessageToAPI(message) {
            const modelName = "gemini-1.5-flash";
            const maxToken = 100000;
            const RETRY_DELAY = 2000;
            const MAX_RETRIES = keys.length;
            let retries = MAX_RETRIES;
            let lastError = null;
            let currentApiKeyIndex = Math.floor(Math.random() * keys.length);
            const initialIndex = currentApiKeyIndex;

            while (retries > 0) {
                try {
                    const currentApiKey = keys[currentApiKeyIndex];
                    // console.log(`尝试使用 API Key [${currentApiKeyIndex}]: ${currentApiKey.slice(0, 8)}****`);

                    // 添加请求超时控制
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 120000);

                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "x-goog-api-key": currentApiKey
                            },
                            body: JSON.stringify({
                                contents: [{
                                    parts: [{ text: message }]
                                }],
                                generationConfig: {
                                    maxOutputTokens: maxToken
                                }
                            }),
                            signal: controller.signal
                        }
                    );

                    clearTimeout(timeoutId);

                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error?.message || `HTTP 错误: ${response.status}`);
                    }

                    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                        throw new Error("无效的 API 响应结构");
                    }

                    // 成功时返回清理后的结果
                    return data.candidates[0].content.parts[0].text.trim();

                } catch (error) {
                    console.error(`请求失败 (Key ${currentApiKeyIndex}):`, error);
                    lastError = error;
                    
                    // 轮换到下一个 Key
                    currentApiKeyIndex = (currentApiKeyIndex + 1) % keys.length;
                    retries--;

                    // 完整轮换一轮后添加延迟
                    if (currentApiKeyIndex === initialIndex) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                    }
                }
            }

            throw new Error(`所有 API Key 均失败，，请稍后刷新重试。 ${lastError?.message || "未知错误"}`);
        }


        // 异步加载配置
        async function loadConfig() {
            try {
            const response = await fetch('../assets/config.json');
            const config = await response.json();
            keys = config.keys;
            
            if (keys.length === 0) {
                throw new Error("秘钥配置为空");
            }
            
            //   console.log("配置加载成功");
            } catch (error) {
            console.error("配置加载失败:", error);
            }
        }
        // 页面初始化时加载
        window.addEventListener('DOMContentLoaded', loadConfig);
