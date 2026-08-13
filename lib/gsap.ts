"use client"

import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin)
gsap.config({ nullTargetWarn: false })

export { gsap, ScrollTrigger, ScrollToPlugin }
export { useGSAP } from "@gsap/react"
