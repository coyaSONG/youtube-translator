export function extractVideoIdfromUrl(url: string) {
  return new URL(url).searchParams.get('v')
}

type ProgressCallback = (output: string, progress: number) => void

export async function processVideo(
  videoId: string,
  callback: ProgressCallback
): Promise<string | false> {
  callback('Downloading audio...\n',0)
  await downloadAudio(videoId, callback)

  callback('Transcring audio... wait...\n', 20)

  const srt = await transcribe(videoId, callback)

  if (srt) {
    callback('\nTranslating text... wait...\n',50)
    const result = await translate(srt, callback)
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
  onProgress: ProgressCallback
): Promise<string | false> {
  const res = await fetch(`api/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: srtData
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
