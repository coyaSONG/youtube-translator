import React, { useState, useEffect } from 'react'
import * as Form from '@radix-ui/react-form'
import { styled } from '@stitches/react'
import Box from './box'
import { Model, getAvailableModels } from '../utils/api-client'

type Props = {
  onSubmit: (videoUrl: string, model: string) => Promise<void>
  isProcessing: boolean
  disabled?: boolean
}

const VideoForm: React.FC<Props> = ({ onSubmit, isProcessing, disabled }) => {
  const [url, setUrl] = useState('')
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o')
  const [models, setModels] = useState<Model[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // 컴포넌트 마운트 시 모델 목록 가져오기
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true)
      try {
        const availableModels = await getAvailableModels()
        setModels(availableModels)
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0].id)
        }
      } catch (error) {
        console.error('모델 목록을 가져오는데 실패했습니다:', error)
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModels()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (url) {
      await onSubmit(url, selectedModel)
    }
  }

  // 모델 옵션 변환
  const modelOptions = models.map(model => ({
    label: model.name,
    value: model.id,
    description: model.description
  }))
  
  return (
    <FormRoot onSubmit={handleSubmit}>
      <FormField name="vieoUrl">
        <Flex css={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Form.Label>URL</Form.Label>
        </Flex>
        <Form.Control asChild>
          <Input
            name="videoUrl"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v="
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isProcessing || disabled}
          />
        </Form.Control>
      </FormField>

      <FormField name="modelSelect">
        <Flex css={{ alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Form.Label>번역 모델 선택</Form.Label>
          <ModelCount>{isLoadingModels ? '로딩 중...' : `${models.length}개 모델 사용 가능`}</ModelCount>
        </Flex>
        {isLoadingModels ? (
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
        ) : (
          <Form.Control asChild>
            <Select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isProcessing || disabled}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Form.Control>
        )}
      </FormField>

      <Form.Submit asChild>
        <Button type="submit" disabled={isProcessing || !url || disabled}>
          {isProcessing ? 'Processing...' : 'Start Processing'}
        </Button>
      </Form.Submit>
    </FormRoot>
  )
}

const FormRoot = styled(Form.Root, {
  width: '100%',
  marginBottom: '16px'
})

const FormField = styled(Form.Field, {
  display: 'grid',
  marginBottom: 10
})

const Flex = styled('div', {
  display: 'flex'
})

const ModelCount = styled('span', {
  fontSize: '12px',
  color: '#666',
  fontStyle: 'italic',
  display: 'inline-block',
  padding: '2px 6px',
  backgroundColor: '#f9f5ff',
  borderRadius: '4px',
})

const inputStyles = {
  all: 'unset',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,

  fontSize: 15,
  color: '$purple600',
  backgroundColor: 'white',
  boxShadow: `0 0 0 1px $gray400`,
  '&:hover': { boxShadow: `0 0 0 1px $gray600` },
  '&:focus': { boxShadow: `0 0 0 2px $purple600` },
  '&::selection': { backgroundColor: '$gray600', color: 'white' },

  width: '100%',
  height: '40px',
  padding: '0 $2',
  
  '&:disabled': {
    backgroundColor: '$gray200',
    cursor: 'not-allowed'
  }
}

const Input = styled('input', {
  ...inputStyles,
  lineHeight: 1,
})

const Button = styled('button', {
  all: 'unset',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',

  fontSize: '15px',
  lineHeight: 1,
  fontWeight: 500,
  height: '40px',
  width: '100%',

  backgroundColor: '#7c3aed',
  color: 'white',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  
  '&:hover': { 
    backgroundColor: '#6025c9',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
  },
  
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)'
  },
  
  '&:focus': { 
    boxShadow: '0 0 0 2px #e2d9f7'
  },

  '&:disabled': {
    backgroundColor: '#d1d5db',
    color: '#6b7280',
    transform: 'none',
    boxShadow: 'none',
    cursor: 'not-allowed'
  }
})

const Select = styled('select', {
  ...inputStyles,
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20class%3D%22lucide%20lucide-chevron-down%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
  backgroundSize: '16px',
  paddingRight: '32px'
})

export default VideoForm

