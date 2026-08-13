"use client"

export const INTRO_EVENT = "dadda:intro-complete"

let introComplete = true

export function markIntroComplete() {
  introComplete = true
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(INTRO_EVENT))
  }
}

export function onIntroComplete(callback: () => void) {
  callback()
  return () => {}
}
