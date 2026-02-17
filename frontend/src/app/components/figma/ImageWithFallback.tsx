import React, { useState, useEffect } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [didError, setDidError] = useState(false)

  const { src, alt, style, className, loading = "lazy", ...rest } = props

  // Reset states if src changes
  useEffect(() => {
    setIsLoaded(false)
    setDidError(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setDidError(true)
  }

  if (didError) {
    return (
      <div
        className={`inline-block bg-slate-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" className="opacity-20 w-12 h-12" />
        </div>
      </div>
    )
  }

  // Optimization: Automatically request WebP/Optimized version from Supabase if applicable
  const optimizedSrc = src?.includes('supabase.co') && !src.includes('?')
    ? `${src}?width=600&quality=75&format=webp`
    : src;

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`} style={style}>
      {/* Skeleton / Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <div className="w-1/3 h-1/3 bg-slate-300 rounded-full opacity-20" />
        </div>
      )}

      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        className={`w-full h-full transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ ...style, objectFit: (style as any)?.objectFit || 'cover' }}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
    </div>
  )
}


