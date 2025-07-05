import NextAuth, { AuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          githubId: profile.id,
          bio: profile.bio,
          location: profile.location,
          company: profile.company,
          blog: profile.blog,
          publicRepos: profile.public_repos,
          followers: profile.followers,
          following: profile.following,
          role: 'DEVELOPER' // Default role, can be changed later
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: profile.email?.split('@')[0] || profile.name?.toLowerCase().replace(/\s+/g, ''),
          role: 'DEVELOPER' // Default role, can be changed later
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          // Find credentials account for this user
          const account = await prisma.account.findFirst({
            where: {
              userId: user.id,
              provider: 'credentials'
            }
          })

          if (!account || !account.access_token) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            account.access_token
          )

          if (!isPasswordValid) {
            return null
          }

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            username: user.username,
            role: user.role,
            isVerified: user.isVerified
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        // Add custom user properties to session
        session.user.id = user.id
        session.user.role = (user as any).role || 'DEVELOPER'
        session.user.username = (user as any).username
        session.user.githubId = (user as any).githubId
        session.user.isVerified = (user as any).isVerified || false
      }
      return session
    },
    async jwt({ user, token }) {
      if (user) {
        token.role = (user as any).role
        token.username = (user as any).username
        token.githubId = (user as any).githubId
        token.isVerified = (user as any).isVerified
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Auto-verify GitHub users
      if (account?.provider === 'github') {
        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
        return true
      }

      // Auto-verify Google users
      if (account?.provider === 'google') {
        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
        return true
      }
      
      // Handle credentials login
      if (account?.provider === 'credentials') {
        // Update last login time
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })
        return true
      }
      
      return true
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }