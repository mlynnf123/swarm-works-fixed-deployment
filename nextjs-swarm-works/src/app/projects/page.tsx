'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'my-projects' | 'collaborative' | 'templates'>('my-projects')

  // Mock data for projects
  const myProjects = [
    {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'Modern React-based e-commerce solution with blockchain payments',
      tech: 'TypeScript',
      stars: 127,
      forks: 23,
      lastUpdated: '2 hours ago',
      status: 'Active'
    },
    {
      id: '2',
      title: 'DeFi Analytics Dashboard',
      description: 'Real-time cryptocurrency analytics and portfolio tracking',
      tech: 'JavaScript',
      stars: 89,
      forks: 15,
      lastUpdated: '1 day ago',
      status: 'In Development'
    },
    {
      id: '3',
      title: 'AI Code Assistant',
      description: 'Machine learning powered code completion and review tool',
      tech: 'Python',
      stars: 234,
      forks: 45,
      lastUpdated: '3 days ago',
      status: 'Completed'
    }
  ]

  const collaborativeProjects = [
    {
      id: '4',
      title: 'Blockchain Voting System',
      description: 'Decentralized voting platform with smart contract integration',
      tech: 'Solidity',
      stars: 156,
      forks: 32,
      contributors: 8,
      lastUpdated: '4 hours ago',
      role: 'Core Contributor'
    },
    {
      id: '5',
      title: 'Open Source Design System',
      description: 'Comprehensive UI component library for React applications',
      tech: 'TypeScript',
      stars: 312,
      forks: 67,
      contributors: 15,
      lastUpdated: '6 hours ago',
      role: 'Maintainer'
    }
  ]

  const templates = [
    {
      id: 't1',
      title: 'Next.js Starter Template',
      description: 'Production-ready Next.js template with TypeScript and Tailwind',
      tech: 'TypeScript',
      uses: 1240,
      category: 'Web Development'
    },
    {
      id: 't2',
      title: 'Solana dApp Boilerplate',
      description: 'Complete Solana decentralized application template',
      tech: 'Rust',
      uses: 456,
      category: 'Blockchain'
    },
    {
      id: 't3',
      title: 'React Component Library',
      description: 'Reusable React components with Storybook integration',
      tech: 'TypeScript',
      uses: 789,
      category: 'UI/UX'
    }
  ]

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-section-title mb-2">
              PROJECTS
              <span className="block w-16 h-0.5 bg-black mt-4"></span>
            </h1>
            <p className="text-gray-600 mt-4 text-body">
              Manage your repositories and collaborative work
            </p>
          </div>
          <Link href="/post-project" className="swarm-button-primary">
            NEW PROJECT
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('my-projects')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors font-light ${
              activeTab === 'my-projects'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            MY PROJECTS
          </button>
          <button
            onClick={() => setActiveTab('collaborative')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors font-light ${
              activeTab === 'collaborative'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            COLLABORATIVE
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors font-light ${
              activeTab === 'templates'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            TEMPLATES
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* My Projects Tab */}
          {activeTab === 'my-projects' && (
            <>
              {myProjects.map((project) => (
                <div key={project.id} className="swarm-card p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-light">{project.title}</h3>
                        <span className={`text-xs uppercase tracking-wider px-3 py-1 ${
                          project.status === 'Active' ? 'bg-green-100 text-green-800' :
                          project.status === 'In Development' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 font-light">{project.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="font-light">{project.tech}</span>
                        <span className="font-light">★ {project.stars}</span>
                        <span className="font-light">⑂ {project.forks}</span>
                        <span className="font-light">Updated {project.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <button className="swarm-button-secondary text-xs py-2 px-4">
                        VIEW CODE
                      </button>
                      <button className="swarm-button-secondary text-xs py-2 px-4">
                        SETTINGS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Collaborative Projects Tab */}
          {activeTab === 'collaborative' && (
            <>
              {collaborativeProjects.map((project) => (
                <div key={project.id} className="swarm-card p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-light">{project.title}</h3>
                        <span className={`text-xs uppercase tracking-wider px-3 py-1 ${
                          project.role === 'Maintainer' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {project.role}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 font-light">{project.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="font-light">{project.tech}</span>
                        <span className="font-light">★ {project.stars}</span>
                        <span className="font-light">⑂ {project.forks}</span>
                        <span className="font-light">{project.contributors} contributors</span>
                        <span className="font-light">Updated {project.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <button className="swarm-button-secondary text-xs py-2 px-4">
                        VIEW PROJECT
                      </button>
                      <Link href="/marketplace" className="swarm-button-primary text-xs py-2 px-4">
                        JOIN SWARM
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="swarm-card p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-light mb-2">{template.title}</h3>
                      <p className="text-gray-600 text-sm font-light mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-light">{template.tech}</span>
                        <span className="font-light">{template.uses} uses</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider bg-gray-100 px-2 py-1">
                        {template.category}
                      </span>
                      <button className="swarm-button-primary text-xs py-2 px-4">
                        USE TEMPLATE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}