'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function SwarmsPage() {
  const [activeFilter, setActiveFilter] = useState('ALL')

  const swarms = [
    {
      id: '1',
      title: 'React Performance Optimization',
      description: 'Optimizing large-scale React applications for better performance and user experience',
      status: 'Active',
      difficulty: 'Intermediate',
      participants: '4/6',
      duration: '2-3 hours',
      host: 'Sarah Chen',
      timeRemaining: '1h 23m',
      technologies: ['React', 'TypeScript', 'Webpack']
    },
    {
      id: '2',
      title: 'Blockchain Smart Contract Audit',
      description: 'Security review and optimization of Solana smart contracts for DeFi protocol',
      status: 'Starting Soon',
      difficulty: 'Advanced',
      participants: '3/4',
      duration: '3-4 hours',
      host: 'Marcus Rodriguez',
      timeRemaining: '15m',
      technologies: ['Solana', 'Rust', 'Anchor']
    },
    {
      id: '3',
      title: 'API Design Workshop',
      description: 'Collaborative design of RESTful APIs with best practices and documentation',
      status: 'Open',
      difficulty: 'Beginner',
      participants: '6/8',
      duration: '1-2 hours',
      host: 'Alex Thompson',
      timeRemaining: 'Starting in 30m',
      technologies: ['Node.js', 'Express', 'OpenAPI']
    },
    {
      id: '4',
      title: 'Machine Learning Model Training',
      description: 'Training and fine-tuning ML models for code completion and analysis',
      status: 'Open',
      difficulty: 'Advanced',
      participants: '2/5',
      duration: '4-5 hours',
      host: 'Dr. Emily Watson',
      timeRemaining: 'Starting in 2h',
      technologies: ['Python', 'TensorFlow', 'PyTorch']
    }
  ]

  const filters = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

  const filteredSwarms = swarms.filter(swarm => 
    activeFilter === 'ALL' || swarm.difficulty.toUpperCase() === activeFilter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Starting Soon':
        return 'bg-orange-100 text-orange-800'
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600'
      case 'Intermediate':
        return 'text-orange-600'
      case 'Advanced':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-section-title mb-2">
              SWARMS
              <span className="block w-16 h-0.5 bg-black mt-4"></span>
            </h1>
            <p className="text-gray-600 mt-4 text-body">
              Join collaborative coding sessions with elite developers
            </p>
          </div>
          <button className="swarm-button-primary">
            CREATE SWARM
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 text-sm uppercase tracking-wider transition-colors font-light ${
                activeFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-black hover:bg-gray-50'
              }`}
            >
              {filter === 'ALL' ? 'All Levels' : filter}
            </button>
          ))}
        </div>

        {/* Swarms Grid */}
        <div className="space-y-6">
          {filteredSwarms.map((swarm) => (
            <div key={swarm.id} className="swarm-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h2 className="text-xl font-light">{swarm.title}</h2>
                    <span className={`text-xs uppercase tracking-wider px-3 py-1 ${getStatusColor(swarm.status)}`}>
                      {swarm.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 font-light">{swarm.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-5 gap-6 mb-4">
                <div>
                  <span className="text-sm text-gray-500 block font-light">Difficulty</span>
                  <span className={`font-normal ${getDifficultyColor(swarm.difficulty)}`}>
                    {swarm.difficulty}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block font-light">Participants</span>
                  <span className="font-normal">{swarm.participants}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block font-light">Duration</span>
                  <span className="font-normal">{swarm.duration}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block font-light">Host</span>
                  <span className="font-normal">{swarm.host}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block font-light">Time</span>
                  <span className="font-normal">{swarm.timeRemaining}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  {swarm.technologies.map((tech) => (
                    <span 
                      key={tech} 
                      className="text-xs uppercase tracking-wider border border-gray-300 px-3 py-1 font-light"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="swarm-button-secondary text-sm py-2 px-6">
                    VIEW DETAILS
                  </button>
                  <button className="swarm-button-primary text-sm py-2 px-6">
                    JOIN SWARM
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSwarms.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-light mb-4">No swarms found</h3>
            <p className="text-gray-600 font-light mb-8">
              No active swarms match your selected difficulty level.
            </p>
            <Link href="/marketplace" className="swarm-button-primary">
              BROWSE PROJECTS INSTEAD
            </Link>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-xl font-light tracking-wider uppercase mb-8 text-center">Live Network Activity</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-light mb-2">12</div>
              <div className="text-sm uppercase tracking-wider text-gray-600 font-light">Active Swarms</div>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">47</div>
              <div className="text-sm uppercase tracking-wider text-gray-600 font-light">Developers Online</div>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">156</div>
              <div className="text-sm uppercase tracking-wider text-gray-600 font-light">Sessions Today</div>
            </div>
            <div>
              <div className="text-3xl font-light mb-2">2.4k</div>
              <div className="text-sm uppercase tracking-wider text-gray-600 font-light">Total Participants</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}