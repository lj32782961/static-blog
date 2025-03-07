// 分享内容配置
const shareData = {
    title:document.title || '网页标题', // 自动获取页面标题
    text: document.getElementById('summary')?.textContent || '默认摘要', // 获取特定元素内容
    url: '链接： ' + window.location.href // 当前页面URL
};

const shareData0 = {
    // title:document.title || '网页标题', // 自动获取页面标题
    // text:document.title+'\n'+ document.getElementById('summary')?.textContent || '默认摘要' +'链接： '+ '\n'+ window.location.href, // 获取特定元素内容
    text: `${document.title}\n${document.getElementById('summary')?.textContent || '   '}\n链接： ${window.location.href}`,
    // url: '链接： '+window.location.href // 当前页面URL
};

async function shareContent() {
    try {
        // 首先尝试使用 Web Share API (适用于支持的移动设备和浏览器)
        if (navigator.share) {
            await navigator.share(shareData0);
            console.log('分享成功~');
        } else {
            // 如果不支持Web Share API，执行复制到剪贴板
            copyToClipboard();
        }
    } catch (error) {
        // 如果分享失败，也执行复制到剪贴板
        console.log('分享出错:', error);
        copyToClipboard();
    }
}

function copyToClipboard() {
    // 组合分享内容
    const textToCopy = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
    
    // 使用 Clipboard API 复制到剪贴板
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            alert('已复制到剪贴板！\n你可以粘贴到其他APP分享\n内容如下:\n\n' + textToCopy);
        })
        .catch(err => {
            // 如果Clipboard API失败，使用备用方法
            fallbackCopyText(textToCopy);
        });
}

function fallbackCopyText(text) {
    // 创建临时textarea用于复制
    const textArea = document.createElement('textarea');
    textArea.value = title +'\n'+ text +'\n'+ '链接： ' + url+'\n';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        alert('已复制到剪贴板！\n你可以粘贴到其他APP分享\n内容如下:\n\n' + text);
    } catch (err) {
        alert('复制失败，请手动复制:\n\n' + text);
    }
    document.body.removeChild(textArea);
}