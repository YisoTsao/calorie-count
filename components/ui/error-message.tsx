import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  /** 錯誤訊息 */
  message: string;
  /** 錯誤類型 */
  type?: 'error' | 'warning' | 'info';
  /** 額外的 CSS 類別 */
  className?: string;
  /** 顯示圖示 */
  showIcon?: boolean;
}

const typeConfig = {
  error: {
    icon: 'lucide:alert-circle',
    className: 'bg-red-50 text-red-900 border-red-200',
  },
  warning: {
    icon: 'lucide:alert-triangle',
    className: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  },
  info: {
    icon: 'lucide:info',
    className: 'bg-blue-50 text-blue-900 border-blue-200',
  },
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  className,
  showIcon = true,
}) => {
  const config = typeConfig[type];

  return (
    <div
      className={cn('flex items-start gap-3 rounded-lg border p-4', config.className, className)}
      role="alert"
    >
      {showIcon && <Icon icon={config.icon} className="mt-0.5 h-5 w-5 flex-shrink-0" />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};
