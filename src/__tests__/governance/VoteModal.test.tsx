import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoteModal from '../../components/governance/VoteModal';

describe('VoteModal Component', () => {
  const mockProposal = { id: 'p1', title: 'Test Proposal Title' };

  it('renders correctly when open', () => {
    const { rerender } = render(
      <VoteModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={async () => {}} 
        choice="Yes" 
        votingPower={100} 
        proposal={mockProposal} 
      />
    );

    expect(screen.getByRole('button', { name: /Confirm Vote/i })).toBeInTheDocument();
    expect(screen.getByText('Vote Yes')).toBeInTheDocument();
    expect(screen.getByText('Test Proposal Title')).toBeInTheDocument();
    expect(screen.getByText('100 VP')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <VoteModal 
        isOpen={false} 
        onClose={() => {}} 
        onConfirm={async () => {}} 
        choice="Yes" 
        votingPower={100} 
        proposal={mockProposal} 
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('triggers onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn().mockImplementation(async () => {});
    render(
      <VoteModal 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={onConfirm} 
        choice="No" 
        votingPower={500} 
        proposal={mockProposal} 
      />
    );

    const button = screen.getByRole('button', { name: /Confirm Vote/i });
    fireEvent.click(button);

    expect(onConfirm).toHaveBeenCalledWith('No');
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <VoteModal 
        isOpen={true} 
        onClose={onClose} 
        onConfirm={async () => {}} 
        choice="No" 
        votingPower={500} 
        proposal={mockProposal} 
      />
    );

    const closeButton = screen.getByRole('button', { name: /CLOSE MODAL/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
