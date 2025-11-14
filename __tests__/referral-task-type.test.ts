import { taskSchema } from '@/lib/validations'
import { TaskType } from '@/types'

describe('REFERRAL Task Type', () => {
  it('should accept REFERRAL as a valid task type in taskSchema', () => {
    const validTask = {
      title: 'Refer a Friend',
      description: 'Invite friends to earn rewards',
      points: 50,
      taskType: 'REFERRAL' as TaskType,
      campaignId: 'test-campaign-123',
      isActive: true,
    }

    const result = taskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
  })

  it('should validate REFERRAL task type with all required fields', () => {
    const validTask = {
      title: 'Referral Task',
      description: 'Complete referral',
      points: 100,
      taskType: 'REFERRAL' as TaskType,
      campaignId: 'campaign-456',
      taskUrl: 'https://example.com',
      isActive: true,
    }

    const result = taskSchema.safeParse(validTask)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.taskType).toBe('REFERRAL')
    }
  })

  it('should include REFERRAL in TaskType union', () => {
    const referralType: TaskType = 'REFERRAL'
    expect(referralType).toBe('REFERRAL')
  })

  it('should reject invalid task types', () => {
    const invalidTask = {
      title: 'Invalid Task',
      description: 'Test',
      points: 10,
      taskType: 'INVALID_TYPE',
      campaignId: 'test-123',
    }

    const result = taskSchema.safeParse(invalidTask)
    expect(result.success).toBe(false)
  })
})
