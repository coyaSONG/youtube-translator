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
        
        console.log('Service status response:', data); // 디버깅 로그
        
        const newStatus: ServiceStatus = data.available ? 'available' : 'unavailable'
        setWhisperStatus(newStatus)
        
        if (onStatusChange) {
          onStatusChange(newStatus)
        }
      } catch (error) {
        console.error('Error checking service status:', error)
        setWhisperStatus('unavailable')
        
        if (onStatusChange) {
          onStatusChange('unavailable')
        }
      }
    }

    // 컴포넌트 마운트 시 한 번 호출
    checkServiceStatus()
    
    // 30초마다 상태 확인 (선택적)
    const intervalId = setInterval(checkServiceStatus, 30000)
    
    // 클린업 함수
    return () => clearInterval(intervalId)
  }, [onStatusChange])

  return (
    <StatusContainer>
      <StatusRow>
        <StatusLabel>음성 인식 서비스</StatusLabel>
        <StatusIconContainer status={whisperStatus} title={
          whisperStatus === 'loading' ? '서비스 상태 확인 중...' : 
          whisperStatus === 'available' ? '서비스 사용 가능' : 
          '서비스 사용 불가'
        }>
          <StatusIcon status={whisperStatus} />
        </StatusIconContainer>
      </StatusRow>
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
  padding: '8px 12px',
  marginBottom: '16px',
  borderRadius: '6px',
  backgroundColor: '$loContrast',
  border: '1px solid $gray400'
})

const StatusRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

const StatusLabel = styled('span', {
  fontFamily: '$system',
  fontWeight: '500'
})

const StatusIconContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  cursor: 'help',
  padding: '6px',
  borderRadius: '50%',
  transition: 'background-color 0.2s ease',
  
  '&:hover': {
    backgroundColor: '$gray100',
  },
  
  variants: {
    status: {
      loading: {
        '&:hover::after': {
          content: '확인 중...',
          position: 'absolute',
          top: 'calc(100% + 5px)',
          right: '50%',
          transform: 'translateX(50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }
      },
      available: {
        '&:hover::after': {
          content: '사용 가능',
          position: 'absolute',
          top: 'calc(100% + 5px)',
          right: '50%',
          transform: 'translateX(50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }
      },
      unavailable: {
        '&:hover::after': {
          content: '사용 불가',
          position: 'absolute',
          top: 'calc(100% + 5px)',
          right: '50%',
          transform: 'translateX(50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }
      }
    }
  }
})

const StatusIcon = styled('span', {
  display: 'inline-block',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  
  'div:hover &': {
    transform: 'scale(1.2)',
    boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)'
  },
  
  variants: {
    status: {
      loading: {
        backgroundColor: '#6c757d', // 명시적 회색
        animation: 'pulse 1.5s infinite'
      },
      available: {
        backgroundColor: '#28a745', // 명시적 녹색
      },
      unavailable: {
        backgroundColor: '#dc3545', // 명시적 빨간색
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