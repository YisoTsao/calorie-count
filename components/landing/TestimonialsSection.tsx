'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function TestimonialsSection() {
  const t = useTranslations('landing.testimonials');
  const [index, setIndex] = useState(0);

  const items = Array.from({ length: 3 }, (_, i) => ({
    name: t(`items.${i}.name`),
    role: t(`items.${i}.role`),
    content: t(`items.${i}.content`),
  }));

  const prev = () => setIndex((v) => (v - 1 + items.length) % items.length);
  const next = () => setIndex((v) => (v + 1) % items.length);

  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
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

        <div className="relative mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="rounded-3xl border border-gray-100 bg-gray-50 p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50"
            >
              {/* 大引號 */}
              <div className="mb-4 text-6xl font-serif leading-none text-emerald-400">&ldquo;</div>
              <p className="mb-8 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                {items[index].content}
              </p>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold text-gray-900 dark:text-white">{items[index].name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{items[index].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 控制按鈕 */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800"
              aria-label="Previous"
            >
              ‹
            </button>

            {/* 點狀指示器 */}
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index
                    ? 'w-8 bg-emerald-500'
                    : 'w-2.5 bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:border-emerald-400 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
