import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../pages/LandingPage';

describe('LandingPage', () => {
  it('renders key sections and CTAs', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/Get Started/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Explore Features/i)).toBeInTheDocument();
    expect(document.getElementById('features')).toBeInTheDocument();
    expect(document.getElementById('testimonials')).toBeInTheDocument();
    expect(document.getElementById('pricing')).toBeInTheDocument();
    expect(document.getElementById('faq')).toBeInTheDocument();
  });

  it('applies SEO meta tags', () => {
    render(<LandingPage />);
    const desc = document.head.querySelector('meta[name="description"]');
    expect(desc).not.toBeNull();
    expect(desc!.getAttribute('content')).toMatch(/Stellar/i);
    const ogTitle = document.head.querySelector('meta[property="og:title"]');
    expect(ogTitle).not.toBeNull();
    expect(ogTitle!.getAttribute('content')).toMatch(/MentorMinds/i);
  });

  it('features grid is responsive', () => {
    render(<LandingPage />);
    const grid = screen.getByTestId('features-grid');
    expect(grid.className).toMatch(/grid/);
    expect(grid.className).toMatch(/md:grid-cols-2/);
    expect(grid.className).toMatch(/lg:grid-cols-3/);
  });

  it('faq accordion is accessible and toggles', () => {
    render(<LandingPage />);
    const buttons = screen.getAllByRole('button', { name: /How|Do I|What|Is/i });
    expect(buttons.length).toBeGreaterThan(0);
    const first = buttons[0];
    expect(first.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders efficiently', () => {
    const start = performance.now();
    render(<LandingPage />);
    const end = performance.now();
    expect(end - start).toBeLessThan(200);
  });
});
