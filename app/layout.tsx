import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SYSTEM // Player Console', description: 'Habit tracker RPG dashboard' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body>{children}</body></html>; }
