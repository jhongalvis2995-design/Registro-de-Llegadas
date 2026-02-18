
import React, { useState, useMemo } from 'react';
import { AttendanceRecord, UserRole } from '../types';
import { 
  Search, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  ShieldCheck, 
  Download, 
  Server, 
  Zap, 
  Trash2, 
  X, 
  Lock,
  Trophy,
  UserX,
  TrendingUp,
  Star,
  Frown
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AttendanceHistoryProps {
  attendance: AttendanceRecord[];
  userRole?: UserRole;
  onDeleteRecord?: (id: string) => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ attendance, userRole, onDeleteRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState(false);

  // Lógica para determinar periodos (Mes y Quincena)
  const periods = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const day = now.getDate();
    const fortnight = day <= 15 ? 1 : 2;
    
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return {
      month,
      year,
      fortnight,
      monthLabel: `${monthNames[month].toUpperCase()} ${year}`,
      fortnightLabel: `${fortnight}RA QUINCENA`
    };
  }, []);

  // Cálculo de Líderes de Desempeño (Top 5 Mensual y Top 5 Quincenal)
  const performanceStats = useMemo(() => {
    const monthlyMap: Record<string, { name: string, punctual: number, total: number }> = {};
    const fortnightMap: Record<string, { name: string, late: number }> = {};
    
    attendance.forEach(rec => {
      const recDate = new Date(rec.date + 'T12:00:00');
      const recMonth = recDate.getMonth();
      const recYear = recDate.getFullYear();
      const recDay = recDate.getDate();
      const recFortnight = recDay <= 15 ? 1 : 2;

      // Filtro Mensual (Cuadro de Honor)
      if (recMonth === periods.month && recYear === periods.year) {
        if (!monthlyMap[rec.staffId]) {
          monthlyMap[rec.staffId] = { name: rec.staffName, punctual: 0, total: 0 };
        }
        monthlyMap[rec.staffId].total++;
        if (rec.status === 'Llegada normal') monthlyMap[rec.staffId].punctual++;
      }

      // Filtro Quincenal (Alertas)
      if (recMonth === periods.month && recYear === periods.year && recFortnight === periods.fortnight) {
        if (!fortnightMap[rec.staffId]) {
          fortnightMap[rec.staffId] = { name: rec.staffName, late: 0 };
        }
        if (rec.status === 'Retardo') fortnightMap[rec.staffId].late++;
      }
    });

    // Procesar Top 5 Mensual (Puntualidad)
    const topPunctual = Object.values(monthlyMap)
      .map(p => ({
        ...p,
        ratio: Math.round((p.punctual / p.total) * 100)
      }))
      .filter(p => p.total >= 1)
      .sort((a, b) => b.ratio - a.ratio || b.punctual - a.punctual)
      .slice(0, 5);

    // Procesar Top 5 Quincenal (Alertas/Retardos)
    const topLate = Object.values(fortnightMap)
      .filter(p => p.late > 0)
      .sort((a, b) => b.late - a.late)
      .slice(0, 5);

    return { topPunctual, topLate };
  }, [attendance, periods]);

  const filteredHistory = attendance.filter(r => 
    r.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.post.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.registeredBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1093781185AmyJavid/') {
      if (confirmDeleteId && onDeleteRecord) {
        onDeleteRecord(confirmDeleteId);
        setConfirmDeleteId(null);
        setPassword('');
        setPassError(false);
      }
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const exportExcel = () => {
    const data = filteredHistory.map(r => ({
      'Empleado': r.staffName,
      'Puesto': r.post,
      'Fecha': r.date,
      'Hora': r.time,
      'Estado': r.status,
      'Extensión': r.isExtension ? 'SÍ' : 'NO',
      'Validado Por': r.registeredBy
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bitácora Central");
    XLSX.writeFile(workbook, `Bitacora_Asistencia_CDC.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl border border-slate-800">
              <Server className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Bitácora Centralizada</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Sincronización de Nodos Operativos</p>
           </div>
        </div>
        
        {userRole === 'admin' && (
           <button 
             onClick={exportExcel}
             className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
           >
             <Download className="w-4 h-4" />
             Exportar Bitácora
           </button>
        )}
      </div>

      {/* DASHBOARD DE DESEMPEÑO ACUMULADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CUADRO DE HONOR - TOP 5 MENSUAL */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[3.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <Trophy className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                     <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Cuadro de Honor</h3>
                    <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.2em] mt-1">Top 5 Puntualidad Mensual</p>
                  </div>
               </div>
               <div className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {periods.monthLabel}
               </div>
            </div>
            
            <div className="space-y-3">
              {performanceStats.topPunctual.length > 0 ? performanceStats.topPunctual.map((p, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-[1.8rem] border border-white/10 flex items-center justify-between hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-black opacity-30 italic w-8 text-center">#{i+1}</span>
                    <div>
                      <p className="font-black text-[11px] uppercase tracking-tight leading-none mb-2">{p.name}</p>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400" style={{ width: `${p.ratio}%` }}></div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">{p.ratio}% Puntual</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <TrendingUp className="w-10 h-10 mx-auto opacity-20 mb-4" />
                  <p className="opacity-50 uppercase font-black text-[10px] tracking-widest">Sin registros mensuales</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ALERTAS CRÍTICAS - TOP 5 QUINCENAL */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-[3.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <UserX className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                     <AlertCircle className="w-6 h-6 text-rose-200" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Alertas de Seguimiento</h3>
                    <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.2em] mt-1">Top 5 Retardos Quincenales</p>
                  </div>
               </div>
               <div className="bg-rose-900/40 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {periods.fortnightLabel}
               </div>
            </div>
            
            <div className="space-y-3">
              {performanceStats.topLate.length > 0 ? performanceStats.topLate.map((p, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-[1.8rem] border border-white/10 flex items-center justify-between hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg border border-rose-400/30">
                       {p.late}
                    </div>
                    <div>
                      <p className="font-black text-[11px] uppercase tracking-tight leading-none mb-1">{p.name}</p>
                      <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest flex items-center gap-1">
                         <Zap className="w-2.5 h-2.5 fill-rose-300 text-rose-300" />
                         Retardos acumulados
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-10 h-10 bg-rose-900/30 rounded-full flex items-center justify-center border border-white/10">
                      <Frown className="w-5 h-5 text-rose-300" />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <ShieldCheck className="w-10 h-10 mx-auto opacity-20 mb-4 text-emerald-300" />
                  <p className="opacity-50 uppercase font-black text-[10px] tracking-widest">Sin incidencias en la quincena</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="flex items-center gap-4 bg-white border border-slate-200 px-6 py-4 rounded-[2rem] shadow-sm focus-within:ring-4 ring-blue-500/10 transition-all">
        <Search className="w-6 h-6 text-slate-400" />
        <input 
          type="text" 
          placeholder="Filtrar bitácora por nombre, puesto o supervisor..." 
          className="flex-1 outline-none text-slate-700 bg-transparent font-bold text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA DE REGISTROS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Colaborador</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Puesto</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estatus</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tiempo</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Validador</th>
                {userRole === 'admin' && <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-inner border border-blue-100">
                          {record.staffName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-sm text-slate-800 tracking-tight">{record.staffName}</span>
                          {record.isExtension && (
                            <span className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-widest mt-0.5">
                              <Zap className="w-2.5 h-2.5 fill-blue-600" />
                              Extensión Autorizada
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        <MapPin className="w-3.5 h-3.5" />
                        {record.post}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        record.status === 'Llegada normal' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {record.status === 'Llegada normal' ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        {record.status}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 font-black tabular-nums">{record.time}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{record.date}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 text-slate-600 font-black text-[10px] uppercase">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                           <ShieldCheck className="w-4 h-4" />
                        </div>
                        {record.registeredBy}
                      </div>
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => setConfirmDeleteId(record.id)}
                          className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === 'admin' ? 6 : 5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-6 opacity-30">
                      <Calendar className="w-12 h-12 text-slate-300" />
                      <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Sin registros para mostrar</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-rose-600 p-10 text-center text-white relative">
               <AlertCircle className="w-16 h-16 mx-auto mb-4" />
               <h3 className="text-2xl font-black uppercase italic tracking-tighter">Seguridad Admin</h3>
               <p className="text-[10px] font-bold uppercase opacity-80 mt-2 tracking-widest">Contraseña requerida para borrar</p>
               <button onClick={() => setConfirmDeleteId(null)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleDeleteAttempt} className="p-10 space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Maestro</label>
                  <div className="relative">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input 
                        type="password"
                        placeholder="Ingrese clave"
                        className={`w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl font-black text-sm outline-none transition-all ${passError ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200'}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                     />
                  </div>
                  {passError && <p className="text-rose-600 text-[10px] font-black uppercase text-center mt-2">Acceso Denegado</p>}
               </div>
               <button type="submit" className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl border-b-4 border-rose-800">Eliminar Registro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
