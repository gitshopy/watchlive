'use client'

import { useEffect } from 'react'
import ReactGA from 'react-ga4'

export default function GoogleAnalytics() {
  useEffect(() => {
    // Only initialize if GA ID is provided
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
      
      // Track initial page view
      ReactGA.send({ hitType: "pageview", page: window.location.pathname })
      
      console.log('Google Analytics initialized with ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)
    } else {
      console.warn('Google Analytics ID not found. Please add NEXT_PUBLIC_GA_MEASUREMENT_ID to your environment variables.')
    }
  }, [])

  return null
}
