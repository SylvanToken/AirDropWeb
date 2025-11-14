import { NextRequest, NextResponse } from 'next/server';
import { processReaction } from '@/lib/telegram/reaction-service';

/**
 * POST /api/telegram/webhook
 * 
 * Telegram webhook for reaction updates
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      console.error('[Telegram Webhook] Invalid secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle message_reaction update
    if (body.message_reaction) {
      const reaction = body.message_reaction;
      
      // Process each reaction change
      const oldReactions = reaction.old_reaction || [];
      const newReactions = reaction.new_reaction || [];
      
      // Find added reactions
      for (const newR of newReactions) {
        const wasPresent = oldReactions.some((r: any) => r.emoji === newR.emoji);
        
        if (!wasPresent) {
          // Reaction added
          await processReaction({
            userId: '', // Will be found by telegramUserId
            telegramUserId: reaction.user.id.toString(),
            postId: reaction.message_id.toString(),
            chatId: reaction.chat.id.toString(),
            reactionEmoji: newR.emoji,
            action: 'added',
          });
        }
      }
      
      // Find removed reactions
      for (const oldR of oldReactions) {
        const stillPresent = newReactions.some((r: any) => r.emoji === oldR.emoji);
        
        if (!stillPresent) {
          // Reaction removed
          await processReaction({
            userId: '',
            telegramUserId: reaction.user.id.toString(),
            postId: reaction.message_id.toString(),
            chatId: reaction.chat.id.toString(),
            reactionEmoji: oldR.emoji,
            action: 'removed',
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
