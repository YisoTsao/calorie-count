'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 1800;
    const step = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const ease = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
      setCount(Math.floor(ease * target));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  const t = useTranslations('landing.stats');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // 手動取得 stats 數值（next-intl messages 為 JSON，不支援 raw number）
  const statValues = [10000, 500000, 5000, 98];
  const statSuffixes = ['+', '+', '+', '%'];
  const statLabels = Array.from({ length: 4 }, (_, i) => t(`items.${i}.label`));

  return (
    <section className="bg-white py-24 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-16 text-center text-4xl font-extrabold tracking-tight md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.h2>

        <div ref={ref} className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {statValues.map((value, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-2 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">
                <CountUp target={value} suffix={statSuffixes[i]} active={inView} />
              </p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{statLabels[i]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
