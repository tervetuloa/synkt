import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: 'Agent Visualization Dashboard',
  description: 'Premium dark mode agent graph visualization with glassmorphism UI',
}

export const viewport: Viewport = {
  themeColor: '#121212',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-[#121212] text-[#f5f5f5]`}>
        {children}
      </body>
    </html>
  )
}
