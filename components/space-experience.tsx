'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Pause, Play, Maximize2, Minimize2, SlidersHorizontal, X, Menu, Orbit, MoveUpRight } from 'lucide-react'

const BlackHoleScene = dynamic(() => import('./black-hole-scene'), { ssr: false, loading: () => <div className="scene-fallback" /> })

const discoveries = [
  { number: '01', title: 'A point of no return.', label: 'THE EVENT HORIZON', text: 'The boundary beyond which nothing—not even light—can escape. It is not a solid surface, but a limit written into spacetime.' },
  { number: '02', title: 'Light bends. Reality shifts.', label: 'GRAVITATIONAL LENSING', text: 'Extreme gravity curves the path of light. The disk behind a black hole can appear above and below it, revealing the invisible.' },
  { number: '03', title: 'Darkness, surrounded by fire.', label: 'THE ACCRETION DISK', text: 'Matter spiraling inward heats to extraordinary temperatures. This glowing disk helps us find objects that emit no light of their own.' },
]

export function SpaceExperience() {
  const [paused, setPaused] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const [settings, setSettings] = useState(false)
  const [menu, setMenu] = useState(false)
  const [intensity, setIntensity] = useState(1.15)
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState('')
  const hero = useRef<HTMLElement>(null)
  const exploreButton = useRef<HTMLButtonElement>(null)
  const exitButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPaused(media.matches)
    update()
    media.addEventListener('change', update)
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => { media.removeEventListener('change', update); document.removeEventListener('fullscreenchange', onFullscreen) }
  }, [])

  useEffect(() => {
    if (immersive) exitButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setImmersive(false); setSettings(false); exploreButton.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [immersive])

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await hero.current?.requestFullscreen()
    } catch { setNotice('Fullscreen is unavailable in this preview. Use Explore for an immersive view.') }
  }

  return (
    <main>
      <section ref={hero} className={`hero ${immersive ? 'is-immersive' : ''}`} id="explore" aria-label="Black hole exploration">
        <div className={`scene ${paused ? 'scene-paused' : ''}`} style={{ filter: `brightness(${0.65 + intensity * 0.3})` }} onPointerMove={event => {
          if (paused) return
          const bounds = event.currentTarget.getBoundingClientRect()
          event.currentTarget.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 8}px`)
          event.currentTarget.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height - 0.5) * 8}px`)
        }}><BlackHoleScene paused={paused} intensity={intensity} immersive={immersive} /></div>
        <div className="scene-shade" />
        <header className="site-header">
          <a href="#explore" className="brand" aria-label="NASA-inspired Beyond home"><img src="/nasa.svg" alt="NASA" width="82" height="24" /><span className="brand-divider" /><span className="brand-label">BEYOND</span></a>
          <nav className={`main-nav ${menu ? 'nav-open' : ''}`} aria-label="Main navigation">
            <a className="nav-active" href="#explore" onClick={() => setMenu(false)}>Explore <Plus size={10} /></a>
            <a href="#science" onClick={() => setMenu(false)}>The science</a>
            <a href="#missions" onClick={() => setMenu(false)}>Our missions</a>
            <a href="#about" onClick={() => setMenu(false)}>About</a>
          </nav>
          <a className="nasa-link" href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA.GOV <ArrowUpRight size={13} /></a>
          <button className="mobile-menu icon-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X size={19} /> : <Menu size={19} />}</button>
        </header>

        {!immersive ? <>
          <div className="hero-content">
            <div className="eyebrow"><span className="status-dot" /> A JOURNEY INTO THE UNKNOWN</div>
            <h1>Where light<br />ends.<br /><span>Wonder begins.</span></h1>
            <p className="hero-description">Journey to the edge of a black hole.<br />Discover the most mysterious objects<br className="desktop-break" /> in our universe.</p>
            <div className="hero-actions">
              <button className="explore-button" ref={exploreButton} onClick={() => setImmersive(true)}>Explore the black hole <ArrowUpRight size={17} /></button>
              <a className="science-link" href="#science">Discover the science <ArrowRight size={14} /></a>
            </div>
          </div>
          <div className="object-label"><span className="object-cross">+</span><div><span className="micro">SAGITTARIUS A*</span><span className="object-caption">The heart of our galaxy</span></div><span className="label-line" /></div>
          <div className="scene-annotation"><span className="annotation-line" /><span>THE EVENT HORIZON</span><span className="annotation-dot" /></div>
          <div className="hero-bottom">
            <a href="#science" className="scroll-prompt"><span className="scroll-circle"><ArrowDown size={14} /></span><span>SCROLL TO DISCOVER</span></a>
            <div className="coordinate"><span>RA 17h 45m 40s</span><span>DEC −29° 00′ 28″</span></div>
          </div>
        </> : <>
          <div className="immersive-top"><span className="eyebrow"><span className="status-dot" /> EXPLORATION MODE</span><button ref={exitButton} className="exit-button" onClick={() => { setImmersive(false); requestAnimationFrame(() => exploreButton.current?.focus()) }}>Exit exploration <X size={16} /></button></div>
          <div className="immersive-description"><h2>Sagittarius A*</h2><p>Move your cursor to shift perspective. An artistic visualization—not a scientific simulation.</p></div>
        </>}

        <div className="scene-controls">
          <span className="simulation-label"><span className="live-dot" /> {paused ? 'ANIMATION PAUSED' : 'LIVE VISUALIZATION'}</span>
          <div className="control-buttons">
            <button className="icon-button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Play animation' : 'Pause animation'} title={paused ? 'Play animation' : 'Pause animation'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
            <button className={`icon-button ${settings ? 'control-active' : ''}`} onClick={() => setSettings(!settings)} aria-label="Visualization settings" aria-expanded={settings} title="Visualization settings"><SlidersHorizontal size={15} /></button>
            <button className="icon-button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title="Fullscreen">{fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
          </div>
          {settings && <div className="settings-panel"><div className="settings-heading">Visual settings<button className="icon-button" aria-label="Close settings" onClick={() => setSettings(false)}><X size={14} /></button></div><label htmlFor="luminosity">Disk luminosity <span>{Math.round(intensity * 100)}%</span></label><input id="luminosity" type="range" min="0.5" max="1.8" step="0.05" value={intensity} onChange={e => setIntensity(Number(e.target.value))} /><p>Artist&apos;s interpretation of gravitational lensing.</p></div>}
        </div>
        {notice && <div className="fullscreen-notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice('')}><X size={14} /></button></div>}
      </section>

      <section className="metrics-strip" aria-label="Sagittarius A star facts">
        <div className="metrics-intro"><Orbit size={22} strokeWidth={1} /><span>A MONSTER.<br />BY THE NUMBERS.</span></div>
        <div className="metric"><span className="metric-value">4.3 <span>million</span></span><span className="micro">TIMES THE MASS OF OUR SUN</span></div>
        <div className="metric"><span className="metric-value">26,000 <span>ly</span></span><span className="micro">FROM EARTH</span></div>
        <div className="metric"><span className="metric-value">1 <span>point of no return</span></span><span className="micro">ENDLESS POSSIBILITIES FOR DISCOVERY</span></div>
      </section>

      <section className="science-section section-padding" id="science">
        <div className="section-heading"><div><span className="eyebrow">01 / THE SCIENCE</span><h2>Invisible. Not unknowable.</h2></div><p>At the edge of our understanding,<br />a new perspective begins.</p></div>
        <div className="discovery-grid">{discoveries.map(item => <article className="discovery" key={item.number}><div className="discovery-number"><span>{item.number}</span><Plus size={15} /></div><span className="micro">{item.label}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
        <a className="text-link" href="https://science.nasa.gov/universe/black-holes/" target="_blank" rel="noopener noreferrer">Explore NASA&apos;s black hole science <ArrowUpRight size={16} /></a>
      </section>

      <section className="mission-section section-padding" id="missions"><div><span className="eyebrow">02 / OUR WINDOW INTO THE UNIVERSE</span><h2>The universe has a story.<br />We&apos;re listening.</h2><p>From X-rays to infrared light, NASA missions reveal<br className="desktop-break" /> what our eyes alone could never see.</p></div><div className="mission-links"><a href="https://science.nasa.gov/mission/chandra/" target="_blank" rel="noopener noreferrer"><span><span className="micro">X-RAY ASTRONOMY</span><strong>Chandra X-ray Observatory</strong></span><MoveUpRight size={21} /></a><a href="https://science.nasa.gov/mission/webb/" target="_blank" rel="noopener noreferrer"><span><span className="micro">INFRARED ASTRONOMY</span><strong>James Webb Space Telescope</strong></span><MoveUpRight size={21} /></a></div></section>
      <footer className="site-footer" id="about"><a href="#explore" className="footer-brand">BEYOND<span>Keep looking up.</span></a><p>An independent NASA-inspired concept.<br />Not affiliated with or endorsed by NASA.</p><a href="https://www.nasa.gov/nasa-brand-center/" target="_blank" rel="noopener noreferrer">NASA brand guidelines <ArrowUpRight size={13} /></a></footer>
    </main>
  )
}
