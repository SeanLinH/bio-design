# UI Design System

## Bio-Design Innovation Platform Design System

This document defines the comprehensive design system for the Bio-Design Multi-Agent Innovation Platform, ensuring consistent user experience across all three phases of the Stanford Biodesign methodology.

## 🎨 Design Principles

### 1. Phase-Driven Design
Each innovation phase has distinct visual characteristics while maintaining overall system cohesion:

- **IDENTIFY Phase**: Blue tones (#2563EB) representing exploration and discovery
- **INVENT Phase**: Green tones (#059669) representing growth and creation  
- **IMPLEMENT Phase**: Orange tones (#EA580C) representing energy and execution

### 2. Multi-Agent Collaboration
Visual design supports multi-agent interaction patterns:
- Distinct agent avatars and color coding
- Clear conversation threading
- Real-time activity indicators
- Consensus building visualization

### 3. Multimodal Content Integration
Interface accommodates diverse content types:
- Drag-and-drop zones for various file formats
- Preview capabilities for images, documents, and diagrams
- Annotation and markup tools
- Content relationship mapping

### 4. Progressive Complexity
Information architecture supports both novice and expert users:
- Simple entry points with guided workflows
- Advanced features accessible through progressive disclosure
- Contextual help and onboarding
- Customizable interface density

## 🎯 Core Color Palette

### Primary Colors
```css
/* Phase 1: IDENTIFY */
--identify-primary: #2563EB;    /* Blue 600 */
--identify-light: #DBEAFE;      /* Blue 100 */
--identify-dark: #1D4ED8;       /* Blue 700 */

/* Phase 2: INVENT */
--invent-primary: #059669;      /* Emerald 600 */
--invent-light: #D1FAE5;        /* Emerald 100 */
--invent-dark: #047857;         /* Emerald 700 */

/* Phase 3: IMPLEMENT */
--implement-primary: #EA580C;   /* Orange 600 */
--implement-light: #FED7AA;     /* Orange 200 */
--implement-dark: #C2410C;      /* Orange 700 */
```

### Neutral Colors
```css
/* Background and surfaces */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Semantic colors */
--success: #10B981;     /* Green 500 */
--warning: #F59E0B;     /* Amber 500 */
--error: #EF4444;       /* Red 500 */
--info: #3B82F6;        /* Blue 500 */
```

### Agent Colors
```css
/* AI Agent Identity Colors */
--agent-medical: #DC2626;       /* Red 600 - Medical Expert */
--agent-tech: #2563EB;          /* Blue 600 - Tech Engineer */
--agent-business: #059669;       /* Emerald 600 - Business Analyst */
--agent-regulatory: #7C3AED;     /* Violet 600 - Regulatory Affairs */
--agent-ethics: #BE185D;         /* Pink 700 - Ethicist */
--agent-patient: #0891B2;        /* Cyan 600 - Patient Advocate */
--agent-devil: #374151;          /* Gray 700 - Devil's Advocate */
```

## 🖼️ Typography

### Font Stack
```css
/* Primary font for UI */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace for code and technical content */
font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### Type Scale
```css
/* Headings */
--text-5xl: 3rem;      /* 48px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Section headers */
--text-3xl: 1.875rem;  /* 30px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Component headers */
--text-xl: 1.25rem;    /* 20px - Subheadings */
--text-lg: 1.125rem;   /* 18px - Large body text */

/* Body text */
--text-base: 1rem;     /* 16px - Default body */
--text-sm: 0.875rem;   /* 14px - Small text */
--text-xs: 0.75rem;    /* 12px - Captions */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 📏 Spacing System

### Base Unit: 4px
```css
/* Spacing scale based on 4px grid */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
```

## 🎭 Component Patterns

### Cards and Containers
```css
/* Card base styles */
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
}

/* Phase-specific card variants */
.card--identify { border-left: 4px solid var(--identify-primary); }
.card--invent { border-left: 4px solid var(--invent-primary); }
.card--implement { border-left: 4px solid var(--implement-primary); }
```

### Buttons
```css
/* Primary button states */
.btn-primary {
  background: var(--phase-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--phase-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Button sizes */
.btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.btn-md { padding: 0.5rem 1rem; font-size: 1rem; }
.btn-lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; }
```

### Agent Indicators
```css
/* Agent avatar component */
.agent-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 2px solid var(--agent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  position: relative;
}

.agent-avatar::after {
  content: '';
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 0.75rem;
  height: 0.75rem;
  background: var(--success);
  border: 2px solid white;
  border-radius: 50%;
}

/* Active state */
.agent-avatar--active {
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 4px rgba(var(--agent-color-rgb), 0.2);
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large screens */
```

### Layout Grid
```css
/* Container max-widths */
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
```

## 🔄 Animation and Transitions

### Standard Durations
```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing Functions
```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations
```css
/* Fade in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Loading pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Agent activity indicator */
@keyframes agentActivity {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

## 🎪 Multimodal Content Styling

### File Upload Zones
```css
.upload-zone {
  border: 2px dashed var(--gray-300);
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  background: var(--gray-50);
}

.upload-zone--dragover {
  border-color: var(--phase-primary);
  background: var(--phase-light);
}

.upload-zone--error {
  border-color: var(--error);
  background: #FEF2F2;
}
```

### Content Preview Cards
```css
.content-preview {
  position: relative;
  border-radius: 0.375rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-preview__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  background: var(--gray-100);
}

.content-preview__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.content-preview:hover .content-preview__overlay {
  opacity: 1;
}
```

## 🎯 Accessibility Considerations

### Focus Management
```css
/* High contrast focus indicators */
.focus-ring {
  outline: 2px solid var(--phase-primary);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--gray-900);
  color: white;
  padding: 8px;
  z-index: 100;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### Color Contrast
All color combinations meet WCAG 2.1 AA standards:
- Normal text: minimum 4.5:1 contrast ratio
- Large text: minimum 3:1 contrast ratio
- Interactive elements: minimum 3:1 contrast ratio

### Screen Reader Support
```css
/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 📊 Component States

### Loading States
```css
.loading-skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Error States
```css
.error-state {
  border: 1px solid var(--error);
  background: #FEF2F2;
  color: var(--error);
  padding: 1rem;
  border-radius: 0.375rem;
}

.error-state__icon {
  color: var(--error);
  margin-right: 0.5rem;
}
```

### Success States
```css
.success-state {
  border: 1px solid var(--success);
  background: #F0FDF4;
  color: var(--success);
  padding: 1rem;
  border-radius: 0.375rem;
}
```

---

*This design system ensures consistent, accessible, and beautiful user interfaces across all phases of the Bio-Design Innovation Platform.*
