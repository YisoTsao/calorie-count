import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://calo-circle.yisoapp.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // 阻擋 API 路由與需登入的管理後台
      disallow: ['/api/', '/admin/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
