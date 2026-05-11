'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const stepColors = [
  'from-emerald-500 to-teal-600',
  'from-teal-500 to-cyan-600',
  'from-cyan-500 to-sky-600',
];

export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');
  const steps = Array.from({ length: 3 }, (_, i) => ({
    step: t(`steps.${i}.step`),
    title: t(`steps.${i}.title`),
    desc: t(`steps.${i}.desc`),
  }));

  return (
    <section className="bg-gradient-to-br from-emerald-50 to-teal-50 py-24 dark:from-gray-950 dark:to-gray-900">
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

        {/* 步驟列 */}
        <div className="relative flex flex-col items-stretch gap-8 md:flex-row md:items-start">
          {/* 連線（僅桌面） */}
          <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 md:block" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* 步驟圓圈 */}
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${stepColors[i]} text-2xl font-extrabold text-white shadow-lg`}
              >
                {s.step}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{s.title}</h3>
              <p className="max-w-xs text-gray-500 dark:text-gray-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
