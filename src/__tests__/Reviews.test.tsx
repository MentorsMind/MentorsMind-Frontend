import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import StarRating from '../components/reviews/StarRating';
import ReviewForm from '../components/reviews/ReviewForm';
import { useReviews } from '../hooks/useReviews';
import { vi, describe, test, expect } from 'vitest';

describe('Rating & Reviews', () => {
  test('StarRating displays correct number of stars', () => {
    const { container } = render(<StarRating rating={3.5} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  test('ReviewForm validates required fields', () => {
    const onSubmit = vi.fn();
    render(<ReviewForm bookingId="booking-m1-001" onSubmit={onSubmit} />);
    
    fireEvent.click(screen.getByText(/Post Review/i));
    expect(screen.getByText(/Please select a rating/i)).toBeInTheDocument();
  });

  test('useReviews hook filters by rating', () => {
    const { result } = renderHook(() => useReviews('m1'));
    
    act(() => {
      result.current.setFilterRating(5);
    });
    
    expect(result.current.reviews.every(r => Math.floor(r.rating) === 5)).toBe(true);
  });
});
