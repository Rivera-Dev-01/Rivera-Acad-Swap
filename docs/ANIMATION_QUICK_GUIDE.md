# Animation Quick Reference Guide

## 🚀 Quick Start

### Most Common Animations

```jsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up (cards, modals)
<div className="animate-slide-up">Content</div>

// Zoom in (modals, popups)
<div className="animate-zoom-in">Content</div>

// Loading spinner
<div className="animate-spin-smooth">
  <Loader />
</div>

// Hover effects
<button className="hover-lift hover-scale">
  Button
</button>
```

## 📋 Animation Cheat Sheet

| Effect | Class | Use Case |
|--------|-------|----------|
| Fade in | `animate-fade-in` | General content |
| Slide up | `animate-slide-up` | Cards, lists |
| Slide down | `animate-slide-down` | Dropdowns |
| Zoom in | `animate-zoom-in` | Modals, popups |
| Spin | `animate-spin-smooth` | Loading |
| Pulse | `animate-pulse-smooth` | Notifications |
| Hover lift | `hover-lift` | Buttons, cards |
| Hover scale | `hover-scale` | Interactive items |

## 🎨 Glassmorphism Elements

All glass elements have smooth transitions built-in:

```jsx
<div className="glass-card">Auto-smooth</div>
<div className="glass-card glass-card-hover">Hover effect</div>
<button className="glass-button">Smooth button</button>
<input className="glass-input" />
```

## ⚡ Performance Tips

1. **Use GPU-accelerated classes** - All animations are optimized
2. **Stagger multiple items** - Use `stagger-1` through `stagger-5`
3. **Combine effects** - `animate-fade-in hover-lift`
4. **Keep it simple** - Less is more

## 🔥 Pro Tips

### Stagger List Items
```jsx
{items.map((item, i) => (
  <div className={`animate-fade-in stagger-${i + 1}`}>
    {item}
  </div>
))}
```

### Modal with Overlay
```jsx
<div className="fixed inset-0 animate-fadeInOverlay">
  <div className="glass-card animate-zoom-in">
    Modal
  </div>
</div>
```

### Toast Notification
```jsx
<div className="glass-card animate-slide-in-right">
  Toast
</div>
```

## ✅ What's Optimized

- ✅ All animations use GPU acceleration
- ✅ Smooth 60 FPS on all devices
- ✅ Reduced CPU usage
- ✅ Better battery life
- ✅ Accessibility support (respects prefers-reduced-motion)

## 📖 Full Documentation

See [ANIMATION_OPTIMIZATION.md](ANIMATION_OPTIMIZATION.md) for complete details.
