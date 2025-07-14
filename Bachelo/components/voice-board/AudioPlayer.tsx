'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  url: string
  duration?: number
  onPlay?: () => void
  compact?: boolean
}

export default function AudioPlayer({ url, duration = 0, onPlay, compact = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
        onPlay?.()
      }
    } catch (error) {
      console.error('Playback error:', error)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const newTime = percentage * (duration || audio.duration)
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-pink-600" />
          ) : (
            <Play className="w-4 h-4 text-pink-600" />
          )}
        </button>
        <span className="text-sm text-gray-600">{formatTime(duration)}</span>
        <audio ref={audioRef} src={url} preload="none" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-pink-500 hover:bg-pink-600 transition-colors shadow-sm"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>

        <div className="flex-1 space-y-1">
          <div
            ref={progressRef}
            className="h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-pink-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 0)}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowVolumeControl(!showVolumeControl)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Volume2 className="w-5 h-5 text-gray-600" />
          </button>
          {showVolumeControl && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white rounded-lg shadow-lg">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2"
              />
            </div>
          )}
        </div>
      </div>

      <audio ref={audioRef} src={url} preload="metadata" />
    </div>
  )
}