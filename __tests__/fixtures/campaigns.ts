/**
 * Campaign Test Fixtures
 * Predefined campaign data for consistent testing
 */

const now = new Date()
const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
const farFutureDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // 60 days from now

export const testCampaigns = {
  activeCampaign: {
    title: 'Active Campaign',
    description: 'Currently running campaign',
    titleTr: 'Aktif Kampanya',
    descriptionTr: 'Şu anda devam eden kampanya',
    titleDe: 'Aktive Kampagne',
    descriptionDe: 'Derzeit laufende Kampagne',
    titleZh: '活动活动',
    descriptionZh: '当前正在进行的活动',
    titleRu: 'Активная кампания',
    descriptionRu: 'Текущая кампания',
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
    endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000), // Ends in 23 days
    isActive: true,
  },
  
  futureCampaign: {
    title: 'Future Campaign',
    description: 'Upcoming campaign',
    titleTr: 'Gelecek Kampanya',
    descriptionTr: 'Yaklaşan kampanya',
    titleDe: 'Zukünftige Kampagne',
    descriptionDe: 'Bevorstehende Kampagne',
    titleZh: '未来活动',
    descriptionZh: '即将到来的活动',
    titleRu: 'Будущая кампания',
    descriptionRu: 'Предстоящая кампания',
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Starts in 7 days
    endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000), // Ends in 37 days
    isActive: true,
  },
  
  expiredCampaign: {
    title: 'Expired Campaign',
    description: 'Past campaign',
    titleTr: 'Süresi Dolmuş Kampanya',
    descriptionTr: 'Geçmiş kampanya',
    titleDe: 'Abgelaufene Kampagne',
    descriptionDe: 'Vergangene Kampagne',
    titleZh: '过期活动',
    descriptionZh: '过去的活动',
    titleRu: 'Истекшая кампания',
    descriptionRu: 'Прошедшая кампания',
    startDate: new Date(now.getTime() - 37 * 24 * 60 * 60 * 1000), // Started 37 days ago
    endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Ended 7 days ago
    isActive: false,
  },
  
  inactiveCampaign: {
    title: 'Inactive Campaign',
    description: 'Manually deactivated campaign',
    startDate: now,
    endDate: futureDate,
    isActive: false,
  },
  
  shortCampaign: {
    title: 'Short Campaign',
    description: 'Campaign with short duration',
    startDate: now,
    endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true,
  },
  
  longCampaign: {
    title: 'Long Campaign',
    description: 'Campaign with long duration',
    startDate: now,
    endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive: true,
  },
}

export const invalidCampaigns = {
  missingTitle: {
    description: 'Campaign without title',
    startDate: now,
    endDate: futureDate,
  },
  
  missingDescription: {
    title: 'Campaign without description',
    startDate: now,
    endDate: futureDate,
  },
  
  invalidDateRange: {
    title: 'Invalid Date Range',
    description: 'End date before start date',
    startDate: futureDate,
    endDate: now, // Invalid: end before start
  },
  
  missingDates: {
    title: 'Missing Dates',
    description: 'Campaign without dates',
  },
}

export const campaignDateRanges = {
  past: {
    startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  },
  
  current: {
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
  },
  
  future: {
    startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 37 * 24 * 60 * 60 * 1000),
  },
  
  overlapping: {
    startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
  },
}
