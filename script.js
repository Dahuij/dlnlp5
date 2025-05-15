document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.getElementById('result-container');
    const templateSelect = document.getElementById('template-select');
    const temperatureRange = document.getElementById('temperature-range');
    const temperatureValue = document.getElementById('temperature-value');
    const copyHtmlBtn = document.getElementById('copy-html-btn');
    const exportBtn = document.getElementById('export-btn');
    const apiKeyInput = document.getElementById('api-key');
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const apiTypeSelect = document.getElementById('api-type');
    const modelSelect = document.getElementById('model-select');
    const customEndpointContainer = document.getElementById('custom-endpoint-container');
    const customEndpointInput = document.getElementById('custom-endpoint');
    
    // API密钥显示/隐藏功能
    toggleApiKeyBtn.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKeyBtn.textContent = '隐藏';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKeyBtn.textContent = '显示';
        }
    });
    
    // API类型切换时更新模型列表和端点输入框
    apiTypeSelect.addEventListener('change', () => {
        updateModelList();
        updateDefaultKey();
        
        if (apiTypeSelect.value === 'custom') {
            customEndpointContainer.style.display = 'block';
        } else {
            customEndpointContainer.style.display = 'none';
        }
    });
    
    // 更新默认API密钥（如果有）
    function updateDefaultKey() {
        const apiType = apiTypeSelect.value;
        
        // 清空当前密钥
        if (!apiKeyInput.dataset.userSet) {
            apiKeyInput.value = '';
        }
        
        // 如果有默认密钥，则设置
        if (CONFIG.DEFAULT_KEYS && CONFIG.DEFAULT_KEYS[apiType]) {
            apiKeyInput.value = CONFIG.DEFAULT_KEYS[apiType];
            apiKeyInput.dataset.isDefault = 'true';
        } else {
            apiKeyInput.dataset.isDefault = 'false';
        }
    }
    
    // API密钥输入框焦点事件
    apiKeyInput.addEventListener('focus', () => {
        // 如果是默认密钥，则在获取焦点时清空
        if (apiKeyInput.dataset.isDefault === 'true') {
            apiKeyInput.value = '';
        }
    });
    
    // API密钥输入框输入事件
    apiKeyInput.addEventListener('input', () => {
        // 标记为用户设置的密钥
        if (apiKeyInput.value.trim() !== '') {
            apiKeyInput.dataset.userSet = 'true';
        } else {
            apiKeyInput.dataset.userSet = 'false';
        }
    });
    
    // 更新模型列表
    function updateModelList() {
        // 清空现有选项
        modelSelect.innerHTML = '';
        
        // 获取当前选择的API类型
        const apiType = apiTypeSelect.value;
        
        // 如果是自定义API，添加一个默认选项
        if (apiType === 'custom') {
            const option = document.createElement('option');
            option.value = 'custom-model';
            option.textContent = '自定义模型';
            modelSelect.appendChild(option);
            return;
        }
        
        // 添加相应API类型的模型选项
        CONFIG.MODELS[apiType].forEach(modelName => {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        });
    }
    
    // 尝试从localStorage加载API设置（如果用户之前保存过）
    const savedApiKey = localStorage.getItem('api_key');
    const savedApiType = localStorage.getItem('api_type');
    const savedCustomEndpoint = localStorage.getItem('custom_endpoint');
    
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        apiKeyInput.dataset.userSet = 'true';
    }
    
    if (savedApiType) {
        apiTypeSelect.value = savedApiType;
        if (savedApiType === 'custom' && savedCustomEndpoint) {
            customEndpointContainer.style.display = 'block';
            customEndpointInput.value = savedCustomEndpoint;
        }
    }
    
    // 初始化模型列表
    updateModelList();
    
    // 设置默认API密钥（如果有）
    updateDefaultKey();
    
    // 初始化模板选择器
    initTemplateSelector();
    
    // 初始化温度滑块
    temperatureRange.addEventListener('input', () => {
        temperatureValue.textContent = temperatureRange.value;
    });
    
    // 生成按钮点击事件
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        const selectedTemplate = templateSelect.value;
        const temperature = parseFloat(temperatureRange.value);
        const apiKey = apiKeyInput.value.trim();
        const apiType = apiTypeSelect.value;
        const modelName = modelSelect.value;
        const customEndpoint = customEndpointInput.value.trim();
        
        if (!prompt) {
            alert('请输入提示内容！');
            return;
        }
        
        if (!apiKey) {
            alert('请输入API密钥！');
            return;
        }
        
        if (apiType === 'custom' && !customEndpoint) {
            alert('请输入自定义API端点！');
            return;
        }
        
        // 保存API设置到localStorage（如果用户允许）
        if (confirm('是否保存API设置到本地？（仅保存在您的浏览器中）')) {
            localStorage.setItem('api_key', apiKey);
            localStorage.setItem('api_type', apiType);
            if (apiType === 'custom') {
                localStorage.setItem('custom_endpoint', customEndpoint);
            }
        }
        
        // 显示加载状态
        resultContainer.innerHTML = '<p class="loading">正在生成内容，请稍候...</p>';
        generateBtn.disabled = true;
        copyHtmlBtn.disabled = true;
        exportBtn.disabled = true;
        
        try {
            // 调用选定的API
            const generatedContent = await callAPI(
                prompt, 
                selectedTemplate, 
                temperature, 
                apiKey, 
                apiType, 
                modelName, 
                customEndpoint
            );
            displayResult(generatedContent);
            
            // 启用复制和导出按钮
            copyHtmlBtn.disabled = false;
            exportBtn.disabled = false;
        } catch (error) {
            resultContainer.innerHTML = `<p class="error">生成失败：${error.message}</p>`;
        } finally {
            generateBtn.disabled = false;
        }
    });
    
    // 复制HTML按钮点击事件
    copyHtmlBtn.addEventListener('click', () => {
        const htmlContent = resultContainer.innerHTML;
        copyToClipboard(htmlContent);
        alert('HTML已复制到剪贴板！');
    });
    
    // 导出按钮点击事件
    exportBtn.addEventListener('click', () => {
        const htmlContent = resultContainer.innerHTML;
        const fullHtml = generateFullHtml(htmlContent);
        downloadHtml(fullHtml, 'generated-webpage.html');
    });
    
    // 初始化模板选择器
    function initTemplateSelector() {
        CONFIG.TEMPLATES.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            option.title = template.description;
            templateSelect.appendChild(option);
        });
    }
    
    // 统一调用API函数
    async function callAPI(prompt, templateId, temperature, apiKey, apiType, modelName, customEndpoint) {
        // 获取选定模板的提示前缀
        const templatePrompt = CONFIG.TEMPLATES.find(t => t.id === templateId).prompt;
        
        // 组合完整的提示
        const fullPrompt = `${templatePrompt}${prompt}`;
        
        try {
            // 根据API类型选择相应的调用方法
            switch (apiType) {
                case 'openai':
                    return await callOpenAIAPI(fullPrompt, temperature, apiKey, modelName);
                case 'gemini':
                    return await callGeminiAPI(fullPrompt, temperature, apiKey, modelName);
                case 'zhipuai':
                    return await callZhipuAIAPI(fullPrompt, temperature, apiKey, modelName);
                case 'custom':
                    return await callCustomAPI(fullPrompt, temperature, apiKey, modelName, customEndpoint);
                default:
                    throw new Error('不支持的API类型');
            }
        } catch (error) {
            console.error('API调用失败:', error);
            throw new Error(`API调用失败: ${error.message}`);
        }
    }
    
    // 调用OpenAI API
    async function callOpenAIAPI(fullPrompt, temperature, apiKey, modelName) {
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        
        // 构建请求数据
        const requestData = {
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: "你是一位网页设计专家，擅长根据描述生成HTML和CSS代码。"
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ],
            temperature: temperature,
            max_tokens: CONFIG.MODEL_SETTINGS.max_tokens
        };
        
        // 针对不同模型的特殊处理
        if (modelName === "gpt-4o" || modelName === "gpt-4o-mini" || modelName === "o1-mini") {
            // 对最新模型添加特殊提示，以优化生成网页的性能
            requestData.messages[0].content += " 请生成符合现代网页设计标准的响应式HTML代码，重点关注可用性和美观性。";
        }
        
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API错误：${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            // 提取生成的内容
            const generatedContent = data.choices[0].message.content;
            return extractHtmlFromResponse(generatedContent);
        } catch (error) {
            console.error("OpenAI API调用失败：", error);
            throw error;
        }
    }
    
    // 调用Gemini API
    async function callGeminiAPI(fullPrompt, temperature, apiKey, modelName) {
        // 使用CONFIG中的API端点或默认端点
        const apiUrl = CONFIG.API_ENDPOINTS.gemini.url;
        
        // 构建请求数据
        const requestData = {
            model: modelName,
            messages: [
                {
                    role: "user",
                    content: fullPrompt
                }
            ],
            temperature: temperature,
            max_tokens: CONFIG.MODEL_SETTINGS.max_tokens
        };
        
        // 针对不同Gemini模型版本的特殊处理
        if (modelName.includes("1.5") || modelName.includes("2.0") || modelName.includes("2.5")) {
            // 为较新的Gemini模型添加特殊系统提示
            requestData.messages.unshift({
                role: "system",
                content: "你是一位网页设计专家，擅长生成现代、响应式的HTML和CSS代码。请根据用户的描述，提供干净、结构良好的代码。"
            });
        }
        
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API错误：${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            // 提取生成的内容
            const generatedContent = data.choices[0].message.content;
            return extractHtmlFromResponse(generatedContent);
        } catch (error) {
            console.error("Gemini API调用失败：", error);
            throw error;
        }
    }
    
    // 辅助函数：从模型响应中提取HTML内容
    function extractHtmlFromResponse(responseText) {
        let htmlContent = responseText.trim();
        
        // 检查是否有代码块符号
        const codeBlockMatches = htmlContent.match(/```(?:html)?([\s\S]*?)```/);
        if (codeBlockMatches && codeBlockMatches[1]) {
            htmlContent = codeBlockMatches[1].trim();
        }
        
        // 移除Markdown转义
        htmlContent = htmlContent.replace(/\\([`*_{}[\]()#+\-.!])/g, '$1');
        
        return {
            htmlContent: sanitizeHTML(htmlContent)
        };
    }
    
    // 调用智谱AI API
    async function callZhipuAIAPI(fullPrompt, temperature, apiKey, modelName) {
        const apiUrl = CONFIG.API_ENDPOINTS.zhipuai.url;
        
        // 构建请求数据
        const requestData = {
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: "你是一位网页设计专家，擅长创建现代美观的HTML网页。请使用语义化标签和现代CSS技术。"
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ],
            temperature: temperature,
            max_tokens: CONFIG.MODEL_SETTINGS.max_tokens
        };
        
        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API错误：${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            
            // 提取生成的内容
            const generatedContent = data.choices[0].message.content;
            return extractHtmlFromResponse(generatedContent);
        } catch (error) {
            console.error("智谱AI API调用失败：", error);
            throw error;
        }
    }
    
    // 调用自定义API
    async function callCustomAPI(fullPrompt, temperature, apiKey, modelName, endpoint) {
        if (!endpoint) {
            throw new Error('请提供有效的API端点URL');
        }
        
        // 构建请求数据
        const requestData = {
            model: modelName,
            messages: [
                {
                    role: "system",
                    content: "你是一位网页设计专家，精通响应式设计和现代CSS技术。"
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ],
            temperature: temperature,
            max_tokens: CONFIG.MODEL_SETTINGS.max_tokens
        };
        
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error?.message || response.statusText;
                } catch (e) {
                    errorMessage = await response.text() || response.statusText;
                }
                throw new Error(`API错误：${errorMessage}`);
            }
            
            const data = await response.json();
            
            // 尝试从不同格式的响应中提取内容
            let generatedContent = '';
            if (data.choices && data.choices[0]) {
                if (data.choices[0].message) {
                    generatedContent = data.choices[0].message.content;
                } else if (data.choices[0].text) {
                    generatedContent = data.choices[0].text;
                }
            } else if (data.content) {
                generatedContent = data.content;
            } else {
                throw new Error('无法从API响应中提取内容，请检查API返回格式');
            }
            
            return extractHtmlFromResponse(generatedContent);
        } catch (error) {
            console.error("自定义API调用失败：", error);
            throw error;
        }
    }
    
    // 清理和验证HTML，防止XSS攻击
    function sanitizeHTML(html) {
        // 确保结果是有效的HTML片段
        // 如果生成的内容包含完整的HTML文档结构，我们只提取需要的部分
        if (html.includes('<body>') && html.includes('</body>')) {
            const bodyContent = html.match(/<body>([\s\S]*?)<\/body>/i);
            if (bodyContent && bodyContent[1]) {
                html = bodyContent[1].trim();
            }
        }
        
        // 清理可能包含的代码块标记
        html = html.replace(/```html/g, '');
        html = html.replace(/```/g, '');
        
        // 移除可能的脚本标签
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // 如果模型没有返回完整的HTML结构，我们添加一个外层容器
        if (!html.trim().startsWith('<div') && !html.trim().startsWith('<section')) {
            html = `<div class="generated-page">${html}</div>`;
        }
        
        return html;
    }
    
    // 模板生成函数（当API调用失败时作为备选）
    function generateBasicTemplate(prompt) {
        const title = prompt.split('.')[0].trim() || '基于您的提示生成的内容';
        
        return `
            <div class="generated-page">
                <h1>${title}</h1>
                <p class="prompt-info">基于提示: "${prompt}"</p>
                <div class="content">
                    <h2>您的网页已生成</h2>
                    <p>这是一个由AI根据您的描述生成的简单网页。根据您的描述，我们创建了一个基础模板。</p>
                    <p>您可以使用上方的"复制HTML"按钮获取HTML代码，或点击"导出网页文件"下载完整的HTML文件。</p>
                    <div class="section">
                        <h3>关于这个网页</h3>
                        <p>这个网页是根据您的提示"${prompt}"生成的。如果这不是您期望的结果，您可以尝试提供更详细的描述，或者选择不同的模板。</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 显示生成结果的函数
    function displayResult(data) {
        resultContainer.innerHTML = data.htmlContent;
        
        // 为生成的内容添加样式
        addStyles();
    }
    
    // 添加样式
    function addStyles() {
        // 移除之前的样式（如果存在）
        const existingStyle = document.getElementById('generated-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // 创建新样式
        const style = document.createElement('style');
        style.id = 'generated-styles';
        style.textContent = `
            /* 通用样式 */
            .generated-page {
                font-family: 'Microsoft YaHei', sans-serif;
                color: #333;
            }
            
            .generated-page h1 {
                color: #4a6bdf;
                margin-bottom: 15px;
            }
            
            .generated-page h2 {
                color: #3a56b0;
                margin: 15px 0;
            }
            
            .generated-page h3 {
                color: #2a3f80;
                margin: 10px 0;
            }
            
            .generated-page p {
                margin-bottom: 10px;
                line-height: 1.6;
            }
            
            .generated-page img {
                max-width: 100%;
                height: auto;
                display: block;
                margin: 15px auto;
            }
            
            .generated-page ul, .generated-page ol {
                margin-left: 20px;
                margin-bottom: 15px;
            }
            
            .generated-page li {
                margin-bottom: 5px;
            }
            
            .prompt-info {
                color: #777;
                font-style: italic;
                margin-bottom: 20px;
            }
            
            .content {
                border-left: 3px solid #4a6bdf;
                padding-left: 15px;
                margin: 20px 0;
            }
            
            .section {
                margin: 20px 0;
            }
            
            /* 博客模板样式 */
            .blog-header {
                text-align: center;
                border-bottom: 1px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .meta {
                color: #777;
                font-size: 14px;
                margin-top: 10px;
            }
            
            .meta .date {
                margin-right: 20px;
            }
            
            .lead {
                font-size: 18px;
                color: #555;
                margin-bottom: 30px;
            }
            
            .article-section {
                margin: 30px 0;
            }
            
            .blog-footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #777;
            }
            
            /* 作品集模板样式 */
            .portfolio-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .portfolio-intro {
                margin-bottom: 40px;
            }
            
            .portfolio-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 30px;
                margin: 40px 0;
            }
            
            .portfolio-item {
                border: 1px solid #eee;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .portfolio-image {
                height: 180px;
                background-color: #4a6bdf;
            }
            
            .portfolio-item h3 {
                padding: 15px 15px 5px;
            }
            
            .portfolio-item p {
                padding: 0 15px 15px;
            }
            
            .portfolio-footer {
                margin-top: 40px;
                text-align: center;
                font-size: 14px;
                color: #777;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 复制到剪贴板
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
    
    // 生成完整HTML文件
    function generateFullHtml(content) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI生成的网页</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        ${document.getElementById('generated-styles').textContent}
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }
    
    // 下载HTML文件
    function downloadHtml(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
}); 