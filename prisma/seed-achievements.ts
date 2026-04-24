import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENT_DEFINITIONS = [
  // ── 打卡類 streak ──
  {
    code: "first_meal",
    name: "起步",
    description: "記錄了第一餐飲食",
    icon: "",
    category: "milestone",
    triggerType: "FIRST_MEAL" as const,
    triggerValue: null,
    sortOrder: 0,
  },
  {
    code: "streak_7",
    name: "一週達成",
    description: "連續記錄 7 天飲食",
    icon: "",
    category: "streak",
    triggerType: "STREAK_DAYS" as const,
    triggerValue: 7,
    sortOrder: 1,
  },
  {
    code: "streak_30",
    name: "習慣養成",
    description: "連續記錄 30 天飲食",
    icon: "",
    category: "streak",
    triggerType: "STREAK_DAYS" as const,
    triggerValue: 30,
    sortOrder: 2,
  },
  {
    code: "streak_100",
    name: "毅力大師",
    description: "連續記錄 100 天飲食",
    icon: "",
    category: "streak",
    triggerType: "STREAK_DAYS" as const,
    triggerValue: 100,
    sortOrder: 3,
  },
  // ── 里程碑類 milestone ──
  {
    code: "total_100_meals",
    name: "百餐達人",
    description: "累積記錄 100 餐飲食",
    icon: "",
    category: "milestone",
    triggerType: "TOTAL_MEALS" as const,
    triggerValue: 100,
    sortOrder: 4,
  },
  {
    code: "total_500_meals",
    name: "老饕",
    description: "累積記錄 500 餐飲食",
    icon: "",
    category: "milestone",
    triggerType: "TOTAL_MEALS" as const,
    triggerValue: 500,
    sortOrder: 5,
  },
  {
    code: "app_30_days",
    name: "一個月用戶",
    description: "使用 App 滿 30 天",
    icon: "",
    category: "milestone",
    triggerType: "TOTAL_DAYS" as const,
    triggerValue: 30,
    sortOrder: 6,
  },
  {
    code: "app_180_days",
    name: "半年夥伴",
    description: "使用 App 滿 180 天",
    icon: "",
    category: "milestone",
    triggerType: "TOTAL_DAYS" as const,
    triggerValue: 180,
    sortOrder: 7,
  },
  // ── 目標類 goal ──
  {
    code: "goal_hit_7",
    name: "精準控制",
    description: "達成熱量目標 7 次",
    icon: "",
    category: "goal",
    triggerType: "GOAL_HIT_COUNT" as const,
    triggerValue: 7,
    sortOrder: 8,
  },
  {
    code: "goal_hit_30",
    name: "均衡飲食",
    description: "達成熱量目標 30 次",
    icon: "",
    category: "goal",
    triggerType: "GOAL_HIT_COUNT" as const,
    triggerValue: 30,
    sortOrder: 9,
  },
  {
    code: "goal_hit_100",
    name: "卡路里大師",
    description: "達成熱量目標 100 次",
    icon: "",
    category: "goal",
    triggerType: "GOAL_HIT_COUNT" as const,
    triggerValue: 100,
    sortOrder: 10,
  },
];

async function main() {
  console.log("Seeding achievement definitions...");

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await prisma.achievementDefinition.upsert({
      where: { code: def.code },
      update: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        triggerType: def.triggerType,
        triggerValue: def.triggerValue,
        sortOrder: def.sortOrder,
      },
      create: def,
    });
    console.log(`  ✓ ${def.name}`);
  }

  console.log(
    `Done! Seeded ${ACHIEVEMENT_DEFINITIONS.length} achievement definitions.`,
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
