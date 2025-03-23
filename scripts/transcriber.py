import os
import sys
from faster_whisper import WhisperModel

video_id = sys.argv[1]
audio_file_path = os.path.join(os.getcwd(), 'tmp', video_id + '.m4a')

# 이미 CTranslate2 형식으로 변환된 모델 사용
model = WhisperModel("mobiuslabsgmbh/faster-whisper-large-v3-turbo", device="cpu", compute_type="int8")

# 음성을 텍스트로 변환
segments, info = model.transcribe(audio_file_path, language="en", beam_size=5, vad_filter=True)

# SRT 형식으로 변환
srt_output = []
for i, segment in enumerate(segments, 1):
    start_time = segment.start
    end_time = segment.end
    text = segment.text
    
    # SRT 시간 형식 변환 (HH:MM:SS,mmm)
    start_str = f"{int(start_time // 3600):02d}:{int((start_time % 3600) // 60):02d}:{int(start_time % 60):02d},{int((start_time % 1) * 1000):03d}"
    end_str = f"{int(end_time // 3600):02d}:{int((end_time % 3600) // 60):02d}:{int(end_time % 60):02d},{int((end_time % 1) * 1000):03d}"
    
    # SRT 형식으로 포맷팅
    srt_output.append(f"{i}\n{start_str} --> {end_str}\n{text.strip()}\n")

# 최종 SRT 출력
print("\n".join(srt_output))
