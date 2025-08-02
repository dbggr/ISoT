# Template Page

This template provides a reusable skeleton for creating new pages with the same layout and structure as the main dashboard. It uses Next.js routing with Link components for navigation.

## Usage

### Basic Usage

```tsx
import TemplatePage from '@/app/template/page'

export default function MyNewPage() {
  return (
    <TemplatePage>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">My Page Content</h2>
        {/* Your page content goes here */}
      </div>
    </TemplatePage>
  )
}
```

### Custom Configuration

```tsx
import TemplatePage from '@/app/template/page'
import { Settings, Database, Network } from 'lucide-react'

export default function CustomPage() {
  return (
    <TemplatePage
      title="SYSTEM ADMIN"
      sections={[
        { id: "settings", icon: Settings, label: "SETTINGS", href: "/admin/settings" },
        { id: "database", icon: Database, label: "DATABASE", href: "/admin/database" },
        { id: "network", icon: Network, label: "NETWORK", href: "/admin/network" },
      ]}
      currentSection="settings"
      customSystemData={{
        uptime: "120:45:12",
        groups: "1,234 ACTIVE",
        services: "56 RUNNING",
        status: "MAINTENANCE"
      }}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        {/* Your settings content */}
      </div>
    </TemplatePage>
  )
}
```

## Props

### TemplatePageProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"INFRASTRUCTURE"` | The main title displayed in the sidebar header |
| `sections` | `Array<SectionConfig>` | Default sections | Array of navigation sections with links |
| `currentSection` | `string` | Auto-detected from URL | The currently active section ID |
| `showSystemStatus` | `boolean` | `true` | Whether to show the system status panel |
| `customSystemData` | `SystemData` | Default data | Custom data for the system status panel |
| `children` | `React.ReactNode` | Required | The page content to display |

### SectionConfig

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the section |
| `icon` | `LucideIcon` | Icon component from lucide-react |
| `label` | `string` | Display label for the navigation |
| `href` | `string` | Next.js route path for the section |

### SystemData

| Property | Type | Description |
|----------|------|-------------|
| `uptime` | `string` | System uptime display |
| `groups` | `string` | Groups count display |
| `services` | `string` | Services count display |
| `status` | `string` | System status display |

## Features

- **Responsive Design**: Mobile-friendly with collapsible sidebar
- **Tactical Theme**: Dark theme with orange accents matching the main dashboard
- **Accessibility**: ARIA labels and keyboard navigation support
- **Customizable**: All sections, icons, and data can be customized
- **SEO Ready**: Includes SEO head component integration
- **System Status**: Optional system status panel with real-time data
- **Smooth Animations**: Transition effects for sidebar and navigation

## File Structure

```
app/template/
├── page.tsx          # Main template component
├── README.md         # This documentation
└── examples/         # Usage examples (optional)
```

## Best Practices

1. **Component Organization**: Keep section components in separate files for better maintainability
2. **Icon Consistency**: Use lucide-react icons for consistency with the design system
3. **Data Management**: Use React hooks or state management for dynamic data
4. **Accessibility**: Ensure all custom components follow accessibility guidelines
5. **Performance**: Lazy load heavy components when possible

## Example Implementation

See the main dashboard (`app/page.tsx`) for a complete implementation example using this template structure.