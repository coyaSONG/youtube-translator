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
    <Box as="form" onSubmit={handleSubmit} css={{ marginBottom: '$4' }}>
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
    </Box>
  )
}

const FormRoot = styled(Form.Root, {
  width: '100%',
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
  borderRadius: 4,

  fontSize: 15,
  lineHeight: 1,
  fontWeight: 500,
  height: '40px',
  width: '100%',

  backgroundColor: '$purple600',
  color: 'white',
  boxShadow: `0 2px 10px $gray400`,
  '&:hover': { backgroundColor: '$purple700' },
  '&:not(disabled):focus': { boxShadow: `0 0 0 2px black` },

  '&:disabled': {
    backgroundColor: '$gray400',
    cursor: 'not-allowed'
  }
})

export default VideoForm
