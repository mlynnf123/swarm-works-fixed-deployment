'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { Project, Proposal } from '@/types/marketplace'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [activeTab, setActiveTab] = useState<'details' | 'proposals'>('details')

  // Mock project data - in real app this would come from API
  const project: Project = {
    id: projectId,
    title: 'Build NFT Marketplace Smart Contract',
    description: `We're looking for an experienced Solidity developer to create smart contracts for our NFT marketplace. The marketplace should support:

    - Minting and listing NFTs
    - Fixed price sales and auctions
    - Royalty distribution to creators
    - Multi-token support (ERC-721 and ERC-1155)
    - Admin controls and fee collection
    
    The ideal candidate should have experience with DeFi protocols and NFT standards. Please include examples of similar smart contracts you've developed.`,
    category: 'FULL_PROJECT',
    skills: ['SOLIDITY', 'RUST', 'WEB3', 'ETHEREUM', 'HARDHAT'],
    budget: { type: 'fixed', min: 5000, max: 10000 },
    timeline: '1-2 MONTHS',
    experienceLevel: 'EXPERT',
    postedBy: {
      id: '1',
      name: 'Marcus Rodriguez',
      email: 'marcus@example.com',
      rating: 4.9,
      verified: true,
      totalSpent: 45000,
      projectsPosted: 12,
      memberSince: 'January 2023',
      timezone: 'EST'
    },
    postedAt: '5 hours ago',
    updatedAt: '5 hours ago',
    status: 'open',
    githubRepo: 'https://github.com/example/nft-marketplace',
    attachments: [
      {
        id: '1',
        filename: 'requirements.pdf',
        url: '/attachments/requirements.pdf',
        type: 'document',
        size: 2048000,
        uploadedAt: '5 hours ago'
      },
      {
        id: '2',
        filename: 'wireframes.fig',
        url: '/attachments/wireframes.fig',
        type: 'design',
        size: 5120000,
        uploadedAt: '5 hours ago'
      }
    ],
    proposalCount: 12,
    averageBid: 7500,
    invitesSent: 3,
    tags: ['blockchain', 'nft', 'solidity'],
    requirements: []
  }

  // Mock proposals data
  const proposals: Proposal[] = [
    {
      id: '1',
      projectId: projectId,
      developer: {
        id: '1',
        name: 'Alex Chen',
        email: 'alex@example.com',
        rating: 4.9,
        verified: true,
        completedProjects: 87,
        totalEarnings: 125000,
        skills: ['SOLIDITY', 'RUST', 'WEB3'],
        location: 'San Francisco, CA',
        timezone: 'PST',
        availability: 'available',
        portfolio: [],
        languages: [],
        certifications: []
      },
      coverLetter: 'I have extensive experience building NFT marketplaces and DeFi protocols. Recently completed a similar project for OpenSea competitor with over $10M in transaction volume. My approach focuses on gas optimization and security best practices.',
      proposedBudget: 8000,
      estimatedTime: '6 weeks',
      milestones: [
        {
          id: '1',
          title: 'Smart Contract Development',
          description: 'Core marketplace contracts with all features',
          amount: 5000,
          duration: '3 weeks',
          order: 1,
          status: 'pending',
          deliverables: []
        },
        {
          id: '2',
          title: 'Testing & Deployment',
          description: 'Comprehensive testing and mainnet deployment',
          amount: 3000,
          duration: '3 weeks',
          order: 2,
          status: 'pending',
          deliverables: []
        }
      ],
      githubSamples: ['https://github.com/alexchen/nft-marketplace', 'https://github.com/alexchen/defi-protocol'],
      availability: 'Available to start immediately',
      submittedAt: '2 hours ago',
      status: 'shortlisted',
      questions: [],
      terms: {
        startDate: '2024-01-15',
        revisions: 3,
        communicationMethod: 'discord',
        workingHours: '9 AM - 6 PM PST',
        deliveryFormat: 'GitHub repository with documentation',
        additionalServices: []
      }
    },
    {
      id: '2',
      projectId: projectId,
      developer: {
        id: '2',
        name: 'Sarah Kim',
        email: 'sarah@example.com',
        rating: 5.0,
        verified: true,
        completedProjects: 125,
        totalEarnings: 200000,
        skills: ['SOLIDITY', 'ETHEREUM', 'HARDHAT'],
        location: 'New York, NY',
        timezone: 'EST',
        availability: 'available',
        portfolio: [],
        languages: [],
        certifications: []
      },
      coverLetter: 'Blockchain developer with 5+ years experience. Built smart contracts for major NFT platforms including Foundation and SuperRare. Expert in gas optimization and security audits.',
      proposedBudget: 9500,
      estimatedTime: '5 weeks',
      milestones: [
        {
          id: '3',
          title: 'Architecture & Setup',
          description: 'Design patterns and initial setup',
          amount: 2000,
          duration: '1 week',
          order: 1,
          status: 'pending',
          deliverables: []
        },
        {
          id: '4',
          title: 'Core Development',
          description: 'Marketplace contracts implementation',
          amount: 5500,
          duration: '3 weeks',
          order: 2,
          status: 'pending',
          deliverables: []
        },
        {
          id: '5',
          title: 'Audit & Deployment',
          description: 'Security audit and deployment',
          amount: 2000,
          duration: '1 week',
          order: 3,
          status: 'pending',
          deliverables: []
        }
      ],
      githubSamples: ['https://github.com/sarahkim/nft-contracts'],
      availability: 'Available with 2 weeks notice',
      submittedAt: '4 hours ago',
      status: 'pending',
      questions: [],
      terms: {
        startDate: '2024-01-29',
        revisions: 2,
        communicationMethod: 'slack',
        workingHours: '10 AM - 7 PM EST',
        deliveryFormat: 'GitHub with comprehensive documentation',
        additionalServices: ['Code audit', 'Gas optimization report']
      }
    }
  ]

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-light tracking-wider mb-2">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 font-light">
                <span className="uppercase tracking-wider bg-gray-100 px-3 py-1">
                  {project.category.replace('_', ' ')}
                </span>
                <span>Posted {project.postedAt}</span>
                <span className={`uppercase tracking-wider px-3 py-1 ${
                  project.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
            <button className="swarm-button-primary">
              SUBMIT PROPOSAL
            </button>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-5 gap-6 py-6 border-t border-b border-gray-200">
            <div>
              <span className="text-sm text-gray-500 block font-light">Budget</span>
              <span className="font-normal">
                ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block font-light">Timeline</span>
              <span className="font-normal">{project.timeline}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block font-light">Experience</span>
              <span className="font-normal">{project.experienceLevel}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block font-light">Proposals</span>
              <span className="font-normal">{project.proposalCount}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block font-light">Avg Bid</span>
              <span className="font-normal">${project.averageBid?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors font-light ${
              activeTab === 'details'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            PROJECT DETAILS
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors font-light ${
              activeTab === 'proposals'
                ? 'border-b-2 border-black text-black'
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
                <h3 className="text-sm uppercase tracking-wider mb-4 font-normal">PROJECT DESCRIPTION</h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="text-sm uppercase tracking-wider mb-4 font-normal">REQUIRED SKILLS</h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span key={skill} className="px-4 py-2 border border-black text-sm uppercase tracking-wider font-light">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {project.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider mb-4 font-normal">ATTACHMENTS</h3>
                  <div className="space-y-2">
                    {project.attachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 border border-gray-300">
                        <span className="text-sm font-light">{file.filename}</span>
                        <button className="text-sm uppercase tracking-wider hover:underline font-light">
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
                  <h3 className="text-sm uppercase tracking-wider mb-4 font-normal">GITHUB REPOSITORY</h3>
                  <a 
                    href={project.githubRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-light"
                  >
                    {project.githubRepo}
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Info */}
              <div className="swarm-card p-6">
                <h3 className="text-sm uppercase tracking-wider mb-4 font-normal">CLIENT INFORMATION</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-normal">{project.postedBy.name}</span>
                    {project.postedBy.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 uppercase">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm font-light">
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
              <div className="swarm-card p-6">
                <h3 className="text-sm uppercase tracking-wider mb-4 font-normal">PROJECT ACTIVITY</h3>
                <div className="space-y-2 text-sm font-light">
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
              <div key={proposal.id} className="swarm-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-normal">{proposal.developer.name}</h3>
                      <span className="text-sm text-gray-600 font-light">★ {proposal.developer.rating}</span>
                      <span className="text-sm text-gray-600 font-light">
                        {proposal.developer.completedProjects} projects
                      </span>
                      {proposal.status === 'shortlisted' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 uppercase">
                          SHORTLISTED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-light">{proposal.developer.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-normal">${proposal.proposedBudget.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 font-light">{proposal.estimatedTime}</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 font-light line-clamp-3">{proposal.coverLetter}</p>

                {/* Skills */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {proposal.developer.skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="text-xs uppercase tracking-wider border border-gray-300 px-2 py-1 font-light">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button className="swarm-button-secondary text-sm py-2 px-4">
                      VIEW DETAILS
                    </button>
                    <button className="swarm-button-primary text-sm py-2 px-4">
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
  )
}