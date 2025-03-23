import React, { useRef, useEffect } from 'react'
import { styled } from '@stitches/react'
import Box from './box'

type Props = {
  children: string | undefined
}

export const Output: React.FC<Props> = ({ children }) => {
  const refBox = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elBox = refBox.current
    if (elBox) {
      elBox.scrollTop = elBox.scrollHeight
    }
  }, [children])

  const handleCopy = () => {
    if (children) {
      navigator.clipboard.writeText(children)
        .then(() => {
          // Optional: Show success feedback
          const button = document.getElementById('copy-button')
          if (button) {
            const originalText = button.textContent
            button.textContent = '✓ Copied!'
            setTimeout(() => {
              button.textContent = originalText
            }, 2000)
          }
        })
        .catch(err => {
          console.error('Failed to copy text: ', err)
        })
    }
  }

  return (
    <Box
      ref={refBox}
      css={{ flex: 1, overflow: 'auto', position: 'relative' }}
      className="output-container"
    >
      {children && children.length > 0 && (
        <CopyButton id="copy-button" onClick={handleCopy}>
          Copy
        </CopyButton>
      )}
      <Pre>{children}</Pre>
    </Box>
  )
}

const Pre = styled('pre', {
  margin: '1em',
  fontSize: '1.2em',
  whiteSpace: 'pre-wrap'
})

const CopyButton = styled('button', {
  position: 'absolute',
  top: '10px',
  right: '10px',
  padding: '5px 10px',
  background: '$purple600',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85em',
  opacity: 0.8,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 1
  }
})
