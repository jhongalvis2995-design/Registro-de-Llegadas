
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  RefreshCw, 
  Target, 
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  Server,
  AlertTriangle,
  Zap,
  MapPin,
  Activity,
  History,
  Timer,
  CalendarDays
} from 'lucide-react';
import { AttendanceRecord, UserRole } from '../types';
import { formatDate, calculateLateMinutes } from '../utils/timeUtils';
import * as XLSX from 'xlsx';

interface DashboardProps {
  attendance: AttendanceRecord[];
  userRole?: UserRole;
}

const PIE_COLORS = ['#22c55e', '#f43f5e'];

export const Dashboard: React.FC<DashboardProps> = ({ attendance, userRole }) => {
  const [filterDate, setFilterDate] = useState<string>(formatDate(new Date()));
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, [attendance]);

  // Cálculo de sumatorias de minutos por periodos
  const lateMinutesStats = useMemo(() => {
    const now = new Date();
    const todayStr = filterDate;
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    
    // Rango Semana (Últimos 7 días desde hoy)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Rango Quincena Actual
    const isFirstFortnight = currentDay <= 15;
    
    let daySum = 0;
    let weekSum = 0;
    let fortnightSum = 0;
    let monthSum = 0;

    attendance.forEach(rec => {
      if (rec.status !== 'Retardo') return;
      
      const lateMins = calculateLateMinutes(rec);
      const recDate = new Date(rec.date + 'T12:00:00');
      const recDay = recDate.getDate();
      const recMonth = recDate.getMonth();
      const recYear = recDate.getFullYear();

      // Diario
      if (rec.date === todayStr) daySum += lateMins;

      // Mensual
      if (recMonth === currentMonth && recYear === currentYear) {
        monthSum += lateMins;
        
        // Quincenal (dentro del mismo mes)
        if (isFirstFortnight && recDay <= 15) fortnightSum += lateMins;
        if (!isFirstFortnight && recDay > 15) fortnightSum += lateMins;
      }

      // Semanal (últimos 7 días calendario)
      if (recDate >= sevenDaysAgo && recDate <= now) {
        weekSum += lateMins;
      }
    });

    return { daySum, weekSum, fortnightSum, monthSum };
  }, [attendance, filterDate]);

  const stats = useMemo(() => {
    const dailyRecords = attendance.filter(r => r.date === filterDate);
    const normal = dailyRecords.filter(r => r.status === 'Llegada normal').length;
    const late = dailyRecords.filter(r => r.status === 'Retardo').length;
    
    const postAlerts = dailyRecords.reduce((acc: any, curr) => {
      if (curr.status === 'Retardo') {
        acc[curr.post] = (acc[curr.post] || 0) + 1;
      }
      return acc;
    }, {});

    const rankingData = Object.entries(postAlerts)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const pieData = [
      { name: 'Puntual', value: normal },
      { name: 'Retardo', value: late }
    ].filter(d => d.value > 0);

    return {
      total: dailyRecords.length,
      normal,
      late,
      efficiency: dailyRecords.length ? Math.round((normal / dailyRecords.length) * 100) : 0,
      pieData,
      rankingData
    };
  }, [attendance, filterDate]);

  const trendData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDate(d);
      const dayRecs = attendance.filter(r => r.date === dStr);
      data.push({
        name: dStr.split('-').slice(2).join('/'),
        total: dayRecs.length,
        puntual: dayRecs.filter(r => r.status === 'Llegada normal').length,
        retardo: dayRecs.filter(r => r.status === 'Retardo').length,
      });
    }
    return data;
  }, [attendance]);

  const exportToExcel = () => {
    const data = attendance.map(r => ({
      'Empleado': r.staffName,
      'Puesto': r.post,
      'Fecha': r.date,
      'Hora': r.time,
      'Estado': r.status,
      'Minutos Retardo': calculateLateMinutes(r),
      'Supervisor': r.registeredBy
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bitácora");
    XLSX.writeFile(workbook, `Reporte_Inteligente_Operaciones.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-slate-200">
              <Server className="w-8 h-8 text-blue-400" />
           </div>
           <div>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Monitor Central</h2>
                <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${isSyncing ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                   <Activity className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                   {isSyncing ? 'Recibiendo Datos' : 'Canal Estable'}
                </div>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">G4S Secure Solutions - Análisis de Operaciones</p>
           </div>
        </div>
        
        <div className="flex gap-4">
           <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm focus-within:border-blue-500 transition-colors">
              <Calendar className="w-5 h-5 text-blue-600" />
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="font-black text-[12px] uppercase outline-none bg-transparent"
              />
           </div>
           {userRole === 'admin' && (
              <button 
                onClick={exportToExcel}
                className="group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 border-b-4 border-slate-700"
              >
                <Download className="w-4 h-4 group-hover:animate-bounce" />
                Descarga Inteligente
              </button>
           )}
        </div>
      </div>

      {/* PANEL DE ANALÍTICA DE RETARDOS */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Timer className="w-6 h-6 text-rose-600" />
          <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Analítica de Incumplimiento (Minutos de Retardo)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-rose-500 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoy</p>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{lateMinutesStats.daySum}<span className="text-sm font-bold text-rose-500 ml-1">min</span></p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-rose-600 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <History className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimos 7 Días</p>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{lateMinutesStats.weekSum}<span className="text-sm font-bold text-rose-500 ml-1">min</span></p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-rose-700 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <Zap className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quincena Actual</p>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{lateMinutesStats.fortnightSum}<span className="text-sm font-bold text-rose-500 ml-1">min</span></p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm border-l-8 border-l-rose-800 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <CalendarDays className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mes Actual</p>
            </div>
            <p className="text-4xl font-black text-slate-800 tracking-tighter">{lateMinutesStats.monthSum}<span className="text-sm font-bold text-rose-500 ml-1">min</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group border-b-8 border-blue-600">
            <TrendingUp className="absolute -top-10 -right-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-all duration-1000 text-blue-400" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4 italic">Eficiencia Hoy</p>
            <h4 className="text-7xl font-black text-white italic tracking-tighter">{stats.efficiency}<span className="text-2xl text-blue-500">%</span></h4>
            <div className="w-full h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
               <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ width: `${stats.efficiency}%` }} />
            </div>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Capturas</p>
                  <p className="text-5xl font-black text-slate-800 tracking-tighter">{stats.total}</p>
               </div>
               <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><CheckCircle2 className="w-8 h-8" /></div>
            </div>
            <p className="text-[10px] text-blue-500 font-black uppercase mt-6 flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
               Datos validados
            </p>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puntuales</p>
                  <p className="text-5xl font-black text-green-600 tracking-tighter">{stats.normal}</p>
               </div>
               <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><Target className="w-8 h-8" /></div>
            </div>
            <p className="text-[10px] text-green-600 font-black uppercase mt-6 tracking-widest">Cumplimiento Óptimo</p>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retardos</p>
                  <p className="text-5xl font-black text-rose-600 tracking-tighter">{stats.late}</p>
               </div>
               <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle className="w-8 h-8" /></div>
            </div>
            <p className="text-[10px] text-rose-400 font-black uppercase mt-6 tracking-widest">Alertas de Horario</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-4 text-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Tendencia Semanal
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Actividad de los últimos 7 días</p>
               </div>
               <div className="flex gap-6">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-[10px] font-black uppercase">Ingresos</span></div>
               </div>
            </div>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                     <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                     <Tooltip 
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                        itemStyle={{fontWeight: 900, textTransform: 'uppercase', fontSize: '10px'}}
                     />
                     <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-black text-slate-900 uppercase italic tracking-tight text-xl mb-4">
               Distribución Hoy
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Puntualidad vs Retardos</p>
            <div className="flex-1 flex flex-col items-center justify-center">
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={stats.pieData}
                           cx="50%"
                           cy="50%"
                           innerRadius={80}
                           outerRadius={110}
                           paddingAngle={8}
                           dataKey="value"
                           animationBegin={0}
                           animationDuration={1500}
                        >
                           {stats.pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                           ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" align="center" wrapperStyle={{paddingTop: '30px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase'}} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-4 text-xl">
                    <Zap className="w-6 h-6 text-amber-500" />
                    Ranking de Alertas por Puesto
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Zonas con mayor incidencia de retardos hoy</p>
               </div>
            </div>
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={stats.rankingData} margin={{ left: 80, right: 40 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                     <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 900}} />
                     <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={180} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#1e293b', fontSize: 10, fontWeight: 900}} 
                     />
                     <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                     />
                     <Bar dataKey="value" fill="#f59e0b" radius={[0, 15, 15, 0]} barSize={40}>
                        {stats.rankingData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#f43f5e' : '#f59e0b'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};
