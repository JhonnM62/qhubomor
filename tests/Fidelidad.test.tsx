import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StampGrid } from '../src/components/fidelidad/StampGrid';

describe('StampGrid Component', () => {
  it('renders 10 stamps correctly', () => {
    render(<StampGrid contador={7} />);
    expect(screen.getByText('7 de 10 sellos')).toBeTruthy();
    expect(screen.getByText('15% OFF')).toBeTruthy();
    expect(screen.getByText('GRATIS')).toBeTruthy();
  });

  it('handles 0 stamps correctly', () => {
    render(<StampGrid contador={0} />);
    expect(screen.getByText('0 de 10 sellos')).toBeTruthy();
  });

  it('caps at 10 stamps when completed', () => {
    render(<StampGrid contador={12} />);
    expect(screen.getByText('10 de 10 sellos')).toBeTruthy();
  });
});
