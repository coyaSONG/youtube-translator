import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { promisify } from 'util'

type ServiceStatus = {
  available: boolean
  message: string
  modelPath?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceStatus>
) {
  try {
    // 파이썬 스크립트를 통해 모델 존재 여부 확인
    const scriptResult = await checkModelAvailability()
    
    if (scriptResult.available) {
      res.status(200).json({ 
        available: true, 
        message: 'Transcription service is available',
        modelPath: scriptResult.modelPath
      })
    } else {
      res.status(200).json({ 
        available: false, 
        message: 'Transcription service is not available. The model might not be downloaded yet.'
      })
    }
  } catch (error) {
    console.error('Error checking transcription service:', error)
    res.status(200).json({ 
      available: false, 
      message: 'Failed to check transcription service status'
    })
  }
}

async function checkModelAvailability(): Promise<{ available: boolean; modelPath?: string }> {
  return new Promise((resolve) => {
    const checkScript = `
import os
from huggingface_hub import scan_cache_dir

model_id = "mobiuslabsgmbh/faster-whisper-large-v3-turbo"
found = False
model_path = ""

try:
    cache_info = scan_cache_dir()
    for repo in cache_info.repos:
        if model_id.lower() in repo.repo_id.lower():
            if repo.repo_type == "model":
                found = True
                model_path = repo.repo_path
                break
    
    print(f"{{\\\"available\\\": {str(found).lower()}, \\\"modelPath\\\": \\\"{model_path}\\\"}}")
except Exception as e:
    print(f"{{\\\"available\\\": false, \\\"error\\\": \\\"{str(e)}\\\"}}")
    `
    
    // 임시 파이썬 스크립트 파일 생성
    const tempScriptPath = path.join(process.cwd(), 'tmp', 'check_model.py')
    
    try {
      // tmp 디렉토리가 없으면 생성
      if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
        fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true })
      }
      
      fs.writeFileSync(tempScriptPath, checkScript)
      
      const python = spawn('python3', [tempScriptPath])
      
      let output = ''
      
      python.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      python.on('close', (code) => {
        try {
          // 스크립트 삭제
          fs.unlinkSync(tempScriptPath)
          
          if (code !== 0) {
            resolve({ available: false })
            return
          }
          
          const result = JSON.parse(output)
          resolve({ 
            available: result.available,
            modelPath: result.modelPath
          })
        } catch (error) {
          console.error('Error parsing model check output:', error)
          resolve({ available: false })
        }
      })
    } catch (error) {
      console.error('Error running model check script:', error)
      resolve({ available: false })
    }
  })
}
