# DragDropMediaList Component

## Overview

The `DragDropMediaList` component provides a drag-and-drop interface for reordering media items with thumbnails, alt text editing, and delete confirmation.

## Features

- **Drag & Drop Reordering**: Uses native HTML5 drag API for desktop
- **Touch Support**: Basic touch event handling for mobile devices
- **Visual Feedback**: Drag indicators, drop zones, and hover effects
- **Alt Text Editing**: Inline input for accessibility text
- **Remove Confirmation**: Modal dialog before deletion
- **i18n Support**: Full localization support
- **Responsive Design**: Works at all breakpoints (375px, 768px, 1024px, 1440px)

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mediaItems` | `Media[]` | Yes | Array of media items to display |
| `onReorder` | `(items: Media[]) => void` | Yes | Callback when items are reordered |
| `onRemove` | `(id: string) => void` | Yes | Callback when an item is removed |
| `onAltTextChange` | `(id: string, alt: string) => void` | No | Callback when alt text changes |

## Usage Example

```tsx
import { useState } from 'react';
import DragDropMediaList from './DragDropMediaList';
import type { Media } from '../../types/project';

function MediaManagement() {
  const [mediaItems, setMediaItems] = useState<Media[]>([
    {
      id: '1',
      url: 'https://example.com/image1.jpg',
      role: 'hero',
      sort_order: 0,
      alt: 'First image'
    },
    {
      id: '2',
      url: 'https://example.com/image2.jpg',
      role: 'hero',
      sort_order: 1,
      alt: 'Second image'
    }
  ]);

  const handleReorder = (reorderedItems: Media[]) => {
    setMediaItems(reorderedItems);
    // Send updated order to API
    // api.updateMediaOrder(reorderedItems);
  };

  const handleRemove = (id: string) => {
    // Remove from API
    // api.deleteMedia(id);
    // Update local state
    setMediaItems(items => items.filter(item => item.id !== id));
  };

  const handleAltTextChange = (id: string, alt: string) => {
    // Update alt text in API
    // api.updateMediaAltText(id, alt);
    // Update local state
    setMediaItems(items =>
      items.map(item =>
        item.id === id ? { ...item, alt } : item
      )
    );
  };

  return (
    <DragDropMediaList
      mediaItems={mediaItems}
      onReorder={handleReorder}
      onRemove={handleRemove}
      onAltTextChange={handleAltTextChange}
    />
  );
}
```

## Styling

The component uses Tailwind CSS with the admin UI design system:
- **Primary colors**: Zinc (neutral) palette
- **Accent colors**: Red for destructive actions
- **Shadows**: Subtle elevation for depth
- **Transitions**: Smooth animations for interactions

## Accessibility

- **ARIA labels**: All interactive elements have proper labels
- **Keyboard navigation**: Tab order is logical
- **Focus states**: Visible focus indicators
- **Alt text**: Dedicated input for image accessibility
- **Touch targets**: Minimum 44px for mobile

## Mobile Support

Basic touch support is implemented via touch event handlers. For enhanced mobile drag-and-drop, consider integrating `@dnd-kit/core` or `react-beautiful-dnd` in the future.

## Translations

The component uses the following translation keys:

```typescript
mediaList: {
  title: 'Media Items',
  dragToReorder: 'Drag to reorder',
  altText: 'Alt text',
  altTextPlaceholder: 'Enter alt text for accessibility',
  remove: 'Remove',
  removeConfirm: 'Are you sure you want to remove this media item?',
  confirm: 'Confirm',
  cancel: 'Cancel',
  noMedia: 'No media items yet',
  loading: 'Loading media...'
}
```

These are already added to both `en.ts` and `uk.ts` locale files.

## File Location

- Component: `src/components/admin/DragDropMediaList.tsx`
- Types: `src/types/project.ts` (Media interface)
- Translations: `src/i18n/locales/en.ts`, `src/i18n/locales/uk.ts`
