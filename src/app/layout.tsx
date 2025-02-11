import type { Metadata, Viewport } from 'next';

import { Provider } from '@/components/ui/provider';
import { Layout } from '@/lib/layout';

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = 'Qlik Saas Capacity Migration Check';

export const metadata: Metadata = {
  title: { default: APP_NAME, template: '%s | Qlik Saas Capacity Check' },
  description: 'Small app to check if you are ready to migrate to the new pricing model',
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FFFFFF',
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" suppressHydrationWarning style={{overflow: 'hidden'}}>
      <body style={{overflow: 'auto', maxHeight: '100vh'}}>
        <Provider>
          <Layout>{children}</Layout>
        </Provider>
      </body>
    </html>
  );
};

export default RootLayout;
