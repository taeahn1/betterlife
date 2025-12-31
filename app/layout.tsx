import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: '나의 라이프 로그 - BetterLife',
    description: '명상, 운동, 식사 등 일상의 모든 순간을 기록하고 시각화하는 라이프 로깅 서비스',
    keywords: ['명상', '라이프로그', '헬스트래킹', '웰빙', '건강관리'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
