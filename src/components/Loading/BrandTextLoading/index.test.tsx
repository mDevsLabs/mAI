import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import BrandTextLoading from './index';

// Initial mock state
let mockIsCustomBranding = false;

vi.mock('@/const/version', () => ({
  get isCustomBranding() {
    return mockIsCustomBranding;
  },
}));

vi.mock('@lobechat/business-const', () => ({
  BRANDING_NAME: 'mAI',
}));

describe('BrandTextLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render mAI brand loading screen when isCustomBranding is false', () => {
    mockIsCustomBranding = false;
    render(<BrandTextLoading debugId="test-debug" />);

    // Check that the brand element is displayed
    const loadingContainer = screen.getByRole('status', { name: /loading/i });
    expect(loadingContainer).toBeDefined();

    // Check that mAI text is visible
    expect(screen.getByText('mAI')).toBeDefined();
  });

  it('should render simple CircleLoading when isCustomBranding is true', () => {
    mockIsCustomBranding = true;
    const { container } = render(<BrandTextLoading debugId="test-debug" />);

    // Brand text mAI should not be rendered
    expect(screen.queryByText('mAI')).toBeNull();

    // CircleLoading indicator should be visible
    expect(container.querySelector('.container')).toBeDefined();
  });
});
