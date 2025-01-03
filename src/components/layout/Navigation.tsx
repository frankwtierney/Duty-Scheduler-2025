import { Link, useLocation } from 'react-router-dom';
import { Users, Calendar, Clock, BookOpen } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#005bbb]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-semibold text-white">Duty Scheduler</h1>
        
        <div className="flex h-full items-end space-x-1">
          {[
            { path: '/semester', icon: BookOpen, label: 'Semester' },
            { path: '/staff', icon: Users, label: 'Staff' },
            { path: '/availability', icon: Calendar, label: 'Availability' },
            { path: '/scheduler', icon: Clock, label: 'Scheduler' },
          ].map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`group relative flex min-w-[120px] items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-gray-900'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {/* Chrome-style tab background */}
                <span
                  className={`absolute inset-0 transition-all duration-200 ${
                    active
                      ? 'rounded-t-lg bg-[#f3f4f6]'
                      : 'rounded-t-lg bg-white/10 opacity-0 group-hover:opacity-100'
                  }`}
                />
                
                {/* Content */}
                <span className="relative flex items-center">
                  <Icon className={`mr-2 h-4 w-4 ${active ? 'text-[#005bbb]' : 'text-white/70 group-hover:text-white'}`} />
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
