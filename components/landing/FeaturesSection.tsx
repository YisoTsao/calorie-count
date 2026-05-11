'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';

const FEATURE_ICONS = [
  'lucide:scan-face',
  'lucide:activity',
  'lucide:utensils',
  'lucide:dumbbell',
  'lucide:scale',
  'lucide:bar-chart-2',
  'lucide:target',
  'lucide:trophy',
];

const ICON_COLORS = [
  'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30',
  'text-teal-600 bg-teal-50 dark:bg-teal-900/30',
  'text-green-600 bg-green-50 dark:bg-green-900/30',
  'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30',
  'text-sky-600 bg-sky-50 dark:bg-sky-900/30',
  'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30',
  'text-violet-600 bg-violet-50 dark:bg-violet-900/30',
  'text-amber-600 bg-amber-50 dark:bg-amber-900/30',
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function FeaturesSection() {
  const t = useTranslations('landing.features');
  // next-intl 不支援直接 t.raw 陣列，改用 index-based 讀取
  const items = Array.from({ length: 8 }, (_, i) => ({
    title: t(`items.${i}.title`),
    desc: t(`items.${i}.desc`),
  }));

  return (
    <section id="features" className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* 標題 */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">{t('title')}</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">{t('subtitle')}</p>
        </motion.div>

        {/* 功能卡片網格 */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-800/50"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${ICON_COLORS[i]}`}
              >
                <Icon icon={FEATURE_ICONS[i]} className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
