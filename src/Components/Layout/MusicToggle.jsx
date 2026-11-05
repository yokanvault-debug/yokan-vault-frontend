import React, { useEffect, useState, useSyncExternalStore } from 'react'
import { subscribe, getStatus, toggleMusic } from '../Utils/player'

const GIF_SRC = '/images/bean_music.gif'

// A GIF can't be paused, so we paint its first frame onto a canvas and
// show that while the music is stopped. Only one GIF file is needed.
const useStillFrame = (src) => {
    const [still, setStill] = useState(null)
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas')
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                canvas.getContext('2d').drawImage(img, 0, 0)
                setStill(canvas.toDataURL('image/png'))
            } catch {
                /* fall back to the animated gif */
            }
        }
        img.src = src
    }, [src])
    return still
}

const MusicToggle = () => {
    const status = useSyncExternalStore(subscribe, getStatus)
    const still = useStillFrame(GIF_SRC)
    const playing = status === 'playing'

    const title =
        status === 'loading' ? 'Loading music…'
            : status === 'error' ? 'Music failed to load - click to retry'
                : playing ? 'Pause music'
                    : 'Play music'

    return (
        <button
            type="button"
            className={`music-toggle${playing ? ' is-playing' : ''}${status === 'loading' ? ' is-loading' : ''}`}
            onClick={toggleMusic}
            aria-pressed={playing}
            aria-label={title}
            title={title}
        >
            <img src={playing ? GIF_SRC : (still || GIF_SRC)} alt="" />
        </button>
    )
}

export default MusicToggle
