
import React from 'react';
import { ViewState, User } from '../types';
import { 
  Scan, 
  LayoutDashboard, 
  Users, 
  History, 
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Zap,
  Server,
  Eye,
  FileSearch
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User;
  onLogout: () => void;
  isManualActive: boolean;
  onToggleManual: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  user, 
  onLogout,
  isManualActive,
  onToggleManual 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Monitor Central', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'auditor'] },
    { id: 'scanner', label: 'Estación Escáner', icon: Scan, roles: ['admin', 'supervisor'] },
    { id: 'personnel', label: 'Inventario Personal', icon: Users, roles: ['admin'] },
    { id: 'history', label: 'Bitácora Histórica', icon: History, roles: ['admin', 'auditor'] },
    { id: 'activity_log', label: 'Registro Actividades', icon: FileSearch, roles: ['admin', 'auditor'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-white p-6 sticky top-0 h-screen shadow-2xl z-50">
        <div className="flex items-center gap-3 mb-10 group">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
            user.role === 'admin' ? 'bg-blue-600 shadow-blue-500/20' : 
            user.role === 'auditor' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-slate-700'
          }`}>
            {user.role === 'admin' ? <Server className="w-6 h-6 text-white" /> : 
             user.role === 'auditor' ? <Eye className="w-6 h-6 text-white" /> : 
             <ShieldCheck className="w-6 h-6 text-white" />}
          </div>
          <div>
             <h1 className="text-lg font-black tracking-tight uppercase italic text-blue-50">ODS&SCAN</h1>
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">
               {user.role === 'admin' ? 'Servidor Central' : 
                user.role === 'auditor' ? 'Espejo Auditor' : 'Estación Supervisor'}
             </p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 translate-x-1' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'animate-pulse' : ''}`} />
              <span className="font-bold text-xs tracking-wide uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        {user.role === 'admin' && (
          <div className="mt-8 mb-4 p-5 rounded-[2rem] bg-slate-800/80 border border-slate-700/50 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Zap className={`w-4 h-4 ${isManualActive ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Remote Override</span>
            </div>
            <button
              onClick={onToggleManual}
              disabled={isManualActive}
              className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${
                isManualActive 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'
              }`}
            >
              {isManualActive ? 'Excepción Activa' : 'Liberar Escáner'}
            </button>
          </div>
        )}
        
        <div className="pt-6 border-t border-slate-800/50 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-[1.5rem] border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 text-blue-400 flex items-center justify-center border border-slate-600 shadow-inner">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black truncate text-blue-100 uppercase tracking-tight">{user.name}</p>
                <div className="flex items-center gap-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></div>
                   <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">En Línea</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-500 font-black text-[10px] uppercase tracking-widest border border-rose-500/20 hover:border-transparent active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-xl z-50">
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-black tracking-tighter uppercase italic">ODS&SCAN</h1>
          </div>
          <button onClick={onLogout} className="p-2.5 text-rose-400 bg-rose-400/10 rounded-xl hover:bg-rose-500 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {isManualActive && (
             <div className="max-w-7xl mx-auto mb-6 bg-amber-500 text-white px-8 py-3 rounded-[1.5rem] flex items-center justify-between shadow-xl animate-in slide-in-from-top-4 border-b-4 border-amber-700/30">
                <div className="flex items-center gap-4">
                   <Zap className="w-5 h-5 animate-pulse" />
                   <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Status: Override Remoto</span>
                      <p className="text-[9px] font-bold opacity-80 uppercase tracking-widest">Los escáneres están operando fuera de horario por mandato de Administración</p>
                   </div>
                </div>
                <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Activo</div>
             </div>
          )}
          <div className="max-w-7xl mx-auto h-full pb-24 md:pb-0">
            {children}
          </div>
        </div>

        <nav className="md:hidden bg-white border-t border-slate-100 flex justify-around p-3 fixed bottom-0 left-0 right-0 z-[60] shadow-2xl rounded-t-[2.5rem]">
          {visibleNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all ${
                currentView === item.id ? 'text-blue-600 bg-blue-50 scale-105' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};
