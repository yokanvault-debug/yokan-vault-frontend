// Global, module-level Strudel player.
// Lives outside React, so route changes / re-renders can never interrupt it.
import { initStrudel } from '@strudel/web'
import songCode from './song'

// Same sample bank the Strudel REPL uses for "piano"
const PIANO_SAMPLES =
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json'

let status = 'idle' // 'idle' | 'loading' | 'playing' | 'error'
let pianoReady = false
let ready = null    // init promise (runs once, on the first click)
const listeners = new Set()

const setStatus = (next) => {
  status = next
  listeners.forEach((fn) => fn())
}

const init = () => {
  if (!ready) {
    ready = Promise.resolve(
      initStrudel({
        // the piano samples come from GitHub: give up after a few seconds and use a synth instead
        prebake: async () => {
          // GitHub unreachable last time (blocked network)? skip straight to the synth for a day
          let skip = false
          try { skip = Date.now() < Number(localStorage.getItem('yk-piano-off') || 0) } catch { /* ignore */ }
          if (skip) { pianoReady = false; return }
          try {
            await Promise.race([
              globalThis.samples(PIANO_SAMPLES),
              new Promise((_, reject) => setTimeout(() => reject(new Error('sample download timed out')), 3000)),
            ])
            pianoReady = true
          } catch (e) {
            console.warn('Piano samples unavailable, using a synth:', e.message)
            pianoReady = false
            try { localStorage.setItem('yk-piano-off', String(Date.now() + 24 * 60 * 60 * 1000)) } catch { /* ignore */ }
          }
        },
      })
    ).catch((err) => {
      ready = null // allow a retry on the next click
      throw err
    })
  }
  return ready
}

const getContext = () => {
  try {
    return globalThis.getAudioContext?.()
  } catch {
    return null
  }
}

export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getStatus = () => status

export const startMusic = async () => {
  if (status === 'loading' || status === 'playing') return
  setStatus('loading')
  try {
    await Promise.race([init(), new Promise((_, reject) => setTimeout(() => reject(new Error('music took too long to start')), 20000))])
    // stopMusic() suspends the audio engine, so wake it up again first
    await getContext()?.resume()
    await globalThis.evaluate(pianoReady ? songCode : songCode.replaceAll('"piano"', '"triangle"'))
    setStatus('playing')
  } catch (err) {
    console.error('Strudel failed to start:', err)
    setStatus('error')
  }
}

export const stopMusic = async () => {
  if (status !== 'playing') return
  setStatus('idle') // update the button straight away

  // 1) replace the running pattern with silence (hush() alone only clears
  //    patterns started with `$:`, not one started through evaluate())
  try { await globalThis.evaluate('silence') } catch { /* ignore */ }
  try { globalThis.hush?.() } catch { /* ignore */ }

  // 2) suspend the audio engine so notes that were already triggered
  //    (piano tails) are cut immediately
  try { await getContext()?.suspend() } catch { /* ignore */ }
}

export const toggleMusic = () =>
  status === 'playing' ? stopMusic() : startMusic()
