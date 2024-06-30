import { TabsContent } from '@radix-ui/react-tabs'
import Head from 'next/head'
import { useState } from 'react'
import Box from '../components/box'
import { Output } from '../components/output'
import { TabsList, TabsRoot, TabsTrigger } from '../components/tabs'
import VideoForm from '../components/video-form'
import { styled } from '../stitches.config'
import { extractVideoIdfromUrl, processVideo } from '../utils/api-client'
import ProgressBar from '../components/progressbar'

const Text = styled('p', {
  fontFamily: '$system',
  color: '$hiContrast'
})

const Link = styled('a', {
  fontFamily: '$system',
  textDecoration: 'none',
  color: '$purple600'
})

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  marginY: 0,
  marginX: 'auto',
  paddingY: 0,
  paddingX: '$3',

  variants: {
    size: {
      1: {
        maxWidth: '300px'
      },
      2: {
        maxWidth: '585px'
      },
      3: {
        maxWidth: '865px'
      }
    }
  }
})
 
const TabContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  minHeight: 0,
})

export default function Home() {
  const [isProcessing, setProcessing] = useState(false)
  const [progressOutput, setProgressOutput] = useState('')
  const [activeTab, setActiveTab] = useState('progress')
  const [resultTranscript, setResultTransciprt] = useState('')
  const [progress, setProgress] = useState(0)

  const handleStartProcessing = async (videoUrl: string) => {
    setResultTransciprt('');
    setProcessing(true)
    setProgress(0)
  
    //todo
    const videoId = extractVideoIdfromUrl(videoUrl)
    if (typeof videoId === 'string') {
      const transcriptInKorean = await processVideo(videoId, (message, currentProgress) => {
        setProgressOutput((prev) => prev + message)
        setProgress(currentProgress)
      })

      if (transcriptInKorean) {
        setResultTransciprt(transcriptInKorean)
      }

      setProcessing(false)
      setActiveTab('result')
    } else {
      alert('Invalid URL')
    }
  }

  return (
    <Box css={{ paddingY: '$6' }}>
      <Head>
        <title>Youtube Transcription &amp; Korean Translation</title>
      </Head>
      <Container size={{ '@initial': '1', '@bp1': '2' }}>
        <Text as="h1">Youtube Transcription &amp; Translation</Text>
        <VideoForm onSubmit={handleStartProcessing} isProcessing={isProcessing} />
        <Box css={{height: '24px'}}>
        {isProcessing && <ProgressBar progress={progress}/>}
        </Box>
        <TabsRoot value={activeTab} onValueChange={setActiveTab}>
          <TabsList aria-label="Output">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>
          <TabsContent value="progress">
            <Output>{progressOutput}</Output>
          </TabsContent>
          <TabsContent value="result">
            <Output>{resultTranscript}</Output>
          </TabsContent>
        </TabsRoot>
      </Container>
    </Box>
  )
}
