import type { NextApiRequest, NextApiResponse } from 'next'
import { spawn } from 'child_process'
import path from 'path'
import { transferChildProcessOutput } from '../../utils/shell'

export default function POST(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const srt = request.body.srt || request.body
  const model = request.body.model || 'openai/gpt-4o' // 기본 모델 설정
  
  if (typeof srt !== 'string') {
    response.status(400).json({ error: 'Invalid request' })
    return
  }

  // 환경 변수에 모델 정보 추가
  const env = {
    ...process.env,
    TRANSLATION_MODEL: model
  }

  const cmd = spawn(
    'python3',
    [path.join(process.cwd(), 'scripts/translate.py')],
    {
      cwd: process.cwd(),
      env: env
    }
  )
  cmd.stdin.write(srt)
  cmd.stdin.end()

  transferChildProcessOutput(cmd, response)
}
