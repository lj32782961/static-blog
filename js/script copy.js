document.addEventListener('DOMContentLoaded', () => {
    // 导航菜单展开/收起
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-menu .nav-list');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
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