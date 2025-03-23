import React, { useState, useEffect } from 'react'
import { styled } from '@stitches/react'
import Box from './box'

type ServiceStatus = 'loading' | 'available' | 'unavailable'

type ServiceStatusProps = {
  onStatusChange?: (status: ServiceStatus) => void
}

export const ServiceStatusIndicator: React.FC<ServiceStatusProps> = ({ onStatusChange }) => {
  const [whisperStatus, setWhisperStatus] = useState<ServiceStatus>('loading')
  
  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        // 서비스 상태 확인 API 호출
        const response = await fetch('/api/check-transcription-service')
        const data = await response.json()
        
        if (data.available) {
          setWhisperStatus('available')
        } else {
          setWhisperStatus('unavailable')
        }
      } catch (error) {
        console.error('Error checking service status:', error)
        setWhisperStatus('unavailable')
      }

      if (onStatusChange) {
        onStatusChange(whisperStatus)
      }
    }

    checkServiceStatus()
  }, [onStatusChange, whisperStatus])

  return (
    <StatusContainer>
      <StatusLabel>음성 인식 서비스:</StatusLabel>
      <StatusIndicator status={whisperStatus}>
        {whisperStatus === 'loading' && '확인 중...'}
        {whisperStatus === 'available' && '사용 가능'}
        {whisperStatus === 'unavailable' && '사용 불가'}
      </StatusIndicator>
      {whisperStatus === 'unavailable' && (
        <StatusMessage>
          음성 인식 모델을 사용할 수 없습니다. 모델이 다운로드되지 않았거나 문제가 발생했습니다.
        </StatusMessage>
      )}
    </StatusContainer>
  )
}

const StatusContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  marginBottom: '16px',
  borderRadius: '6px',
  backgroundColor: '$loContrast',
  border: '1px solid $gray400'
})

const StatusLabel = styled('span', {
  fontFamily: '$system',
  fontWeight: '500',
  marginBottom: '4px'
})

const StatusIndicator = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: '$system',
  fontWeight: 'bold',
  
  '&::before': {
    content: '',
    display: 'inline-block',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginRight: '6px'
  },
  
  variants: {
    status: {
      loading: {
        color: '$gray600',
        '&::before': {
          backgroundColor: '$gray600',
          animation: 'pulse 1.5s infinite'
        }
      },
      available: {
        color: '$green600',
        '&::before': {
          backgroundColor: '$green600'
        }
      },
      unavailable: {
        color: '$red600',
        '&::before': {
          backgroundColor: '$red600'
        }
      }
    }
  }
})

const StatusMessage = styled('p', {
  fontFamily: '$system',
  fontSize: '0.85em',
  color: '$red600',
  margin: '4px 0 0 0'
})

export default ServiceStatusIndicator
