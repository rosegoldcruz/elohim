import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import { TrendsResponse, Trend } from '../../../types/aeon'

// Mock trending topics - in production, this would scrape real trend data
const MOCK_TRENDS: Omit<Trend, 'trend_id' | 'timestamp'>[] = [
  {
    title: "AI replacing jobs in 2024",
    virality_score: 95,
    topic_tags: ["ai", "technology", "future", "jobs", "automation"]
  },
  {
    title: "Secret productivity hack billionaires use",
    virality_score: 88,
    topic_tags: ["productivity", "success", "business", "mindset", "wealth"]
  },
  {
    title: "Why Gen Z is quitting corporate jobs",
    virality_score: 92,
    topic_tags: ["genz", "career", "corporate", "lifestyle", "freedom"]
  },
  {
    title: "Hidden psychology tricks that actually work",
    virality_score: 87,
    topic_tags: ["psychology", "mindtricks", "influence", "social", "behavior"]
  },
  {
    title: "Crypto predictions that came true",
    virality_score: 84,
    topic_tags: ["crypto", "bitcoin", "predictions", "finance", "investing"]
  },
  {
    title: "Morning routines of successful people",
    virality_score: 79,
    topic_tags: ["morning", "routine", "success", "habits", "lifestyle"]
  },
  {
    title: "Social media is rewiring our brains",
    virality_score: 91,
    topic_tags: ["socialmedia", "brain", "psychology", "addiction", "health"]
  },
  {
    title: "Climate change solutions nobody talks about",
    virality_score: 86,
    topic_tags: ["climate", "environment", "solutions", "sustainability", "future"]
  }
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendsResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Select 3 random trending topics
    const shuffled = [...MOCK_TRENDS].sort(() => 0.5 - Math.random())
    const selectedTrends = shuffled.slice(0, 3)

    // Add IDs and timestamps
    const trends: Trend[] = selectedTrends.map(trend => ({
      ...trend,
      trend_id: uuidv4(),
      timestamp: new Date().toISOString()
    }))

    // Sort by virality score (highest first)
    trends.sort((a, b) => b.virality_score - a.virality_score)

    console.log(`Trends agent: Generated ${trends.length} trending topics`)

    return res.status(200).json({ trends })

  } catch (error) {
    console.error('Trends agent error:', error)
    
    if (error instanceof Error) {
      return res.status(500).json({ error: `Trends generation failed: ${error.message}` })
    }
    
    return res.status(500).json({ error: 'Trends generation failed due to an unknown error' })
  }
}

// Export config for Vercel
export const config = {
  api: {
    responseLimit: '1mb',
  },
}
