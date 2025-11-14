'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AnalyticsChart from './AnalyticsChart'
import { TrendingUp, Users, CheckCircle, Target, X } from 'lucide-react'

interface Campaign {
  id: string
  title: string
}

interface CampaignComparisonProps {
  campaigns: Campaign[]
  currentCampaignId: string
}

interface ComparisonData {
  campaigns: Array<{
    id: string
    title: string
    participationRate: number
    completionRate: number
    engagementScore: number
    totalCompletions: number
  }>
  insights: string[]
}

export function CampaignComparison({ campaigns, currentCampaignId }: CampaignComparisonProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([currentCampaignId])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableCampaigns = campaigns.filter(c => c.id !== currentCampaignId)

  const handleAddCampaign = (campaignId: string) => {
    if (!selectedCampaigns.includes(campaignId)) {
      setSelectedCampaigns([...selectedCampaigns, campaignId])
    }
  }

  const handleRemoveCampaign = (campaignId: string) => {
    if (campaignId !== currentCampaignId) {
      setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaignId))
    }
  }

  const handleCompare = async () => {
    if (selectedCampaigns.length < 2) {
      alert('Please select at least one other campaign to compare')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/campaigns/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: selectedCampaigns }),
      })

      if (!res.ok) throw new Error('Failed to compare campaigns')
      const data = await res.json()
      setComparisonData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCampaignTitle = (id: string) => {
    return campaigns.find(c => c.id === id)?.title || 'Unknown Campaign'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Campaigns */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Campaigns</label>
            <div className="flex flex-wrap gap-2">
              {selectedCampaigns.map(id => (
                <div
                  key={id}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  <span>{getCampaignTitle(id)}</span>
                  {id !== currentCampaignId && (
                    <button
                      onClick={() => handleRemoveCampaign(id)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Available Campaigns */}
          {availableCampaigns.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Add Campaign to Compare</label>
              <div className="flex flex-wrap gap-2">
                {availableCampaigns
                  .filter(c => !selectedCampaigns.includes(c.id))
                  .map(campaign => (
                    <Button
                      key={campaign.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddCampaign(campaign.id)}
                    >
                      {campaign.title}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Compare Button */}
          <Button
            onClick={handleCompare}
            disabled={loading || selectedCampaigns.length < 2}
            className="w-full"
          >
            {loading ? 'Comparing...' : 'Compare Campaigns'}
          </Button>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparisonData && (
        <>
          {/* Insights */}
          {comparisonData.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparisonData.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Comparison Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participation Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={comparisonData.campaigns.map(c => ({
                    name: c.title,
                    rate: c.participationRate,
                  }))}
                  type="bar"
                  dataKey="rate"
                  xAxisKey="name"
                  height={250}
                  color="#3b82f6"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={comparisonData.campaigns.map(c => ({
                    name: c.title,
                    rate: c.completionRate,
                  }))}
                  type="bar"
                  dataKey="rate"
                  xAxisKey="name"
                  height={250}
                  color="#10b981"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Engagement Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={comparisonData.campaigns.map(c => ({
                    name: c.title,
                    score: c.engagementScore,
                  }))}
                  type="bar"
                  dataKey="score"
                  xAxisKey="name"
                  height={250}
                  color="#a855f7"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Total Completions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={comparisonData.campaigns.map(c => ({
                    name: c.title,
                    completions: c.totalCompletions,
                  }))}
                  type="bar"
                  dataKey="completions"
                  xAxisKey="name"
                  height={250}
                  color="#f59e0b"
                />
              </CardContent>
            </Card>
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Campaign</th>
                      <th className="text-right py-2 px-4">Participation Rate</th>
                      <th className="text-right py-2 px-4">Completion Rate</th>
                      <th className="text-right py-2 px-4">Engagement Score</th>
                      <th className="text-right py-2 px-4">Total Completions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{campaign.title}</td>
                        <td className="text-right py-3 px-4">
                          {campaign.participationRate.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          {campaign.completionRate.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-medium ${
                            campaign.engagementScore >= 70 ? 'text-green-600' :
                            campaign.engagementScore >= 40 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {campaign.engagementScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          {campaign.totalCompletions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
