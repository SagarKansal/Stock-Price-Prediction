import CenteredLayout from '../components/layouts/CenteredLayout.jsx'
import BannerSplitLayout from '../components/layouts/BannerSplitLayout.jsx'
import ThumbnailBoldLayout from '../components/layouts/ThumbnailBoldLayout.jsx'
import CardMonogramLayout from '../components/layouts/CardMonogramLayout.jsx'

// The same four layouts used for the fixed-size templates, offered here as
// selectable "styles" so a redesign can be rendered at any custom dimensions.
export const REDESIGN_STYLES = [
  { id: 'centered', name: 'Centered hero', Layout: CenteredLayout },
  { id: 'split', name: 'Split banner', Layout: BannerSplitLayout },
  { id: 'bold', name: 'Bold thumbnail', Layout: ThumbnailBoldLayout },
  { id: 'card', name: 'Card / monogram', Layout: CardMonogramLayout },
]

export function getStyle(id) {
  return REDESIGN_STYLES.find((s) => s.id === id) || REDESIGN_STYLES[0]
}
