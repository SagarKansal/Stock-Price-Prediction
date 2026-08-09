import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ensureFontLoaded } from '../data/fonts.js'

const STORAGE_KEY = 'brand-asset-studio:brand-kit:v1'

const DEFAULT_BRAND = {
  brandName: 'Nova Finance',
  tagline: 'Smarter investing, simplified.',
  primaryColor: '#4F46E5',
  secondaryColor: '#14B8A6',
  accentColor: '#F59E0B',
  headingFont: 'Space Grotesk',
  bodyFont: 'Inter',
  logoDataUrl: null,
  headline: 'Predict Smarter. Invest Better.',
  subheadline: 'AI-driven market insights for confident decisions.',
  cta: 'Get Started',
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_BRAND
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_BRAND, ...parsed }
  } catch {
    return DEFAULT_BRAND
  }
}

const BrandContext = createContext(null)

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brand))
  }, [brand])

  useEffect(() => {
    ensureFontLoaded(brand.headingFont)
    ensureFontLoaded(brand.bodyFont)
  }, [brand.headingFont, brand.bodyFont])

  const updateBrand = (patch) => setBrand((prev) => ({ ...prev, ...patch }))
  const resetBrand = () => setBrand(DEFAULT_BRAND)

  const value = useMemo(() => ({ brand, updateBrand, resetBrand }), [brand])

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrand must be used within a BrandProvider')
  return ctx
}

export { DEFAULT_BRAND }
