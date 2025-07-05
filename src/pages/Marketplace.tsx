import React, { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    type: 'fixed' | 'hourly';
    min: number;
    max: number;
  };
  timeline: string;
  experienceLevel: string;
  proposals: number;
  postedBy: {
    name: string;
    rating: number;
    verified: boolean;
  };
  postedAt: string;
  status: 'open' | 'in-progress' | 'completed';
}

const Marketplace: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState({ min: '', max: '' });
  const [experienceFilter, setExperienceFilter] = useState('ALL');

  // Mock data for demonstration
  const projects: Project[] = [
    {
      id: '1',
      title: 'Fix Authentication Bug in React Application',
      description: 'Our React app has an authentication issue where users are randomly logged out. Need an experienced developer to debug and fix the issue.',
      category: 'BUG FIX',
      skills: ['REACT', 'TYPESCRIPT', 'NODE.JS'],
      budget: { type: 'fixed', min: 500, max: 1000 },
      timeline: 'LESS THAN 1 WEEK',
      experienceLevel: 'INTERMEDIATE',
      proposals: 8,
      postedBy: { name: 'Sarah Chen', rating: 4.8, verified: true },
      postedAt: '2 hours ago',
      status: 'open'
    },
    {
      id: '2',
      title: 'Build NFT Marketplace Smart Contract',
      description: 'Looking for a Solidity developer to create smart contracts for an NFT marketplace with royalties and auction functionality.',
      category: 'FULL PROJECT',
      skills: ['SOLIDITY', 'RUST', 'WEB3'],
      budget: { type: 'fixed', min: 5000, max: 10000 },
      timeline: '1-2 MONTHS',
      experienceLevel: 'EXPERT',
      proposals: 12,
      postedBy: { name: 'Marcus Rodriguez', rating: 4.9, verified: true },
      postedAt: '5 hours ago',
      status: 'open'
    },
    {
      id: '3',
      title: 'Add Real-time Chat Feature to Existing App',
      description: 'Need to integrate a real-time chat feature into our existing Node.js application using Socket.io.',
      category: 'NEW FEATURE',
      skills: ['NODE.JS', 'SOCKET.IO', 'REACT'],
      budget: { type: 'hourly', min: 50, max: 75 },
      timeline: '2-4 WEEKS',
      experienceLevel: 'INTERMEDIATE',
      proposals: 15,
      postedBy: { name: 'Alex Thompson', rating: 4.7, verified: false },
      postedAt: '1 day ago',
      status: 'open'
    },
    {
      id: '4',
      title: 'Code Review and Optimization for Python ML Pipeline',
      description: 'Our machine learning pipeline needs optimization. Looking for someone to review code and improve performance.',
      category: 'CODE REVIEW',
      skills: ['PYTHON', 'TENSORFLOW', 'AWS'],
      budget: { type: 'fixed', min: 1500, max: 2500 },
      timeline: '1-2 WEEKS',
      experienceLevel: 'EXPERT',
      proposals: 6,
      postedBy: { name: 'Emily Watson', rating: 5.0, verified: true },
      postedAt: '3 days ago',
      status: 'open'
    }
  ];

  const categories = [
    'ALL',
    'BUG FIX',
    'NEW FEATURE',
    'FULL PROJECT',
    'CODE REVIEW',
    'REFACTORING',
    'DOCUMENTATION',
    'TESTING',
    'DEPLOYMENT'
  ];

  const skills = [
    'REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'NODE.JS', 'PYTHON',
    'SOLIDITY', 'RUST', 'GO', 'JAVA', 'C++', 'AWS', 'DOCKER'
  ];

  const filteredProjects = projects.filter(project => {
    if (activeFilter !== 'ALL' && project.category !== activeFilter) return false;
    if (experienceFilter !== 'ALL' && project.experienceLevel !== experienceFilter) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some(skill => project.skills.includes(skill))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-light tracking-wider mb-2">
              MARKETPLACE
              <span className="block w-16 h-0.5 bg-black mt-4"></span>
            </h1>
            <p className="text-gray-600 mt-4">
              Browse available projects and submit proposals
            </p>
          </div>
          <button className="bg-black text-white px-8 py-3 text-sm tracking-wider hover:bg-gray-900 transition-colors">
            POST PROJECT
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4">CATEGORY</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`block w-full text-left px-4 py-2 text-sm tracking-wider transition-colors ${
                      activeFilter === category
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4">EXPERIENCE LEVEL</h3>
              <div className="space-y-2">
                {['ALL', 'BEGINNER', 'INTERMEDIATE', 'EXPERT'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceFilter(level)}
                    className={`block w-full text-left px-4 py-2 text-sm tracking-wider transition-colors ${
                      experienceFilter === level
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills Filter */}
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4">SKILLS</h3>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSkills([...selectedSkills, skill]);
                        } else {
                          setSelectedSkills(selectedSkills.filter(s => s !== skill));
                        }
                      }}
                      className="w-4 h-4 border-gray-300 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Range Filter */}
            <div>
              <h3 className="text-sm uppercase tracking-wider mb-4">BUDGET RANGE</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="MIN ($)"
                  value={budgetRange.min}
                  onChange={(e) => setBudgetRange({...budgetRange, min: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                />
                <input
                  type="text"
                  placeholder="MAX ($)"
                  value={budgetRange.max}
                  onChange={(e) => setBudgetRange({...budgetRange, max: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {filteredProjects.length} projects found
              </p>
              <select className="px-4 py-2 border border-black text-sm focus:outline-none">
                <option>NEWEST FIRST</option>
                <option>BUDGET: HIGH TO LOW</option>
                <option>BUDGET: LOW TO HIGH</option>
                <option>PROPOSALS: LOW TO HIGH</option>
              </select>
            </div>

            {/* Project Cards */}
            {filteredProjects.map((project) => (
              <div key={project.id} className="border border-black p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-xl font-light">{project.title}</h2>
                      <span className="text-xs uppercase tracking-wider bg-gray-100 px-3 py-1">
                        {project.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills.map((skill) => (
                        <span key={skill} className="text-xs uppercase tracking-wider border border-gray-300 px-3 py-1">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Budget</span>
                        <span className="font-medium">
                          ${project.budget.min} - ${project.budget.max}
                          {project.budget.type === 'hourly' && '/hr'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Timeline</span>
                        <span className="font-medium">{project.timeline}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Experience</span>
                        <span className="font-medium">{project.experienceLevel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Proposals</span>
                        <span className="font-medium">{project.proposals}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Posted by</span>
                    <span className="font-medium">{project.postedBy.name}</span>
                    {project.postedBy.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">VERIFIED</span>
                    )}
                    <span className="text-gray-500">★ {project.postedBy.rating}</span>
                    <span className="text-gray-500">• {project.postedAt}</span>
                  </div>
                  <button className="bg-black text-white px-6 py-2 text-sm tracking-wider hover:bg-gray-900 transition-colors">
                    SUBMIT PROPOSAL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;