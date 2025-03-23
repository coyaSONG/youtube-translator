# YouTube Transcription & Korean Translation

이 프로젝트는 YouTube 동영상의 오디오를 추출하여, 이를 한국어로 번역하는 웹 애플리케이션입니다.

## 주요 기능

1. YouTube URL 입력을 통한 동영상 처리
2. 오디오 추출 및 다운로드
3. **Faster Whisper** (로컬 음성인식 모델)를 사용한 음성-텍스트 변환 (영어 자막 생성)
4. OpenAI GPT-4o를 사용한 영어에서 한국어로의 번역
5. 실시간 진행 상황 표시 및 서비스 가용성 표시기
6. 로그 및 결과 내용 복사 기능
7. 결과 출력 (원본 영어 자막 및 한국어 번역)

## 기술 스택

- Frontend: React, Next.js, Stitches (CSS-in-JS), Radix UI
- Backend: Next.js API Routes
- AI 모델: Faster Whisper (로컬 모델), OpenAI GPT-4o
- 기타 도구: yt-dlp (동영상 다운로드), pysrt (SRT 파일 처리)

## 설치 방법

```bash
# 프로젝트 클론
git clone https://github.com/username/youtube-translator.git
cd youtube-translator

# 의존성 설치
yarn install

# 필요한 Python 라이브러리 설치
pip install -r requirements.txt
pip install faster-whisper huggingface_hub

# 개발 서버 실행
yarn dev
```

## 환경 설정

1. `.env` 파일을 생성하고 다음 내용을 추가합니다 (GPT-4o 번역을 위해 필요):
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```
2. 첫 실행 시 Faster Whisper 모델이 자동으로 다운로드됩니다 (약 1.5GB).

## 사용 방법

1. 브라우저에서 `http://localhost:3000` 접속
2. 상단의 상태 표시기를 통해 음성 인식 서비스 가용성 확인
3. 메인 페이지에서 YouTube 동영상 URL을 입력합니다.
4. "Start Processing" 버튼을 클릭합니다.
5. 진행 상황을 실시간으로 확인할 수 있습니다.
6. 처리가 완료되면 "Result" 탭에서 번역된 자막을 확인할 수 있습니다.
7. 복사 버튼을 사용하여 로그나 결과를 클립보드에 복사할 수 있습니다.

## 기술적 특징

- **로컬 음성 인식**: OpenAI API 대신 Faster Whisper를 사용하여 로컬에서 무료로 음성 인식 수행
- **상태 모니터링**: 서비스 가용성을 실시간으로 확인하는 상태 표시기
- **반응형 UI**: 모든 상태 변화에 대한 시각적 피드백 제공
- **최적화된 성능**: int8 양자화를 사용하여 메모리 사용량 최소화

## 향후 계획

- [ ] 한국어 번역에도 로컬 모델 적용
- [ ] 다국어 지원 확장
- [ ] 자막 타임스탬프 수동 조정 기능
- [ ] 비디오 미리보기 및 자막 오버레이 기능
