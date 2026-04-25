import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '認證 | AI 卡路里追蹤',
    template: '%s | AI 卡路里追蹤',
  },
  description: 'AI 驅動的智慧卡路里追蹤應用',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
