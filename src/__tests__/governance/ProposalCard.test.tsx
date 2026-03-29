import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProposalCard from '../../components/governance/ProposalCard';
import { Proposal } from '../../types/governance.types';

const mockProposal: Proposal = {
  id: 'pro-123',
  title: 'Upgrade Network to V2.1',
  description: 'Detailed proposal description...',
  proposer: 'GD...7X2Z',
  status: 'Active',
  votesFor: 1200000,
  votesAgainst: 400000,
  totalVotes: 1600000,
  voters: [],
  createdAt: '2024-03-24T10:00:00Z',
  expiresAt: '2024-03-31T10:00:00Z',
  discussionUrl: 'https://forum.mentorminds.io/t/upgrade-network/123',
  quorumReached: true,
  quorumThreshold: 1240000
};

describe('ProposalCard Component', () => {
  it('renders title, proposer, and status badge', () => {
    render(
      <MemoryRouter>
        <ProposalCard {...mockProposal} participationRate={15.2} onVote={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Upgrade Network to V2.1')).toBeInTheDocument();
    expect(screen.getByText(/By GD/i)).toBeInTheDocument();
  });

  it('displays the correct status badge color', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ProposalCard {...mockProposal} status="Passed" participationRate={22.5} onVote={() => {}} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100 text-green-800');

    rerender(
      <MemoryRouter>
        <ProposalCard {...mockProposal} status="Failed" participationRate={22.5} onVote={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100 text-red-800');
  });

  it('triggers voting callback when vote buttons are clicked', () => {
    const onVote = vi.fn();
    render(
      <MemoryRouter>
        <ProposalCard {...mockProposal} onVote={onVote} participationRate={15.2} />
      </MemoryRouter>
    );

    const voteYes = screen.getByRole('button', { name: /Vote Yes/i });
    fireEvent.click(voteYes);

    expect(onVote).toHaveBeenCalledWith(mockProposal.id, 'Yes');
  });

  it('navigates to the details page on title click', () => {
    render(
      <MemoryRouter>
        <ProposalCard {...mockProposal} participationRate={15.2} onVote={() => {}} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/governance/proposals/${mockProposal.id}`);
  });
});
