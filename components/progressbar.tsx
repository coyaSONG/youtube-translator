import React from 'react';
import {styled} from '../stitches.config';

const ProgressBarContainer = styled('div',{
    width: '100%',
    backgroundColor: '$gray300',
    borderRadius: '4px',
    margin: '10px 0',
    position: 'relative',
    height: '24px',
    overflow: 'hidden'
});

const ProgressBarFill = styled('div',{
    height: '24px',
    backgroundColor: '$purple500',
    borderRadius: '4px',
    transition: 'width 0.5s ease-in-out',
})

const ProgressText = styled('span', {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '$hiContrast',
    fontSize: '14px',
    fontWeight: 'bold',
    textShadow: '0 0 2px white'
})

interface ProgressBarProps {
    progress: number;
}


const ProgressBar: React.FC<ProgressBarProps> = ({progress}) => {
    const roundedProgress = Math.round(progress);

    return (
        <ProgressBarContainer>
            <ProgressBarFill css={{width: `${progress}%`}} />
            <ProgressText>{`${roundedProgress}% / 100%`}</ProgressText>
        </ProgressBarContainer>
    )
}

export default ProgressBar;