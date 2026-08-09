import CenteredLayout from '../components/layouts/CenteredLayout.jsx'
import BannerSplitLayout from '../components/layouts/BannerSplitLayout.jsx'
import ThumbnailBoldLayout from '../components/layouts/ThumbnailBoldLayout.jsx'
import CardMonogramLayout from '../components/layouts/CardMonogramLayout.jsx'

// Registry of downloadable assets. Each maps a real-world size to a shared
// layout component, so adding a new asset is a one-line entry.
export const TEMPLATES = [
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: 'Social',
    width: 1080,
    height: 1080,
    Layout: CenteredLayout,
  },
  {
    id: 'instagram-story',
    name: 'Instagram / FB Story',
    category: 'Social',
    width: 1080,
    height: 1920,
    Layout: CenteredLayout,
  },
  {
    id: 'og-image',
    name: 'Open Graph / Link Preview',
    category: 'Web',
    width: 1200,
    height: 630,
    Layout: BannerSplitLayout,
  },
  {
    id: 'twitter-header',
    name: 'X / Twitter Header',
    category: 'Social',
    width: 1500,
    height: 500,
    Layout: BannerSplitLayout,
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'Social',
    width: 1584,
    height: 396,
    Layout: BannerSplitLayout,
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    category: 'Social',
    width: 820,
    height: 312,
    Layout: BannerSplitLayout,
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'Video',
    width: 1280,
    height: 720,
    Layout: ThumbnailBoldLayout,
  },
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'Print',
    width: 1050,
    height: 600,
    Layout: CardMonogramLayout,
  },
]
