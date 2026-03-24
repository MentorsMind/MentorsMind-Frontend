import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileNavigation, MobileHeader, MobileTabBar } from '../components/mobile/MobileNavigation';
import { MobileModal, BottomSheet, ActionSheet } from '../components/mobile/MobileModal';
import { TouchGestures } from '../components/mobile/TouchGestures';
import { PullToRefresh } from '../components/mobile/PullToRefresh';
import { MobileInput, MobileButton, MobileForm } from '../components/mobile/MobileForm';
import { MobileLoading, Skeleton, CardSkeleton } from '../components/mobile/MobileLoading';
import { ResponsiveImage, Avatar } from '../components/mobile/ResponsiveImage';

// Mock useMobile hook
vi.mock('../hooks/useMobile', () => ({
  useMobile: () => ({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: true,
    breakpoint: 'sm',
    orientation: 'portrait',
    isOnline: true,
  }),
}));

describe('MobileNavigation', () => {
  const mockItems = [
    { id: 'home', label: 'Home', icon: <span>🏠</span>, href: '/' },
    { id: 'search', label: 'Search', icon: <span>🔍</span>, href: '/search' },
  ];

  it('renders navigation items', () => {
    const onItemClick = vi.fn();
    render(
      <MobileNavigation
        items={mockItems}
        activeItem="home"
        onItemClick={onItemClick}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('calls onItemClick when item is clicked', () => {
    const onItemClick = vi.fn();
    render(
      <MobileNavigation
        items={mockItems}
        activeItem="home"
        onItemClick={onItemClick}
      />
    );

    fireEvent.click(screen.getByText('Search'));
    expect(onItemClick).toHaveBeenCalledWith('search');
  });

  it('shows badge when provided', () => {
    const itemsWithBadge = [
      { ...mockItems[0], badge: 5 },
      mockItems[1],
    ];
    
    render(
      <MobileNavigation
        items={itemsWithBadge}
        activeItem="home"
        onItemClick={vi.fn()}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

describe('MobileHeader', () => {
  it('renders title', () => {
    render(<MobileHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('shows back button when enabled', () => {
    const onBackClick = vi.fn();
    render(
      <MobileHeader
        title="Test"
        showBackButton
        onBackClick={onBackClick}
      />
    );

    const backButton = screen.getByLabelText('Go back');
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(onBackClick).toHaveBeenCalled();
  });

  it('shows menu button when enabled', () => {
    const onMenuClick = vi.fn();
    render(
      <MobileHeader
        title="Test"
        showMenuButton
        onMenuClick={onMenuClick}
      />
    );

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    expect(onMenuClick).toHaveBeenCalled();
  });
});

describe('MobileTabBar', () => {
  const tabs = [
    { id: 'all', label: 'All', count: 10 },
    { id: 'active', label: 'Active', count: 5 },
  ];

  it('renders tabs with counts', () => {
    render(
      <MobileTabBar
        tabs={tabs}
        activeTab="all"
        onTabChange={vi.fn()}
      />
    );

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn();
    render(
      <MobileTabBar
        tabs={tabs}
        activeTab="all"
        onTabChange={onTabChange}
      />
    );

    fireEvent.click(screen.getByText('Active'));
    expect(onTabChange).toHaveBeenCalledWith('active');
  });
});

describe('MobileModal', () => {
  it('renders when open', () => {
    render(
      <MobileModal isOpen onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </MobileModal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MobileModal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <div>Modal Content</div>
      </MobileModal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <MobileModal isOpen onClose={onClose} title="Test Modal">
        <div>Content</div>
      </MobileModal>
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    render(
      <MobileModal isOpen onClose={onClose} closeOnOverlayClick>
        <div>Content</div>
      </MobileModal>
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ActionSheet', () => {
  const actions = [
    { label: 'Edit', onClick: vi.fn(), variant: 'default' as const },
    { label: 'Delete', onClick: vi.fn(), variant: 'danger' as const },
  ];

  it('renders actions', () => {
    render(
      <ActionSheet
        isOpen
        onClose={vi.fn()}
        title="Choose Action"
        actions={actions}
      />
    );

    expect(screen.getByText('Choose Action')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls action onClick and closes', () => {
    const onClose = vi.fn();
    render(
      <ActionSheet
        isOpen
        onClose={onClose}
        actions={actions}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(actions[0].onClick).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe('TouchGestures', () => {
  it('renders children', () => {
    render(
      <TouchGestures>
        <div>Touch Content</div>
      </TouchGestures>
    );

    expect(screen.getByText('Touch Content')).toBeInTheDocument();
  });

  it('handles swipe gestures', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    
    render(
      <TouchGestures onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight}>
        <div>Swipeable</div>
      </TouchGestures>
    );

    const element = screen.getByText('Swipeable').parentElement!;

    // Simulate swipe right
    fireEvent.touchStart(element, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchEnd(element, {
      changedTouches: [{ clientX: 100, clientY: 0 }],
    });

    expect(onSwipeRight).toHaveBeenCalled();
  });
});

describe('PullToRefresh', () => {
  it('renders children', () => {
    render(
      <PullToRefresh onRefresh={vi.fn()}>
        <div>Content</div>
      </PullToRefresh>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('triggers refresh on pull', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    
    render(
      <PullToRefresh onRefresh={onRefresh} threshold={50}>
        <div>Content</div>
      </PullToRefresh>
    );

    const container = screen.getByText('Content').parentElement!;

    // Simulate pull down
    fireEvent.touchStart(container, {
      touches: [{ clientX: 0, clientY: 0 }],
    });
    fireEvent.touchMove(container, {
      touches: [{ clientX: 0, clientY: 100 }],
    });
    fireEvent.touchEnd(container);

    await waitFor(() => {
      expect(onRefresh).toHaveBeenCalled();
    });
  });
});

describe('MobileForm Components', () => {
  describe('MobileInput', () => {
    it('renders with label', () => {
      render(<MobileInput id="test" label="Test Input" />);
      expect(screen.getByText('Test Input')).toBeInTheDocument();
    });

    it('shows error message', () => {
      render(
        <MobileInput
          id="test"
          label="Test"
          error="This field is required"
        />
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<MobileInput id="test" label="Test" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('MobileButton', () => {
    it('renders with text', () => {
      render(<MobileButton>Click Me</MobileButton>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(<MobileButton loading>Submit</MobileButton>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(<MobileButton loading>Submit</MobileButton>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<MobileButton onClick={onClick}>Click</MobileButton>);
      
      fireEvent.click(screen.getByText('Click'));
      expect(onClick).toHaveBeenCalled();
    });
  });
});

describe('MobileLoading', () => {
  it('renders loading spinner', () => {
    render(<MobileLoading />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders with text', () => {
    render(<MobileLoading text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders fullscreen when specified', () => {
    render(<MobileLoading fullScreen />);
    const container = document.querySelector('.fixed.inset-0');
    expect(container).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('renders skeleton loader', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders card skeleton', () => {
    const { container } = render(<CardSkeleton count={2} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('ResponsiveImage', () => {
  it('renders image with alt text', () => {
    render(<ResponsiveImage src="/test.jpg" alt="Test Image" />);
    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  it('applies lazy loading by default', () => {
    render(<ResponsiveImage src="/test.jpg" alt="Test" />);
    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('disables lazy loading when specified', () => {
    render(<ResponsiveImage src="/test.jpg" alt="Test" lazy={false} />);
    const img = screen.getByAltText('Test');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="/avatar.jpg" alt="User Avatar" />);
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
  });

  it('shows initials when no src', () => {
    render(<Avatar alt="John Doe" fallbackText="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows first letter when no fallback text', () => {
    render(<Avatar alt="User" />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
