// API配置
const CONFIG = {
    // API端点配置
    API_ENDPOINTS: {
        // OpenAI API端点
        openai: {
            url: "https://api.openai.com/v1/chat/completions",
            defaultModel: "gpt-3.5-turbo"
        },
        // Gemini API端点
        gemini: {
            url: "https://apiv2.aliyahzombie.top/chat/completions",
            defaultModel: "gemini-pro"
        },
        // 智谱AI API端点
        zhipuai: {
            url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
            defaultModel: "glm-4"
        }
    },
    
    // API密钥，需要替换为您的实际API密钥
    API_KEY: "", // 出于安全考虑留空，将在前端页面填写
    
    // 默认试用密钥
    DEFAULT_KEYS: {
        zhipuai: "4b85cbd9921c4794bab3584d0c577ef0.DWN3o6maAdpYBGSD"
    },
    
    // 模型设置
    MODEL_SETTINGS: {
        // 最大生成的令牌数
        max_tokens: 2048,
        
        // 温度参数：控制生成内容的随机性，0-1之间
        // 较低的值使输出更确定性，较高的值使输出更多样化
        temperature: 0.7,
        
        // 惩罚因子，减少重复内容的可能性
        frequency_penalty: 0.0,
        
        // 鼓励模型探索新的话题
        presence_penalty: 0.0
    },
    
    // 可用模型列表
    MODELS: {
        openai: [
            "gpt-3.5-turbo",
            "gpt-4",
            "gpt-4o",
            "gpt-4o-mini",
            "o1-mini"
        ],
        gemini: [
            "gemini-pro",
            "gemini-1.5-pro",
            "gemini-2.0-flash",
            "gemini-2.5-pro-exp-03-25"
        ],
        zhipuai: [
            "glm-4",
            "glm-3-turbo"
        ]
    },
    
    // 网页模板选项
    TEMPLATES: [
        {
            id: "basic",
            name: "基础模板",
            description: "简洁的单页面模板，适合展示简单内容",
            prompt: "你是一位网页设计专家。请根据用户的描述，生成一个简单的单页HTML网页。网页应该包含标题、段落和其他基本元素。生成的HTML应该是完整且语义正确的，可以直接嵌入到网页中。不要包含<!DOCTYPE>、<html>、<head>或<body>标签，只需要返回页面内容部分的HTML。基于以下描述创建HTML内容："
        },
        {
            id: "blog",
            name: "博客模板",
            description: "适合展示文章、博客内容的模板",
            prompt: "你是一位博客写作专家。请根据用户的描述，生成一篇格式化的博客文章HTML。博客应该包含标题、日期、作者、引言、正文内容（包括小标题）和结论。生成的HTML应该是完整且有结构的，可以直接嵌入到网页中。不要包含<!DOCTYPE>、<html>、<head>或<body>标签，只需要返回博客内容部分的HTML。为以下描述创建一篇博客文章："
        },
        {
            id: "portfolio",
            name: "作品集模板",
            description: "展示项目和作品的模板，包含图片和描述",
            prompt: "你是一位作品集设计专家。请根据用户的描述，生成一个作品集展示页面的HTML。作品集应该包含个人简介、项目展示（至少3个项目，每个项目有标题和描述）。生成的HTML应该是结构化的，适合作品展示，可以直接嵌入到网页中。不要包含<!DOCTYPE>、<html>、<head>或<body>标签，只需要返回作品集内容部分的HTML。基于以下描述创建作品集页面："
        }
    ]
};

// 不要修改这里
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
} 