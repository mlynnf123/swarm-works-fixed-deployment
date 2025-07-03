'use client'

import React, { useState } from 'react'
import { ProjectFormData } from '@/types/marketplace'

export default function PostProjectPage() {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: 'BUG_FIX',
    skills: [],
    budget: {
      type: 'fixed',
      min: 0,
      max: 0
    },
    timeline: '',
    experienceLevel: 'INTERMEDIATE',
    githubRepo: '',
    attachments: [],
    requirements: [],
    tags: []
  })

  const categories = [
    'BUG_FIX',
    'NEW_FEATURE',
    'FULL_PROJECT',
    'CODE_REVIEW',
    'REFACTORING',
    'DOCUMENTATION',
    'TESTING',
    'DEPLOYMENT'
  ]

  const experienceLevels = [
    'BEGINNER',
    'INTERMEDIATE', 
    'EXPERT'
  ]

  const timelines = [
    'LESS THAN 1 WEEK',
    '1-2 WEEKS',
    '2-4 WEEKS',
    '1-2 MONTHS',
    'MORE THAN 2 MONTHS'
  ]

  const commonSkills = [
    'REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'NODE.JS', 'PYTHON',
    'SOLIDITY', 'RUST', 'GO', 'JAVA', 'C++', 'AWS', 'DOCKER'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Project submitted:', formData)
    // TODO: Implement API call
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-section-title mb-2">
            POST PROJECT
            <span className="block w-16 h-0.5 bg-black mt-4"></span>
          </h1>
          <p className="text-gray-600 mt-4 text-body">
            Describe your project and find the perfect developer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Project Title */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              PROJECT TITLE
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
              placeholder="e.g., Fix authentication bug in React app"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              CATEGORY
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData({...formData, category})}
                  className={`px-4 py-3 border text-sm tracking-wider transition-colors font-light ${
                    formData.category === category
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  {category.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              PROJECT DESCRIPTION
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none min-h-[200px] font-light"
              placeholder="Describe your project in detail. Include current issues, expected outcomes, and any specific requirements..."
              required
            />
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              REQUIRED SKILLS
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-2 border text-xs tracking-wider transition-colors font-light ${
                    formData.skills.includes(skill)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              BUDGET
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, budget: {...formData.budget, type: 'fixed'}})}
                className={`px-4 py-3 border text-sm tracking-wider transition-colors font-light ${
                  formData.budget.type === 'fixed'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-50'
                }`}
              >
                FIXED PRICE
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, budget: {...formData.budget, type: 'hourly'}})}
                className={`px-4 py-3 border text-sm tracking-wider transition-colors font-light ${
                  formData.budget.type === 'hourly'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-gray-50'
                }`}
              >
                HOURLY RATE
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={formData.budget.min || ''}
                  onChange={(e) => setFormData({...formData, budget: {...formData.budget, min: parseInt(e.target.value) || 0}})}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder={formData.budget.type === 'fixed' ? 'Min budget ($)' : 'Min rate ($/hr)'}
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  value={formData.budget.max || ''}
                  onChange={(e) => setFormData({...formData, budget: {...formData.budget, max: parseInt(e.target.value) || 0}})}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder={formData.budget.type === 'fixed' ? 'Max budget ($)' : 'Max rate ($/hr)'}
                  required
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              TIMELINE
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timelines.map((timeline) => (
                <button
                  key={timeline}
                  type="button"
                  onClick={() => setFormData({...formData, timeline})}
                  className={`px-4 py-3 border text-sm tracking-wider transition-colors font-light ${
                    formData.timeline === timeline
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  {timeline}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              DEVELOPER EXPERIENCE LEVEL
            </label>
            <div className="grid grid-cols-3 gap-3">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({...formData, experienceLevel: level})}
                  className={`px-4 py-3 border text-sm tracking-wider transition-colors font-light ${
                    formData.experienceLevel === level
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub Repository (Optional) */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4 font-normal">
              GITHUB REPOSITORY (OPTIONAL)
            </label>
            <input
              type="text"
              value={formData.githubRepo}
              onChange={(e) => setFormData({...formData, githubRepo: e.target.value})}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
              placeholder="https://github.com/username/repository"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              className="flex-1 swarm-button-primary"
            >
              POST PROJECT
            </button>
            <button
              type="button"
              className="flex-1 swarm-button-secondary"
            >
              SAVE AS DRAFT
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}