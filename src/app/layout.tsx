import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { PWARegister } from '@/components/providers/PWARegister'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400'],
})

export const viewport: Viewport = {
  themeColor: '#ff6d00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: {
    default: 'LOFO — Find What\'s Yours',
    template: '%s | LOFO',
  },
  description:
    'A university campus lost and found platform. Post lost or found items, submit claims, and connect with your campus community.',
  keywords: ['lost and found', 'university', 'campus', 'LOFO'],
  openGraph: {
    title: 'LOFO — Find What\'s Yours',
    description: 'University Lost & Found Platform',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LOFO',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body>
        <PWARegister />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1E2028',
              color: '#F0F2F5',
              border: '1px solid #2A2D37',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#ff6d00', secondary: '#0D0F14' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#0D0F14' },
            },
          }}
        />
      </body>
    </html>
  )
}
