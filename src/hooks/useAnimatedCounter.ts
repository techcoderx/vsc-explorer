import { useEffect, useRef, useState } from 'react'

export const useAnimatedCounter = (target: number, duration: number = 800): number => {
  const [display, setDisplay] = useState(target)
  const prevTarget = useRef(target)
  const hasAnimated = useRef(false)
  const rafId = useRef(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    const from = hasAnimated.current ? prevTarget.current : 0
    prevTarget.current = target

    if (!hasAnimated.current) {
      hasAnimated.current = true
    }

    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplay(Math.round(from + (target - from) * eased))
      if (progress < 1) rafId.current = requestAnimationFrame(animate)
    }

    cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId.current)
  }, [target, duration])

  return display
}
