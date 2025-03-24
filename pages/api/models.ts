import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

// 번역에 추천되는 모델 (최상단에 표시됨)
const RECOMMENDED_MODELS = [
  'openai/gpt-4o',
  'anthropic/claude-3-opus',
  'anthropic/claude-3-sonnet',
  'google/gemini-1.5-pro',
  'google/gemini-1.5-flash',
  'mistralai/mistral-large',
  'meta-llama/llama-3-70b-instruct'
];

type Model = {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: number;
    completion?: number;
  };
};

type ModelsResponse = {
  models: Model[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ModelsResponse>
) {
  try {
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterApiKey) {
      return res.status(500).json({ 
        models: getDefaultModels(),
        error: 'OpenRouter API 키가 설정되지 않았습니다.'
      });
    }

    // OpenRouter API에서 모델 목록 가져오기
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${openrouterApiKey}`
      }
    });

    if (response.status !== 200) {
      throw new Error('모델 목록을 가져오는데 실패했습니다.');
    }

    const allModels = response.data.data;
    
    // 모든 모델을 포맷팅하여 반환
    const formattedModels = allModels.map((model: any) => {
      const provider = model.id.split('/')[0] || '알 수 없음';
      const modelName = model.id.split('/')[1] || model.id;
      
      // 요금 정보 (있는 경우)
      let pricingInfo = '';
      if (model.pricing && (model.pricing.prompt || model.pricing.completion)) {
        pricingInfo = ` (토큰당 ${(model.pricing.prompt || 0) + (model.pricing.completion || 0)}$)`;
      }
      
      // 컨텍스트 길이 (있는 경우)
      let contextInfo = '';
      if (model.context_length) {
        contextInfo = ` - 최대 ${model.context_length.toLocaleString()}토큰`;
      }
      
      return {
        id: model.id,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} - ${modelName}`,
        description: `${model.description || ''}${contextInfo}${pricingInfo}`.trim(),
        context_length: model.context_length,
        pricing: model.pricing
      };
    });

    // 추천 모델을 상단에, 나머지는 가나다 순으로 정렬
    const sortedModels = formattedModels.sort((a: Model, b: Model) => {
      const aIsRecommended = RECOMMENDED_MODELS.includes(a.id);
      const bIsRecommended = RECOMMENDED_MODELS.includes(b.id);
      
      if (aIsRecommended && !bIsRecommended) return -1;
      if (!aIsRecommended && bIsRecommended) return 1;
      
      // 추천 모델 내에서도 추천 순서대로 정렬
      if (aIsRecommended && bIsRecommended) {
        return RECOMMENDED_MODELS.indexOf(a.id) - RECOMMENDED_MODELS.indexOf(b.id);
      }
      
      // 나머지는 가나다 순
      return a.name.localeCompare(b.name);
    });

    return res.status(200).json({ models: sortedModels });
  } catch (error) {
    console.error('Error fetching models:', error);
    return res.status(200).json({ 
      models: getDefaultModels(),
      error: '모델 목록을 가져오는데 실패했습니다. 기본 모델을 사용합니다.'
    });
  }
}

// API 연결 실패 시 사용할 기본 모델 목록
function getDefaultModels(): Model[] {
  return [
    { id: 'openai/gpt-4o', name: 'OpenAI - GPT-4o', description: 'OpenAI의 최신 멀티모달 모델' },
    { id: 'anthropic/claude-3-sonnet', name: 'Anthropic - Claude 3 Sonnet', description: 'Anthropic의 빠르고 효율적인 모델' },
    { id: 'google/gemini-1.5-flash', name: 'Google - Gemini 1.5 Flash', description: 'Google의 빠른 응답 모델' }
  ];
} 