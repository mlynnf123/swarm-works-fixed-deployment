import React, { useState } from 'react';

interface ProposalModalProps {
  project: {
    id: string;
    title: string;
    budget: {
      type: 'fixed' | 'hourly';
      min: number;
      max: number;
    };
  };
  onClose: () => void;
  onSubmit: (proposal: ProposalData) => void;
}

interface ProposalData {
  coverLetter: string;
  proposedBudget: string;
  estimatedTime: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: string;
    duration: string;
  }>;
  githubSamples: string[];
  availability: string;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ project, onClose, onSubmit }) => {
  const [proposalData, setProposalData] = useState<ProposalData>({
    coverLetter: '',
    proposedBudget: '',
    estimatedTime: '',
    milestones: [
      { title: '', description: '', amount: '', duration: '' }
    ],
    githubSamples: [''],
    availability: ''
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'samples'>('overview');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(proposalData);
  };

  const addMilestone = () => {
    setProposalData({
      ...proposalData,
      milestones: [...proposalData.milestones, { title: '', description: '', amount: '', duration: '' }]
    });
  };

  const removeMilestone = (index: number) => {
    setProposalData({
      ...proposalData,
      milestones: proposalData.milestones.filter((_, i) => i !== index)
    });
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updatedMilestones = [...proposalData.milestones];
    updatedMilestones[index] = { ...updatedMilestones[index], [field]: value };
    setProposalData({ ...proposalData, milestones: updatedMilestones });
  };

  const addGithubSample = () => {
    setProposalData({
      ...proposalData,
      githubSamples: [...proposalData.githubSamples, '']
    });
  };

  const updateGithubSample = (index: number, value: string) => {
    const updatedSamples = [...proposalData.githubSamples];
    updatedSamples[index] = value;
    setProposalData({ ...proposalData, githubSamples: updatedSamples });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="border-b border-black p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-light tracking-wider mb-2">
                SUBMIT PROPOSAL
              </h2>
              <p className="text-gray-600 text-sm">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:bg-gray-100 w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'overview'
                ? 'bg-black text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex-1 px-6 py-4 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'milestones'
                ? 'bg-black text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            MILESTONES
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex-1 px-6 py-4 text-sm uppercase tracking-wider transition-colors ${
              activeTab === 'samples'
                ? 'bg-black text-white'
                : 'hover:bg-gray-50'
            }`}
          >
            WORK SAMPLES
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3">
                  COVER LETTER
                </label>
                <textarea
                  value={proposalData.coverLetter}
                  onChange={(e) => setProposalData({...proposalData, coverLetter: e.target.value})}
                  className="w-full px-4 py-3 border border-black focus:outline-none min-h-[200px]"
                  placeholder="Explain why you're the best fit for this project. Include your relevant experience, approach to solving the problem, and any questions you have..."
                  required
                />
              </div>

              {/* Proposed Budget */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-3">
                    PROPOSED {project.budget.type === 'fixed' ? 'BUDGET' : 'RATE'}
                  </label>
                  <input
                    type="text"
                    value={proposalData.proposedBudget}
                    onChange={(e) => setProposalData({...proposalData, proposedBudget: e.target.value})}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder={project.budget.type === 'fixed' ? 'Total amount ($)' : 'Hourly rate ($/hr)'}
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Client budget: ${project.budget.min} - ${project.budget.max}
                    {project.budget.type === 'hourly' && '/hr'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider mb-3">
                    ESTIMATED TIME
                  </label>
                  <input
                    type="text"
                    value={proposalData.estimatedTime}
                    onChange={(e) => setProposalData({...proposalData, estimatedTime: e.target.value})}
                    className="w-full px-4 py-3 border border-black focus:outline-none"
                    placeholder="e.g., 2 weeks, 40 hours"
                    required
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3">
                  AVAILABILITY
                </label>
                <textarea
                  value={proposalData.availability}
                  onChange={(e) => setProposalData({...proposalData, availability: e.target.value})}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="When can you start? What are your working hours? Any upcoming commitments?"
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 mb-4">
                Break down the project into milestones for better tracking and payment structure
              </p>
              
              {proposalData.milestones.map((milestone, index) => (
                <div key={index} className="border border-gray-300 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm uppercase tracking-wider">
                      MILESTONE {index + 1}
                    </h4>
                    {proposalData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
                      placeholder="Milestone title"
                    />
                    <input
                      type="text"
                      value={milestone.amount}
                      onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                      className="px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
                      placeholder="Amount ($)"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={milestone.duration}
                    onChange={(e) => updateMilestone(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Duration (e.g., 1 week)"
                  />
                  
                  <textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Describe what will be delivered in this milestone"
                    rows={2}
                  />
                </div>
              ))}
              
              <button
                type="button"
                onClick={addMilestone}
                className="w-full py-3 border border-black hover:bg-gray-50 text-sm tracking-wider"
              >
                ADD MILESTONE
              </button>
            </div>
          )}

          {/* Work Samples Tab */}
          {activeTab === 'samples' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 mb-4">
                Share relevant work samples to showcase your expertise
              </p>
              
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3">
                  GITHUB REPOSITORIES
                </label>
                {proposalData.githubSamples.map((sample, index) => (
                  <div key={index} className="mb-3">
                    <input
                      type="text"
                      value={sample}
                      onChange={(e) => updateGithubSample(index, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      placeholder="https://github.com/username/repository"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGithubSample}
                  className="text-sm uppercase tracking-wider hover:underline"
                >
                  + ADD ANOTHER REPOSITORY
                </button>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-black text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-gray-900 transition-colors"
            >
              SUBMIT PROPOSAL
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-black border border-black px-8 py-4 text-sm uppercase tracking-wider hover:bg-gray-50 transition-colors"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;