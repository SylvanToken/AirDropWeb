import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import taskGenerator from '@/lib/task-generator';

/**
 * POST /api/admin/tasks/generate
 * 
 * Generate random tasks (admin only)
 * Tasks are created as inactive and require admin approval
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type = 'random', count = 10, campaignId } = body;

    // Validate campaign exists
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    let tasks: any[] = [];

    // Generate tasks based on type
    switch (type) {
      case 'random':
        tasks = taskGenerator.generateRandomTasks(count);
        break;
      case 'social':
        tasks = taskGenerator.generateSocialTasks();
        break;
      case 'profile':
        tasks = taskGenerator.generateProfileTasks();
        break;
      case 'environmental':
        tasks = taskGenerator.generateEnvironmentalTasks();
        break;
      case 'listing':
        tasks = taskGenerator.generateListingTasks();
        break;
      case 'all':
        const allTasks = taskGenerator.generateAllTasks();
        tasks = Object.values(allTasks).flat();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid task type' },
          { status: 400 }
        );
    }

    // Create tasks in database with translations (inactive by default)
    const createdTasks = await Promise.all(
      tasks.map(task =>
        prisma.task.create({
          data: {
            campaignId,
            // English (default)
            title: task.title,
            description: task.description,
            // Translations
            titleTr: task.titleTr || null,
            descriptionTr: task.descriptionTr || null,
            titleAr: task.titleAr || null,
            descriptionAr: task.descriptionAr || null,
            titleDe: task.titleDe || null,
            descriptionDe: task.descriptionDe || null,
            titleEs: task.titleEs || null,
            descriptionEs: task.descriptionEs || null,
            titleKo: task.titleKo || null,
            descriptionKo: task.descriptionKo || null,
            titleRu: task.titleRu || null,
            descriptionRu: task.descriptionRu || null,
            titleZh: task.titleZh || null,
            descriptionZh: task.descriptionZh || null,
            // Other fields
            points: task.points,
            taskType: task.taskType,
            taskUrl: task.taskUrl || null,
            isActive: false, // Requires admin approval
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${createdTasks.length} tasks`,
      tasks: createdTasks,
      stats: {
        total: createdTasks.length,
        type,
        campaignId,
        status: 'inactive'
      }
    });
  } catch (error) {
    console.error('[Admin Task Generation] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/tasks/generate/stats
 * 
 * Get task generation statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const stats = taskGenerator.getTaskStats();
    const config = taskGenerator.config;

    return NextResponse.json({
      stats,
      config: {
        categories: config.taskCategories,
        supportedLanguages: config.taskGeneration.supportedLanguages,
        defaultStatus: config.taskGeneration.defaultStatus,
        requiresAdminApproval: config.taskGeneration.requiresAdminApproval
      }
    });
  } catch (error) {
    console.error('[Admin Task Generation Stats] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
