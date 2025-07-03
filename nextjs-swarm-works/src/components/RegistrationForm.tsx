'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface RegistrationData {
  name: string
  email: string
  username: string
  password: string
  confirmPassword: string
  role: 'DEVELOPER' | 'CLIENT'
}

export function RegistrationForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'DEVELOPER'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1) // Multi-step form

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.username && formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setStep(prev => prev - 1)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep1() || !validateStep2()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username || undefined,
          password: formData.password,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto-sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (signInResult?.error) {
        setError('Registration successful, but auto-login failed. Please sign in manually.')
        router.push('/login')
      } else {
        router.push('/dashboard')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-section-title mb-2">
          CREATE ACCOUNT
          <span className="block w-16 h-0.5 bg-black mt-4"></span>
        </h2>
        <p className="text-gray-600 mt-4 text-body">
          Join the elite developer network
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center mt-6 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-black' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                placeholder="john@example.com"
                required
              />
            </div>

            <button
              type="button"
              onClick={handleNextStep}
              className="w-full swarm-button-primary"
            >
              CONTINUE
            </button>
          </div>
        )}

        {/* Step 2: Account Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                Username (Optional)
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                placeholder="johndoe"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be your public profile username
              </p>
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                placeholder="Repeat your password"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 py-3 px-6 border border-black hover:bg-gray-50 transition-colors text-center uppercase tracking-wider text-sm"
              >
                BACK
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 swarm-button-primary"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Role Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                Account Type *
              </label>
              <div className="space-y-3">
                <div 
                  className={`p-4 border-2 cursor-pointer transition-colors ${
                    formData.role === 'DEVELOPER' 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'DEVELOPER' }))}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="DEVELOPER"
                      checked={formData.role === 'DEVELOPER'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <h3 className="font-medium uppercase tracking-wider">Developer</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        I want to work on projects and earn money
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 cursor-pointer transition-colors ${
                    formData.role === 'CLIENT' 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'CLIENT' }))}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="CLIENT"
                      checked={formData.role === 'CLIENT'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <h3 className="font-medium uppercase tracking-wider">Client</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        I need help with coding projects
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 py-3 px-6 border border-black hover:bg-gray-50 transition-colors text-center uppercase tracking-wider text-sm"
              >
                BACK
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 swarm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}