# YouTube Transcription & Korean Translation

이 프로젝트는 YouTube 동영상의 오디오를 추출하여, 이를 한국어로 번역하는 웹 애플리케이션입니다.

## 주요 기능

1. YouTube URL 입력을 통한 동영상 처리
2. 오디오 추출 및 다운로드
3. OpenAI Whisper를 사용한 음성-텍스트 변환 (영어 자막 생성)
4. OpenAI GPT-4o를 사용한 영어에서 한국어로의 번역
5. 실시간 진행 상황 표시
6. 결과 출력 (원본 영어 자막 및 한국어 번역)

## 기술 스택

- Frontend: React, Next.js, Stitches (CSS-in-JS)
- Backend: Next.js API Routes
- 외부 서비스: OpenAI API (Whisper, GPT-4o)
- 기타 도구: yt-dlp (동영상 다운로드), pysrt (SRT 파일 처리)

## How to use

1. 브라우저에서 `http://localhost:3000` 접속
2. 메인 페이지에서 YouTube 동영상 URL을 입력합니다.
3. "Start Processing" 버튼을 클릭합니다.
4. 진행 상황을 실시간으로 확인할 수 있습니다.
5. 처리가 완료되면 "Result" 탭에서 번역된 자막을 확인할 수 있습니다.
