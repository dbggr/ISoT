"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Monitor, Smartphone, Tablet, Laptop } from 'lucide-react'

interface ScreenInfo {
  width: number
  height: number
  breakpoint: string
  deviceType: string
  orientation: string
  pixelRatio: number
  touchSupport: boolean
}

export function ResponsiveTest() {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isDevelopment || typeof window === 'undefined') return

    const updateScreenInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Determine breakpoint based on Tailwind CSS breakpoints
      let breakpoint = 'xs'
      let deviceType = 'mobile'
      let icon = Smartphone

      if (width >= 1536) {
        breakpoint = '2xl'
        deviceType = 'desktop'
        icon = Monitor
      } else if (width >= 1280) {
        breakpoint = 'xl'
        deviceType = 'desktop'
        icon = Monitor
      } else if (width >= 1024) {
        breakpoint = 'lg'
        deviceType = 'desktop'
        icon = Laptop
      } else if (width >= 768) {
        breakpoint = 'md'
        deviceType = 'tablet'
        icon = Tablet
      } else if (width >= 640) {
        breakpoint = 'sm'
        deviceType = 'mobile-large'
        icon = Smartphone
      }

      const orientation = width > height ? 'landscape' : 'portrait'
      const pixelRatio = window.devicePixelRatio || 1
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setScreenInfo({
        width,
        height,
        breakpoint,
        deviceType,
        orientation,
        pixelRatio,
        touchSupport
      })
    }

    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)
    window.addEventListener('orientationchange', updateScreenInfo)

    return () => {
      window.removeEventListener('resize', updateScreenInfo)
      window.removeEventListener('orientationchange', updateScreenInfo)
    }
  }, [isDevelopment])

  // Don't render in production
  if (!isDevelopment) return null

  if (!isVisible) {
    return (
      <div className="fixed bottom-16 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          📱 Responsive
        </Button>
      </div>
    )
  }

  const getDeviceIcon = () => {
    if (!screenInfo) return Monitor
    
    switch (screenInfo.deviceType) {
      case 'mobile':
      case 'mobile-large':
        return Smartphone
      case 'tablet':
        return Tablet
      case 'desktop':
        return screenInfo.width >= 1280 ? Monitor : Laptop
      default:
        return Monitor
    }
  }

  const DeviceIcon = getDeviceIcon()

  return (
    <div className="fixed bottom-16 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DeviceIcon className="h-4 w-4" />
              Responsive Test
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="text-xs h-6"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {screenInfo && (
            <>
              {/* Screen Dimensions */}
              <div>
                <h4 className="font-medium mb-1">Screen Size</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Width:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {screenInfo.width}px
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Height:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {screenInfo.height}px
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Breakpoint Info */}
              <div>
                <h4 className="font-medium mb-1">Breakpoint</h4>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={screenInfo.breakpoint === 'xs' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {screenInfo.breakpoint}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {screenInfo.deviceType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {screenInfo.orientation}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Device Capabilities */}
              <div>
                <h4 className="font-medium mb-1">Device Info</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pixel Ratio:</span>
                    <Badge variant="secondary" className="text-xs">
                      {screenInfo.pixelRatio}x
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Touch Support:</span>
                    <Badge 
                      variant={screenInfo.touchSupport ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {screenInfo.touchSupport ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Breakpoint Reference */}
              <div>
                <h4 className="font-medium mb-1">Tailwind Breakpoints</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">xs:</span>
                    <span>0px - 639px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">sm:</span>
                    <span>640px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">md:</span>
                    <span>768px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">lg:</span>
                    <span>1024px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">xl:</span>
                    <span>1280px+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">2xl:</span>
                    <span>1536px+</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Responsive Design Checklist */}
              <div>
                <h4 className="font-medium mb-1">Design Checklist</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={screenInfo.width >= 44 ? 'default' : 'destructive'}
                      className="text-xs w-4 h-4 p-0 flex items-center justify-center"
                    >
                      {screenInfo.width >= 44 ? '✓' : '✗'}
                    </Badge>
                    <span className="text-xs">Touch targets ≥44px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={screenInfo.breakpoint !== 'xs' ? 'default' : 'secondary'}
                      className="text-xs w-4 h-4 p-0 flex items-center justify-center"
                    >
                      {screenInfo.breakpoint !== 'xs' ? '✓' : '?'}
                    </Badge>
                    <span className="text-xs">Responsive layout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={screenInfo.touchSupport ? 'default' : 'secondary'}
                      className="text-xs w-4 h-4 p-0 flex items-center justify-center"
                    >
                      {screenInfo.touchSupport ? '✓' : 'N/A'}
                    </Badge>
                    <span className="text-xs">Touch interactions</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2">
                <div className="flex gap-1">
                  <Button
                    onClick={() => {
                      console.log('Screen Info:', screenInfo)
                      console.log('CSS Media Queries:', {
                        mobile: window.matchMedia('(max-width: 767px)').matches,
                        tablet: window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches,
                        desktop: window.matchMedia('(min-width: 1024px)').matches,
                        touch: window.matchMedia('(pointer: coarse)').matches,
                        hover: window.matchMedia('(hover: hover)').matches
                      })
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 flex-1"
                  >
                    📋 Log Info
                  </Button>
                  <Button
                    onClick={() => {
                      const testData = {
                        timestamp: new Date().toISOString(),
                        screenInfo,
                        userAgent: navigator.userAgent,
                        viewport: {
                          width: window.innerWidth,
                          height: window.innerHeight,
                          availWidth: window.screen.availWidth,
                          availHeight: window.screen.availHeight
                        }
                      }
                      const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `responsive-test-${Date.now()}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 flex-1"
                  >
                    💾 Export
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}