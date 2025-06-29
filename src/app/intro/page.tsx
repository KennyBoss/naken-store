'use client'

import React, { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronUp, ArrowRight, Sparkles, Users, ShoppingBag } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const scenesData = [
  {
    id: 'scene-1',
    image: '/images/ufo.png',
    alt: 'UFO abducting an ancient scroll in the fog',
    title: 'Добро пожаловать в NAKEN',
    subtitle: 'Откройте для себя мир стильной одежды',
  },
  {
    id: 'scene-2',
    image: '/images/cyborgs.png',
    alt: 'Cyborgs studying the scroll with neon outlines',
    title: 'Технологии будущего',
    subtitle: 'В каждом элементе дизайна',
  },
  {
    id: 'scene-3',
    image: '/images/temple.png',
    alt: 'A bridge leading to a mystical temple',
    title: 'Путь к совершенству',
    subtitle: 'Качество проверенное временем',
  },
  {
    id: 'scene-4',
    image: '/images/dragon.png',
    alt: 'A dragon revealing a scroll with the NAKEN logo',
    title: 'Сила NAKEN',
    subtitle: 'Ваш стиль - наша миссия',
  },
  {
    id: 'scene-5',
    image: '', // Final report scene
    alt: 'Transition to main site',
    title: 'Готовы начать?',
    subtitle: 'Переходите в каталог',
  },
]

const IntroPage = () => {
  const component = useRef<HTMLDivElement>(null)
  const animationWrapper = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [countdown, setCountdown] = useState<number | null>(null)
  const [finalSceneVisible, setFinalSceneVisible] = useState(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sceneElements: HTMLElement[] = gsap.utils.toArray('.scene')
      const totalScenes = sceneElements.length

      // Set initial z-indexes for stacking
      gsap.set(sceneElements, {
        zIndex: (i) => totalScenes - i,
      })

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: component.current,
          start: 'top top',
          end: `+=${totalScenes * 100}%`,
          scrub: 3,
          pin: true,
        },
      })

      // Animate each scene to scale up and fade out
      sceneElements.forEach((scene, index) => {
        if (index < totalScenes - 1) {
          masterTimeline.to(
            scene,
            {
              scale: 1.5,
              opacity: 0,
              ease: 'none',
            },
            '>'
          ) 
        }
      })

      // Animate swipe indicator
      gsap.to('.swipe-indicator', {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      })

      // Animate progress bar
      gsap.to('.progress-bar', {
        scaleX: 1,
        duration: masterTimeline.duration(),
        ease: 'none',
        scrollTrigger: {
          trigger: component.current,
          start: 'top top',
          end: `+=${totalScenes * 100}%`,
          scrub: true,
        }
      })

    }, component)

    return () => ctx.revert()
  }, [])

  const handleGoToSite = () => {
    console.log('🔥 Переход на главную!')
    localStorage.setItem('hasSeenIntro', 'true');
    window.location.href = '/'
  }

  // Отслеживание финальной сцены
  useEffect(() => {
    const finalScene = document.querySelector('.final-scene')
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !finalSceneVisible) {
          console.log('🔥 Финальная сцена видна! Запускаем таймер...')
          setFinalSceneVisible(true)
          setCountdown(3)
        }
      })
    }, { threshold: 0.5 })

    if (finalScene) {
      observer.observe(finalScene)
    }

    return () => observer.disconnect()
  }, [finalSceneVisible])

  // Автоматический обратный отсчет и переход
  useEffect(() => {
    if (countdown === null) return
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          console.log('🔥 Автоматический переход!')
          handleGoToSite()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  return (
    <>
      <style jsx>{`
        body,
        html {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #000;
        }
        .scroll-container {
          height: ${scenesData.length}00vh;
          position: relative;
        }
        .animation-wrapper {
          position: sticky;
          top: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          perspective: 1000px;
        }
        .scene {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          background-color: #000;
          text-align: center;
        }
        .scene::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.7) 100%
          );
          opacity: 0.5;
        }
        .scene img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
        }
        .scene .image-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #1a1a1a, #333);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 1.2rem;
          position: absolute;
          top: 0;
          left: 0;
          z-index: -1;
        }
        .content {
          z-index: 10;
          max-width: 80%;
          padding: 2rem;
        }
        .title {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        .subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        .swipe-indicator {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: rgba(255,255,255,0.8);
          font-size: 0.9rem;
          gap: 0.5rem;
        }
        .progress-bar-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.1);
          z-index: 20;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #14b8a6, #06b6d4);
          transform-origin: left;
          transform: scaleX(0);
        }
        .final-scene {
          background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
          justify-content: space-around;
          padding: 2rem;
        }
        .report-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 2rem;
          margin: 1rem 0;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        .stat-item {
          text-align: center;
          padding: 1rem;
          background: rgba(20,184,166,0.1);
          border-radius: 0.5rem;
          border: 1px solid rgba(20,184,166,0.3);
        }
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #14b8a6;
        }
        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 0.5rem;
        }
        .go-to-site-btn {
          background: linear-gradient(135deg, #14b8a6, #06b6d4);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 2rem;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(20,184,166,0.3);
        }
        .go-to-site-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(20,184,166,0.4);
        }
        @media (max-width: 768px) {
          .title {
            font-size: 2rem;
          }
          .subtitle {
            font-size: 1.2rem;
          }
          .content {
            max-width: 90%;
            padding: 1rem;
          }
        }
      `}</style>
      <div ref={component}>
        <div ref={animationWrapper} className='animation-wrapper'>
          {scenesData.map((scene, index) => (
            <section key={scene.id} className={`scene ${index === scenesData.length - 1 ? 'final-scene' : ''}`}>
              {scene.image && (
                <>
                  <img 
                    src={scene.image} 
                    alt={scene.alt}
                    onError={(e) => {
                      console.log('🖼️ Ошибка загрузки изображения в интро:', scene.image)
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('.image-fallback') as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }
                    }}
                  />
                  <div className="image-fallback" style={{ display: 'none' }}>
                    Изображение недоступно
                  </div>
                </>
              )}
              
              {index < scenesData.length - 1 ? (
                // Regular scenes with titles
                <div className="content">
                  <h1 className="title">{scene.title}</h1>
                  <p className="subtitle">{scene.subtitle}</p>
                </div>
              ) : (
                // Final scene with report
                <div className="content">
                  <div className="report-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Sparkles className="text-teal-400" size={24} />
                      <h1 className="title" style={{ fontSize: '2rem', margin: 0 }}>NAKEN Store</h1>
                    </div>
                    
                    <p className="subtitle" style={{ margin: 0, marginBottom: '1.5rem' }}>
                      Премиальная одежда для современных людей
                    </p>
                    
                    <div className="stats-grid">
                      <div className="stat-item">
                        <Users size={24} style={{ margin: '0 auto 0.5rem', color: '#14b8a6' }} />
                        <div className="stat-number">1000+</div>
                        <div className="stat-label">Довольных клиентов</div>
                      </div>
                      <div className="stat-item">
                        <ShoppingBag size={24} style={{ margin: '0 auto 0.5rem', color: '#14b8a6' }} />
                        <div className="stat-number">500+</div>
                        <div className="stat-label">Товаров в каталоге</div>
                      </div>
                      <div className="stat-item">
                        <Sparkles size={24} style={{ margin: '0 auto 0.5rem', color: '#14b8a6' }} />
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Качество</div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="go-to-site-btn" 
                    onClick={handleGoToSite}
                    style={{ 
                      position: 'relative',
                      zIndex: 999
                    }}
                  >
                    {countdown !== null && countdown > 0 ? `Переход через ${countdown} сек...` : 'Перейти в каталог'}
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </section>
          ))}
        </div>
        
        {/* Swipe indicator - показывается только на первых страницах */}
        <div className="swipe-indicator">
          <span>Пролистайте вверх</span>
          <ChevronUp size={24} />
        </div>
        
        {/* Progress bar */}
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
      </div>
    </>
  )
}

export default IntroPage