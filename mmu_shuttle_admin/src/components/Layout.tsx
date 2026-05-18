import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import mmuLogo from '../assets/mmu_logo.svg';

export function Layout() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Full-Width App Header (Blue) matching student app */}
      <header className="bg-[#113a9f] text-white px-4 md:px-10 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between shadow-md gap-4 md:gap-0 shrink-0 z-20">
        <div className="flex items-center gap-3 md:gap-4 md:mr-12 w-full">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-1.5 md:p-2 overflow-hidden shadow-sm">
            <img src={mmuLogo} alt="MMU Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-wide">MMU Shuttle Admin</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-50">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
