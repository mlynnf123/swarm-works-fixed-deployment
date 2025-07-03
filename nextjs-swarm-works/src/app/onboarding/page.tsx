'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface OnboardingData {
  bio: string
  location: string
  company: string
  skills: string[]
  languages: string[]
  hourlyRate: string
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
  timezone: string
}

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    bio: '',
    location: '',
    company: '',
    skills: [],
    languages: [],
    hourlyRate: '',
    availability: 'AVAILABLE',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  useEffect(() => {
    if (!session) {
      router.push('/login')
    }
  }, [session, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      skills
    }))
  }

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const languages = e.target.value.split(',').map(lang => lang.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      languages
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update session
      await update()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-section-title mb-4">
            WELCOME TO SWARM WORKS
            <span className="block w-16 h-0.5 bg-black mt-4 mx-auto"></span>
          </h1>
          <p className="text-gray-600 text-body">
            Let's set up your profile to get started
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-8 mb-12">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepNumber ? 'bg-black' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-normal uppercase tracking-wider mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Bio / About You
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                    placeholder="Current employer or freelance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European Time</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full swarm-button-primary"
              >
                CONTINUE
              </button>
            </div>
          )}

          {/* Step 2: Skills & Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-normal uppercase tracking-wider mb-6">Skills & Experience</h2>
              
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Technical Skills
                </label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={handleSkillsChange}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder="e.g., React, Node.js, Python, TypeScript (separate with commas)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add your main programming languages, frameworks, and tools
                </p>
              </div>

              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={formData.languages.join(', ')}
                  onChange={handleLanguagesChange}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder="e.g., English, Spanish, French (separate with commas)"
                />
              </div>

              {session.user.role === 'DEVELOPER' && (
                <div>
                  <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                    Hourly Rate (USD) - Optional
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                    placeholder="50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps clients understand your pricing expectations
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-6 border border-black hover:bg-gray-50 transition-colors text-center uppercase tracking-wider text-sm"
                >
                  BACK
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 swarm-button-primary"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-normal uppercase tracking-wider mb-6">Availability</h2>
              
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Current Availability
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'AVAILABLE', label: 'Available for new projects', desc: 'Actively looking for work' },
                    { value: 'BUSY', label: 'Busy but open to great opportunities', desc: 'Selective about new projects' },
                    { value: 'UNAVAILABLE', label: 'Not available', desc: 'Not taking on new work right now' }
                  ].map((option) => (
                    <div 
                      key={option.value}
                      className={`p-4 border-2 cursor-pointer transition-colors ${
                        formData.availability === option.value 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, availability: option.value as any }))}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="availability"
                          value={option.value}
                          checked={formData.availability === option.value}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div>
                          <h3 className="font-medium uppercase tracking-wider text-sm">{option.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium uppercase tracking-wider text-sm mb-4">What's Next?</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                    {session.user.role === 'DEVELOPER' ? 
                      'Browse available projects and submit proposals' :
                      'Post your first project and receive proposals'
                    }
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                    Connect your GitHub account for enhanced profile
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                    Access AI-powered coding assistance
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-6 border border-black hover:bg-gray-50 transition-colors text-center uppercase tracking-wider text-sm"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 swarm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'COMPLETING...' : 'COMPLETE SETUP'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}