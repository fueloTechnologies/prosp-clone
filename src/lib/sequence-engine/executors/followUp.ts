import prisma from '@/lib/prisma'



interface ExecuteFollowUpProps {
  cc: any
  conversation: any
  userId: string
  finalContent: string
}

export async function executeFollowUp({

  cc,
  conversation,
  userId,
  finalContent

}: ExecuteFollowUpProps) {

  try {

    console.log(
      "📩 Sending follow-up to:",
      cc.contact.firstName
    )

    await prisma.message.create({

      data: {

        conversationId:
          conversation.id,

        userId: userId,

        direction: 'SENT',

        content: finalContent

      }

    })

    console.log(
      "✅ Follow-up sent"
    )

    return {
      success: true
    }

  }

  catch (error) {

    console.error(
      "❌ Follow-up failed:",
      error
    )

    return {
      success: false
    }

  }

}