export function extractVideoIdfromUrl(url: string) {
  return new URL(url).searchParams.get('v')
}

type ProgressCallback = (output: string, progress: number) => void

export interface Model {
  id: string;
  name: string;
  description?: string;
}

// 사용 가능한 모델 목록 가져오기
export async function getAvailableModels(): Promise<Model[]> {
  try {
    const response = await fetch('/api/models');
    const data = await response.json();
    
    if (data.models && data.models.length > 0) {
      return data.models;
    } else {
      return getDefaultModels();
    }
  } catch (error) {
    console.error('모델 목록을 가져오는데 실패했습니다:', error);
    return getDefaultModels();
  }
}

// 기본 모델 목록
function getDefaultModels(): Model[] {
  return [
    { id: 'openai/gpt-4o', name: 'OpenAI - GPT-4o', description: 'OpenAI의 최신 멀티모달 모델' },
    { id: 'anthropic/claude-3-opus', name: 'Anthropic - Claude 3 Opus', description: 'Anthropic의 정확한 고성능 모델' },
    { id: 'anthropic/claude-3-sonnet', name: 'Anthropic - Claude 3 Sonnet', description: 'Anthropic의 빠르고 효율적인 모델' },
    { id: 'google/gemini-1.5-pro', name: 'Google - Gemini 1.5 Pro', description: 'Google의 고성능 모델' },
    { id: 'google/gemini-1.5-flash', name: 'Google - Gemini 1.5 Flash', description: 'Google의 빠른 응답 모델' }
  ];
}

export async function processVideo(
  videoId: string,
  callback: ProgressCallback,
  model: string = 'openai/gpt-4o'
): Promise<string | false> {
  callback('Downloading audio...\n',0)
  await downloadAudio(videoId, callback)

  callback('Transcring audio... wait...\n', 20)

  const srt = await transcribe(videoId, callback)

  if (srt) {
    callback('\nTranslating text... wait...\n',50)
    const result = await translate(srt, callback, model)
    callback('\nDone!\n',100)
    return result
  }

  return false
}

export async function downloadAudio(videoId: string, onProgress: ProgressCallback) {
  const res = await fetch(`api/audio?${new URLSearchParams({ video_id: videoId })}`, {})
  const reader = res.body?.getReader()

  if (reader) {
    return streamResponse(reader, onProgress, 10,20)
  } else {
    return false
  }
}

export async function transcribe(
  videoId: string,
  onProgress: ProgressCallback
): Promise<string | false> {
  const res = await fetch(`api/transcript?${new URLSearchParams({ video_id: videoId })}`, {})
  const reader = res.body?.getReader()

  if (reader) {
    return streamResponse(reader,onProgress,30,50)
  } else {
    return false
  }
}

export async function translate(
  srtData: string,
  onProgress: ProgressCallback,
  model: string = 'openai/gpt-4o'
): Promise<string | false> {
  const res = await fetch(`api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      srt: srtData,
      model: model
    })
  })
  const reader = res.body?.getReader()

  if (reader) {
    const res = await streamResponse(reader, onProgress, 60,90)

    return res
      .split('\n')
      .filter((line) => {
        return !line.startsWith('[Error]')
      })
      .join('\n')
  } else {
    return false
  }
}

async function streamResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onProgress: ProgressCallback,
  startProgress: number,
  endProgress: number
): Promise<string> {
  return new Promise((resolve) => {
    const decoder = new TextDecoder()
    let result = ''
    let processedChunks = 0
    const totalChunks = 100

    const readChunk = ({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
      if (done) {
        decoder.decode()
        onProgress('', endProgress)
        resolve(result)
        return
      }

      const output = decoder.decode(value, { stream: true })
      result += output
      processedChunks++
      const currentProgress = startProgress + (endProgress - startProgress) * (processedChunks/totalChunks)
      onProgress(output, Math.min(currentProgress, endProgress))
      reader.read().then(readChunk)
    }
    reader.read().then(readChunk)
  })
}
