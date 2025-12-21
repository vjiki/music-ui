import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Player from './Player';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        <Player />
      </main>
    </div>
  );
}

