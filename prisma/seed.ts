// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@prosp.ai' },
    update: {},
    create: {
      email: 'demo@prosp.ai',
      name: 'Yann Dine',
      plan: 'PRO',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yann',
    },
  })

  // Create LinkedIn accounts
  const liAccount = await prisma.linkedInAccount.create({
    data: {
      userId: user.id,
      name: 'Yann Dine',
      status: 'ACTIVE',
      dailyLimit: 25,
      sentToday: 12,
    },
  })

  // Create contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Cannon',
        lastName: 'Paul',
        email: 'cannon.paul@techcorp.com',
        phone: '+1 555 123 4567',
        company: 'TechCorp',
        position: 'VP of Sales',
        linkedInUrl: 'https://linkedin.com/in/cannon-paul',
        status: 'REPLIED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Joan',
        lastName: 'Smith',
        email: 'joan.smith@ventures.io',
        phone: '+1 555 234 5678',
        company: 'Ventures IO',
        position: 'CEO',
        linkedInUrl: 'https://linkedin.com/in/joan-smith',
        status: 'REPLIED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Samantha',
        lastName: 'Evans',
        email: 'samantha@marketing.co',
        phone: '+33 6 15 47 89 65',
        company: 'Marketing Co',
        position: 'Marketing Manager',
        enriched: true,
        enrichedData: {
          prospeo: { email: 'mobileip@mac.com', verified: true },
          dropcontact: { found: false },
          findymail: { phone: '+1 (061) 547-8965', verified: true },
          datagma: { found: false },
        },
        status: 'CONTACTED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Mary',
        lastName: 'Richards',
        email: 'mary@globaltech.com',
        company: 'Global Tech',
        position: 'Head of Growth',
        status: 'REPLIED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'James',
        lastName: 'Ruskin',
        email: 'james.ruskin@saas.io',
        company: 'SaaS IO',
        position: 'CTO',
        status: 'REPLIED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Bob',
        lastName: 'Simons',
        email: 'bob@growthco.com',
        company: 'Growth Co',
        position: 'Sales Director',
        status: 'CONTACTED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Peter',
        lastName: 'Jones',
        email: 'peter@innovate.ai',
        company: 'Innovate AI',
        position: 'Founder',
        status: 'CONTACTED',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'Marx',
        lastName: 'Hershey',
        email: 'Brian@reforge.com',
        phone: '55 51 23 45 67',
        company: 'Reforge',
        position: 'HR Manager',
        enriched: true,
        status: 'NEW',
      },
    }),
    prisma.contact.create({
      data: {
        userId: user.id,
        firstName: 'David',
        lastName: 'Kemp',
        email: 'ewaters@comcast.net',
        phone: '06 11 54 66 89',
        company: 'City Hall',
        position: 'Municipal Engineer',
        enriched: true,
        status: 'NEW',
      },
    }),
  ])

  // Create campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      name: 'Q1 Outreach Campaign',
      status: 'PENDING',
      dailyLimit: 25,
      totalContacts: 100,
      steps: {
        create: [
          {
            order: 1,
            type: 'CONNECTION_REQUEST',
            delay: 0,
            content: 'Hi {{firstName}}, I noticed your work at {{company}} and would love to connect!',
            aiEnhanced: true,
          },
          {
            order: 2,
            type: 'MESSAGE',
            delay: 48,
            content: 'Hi {{firstName}}, thanks for connecting! I\'m reaching out because...',
            aiEnhanced: true,
          },
          {
            order: 3,
            type: 'FOLLOW_UP',
            delay: 96,
            content: 'Just following up on my previous message...',
            aiEnhanced: false,
          },
        ],
      },
    },
  })




  // Create conversations and messages for Joan Smith (matching the screenshot)
  const joanContact = contacts.find(c => c.firstName === 'Joan')!
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      contactId: joanContact.id,
      linkedInAccId: liAccount.id,
      channel: 'LINKEDIN',
      unreadCount: 0,
      lastMessageAt: new Date('2024-03-15T17:00:00Z'),
    },
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        userId: user.id,
        linkedInAccId: liAccount.id,
        direction: 'SENT',
        content: `Hi Joan,\n\nI hope you're doing great! I'm writing to see if your company would like to work with us at Prosp. We make cool tools for your industry, and I think we can do some great things together.\n\nCan we talk soon about how we can help each other?`,
        sentAt: new Date('2024-03-15T16:30:00Z'),
        aiGenerated: true,
      },
      {
        conversationId: conversation.id,
        userId: user.id,
        direction: 'RECEIVED',
        content: `Hi Yann Dine,\nThanks for thinking of us for the partnership with Prosp! We are really excited about the idea of working together. What's the next step? Let's talk more about how we can help each other.`,
        sentAt: new Date('2024-03-15T17:00:00Z'),
      },
    ],
  })

  // Create conversations for other contacts
  const cannonContact = contacts.find(c => c.firstName === 'Cannon')!
  const conv2 = await prisma.conversation.create({
    data: {
      userId: user.id,
      contactId: cannonContact.id,
      channel: 'LINKEDIN',
      unreadCount: 4,
      lastMessageAt: new Date(),
    },
  })

  await prisma.message.create({
    data: {
      conversationId: conv2.id,
      userId: user.id,
      direction: 'RECEIVED',
      content: 'Yes, I would be interested in learning more about your platform!',
      sentAt: new Date(),
    },
  })

  console.log('✅ Seed completed successfully')
  console.log(`👤 Demo user: demo@prosp.ai`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
