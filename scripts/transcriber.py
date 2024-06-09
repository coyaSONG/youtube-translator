import os
import openai
import sys

openai.api_key= os.getenv("OPENAI_API_KEY")

video_id = sys.argv[1]

audio_file_path = os.path.join(os.getcwd(), 'tmp', video_id + '.m4a')

audio_file = open(audio_file_path, "rb")

transcript = openai.audio.transcriptions.create(
    model='whisper-1',
    file=audio_file,
    language='en',
    response_format='srt'
)

print(transcript)
