import ReactGA from 'react-ga4'

// Track page views
export const trackPageView = (page: string) => {
  ReactGA.send({ hitType: "pageview", page })
}

// Track custom events
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value
  })
}

// Track user interactions
export const trackUserInteraction = (action: string, label?: string) => {
  trackEvent('User Interaction', action, label)
}

// Track feature usage
export const trackFeatureUsage = (feature: string, action: string) => {
  trackEvent('Feature Usage', action, feature)
}

// Track errors
export const trackError = (error: string, context?: string) => {
  trackEvent('Error', error, context)
}

// Track performance metrics
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('Performance', metric, undefined, value)
}

// World Clock specific tracking functions
export const trackWorldClockEvent = {
  // Track city additions
  cityAdded: (cityName: string, country: string) => {
    trackEvent('World Clock', 'City Added', `${cityName}, ${country}`)
  },
  
  // Track city removals
  cityRemoved: (cityName: string, country: string) => {
    trackEvent('World Clock', 'City Removed', `${cityName}, ${country}`)
  },
  
  // Track timezone searches
  timezoneSearched: (searchTerm: string) => {
    trackEvent('World Clock', 'Timezone Searched', searchTerm)
  },
  
  // Track fullscreen usage
  fullscreenToggled: (action: 'enter' | 'exit', timeboxType: string) => {
    trackEvent('World Clock', `Fullscreen ${action}`, timeboxType)
  },
  
  // Track minimize/maximize
  cityMinimized: (cityName: string, action: 'minimize' | 'maximize') => {
    trackEvent('World Clock', `City ${action}`, cityName)
  },
  
  // Track clock interactions
  clockInteraction: (action: string, cityName?: string) => {
    trackEvent('World Clock', action, cityName)
  }
}
