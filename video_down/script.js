document.addEventListener('DOMContentLoaded', function() {
    // 元素获取
    const passwordSection = document.getElementById('password-section');
    const mainSection = document.getElementById('main-section');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const linkInput = document.getElementById('link-input');
    const parseButton = document.getElementById('parse-button');
    const resultContainer = document.getElementById('result-container');
    const videoTitle = document.getElementById('video-title');
    const coverPreview = document.getElementById('cover-preview');
    const videoPreview = document.getElementById('video-preview');
    const downloadCover = document.getElementById('download-cover');
    const downloadVideo = document.getElementById('download-video');

    // 固定密码
    const CORRECT_PASSWORD = '123456';
    
    // API地址前缀
    const API_PREFIX = 'https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk?ak=20830028cf0c4f88afd8ba523ae6222a&link=';
    
    // 当前解析的数据
    let currentData = null;

    // 密码验证
    passwordSubmit.addEventListener('click', function() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            passwordSection.classList.add('hidden');
            mainSection.classList.remove('hidden');
        } else {
            alert('密码错误，请重试！');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    // 回车键提交密码
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordSubmit.click();
        }
    });

    // 解析链接
    parseButton.addEventListener('click', async function() {
        const inputText = linkInput.value.trim();
        if (!inputText) {
            alert('请输入分享链接！');
            return;
        }

        // 提取链接
        const url = extractUrl(inputText);
        if (!url) {
            alert('未找到有效链接，请检查输入！');
            return;
        }

        try {
            // 显示加载状态
            parseButton.textContent = '解析中...';
            parseButton.disabled = true;
            
            // 调用API
            const data = await fetchVideoData(url);
            
            // 保存当前数据
            currentData = data;
            
            // 显示结果
            displayResult(data);
        } catch (error) {
            alert('解析失败：' + error.message);
            console.error('解析失败：', error);
        } finally {
            // 恢复按钮状态
            parseButton.textContent = '开始解析';
            parseButton.disabled = false;
        }
    });

    // 下载封面
    downloadCover.addEventListener('click', function() {
        if (currentData && currentData.content.cover) {
            downloadFile(currentData.content.cover, `封面_${generateFileName(currentData.content.title)}.jpg`);
        }
    });

    // 下载视频
    downloadVideo.addEventListener('click', function() {
        if (currentData && currentData.content.url) {
            downloadFile(currentData.content.url, `视频_${generateFileName(currentData.content.title)}.mp4`);
        }
    });

    // 从文本中提取URL
    function extractUrl(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        return matches ? matches[0] : null;
    }

    // 调用API获取视频数据
    async function fetchVideoData(url) {
        const apiUrl = API_PREFIX + encodeURIComponent(url);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== '10000' || !data.content || !data.content.success) {
            throw new Error(data.msg || '解析失败，请检查链接是否有效');
        }
        
        return data;
    }

    // 代理服务器地址
    const PROXY_SERVER = 'http://localhost:3001';

    // 显示解析结果
    function displayResult(data) {
        const content = data.content;
        
        // 设置标题
        videoTitle.textContent = content.title || '未知标题';
        
        // 设置封面预览
        if (content.cover) {
            // 使用代理服务器获取封面
            const proxiedCoverUrl = `${PROXY_SERVER}/proxy/image?url=${encodeURIComponent(content.cover)}`;
            coverPreview.src = proxiedCoverUrl;
            coverPreview.alt = content.title || '视频封面';
            downloadCover.disabled = false;
        } else {
            coverPreview.src = '';
            coverPreview.alt = '无封面';
            downloadCover.disabled = true;
        }
        
        // 设置视频预览
        if (content.url) {
            // 使用代理服务器获取视频
            const proxiedVideoUrl = `${PROXY_SERVER}/proxy/video?url=${encodeURIComponent(content.url)}`;
            videoPreview.src = proxiedVideoUrl;
            downloadVideo.disabled = false;
        } else {
            videoPreview.src = '';
            downloadVideo.disabled = true;
        }
        
        // 显示结果容器
        resultContainer.classList.remove('hidden');
    }

    // 下载文件
    function downloadFile(url, filename) {
        // 使用代理服务器下载文件
        const isVideo = filename.endsWith('.mp4');
        const proxyEndpoint = isVideo ? 'video' : 'image';
        const proxiedUrl = `${PROXY_SERVER}/proxy/${proxyEndpoint}?url=${encodeURIComponent(url)}`;
        
        const a = document.createElement('a');
        a.href = proxiedUrl;
        a.download = filename;
        a.target = '_blank';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // 生成文件名（去除特殊字符）
    function generateFileName(title) {
        if (!title) return 'download';
        return title.replace(/[\/:*?"<>|#]/g, '_').substring(0, 50);
    }
});