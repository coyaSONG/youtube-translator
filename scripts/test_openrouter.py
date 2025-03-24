import os
import requests
import json

# OpenRouter API 키 가져오기
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

if not OPENROUTER_API_KEY:
    print("OpenRouter API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.")
    exit(1)

# API 엔드포인트
API_URL = "https://openrouter.ai/api/v1/chat/completions"

# 간단한 테스트 요청
def test_openrouter():
    try:
        response = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openai/gpt-4o",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Hello! Please translate this to Korean."}
                ],
                "temperature": 0.2
            }
        )
        
        response.raise_for_status()
        result = response.json()
        
        print("OpenRouter API 연결 성공!")
        print("응답:", result["choices"][0]["message"]["content"])
        
        # 사용 가능한 모델 정보 가져오기
        models_response = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"}
        )
        
        models_response.raise_for_status()
        models = models_response.json()
        
        print("\n사용 가능한 모델 목록 (일부):")
        for model in models["data"][:5]:  # 처음 5개 모델만 표시
            print(f"- {model['id']}")
        
        print(f"\n총 {len(models['data'])}개 모델 사용 가능")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")

if __name__ == "__main__":
    test_openrouter() 