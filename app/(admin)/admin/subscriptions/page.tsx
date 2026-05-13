import { redirect } from 'next/navigation';

// 訂閱管理已整合到會員管理頁面
export default function AdminSubscriptionsPage() {
  redirect('/admin/members');
}
