import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Governance from '../../pages/Governance';

// Mock child components to isolate page testing
vi.mock('../../components/governance/DelegationPanel', () => ({
  default: () => <div data-testid="delegation-panel">Delegation Panel</div>
}));

vi.mock('../../components/governance/ProposalCard', () => ({
  default: ({ title, onVote, id }: any) => (
    <div data-testid={`proposal-card-${id}`}>
      <h3>{title}</h3>
      <button onClick={() => onVote(id, 'Yes')}>Vote Yes</button>
    </div>
  )
}));

vi.mock('../../components/governance/QuorumProgress', () => ({
  default: () => <div data-testid="quorum-progress">Quorum Progress</div>
}));

vi.mock('../../components/governance/VoteModal', () => ({
  default: ({ isOpen, onClose, onConfirm }: any) => isOpen ? (
    <div data-testid="vote-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onConfirm('Yes')}>Confirm</button>
    </div>
  ) : null
}));

describe('Governance Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () => render(
    <MemoryRouter>
      <Governance />
    </MemoryRouter>
  );

  it('renders dashboard metrics and main sections', () => {
    renderPage();
    
    expect(screen.getByText('Implement Decentralized Identity Verification')).toBeInTheDocument();
    // Proposer address check is covered in ProposalCard.test.tsx
    expect(screen.getByTestId('delegation-panel')).toBeInTheDocument();
    expect(screen.getByTestId('quorum-progress')).toBeInTheDocument();
  });

  it('filters proposals by status', async () => {
    renderPage();
    
    // Default should show "Implement Decentralized Identity Verification" (Queued)
    expect(screen.getByText('Implement Decentralized Identity Verification')).toBeInTheDocument();
    
    // Click "Active" filter
    const activeFilter = screen.getByRole('button', { name: /Active/i });
    fireEvent.click(activeFilter);
    
    // Should show active proposal
    expect(screen.getByText(/Update Mentor Reward Multiplier/i)).toBeInTheDocument();
    // Should NOT show queued proposal
    expect(screen.queryByText('Implement Decentralized Identity Verification')).not.toBeInTheDocument();
  });

  it('searches for proposals', () => {
    renderPage();
    
    const searchInput = screen.getByPlaceholderText(/Search proposals/i);
    fireEvent.change(searchInput, { target: { value: 'Identity' } });
    
    expect(screen.getByText(/Implement Decentralized Identity Verification/i)).toBeInTheDocument();
    expect(screen.queryByText(/Update Mentor Reward Multiplier/i)).not.toBeInTheDocument();
  });

  it('triggers vote modal when clicking vote on card', async () => {
    renderPage();
    
    // Find the first proposal card and click vote
    const voteButton = screen.getAllByText(/Vote Yes/i)[0];
    fireEvent.click(voteButton);
    
    // Modal should appear
    expect(screen.getByTestId('vote-modal')).toBeInTheDocument();
    
    // Confirm vote
    const confirmButton = screen.getAllByText(/Confirm/i).find(b => b.tagName === 'BUTTON');
    if (confirmButton) fireEvent.click(confirmButton);
    
    // Modal should close (after simulated 2s delay)
    await waitFor(() => {
        expect(screen.queryByTestId('vote-modal')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
