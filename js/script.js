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



// 菜单
let selectedText = '';
        const contextMenu = document.getElementById('contextMenu');
        const copyMessage = document.getElementById('copyMessage');
        const translatePopup = document.getElementById('translatePopup');
        const translateTextarea = translatePopup.querySelector('textarea');
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

        function smartPosition(element, anchorX, anchorY) {
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            element.style.display = 'block';
            const menuRect = element.getBoundingClientRect();

            let top = anchorY - menuRect.height - 30;
            let direction = 'up';
            if (top < 30 || anchorY > window.innerHeight / 2) {
                top = anchorY + 30;
                direction = 'down';
            }
            top = Math.max(30, Math.min(top, viewport.height - menuRect.height - 30));
            let left = anchorX - menuRect.width / 2;
            left = Math.max(10, Math.min(left, viewport.width - menuRect.width - 10));

            element.style.top = `${top + window.scrollY}px`;
            element.style.left = `${left + window.scrollX}px`;
            element.className = direction === 'up' ? 'upward' : '';
        }

        function getEventPosition(event) {
            if (event.type === 'touchend' || event.type === 'touchstart') {
                const touch = event.changedTouches[0] || event.touches[0];
                return { x: touch.clientX, y: touch.clientY };
            }
            return { x: event.clientX, y: event.clientY };
        }

        function handleSelection(event) {
            const selection = window.getSelection();
            selectedText = selection.toString().trim();
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
        //关闭
        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target) && !translatePopup.contains(e.target)) {
                contextMenu.style.display = 'none';
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

        // 翻译功能
        function translateText(element) {
            const selectedText = element.dataset.selected;
            const translations = {
                '测试': 'test',
                '文字': 'text',
                '效果': 'effect'
            };
            const translated = translations[selectedText] || '翻译结果：' + selectedText.split('').join('');
            
            element.classList.add('clicked');
            setTimeout(() => element.classList.remove('clicked'), 300);
            
            contextMenu.style.display = 'none';
            translateTextarea.value = translated;
            translatePopup.style.display = 'block';
            smartPosition(translatePopup, lastPosition.x, lastPosition.y);
            
            element.addEventListener('click', (e) => e.stopPropagation());
        }

        function closeTranslatePopup() {
            translatePopup.style.display = 'none';
        }

        // 初始化时阻止菜单内点击冒泡
        document.addEventListener('DOMContentLoaded', () => {
            contextMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });