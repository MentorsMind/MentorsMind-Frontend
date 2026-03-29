import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QuorumProgress from '../../components/governance/QuorumProgress';

describe('QuorumProgress Component', () => {
  it('displays the current participation percentage correctly', () => {
    // 500 / 1000 = 50%
    render(
      <QuorumProgress 
        currentParticipation={500} 
        threshold={100} 
        totalVotingPower={1000} 
      />
    );

    expect(screen.getByText('50.00%')).toBeInTheDocument();
    expect(screen.getByText('Reached')).toBeInTheDocument();
  });

  it('indicates when quorum is not met yet', () => {
    // 50 / 100 = 50% participation but threshold is 100
    render(
      <QuorumProgress 
        currentParticipation={50} 
        threshold={100} 
        totalVotingPower={1000} 
      />
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows progress bar with correct width', () => {
    const { container } = render(
      <QuorumProgress 
        currentParticipation={250} 
        threshold={500} 
        totalVotingPower={1000} 
      />
    );

    const progressBar = container.querySelector('.transition-all');
    expect(progressBar).toHaveStyle('width: 25%');
  });
});
