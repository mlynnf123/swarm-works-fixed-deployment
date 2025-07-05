import React, { useState } from 'react';

interface Proposal {
  id: string;
  developer: {
    name: string;
    avatar?: string;
    rating: number;
    completedProjects: number;
    skills: string[];
    location: string;
  };
  coverLetter: string;
  proposedBudget: number;
  estimatedTime: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    duration: string;
  }>;
  submittedAt: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
}

const ProjectDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'proposals'>('details');
  const [showProposalModal, setShowProposalModal] = useState(false);

  // Mock project data
  const project = {
    id: '1',
    title: 'Build NFT Marketplace Smart Contract',
    description: `We're looking for an experienced Solidity developer to create smart contracts for our NFT marketplace. The marketplace should support:

    - Minting and listing NFTs
    - Fixed price sales and auctions
    - Royalty distribution to creators
    - Multi-token support (ERC-721 and ERC-1155)
    - Admin controls and fee collection
    
    The ideal candidate should have experience with DeFi protocols and NFT standards. Please include examples of similar smart contracts you've developed.`,
    category: 'FULL PROJECT',
    skills: ['SOLIDITY', 'RUST', 'WEB3', 'ETHEREUM', 'HARDHAT'],
    budget: { type: 'fixed' as const, min: 5000, max: 10000 },
    timeline: '1-2 MONTHS',
    experienceLevel: 'EXPERT',
    postedBy: {
      name: 'Marcus Rodriguez',
      rating: 4.9,
      verified: true,
      totalSpent: 45000,
      projectsPosted: 12,
      memberSince: 'January 2023'
    },
    postedAt: '5 hours ago',
    status: 'open' as const,
    githubRepo: 'https://github.com/example/nft-marketplace',
    attachments: ['requirements.pdf', 'wireframes.fig'],
    proposalCount: 12,
    averageBid: 7500,
    invitesSent: 3
  };

  // Mock proposals data
  const proposals: Proposal[] = [
    {
      id: '1',
      developer: {
        name: 'Alex Chen',
        rating: 4.9,
        completedProjects: 87,
        skills: ['SOLIDITY', 'RUST', 'WEB3'],
        location: 'San Francisco, CA'
      },
      coverLetter: 'I have extensive experience building NFT marketplaces and DeFi protocols. Recently completed a similar project for OpenSea competitor...',
      proposedBudget: 8000,
      estimatedTime: '6 weeks',
      milestones: [
        {
          title: 'Smart Contract Development',
          description: 'Core marketplace contracts with all features',
          amount: 5000,
          duration: '3 weeks'
        },
        {
          title: 'Testing & Deployment',
          description: 'Comprehensive testing and mainnet deployment',
          amount: 3000,
          duration: '3 weeks'
        }
      ],
      submittedAt: '2 hours ago',
      status: 'shortlisted'
    },
    {
      id: '2',
      developer: {
        name: 'Sarah Kim',
        rating: 5.0,
        completedProjects: 125,
        skills: ['SOLIDITY', 'ETHEREUM', 'HARDHAT'],
        location: 'New York, NY'
      },
      coverLetter: 'Blockchain developer with 5+ years experience. Built smart contracts for major NFT platforms including...',
      proposedBudget: 9500,
      estimatedTime: '5 weeks',
      milestones: [
        {
          title: 'Architecture & Setup',
          description: 'Design patterns and initial setup',
          amount: 2000,
          duration: '1 week'
        },
        {
          title: 'Core Development',
          description: 'Marketplace contracts implementation',
          amount: 5500,
          duration: '3 weeks'
        },
        {
          title: 'Audit & Deployment',
          description: 'Security audit and deployment',
          amount: 2000,
          duration: '1 week'
        }
      ],
      submittedAt: '4 hours ago',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-light tracking-wider mb-2">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="uppercase tracking-wider bg-gray-100 px-3 py-1">
                  {project.category}
                </span>
                <span>Posted {project.postedAt}</span>
                <span className={`uppercase tracking-wider px-3 py-1 ${
                  project.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
            {/* Action buttons based on user type */}
            <button className="bg-black text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors">
              SUBMIT PROPOSAL
            </button>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-5 gap-6 py-6 border-t border-b border-gray-200">
            <div>
              <span className="text-sm text-gray-500 block">Budget</span>
              <span className="font-medium">
                ${project.budget.min} - ${project.budget.max}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Timeline</span>
              <span className="font-medium">{project.timeline}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Experience</span>
              <span className="font-medium">{project.experienceLevel}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Proposals</span>
              <span className="font-medium">{project.proposalCount}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Avg Bid</span>
              <span className="font-medium">${project.averageBid}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            PROJECT DETAILS
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'proposals'
                ? 'border-b-2 border-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            PROPOSALS ({project.proposalCount})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' ? (
          <div className="grid grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-sm uppercase tracking-wider mb-4">PROJECT DESCRIPTION</h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="text-sm uppercase tracking-wider mb-4">REQUIRED SKILLS</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span key={skill} className="px-4 py-2 border border-black text-sm uppercase tracking-wider">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {project.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider mb-4">ATTACHMENTS</h3>
                  <div className="space-y-2">
                    {project.attachments.map((file) => (
                      <div key={file} className="flex items-center justify-between p-3 border border-gray-300">
                        <span className="text-sm">{file}</span>
                        <button className="text-sm uppercase tracking-wider hover:underline">
                          DOWNLOAD
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Repository */}
              {project.githubRepo && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider mb-4">GITHUB REPOSITORY</h3>
                  <a 
                    href={project.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {project.githubRepo}
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="border border-black p-6">
                <h3 className="text-sm uppercase tracking-wider mb-4">CLIENT INFORMATION</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{project.postedBy.name}</span>
                    {project.postedBy.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 uppercase">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rating</span>
                      <span>★ {project.postedBy.rating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Spent</span>
                      <span>${project.postedBy.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Projects Posted</span>
                      <span>{project.postedBy.projectsPosted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since</span>
                      <span>{project.postedBy.memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="border border-gray-300 p-6">
                <h3 className="text-sm uppercase tracking-wider mb-4">PROJECT ACTIVITY</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Proposals</span>
                    <span>{project.proposalCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invites Sent</span>
                    <span>{project.invitesSent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Average Bid</span>
                    <span>${project.averageBid}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Proposals List */}
            {proposals.map((proposal) => (
              <div key={proposal.id} className="border border-gray-300 p-6 hover:border-black transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium">{proposal.developer.name}</h3>
                      <span className="text-sm text-gray-600">★ {proposal.developer.rating}</span>
                      <span className="text-sm text-gray-600">
                        {proposal.developer.completedProjects} projects
                      </span>
                      {proposal.status === 'shortlisted' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 uppercase">
                          SHORTLISTED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{proposal.developer.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-medium">${proposal.proposedBudget}</div>
                    <div className="text-sm text-gray-600">{proposal.estimatedTime}</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{proposal.coverLetter}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {proposal.developer.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs uppercase tracking-wider border border-gray-300 px-2 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button className="text-sm uppercase tracking-wider hover:underline">
                      VIEW DETAILS
                    </button>
                    <button className="bg-black text-white px-6 py-2 text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors">
                      ACCEPT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;