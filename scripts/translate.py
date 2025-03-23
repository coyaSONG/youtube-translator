import os
import sys
import requests
import pysrt
import json

# LM Studio 로컬 서버 설정
LM_STUDIO_API_URL = "http://localhost:1234/v1/chat/completions"

input_file = sys.stdin.read()
subs = pysrt.from_string(input_file)

def translate_text(text):
    messages = [
        {"role": "system", "content": "You are a skilled translator and developer. Translate the given English text to Korean accurately while preserving the meaning and nuance."},
        {"role": "user", "content": f"Translate the following English text to Korean: {text}"}
    ]
    
    # LM Studio 로컬 서버로 요청 전송
    try:
        response = requests.post(
            LM_STUDIO_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": "local-model", # LM Studio는 모델 이름이 중요하지 않음
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 3000,
            },
            timeout=30  # 타임아웃 설정
        )
        
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        result = response.json()
        
        # 응답에서 번역된 텍스트 추출
        translated_text = result["choices"][0]["message"]["content"]
        return translated_text
        
    except Exception as e:
        print(f"[Error] 번역 중 오류 발생: {str(e)}", file=sys.stderr)
        # 에러 발생 시 원본 텍스트 반환
        return text

for index, subtitle in enumerate(subs):
    try:
        # 진행 상황 표시
        if index % 10 == 0:
            print(f"[Info] 자막 번역 중... ({index}/{len(subs)})", file=sys.stderr, flush=True)
            
        subtitle.text = translate_text(subtitle.text)
        print(subtitle, flush=True)
    except Exception as e:
        print(f"[Error] 자막 {index}번 처리 중 오류: {str(e)}", file=sys.stderr, flush=True)
        print(subtitle, flush=True)  # 에러 시 원본 자막 출력

print(f"[Info] 번역 완료! 총 {len(subs)}개 자막 처리됨", file=sys.stderr, flush=True)

