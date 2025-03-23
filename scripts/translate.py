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
        {"role": "system", "content": "You are a translation engine that translates English to Korean. Respond ONLY with the Korean translation without any explanations, notes, or additional text. Do not include romanization, explanations about formality levels or alternatives."},
        {"role": "user", "content": f"Translate this text to Korean: {text}"}
    ]
    
    # LM Studio 로컬 서버로 요청 전송
    try:
        response = requests.post(
            LM_STUDIO_API_URL,
            headers={"Content-Type": "application/json"},
            json={
                "model": "gemma-3-27b-it", # 로컬 LM Studio에서 사용 중인 모델 이름
                "messages": messages,
                "temperature": 0.2,  # 낮은 temperature로 일관된 번역 유도
                "max_tokens": 3000,
            },
            timeout=30  # 타임아웃 설정
        )
        
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        result = response.json()
        
        # 응답에서 번역된 텍스트 추출
        translated_text = result["choices"][0]["message"]["content"].strip()
        
        # 설명이나 메타데이터를 제거하기 위한 후처리
        # 불렛 포인트, 별표, 따옴표 등 제거
        translated_text = translated_text.replace('* ', '').replace('**', '')
        
        # "번역:" 이나 "Translation:" 등의 접두사 제거
        prefixes = ["번역:", "Translation:", "한국어:", "Korean:"]
        for prefix in prefixes:
            if translated_text.startswith(prefix):
                translated_text = translated_text[len(prefix):].strip()
        
        return translated_text
        
    except Exception as e:
        print(f"[Error] 번역 중 오류 발생: {str(e)}", file=sys.stderr)
        # 에러 발생 시 원본 텍스트 반환
        return text

# 번역 테스트
print(f"[Info] LM Studio 서버에 연결 테스트 중...", file=sys.stderr, flush=True)
try:
    test_result = translate_text("Hello, this is a test.")
    print(f"[Info] 서버 연결 성공! 테스트 번역: '{test_result}'", file=sys.stderr, flush=True)
except Exception as e:
    print(f"[Error] 서버 연결 실패: {str(e)}", file=sys.stderr, flush=True)

for index, subtitle in enumerate(subs):
    try:
        # 진행 상황 표시
        if index % 5 == 0:
            print(f"[Info] 자막 번역 중... ({index}/{len(subs)})", file=sys.stderr, flush=True)
            
        subtitle.text = translate_text(subtitle.text)
        print(subtitle, flush=True)
    except Exception as e:
        print(f"[Error] 자막 {index}번 처리 중 오류: {str(e)}", file=sys.stderr, flush=True)
        print(subtitle, flush=True)  # 에러 시 원본 자막 출력

print(f"[Info] 번역 완료! 총 {len(subs)}개 자막 처리됨", file=sys.stderr, flush=True)

