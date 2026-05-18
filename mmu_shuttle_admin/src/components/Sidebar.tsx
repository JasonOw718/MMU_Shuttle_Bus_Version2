import { Link, useLocation, useNavigate } from 'react-router';
import { MapPin, Route, Users, LogOut, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useMockData } from '../contexts/MockDataContext';

const navigation = [
  { name: 'Routes', href: '/routes', icon: Route },
  { name: 'Drivers', href: '/drivers', icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsAuthenticated } = useMockData();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-[1px_0_10px_rgb(0,0,0,0.02)] z-10 shrink-0">
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={twMerge(
                  clsx(
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    'group flex items-center rounded-lg px-3 py-3 text-base font-semibold transition-all'
                  )
                )}
              >
                <item.icon
                  className={twMerge(
                    clsx(
                      isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600',
                      'mr-3.5 h-6 w-6 flex-shrink-0 transition-colors'
                    )
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-lg px-3 py-3 text-base font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-all"
        >
          <LogOut className="mr-3.5 h-6 w-6 flex-shrink-0 text-slate-400 group-hover:text-red-500 transition-colors" />
          Log Out
        </button>
      </div>
    </div>
  );
}
