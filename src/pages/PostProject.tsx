import React, { useState } from 'react';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    type: 'fixed' | 'hourly';
    min: string;
    max: string;
  };
  timeline: string;
  experienceLevel: string;
  githubRepo?: string;
}

const PostProject: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    skills: [],
    budget: {
      type: 'fixed',
      min: '',
      max: ''
    },
    timeline: '',
    experienceLevel: '',
    githubRepo: ''
  });

  const categories = [
    'BUG FIX',
    'NEW FEATURE',
    'FULL PROJECT',
    'CODE REVIEW',
    'REFACTORING',
    'DOCUMENTATION',
    'TESTING',
    'DEPLOYMENT'
  ];

  const experienceLevels = [
    'BEGINNER',
    'INTERMEDIATE', 
    'EXPERT'
  ];

  const timelines = [
    'LESS THAN 1 WEEK',
    '1-2 WEEKS',
    '2-4 WEEKS',
    '1-2 MONTHS',
    'MORE THAN 2 MONTHS'
  ];

  const commonSkills = [
    'REACT', 'TYPESCRIPT', 'JAVASCRIPT', 'NODE.JS', 'PYTHON',
    'SOLIDITY', 'RUST', 'GO', 'JAVA', 'C++', 'AWS', 'DOCKER'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Project submitted:', formData);
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-wider mb-2">
            POST PROJECT
            <span className="block w-16 h-0.5 bg-black mt-4"></span>
          </h1>
          <p className="text-gray-600 mt-4">
            Describe your project and find the perfect developer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Project Title */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4">
              PROJECT TITLE
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none"
              placeholder="e.g., Fix authentication bug in React app"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4">
              CATEGORY
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData({...formData, category})}
                  className={`px-4 py-3 border text-sm tracking-wider transition-colors ${
                    formData.category === category
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-black hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4">
              PROJECT DESCRIPTION
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none min-h-[200px]"
              placeholder="Describe your project in detail. Include current issues, expected outcomes, and any specific requirements..."
              required
            />
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4">
              REQUIRED SKILLS
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-2 border text-xs tracking-wider transition-colors ${
                    formData.skills.includes(skill)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 bg-white focus:outline-none focus:border-black"
              placeholder="Add other skills (press Enter)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    toggleSkill(input.value.trim().toUpperCase());
                    input.value = '';
                  }
                }
              }}
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4">
              BUDGET
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, budget: {...formData.budget, type: 'fixed'}})}
                className={`px-4 py-3 border text-sm tracking-wider transition-colors ${
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
                className={`px-4 py-3 border text-sm tracking-wider transition-colors ${
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
                  type="text"
                  value={formData.budget.min}
                  onChange={(e) => setFormData({...formData, budget: {...formData.budget, min: e.target.value}})}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none"
                  placeholder={formData.budget.type === 'fixed' ? 'Min budget ($)' : 'Min rate ($/hr)'}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={formData.budget.max}
                  onChange={(e) => setFormData({...formData, budget: {...formData.budget, max: e.target.value}})}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none"
                  placeholder={formData.budget.type === 'fixed' ? 'Max budget ($)' : 'Max rate ($/hr)'}
                  required
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm uppercase tracking-wider mb-4">
              TIMELINE
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {timelines.map((timeline) => (
                <button
                  key={timeline}
                  type="button"
                  onClick={() => setFormData({...formData, timeline})}
                  className={`px-4 py-3 border text-sm tracking-wider transition-colors ${
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
            <label className="block text-sm uppercase tracking-wider mb-4">
              DEVELOPER EXPERIENCE LEVEL
            </label>
            <div className="grid grid-cols-3 gap-3">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({...formData, experienceLevel: level})}
                  className={`px-4 py-3 border text-sm tracking-wider transition-colors ${
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
            <label className="block text-sm uppercase tracking-wider mb-4">
              GITHUB REPOSITORY (OPTIONAL)
            </label>
            <input
              type="text"
              value={formData.githubRepo}
              onChange={(e) => setFormData({...formData, githubRepo: e.target.value})}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none"
              placeholder="https://github.com/username/repository"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-8">
            <button
              type="submit"
              className="flex-1 bg-black text-white px-8 py-4 text-sm tracking-wider hover:bg-gray-900 transition-colors"
            >
              POST PROJECT
            </button>
            <button
              type="button"
              className="flex-1 bg-white text-black border border-black px-8 py-4 text-sm tracking-wider hover:bg-gray-50 transition-colors"
            >
              SAVE AS DRAFT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProject;