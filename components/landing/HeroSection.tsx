'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

/**
 * 粒子背景設定 — 使用固定值取代 Math.random()。
 * Math.random() 在 SSR 與 Client hydration 會產生不同值，導致 hydration mismatch。
 */
const PARTICLES = [
  { id: 0, size: 8, x: 5, duration: 15, delay: 0 },
  { id: 1, size: 4, x: 14, duration: 18, delay: 3 },
  { id: 2, size: 7, x: 22, duration: 12, delay: 6 },
  { id: 3, size: 5, x: 31, duration: 16, delay: 1 },
  { id: 4, size: 9, x: 40, duration: 20, delay: 4 },
  { id: 5, size: 3, x: 48, duration: 13, delay: 7 },
  { id: 6, size: 6, x: 57, duration: 17, delay: 2 },
  { id: 7, size: 8, x: 66, duration: 11, delay: 5 },
  { id: 8, size: 4, x: 74, duration: 19, delay: 0.5 },
  { id: 9, size: 7, x: 83, duration: 14, delay: 3.5 },
  { id: 10, size: 5, x: 91, duration: 16, delay: 6.5 },
  { id: 11, size: 9, x: 10, duration: 12, delay: 1.5 },
  { id: 12, size: 3, x: 26, duration: 20, delay: 4.5 },
  { id: 13, size: 6, x: 35, duration: 18, delay: 7.5 },
  { id: 14, size: 8, x: 44, duration: 13, delay: 2.5 },
  { id: 15, size: 4, x: 53, duration: 15, delay: 5.5 },
  { id: 16, size: 7, x: 62, duration: 17, delay: 0.8 },
  { id: 17, size: 5, x: 71, duration: 11, delay: 3.8 },
  { id: 18, size: 9, x: 79, duration: 19, delay: 6.8 },
  { id: 19, size: 3, x: 88, duration: 14, delay: 1.8 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.2, ease: 'easeOut' as const },
  }),
};

export function HeroSection() {
  const t = useTranslations('landing.hero');
  const locale = useLocale();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* CSS 粒子背景 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-emerald-400/20 dark:bg-emerald-500/10"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              bottom: '-10px',
              animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* 漸層圓形裝飾 */}
      <div className="pointer-events-none absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-64 -right-64 h-[600px] w-[600px] rounded-full bg-teal-400/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 py-32 text-center">
        {/* Badge */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t('badge')}
          </span>
        </motion.div>

        {/* 標題 */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
        >
          {t('title')}{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            {t('titleHighlight')}
          </span>
        </motion.h1>

        {/* 副標題 */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 md:text-xl"
        >
          {t('subtitle')}
        </motion.p>

        {/* CTA 按鈕 */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-emerald-500/30 hover:shadow-xl"
          >
            <span className="relative z-10">{t('ctaPrimary')}</span>
            <motion.span
              className="absolute inset-0 bg-white/10"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.4 }}
            />
          </Link>
          <button
            onClick={scrollToFeatures}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-8 py-4 text-base font-semibold text-gray-700 backdrop-blur-sm transition-all hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300"
          >
            {t('ctaSecondary')}
            <span className="i-lucide-arrow-down" />
          </button>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          80% { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
