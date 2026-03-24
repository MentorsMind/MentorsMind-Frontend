# Mobile-First Responsive Design - Quick Start Guide

## 🚀 Getting Started

### 1. Import the Mobile Hook
```tsx
import { useMobile } from './hooks/useMobile';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, breakpoint } = useMobile();
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### 2. Add Mobile Navigation
```tsx
import { MobileNavigation, MobileHeader } from './components/mobile/MobileNavigation';
import { Home, Search, User } from 'lucide-react';

function App() {
  const [activeNav, setActiveNav] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-6 h-6" />, href: '/' },
    { id: 'search', label: 'Search', icon: <Search className="w-6 h-6" />, href: '/search' },
    { id: 'profile', label: 'Profile', icon: <User className="w-6 h-6" />, href: '/profile' },
  ];

  return (
    <div className="min-h-screen pb-20">
      <MobileHeader title="My App" />
      
      <main className="p-4">
        {/* Your content */}
      </main>

      <MobileNavigation
        items={navItems}
        activeItem={activeNav}
        onItemClick={setActiveNav}
      />
    </div>
  );
}
```

### 3. Create Mobile-Friendly Forms
```tsx
import { MobileForm, MobileInput, MobileButton } from './components/mobile/MobileForm';

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <MobileForm onSubmit={(e) => {
      e.preventDefault();
      console.log(formData);
    }}>
      <MobileInput
        id="name"
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      
      <MobileInput
        id="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      
      <MobileButton type="submit" variant="primary" fullWidth>
        Submit
      </MobileButton>
    </MobileForm>
  );
}
```

### 4. Add Touch Gestures
```tsx
import { TouchGestures } from './components/mobile/TouchGestures';

function SwipeableCard() {
  return (
    <TouchGestures
      onSwipeLeft={() => console.log('Next')}
      onSwipeRight={() => console.log('Previous')}
      onDoubleTap={() => console.log('Liked!')}
    >
      <div className="p-4 bg-white rounded-xl">
        Swipe me!
      </div>
    </TouchGestures>
  );
}
```

### 5. Implement Pull to Refresh
```tsx
import { PullToRefresh } from './components/mobile/PullToRefresh';

function FeedPage() {
  const handleRefresh = async () => {
    // Fetch new data
    await fetchLatestPosts();
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </PullToRefresh>
  );
}
```

### 6. Use Mobile Modals
```tsx
import { MobileModal, ActionSheet } from './components/mobile/MobileModal';

function OptionsMenu() {
  const [showModal, setShowModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Open Modal</button>
      <button onClick={() => setShowActions(true)}>Open Actions</button>

      {/* Bottom Sheet Modal */}
      <MobileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        position="bottom"
        title="Options"
      >
        <div className="p-4">
          <p>Modal content here</p>
        </div>
      </MobileModal>

      {/* Action Sheet */}
      <ActionSheet
        isOpen={showActions}
        onClose={() => setShowActions(false)}
        actions={[
          { label: 'Edit', onClick: () => console.log('Edit') },
          { label: 'Share', onClick: () => console.log('Share') },
          { label: 'Delete', onClick: () => console.log('Delete'), variant: 'danger' },
        ]}
      />
    </>
  );
}
```

### 7. Add Loading States
```tsx
import { MobileLoading, CardSkeleton } from './components/mobile/MobileLoading';

function DataList() {
  const { data, isLoading } = useData();

  if (isLoading) {
    return <CardSkeleton count={3} />;
  }

  return (
    <div className="space-y-4">
      {data.map(item => <Card key={item.id} item={item} />)}
    </div>
  );
}
```

### 8. Optimize Images
```tsx
import { ResponsiveImage, Avatar } from './components/mobile/ResponsiveImage';

function UserProfile() {
  return (
    <div>
      <Avatar
        src={user.avatar}
        alt={user.name}
        size="lg"
        fallbackText={user.name}
      />
      
      <ResponsiveImage
        src={user.coverImage}
        alt="Cover"
        aspectRatio="16:9"
        lazy
      />
    </div>
  );
}
```

## 🎨 Styling Tips

### Use Safe Area Utilities
```tsx
// For fixed headers
<header className="sticky top-0 safe-area-top">
  Header content
</header>

// For fixed footers
<footer className="fixed bottom-0 safe-area-bottom">
  Footer content
</footer>
```

### Touch-Friendly Sizing
```tsx
// All interactive elements should be at least 44px
<button className="tap-target px-4 py-3">
  Touch Me
</button>
```

### Hide Scrollbars
```tsx
<div className="overflow-x-auto scrollbar-hide">
  Horizontal scrolling content
</div>
```

### Responsive Breakpoints
```tsx
<div className="
  text-sm sm:text-base md:text-lg
  p-2 sm:p-4 md:p-6
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
">
  Responsive content
</div>
```

## 📱 Testing Checklist

- [ ] Test on actual mobile devices (iOS and Android)
- [ ] Verify touch targets are at least 44px
- [ ] Check safe area insets on notched devices
- [ ] Test pull-to-refresh functionality
- [ ] Verify swipe gestures work smoothly
- [ ] Test modals and bottom sheets
- [ ] Check form inputs on mobile keyboards
- [ ] Verify loading states appear correctly
- [ ] Test offline behavior
- [ ] Check landscape orientation
- [ ] Verify accessibility with screen readers

## 🔧 Common Issues & Solutions

### Issue: Navigation bar hidden behind content
```tsx
// Add padding to main content
<main className="pb-20">
  {/* Content */}
</main>
```

### Issue: Modal not scrolling on iOS
```tsx
// Use overscroll-contain
<div className="overflow-y-auto overscroll-contain">
  {/* Modal content */}
</div>
```

### Issue: Touch events not working
```tsx
// Ensure parent doesn't prevent default
<div style={{ touchAction: 'pan-y' }}>
  {/* Touch content */}
</div>
```

### Issue: Images loading slowly
```tsx
// Use lazy loading and placeholders
<ResponsiveImage
  src={image}
  alt="Description"
  lazy
  placeholder="/placeholder.jpg"
/>
```

## 📚 Next Steps

1. Review the full documentation in `MOBILE_RESPONSIVE_FEATURE.md`
2. Check out the demo page at `src/pages/MobileDemo.tsx`
3. Run tests with `npm test`
4. Customize components to match your design system
5. Add haptic feedback for enhanced UX
6. Implement offline support
7. Add PWA capabilities

## 🎯 Pro Tips

1. **Always test on real devices** - Emulators don't capture the full mobile experience
2. **Use the useMobile hook** - It provides all device info you need
3. **Implement pull-to-refresh** - Users expect it on mobile
4. **Add loading states** - Mobile networks can be slow
5. **Optimize images** - Use appropriate sizes for mobile
6. **Consider offline mode** - Mobile connections are unreliable
7. **Use safe area utilities** - Essential for modern devices
8. **Test touch gestures** - Ensure they feel natural
9. **Minimize bundle size** - Mobile data is expensive
10. **Monitor performance** - Mobile devices have less power

## 🆘 Need Help?

- Check component source code for detailed documentation
- Review test files for usage examples
- Visit the demo page for interactive examples
- Read the full feature documentation

Happy mobile development! 📱✨
