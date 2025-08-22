# Google Analytics Setup Guide

## 1. Environment Variables

Create a `.env.local` file in your project root and add:

```env
# Google Analytics 4 Measurement ID
# Get this from your Google Analytics dashboard
# Format: G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Enable/disable analytics in development
NEXT_PUBLIC_GA_ENABLED=true
```

## 2. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or select existing one
3. Go to Admin → Data Streams → Web
4. Copy the Measurement ID (starts with "G-")

## 3. Integration

The Google Analytics component is already created and ready to use. Just add it to your layout:

```tsx
// app/layout.tsx or pages/_app.tsx
import GoogleAnalytics from '@/components/GoogleAnalytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  )
}
```

## 4. Usage Examples

### Track custom events:
```tsx
import { trackWorldClockEvent } from '@/lib/analytics'

// Track city addition
trackWorldClockEvent.cityAdded('Tokyo', 'Japan')

// Track fullscreen usage
trackWorldClockEvent.fullscreenToggled('enter', 'Current Time')

// Track minimize/maximize
trackWorldClockEvent.cityMinimized('London', 'minimize')
```

### Track page views:
```tsx
import { trackPageView } from '@/lib/analytics'

useEffect(() => {
  trackPageView('/world-clock')
}, [])
```

## 5. Features

✅ **Automatic page tracking**  
✅ **Environment-based configuration**  
✅ **TypeScript support**  
✅ **Pre-built tracking functions**  
✅ **Performance optimized**  
✅ **Development mode warnings**  

## 6. Testing

1. Add your GA ID to `.env.local`
2. Check browser console for "Google Analytics initialized" message
3. Visit your site and check Google Analytics Real-Time reports
4. Test custom events using the tracking functions

## 7. Privacy & GDPR

- Only tracks when user consents (if implementing consent management)
- No personal data collected
- Respects user privacy preferences
- Compliant with data protection regulations
