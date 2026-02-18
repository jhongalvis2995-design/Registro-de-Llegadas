
import React, { useState } from 'react';
import { ActivityLogEntry } from '../types';
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ActivityLogProps {
  logs: ActivityLogEntry[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLogIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'danger': return <Trash2 className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl border border-slate-800">
              <FileText className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Centro de Actividades</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Bitácora de Auditoría del Sistema CDC</p>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-[2rem] shadow-sm focus-within:ring-4 ring-blue-500/10 transition-all">
        <Search className="w-6 h-6 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar acciones, usuarios o detalles en el historial..." 
          className="flex-1 outline-none text-slate-700 bg-transparent font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiempo</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuario</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acción</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Descripción de Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => {
                  const { date, time } = formatTimestamp(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-900 font-black tabular-nums">{time}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                              <User className="w-4 h-4" />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-xs text-slate-800 uppercase tracking-tight leading-none">{log.userName}</span>
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {log.userId}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          log.type === 'success' ? 'bg-green-50 text-green-700' :
                          log.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                          log.type === 'danger' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {getLogIcon(log.type)}
                          {log.action}
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-md">
                        <p className="text-xs font-bold text-slate-600 italic tracking-tight">{log.details}</p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-6 opacity-30">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                         <Clock className="w-12 h-12 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                         <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Sin Actividades Recientes</p>
                         <p className="text-xs font-bold text-slate-400 uppercase">El historial de auditoría está vacío o filtrado</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
