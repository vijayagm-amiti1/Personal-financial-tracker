declare module 'canvas-confetti' {
  type ConfettiOptions = {
    particleCount?: number
    spread?: number
    startVelocity?: number
    origin?: {
      x?: number
      y?: number
    }
    colors?: string[]
  }

  export default function confetti(options?: ConfettiOptions): Promise<null>
}
