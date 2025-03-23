import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { promisify } from 'util'

type ServiceStatus = {
  available: boolean
  message: string
  modelPath?: string
  debug?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ServiceStatus>
) {
  try {
    // 파이썬 스크립트를 통해 모델 존재 여부 확인
    const scriptResult = await checkModelAvailability()
    
    console.log('Model check result:', scriptResult); // 서버 로그
    
    if (scriptResult.available) {
      res.status(200).json({ 
        available: true, 
        message: 'Transcription service is available',
        modelPath: scriptResult.modelPath,
        debug: scriptResult // 디버깅 정보 추가
      })
    } else {
      // 모델이 없는 경우 간단한 확인 방법 추가 - huggingface_hub가 설치되어 있는지 확인
      const isLibraryAvailable = await checkLibraryAvailability()
      
      res.status(200).json({ 
        available: isLibraryAvailable, // 라이브러리만 설치되어 있어도 우선 사용 가능으로 표시
        message: isLibraryAvailable 
          ? 'Library is available but model will be downloaded on first use'
          : 'Transcription service is not available. The model might not be downloaded yet.',
        debug: { scriptResult, isLibraryAvailable }
      })
    }
  } catch (error) {
    console.error('Error checking transcription service:', error)
    res.status(200).json({ 
      available: false, 
      message: 'Failed to check transcription service status',
      debug: { error: String(error) }
    })
  }
}

// 라이브러리가 설치되어 있는지 간단히 확인
async function checkLibraryAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    const python = spawn('python3', ['-c', 'import faster_whisper; print("OK")'])
    
    let output = ''
    python.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    python.on('close', (code) => {
      resolve(code === 0 && output.includes('OK'))
    })
  })
}

async function checkModelAvailability(): Promise<{ available: boolean; modelPath?: string; error?: string }> {
  return new Promise((resolve) => {
    const checkScript = `
import os
import sys
from huggingface_hub import scan_cache_dir

model_id = "mobiuslabsgmbh/faster-whisper-large-v3-turbo"
found = False
model_path = ""

try:
    # 먼저 캐시 디렉토리 확인
    cache_info = scan_cache_dir()
    for repo in cache_info.repos:
        if model_id.lower() in repo.repo_id.lower():
            if repo.repo_type == "model":
                found = True
                model_path = repo.repo_path
                break
    
    # 결과 출력
    result = {
        "available": found,
        "modelPath": model_path,
        "cacheInfo": str(cache_info.repos)[:200] if hasattr(cache_info, "repos") else "No repos found"
    }
    print(f"{result}")
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
      let errorOutput = ''
      
      python.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      python.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      python.on('close', (code) => {
        try {
          // 스크립트 삭제
          fs.unlinkSync(tempScriptPath)
          
          if (code !== 0 || errorOutput) {
            console.error('Python script error:', errorOutput);
            resolve({ available: false, error: errorOutput })
            return
          }
          
          // 출력 파싱 시도
          try {
            // output이 문자열 표현의 딕셔너리 형태일 수 있음
            const cleanedOutput = output.replace(/'/g, '"')
              .replace(/True/g, 'true')
              .replace(/False/g, 'false')
              .replace(/None/g, 'null');
              
            const result = JSON.parse(cleanedOutput)
            resolve({ 
              available: result.available === true,
              modelPath: result.modelPath
            })
          } catch (parseError) {
            console.error('Error parsing Python output:', parseError, 'Output was:', output);
            // 파싱 실패 시 대체 방식으로 확인
            const available = output.includes('True') && output.includes('modelPath');
            resolve({
              available,
              error: `Failed to parse output: ${output.substring(0, 100)}`
            })
          }
        } catch (error) {
          console.error('Error in script cleanup:', error);
          resolve({ available: false, error: String(error) })
        }
      })
    } catch (error) {
      console.error('Error running model check script:', error)
      resolve({ available: false, error: String(error) })
    }
  })
}