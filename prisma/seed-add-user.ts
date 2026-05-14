import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
  // 為所有還沒有 subscription 的用戶建立 FREE 訂閱
  const usersWithoutSub = await prisma.user.findMany({
    where: { subscription: null },
    select: { id: true, email: true },
  })

  console.log(`找到 ${usersWithoutSub.length} 位用戶尚無訂閱記錄`)

  for (const user of usersWithoutSub) {
    const sub = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date('2099-12-31'),
      },
    })
    console.log(`建立訂閱：${user.email} → ${sub.id}`)
  }

  console.log('完成')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })