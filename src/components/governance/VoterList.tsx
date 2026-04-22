import React from 'react';

interface Voter {
  address: string;
  choice: 'Yes' | 'No';
  power: number;
}

interface VoterListProps {
  voters: Voter[];
}

const VoterList: React.FC<VoterListProps> = ({ voters }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50 p-4">
        <h3 className="text-lg font-bold text-gray-900">Voters</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 text-sm font-semibold text-gray-500">
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Choice</th>
              <th className="px-6 py-4 text-right">Voting Power</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {voters.map((voter) => (
              <tr key={voter.address} className="text-sm text-gray-900 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono">{formatAddress(voter.address)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    voter.choice === 'Yes' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {voter.choice}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold">
                  {voter.power.toLocaleString()} VP
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoterList;
