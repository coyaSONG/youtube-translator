import React, { useState } from 'react'
import * as Form from '@radix-ui/react-form'
import { styled } from '@stitches/react'
import Box from './box'

type Props = {
  onSubmit: (videoUrl: string) => Promise<void>
  isProcessing: boolean
  disabled?: boolean
}

const VideoForm: React.FC<Props> = ({ onSubmit, isProcessing, disabled }) => {
  const [url, setUrl] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (url) {
      await onSubmit(url)
    }
  }

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

export default VideoForm
