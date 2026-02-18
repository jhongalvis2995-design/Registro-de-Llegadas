
import React, { useState, useMemo } from 'react';
import { Staff, AttendanceRecord, User as LoggedUser } from '../types';
import { QRCodeSVG } from 'qrcode.react';
// Fixed: Removed ToggleLeft from lucide-react import to avoid conflict with local definition
import { Plus, Trash2, Shield, Search, UserCheck, UserMinus, ToggleRight, FileImage, Zap, ChevronRight, X } from 'lucide-react';
import { POSTS } from '../constants';
import { getCurrentTimeStr, formatDate } from '../utils/timeUtils';

interface PersonnelListProps {
  staffList: Staff[];
  onAdd: (staff: Omit<Staff, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdateStatus: (id: string, active: boolean) => void;
  onRegisterManual?: (record: Omit<AttendanceRecord, 'id'>) => void;
  currentUser: LoggedUser;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({ 
  staffList, onAdd, onRemove, onUpdateStatus, onRegisterManual, currentUser 
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Oficial de Seguridad', employeeId: '', active: true });
  const [manualRegStaff, setManualRegStaff] = useState<Staff | null>(null);
  const [selectedPost, setSelectedPost] = useState('');

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => ({
    total: staffList.length,
    active: staffList.filter(s => s.active).length,
    inactive: staffList.filter(s => !s.active).length
  }), [staffList]);

  const handleManualReg = () => {
    if (!manualRegStaff || !selectedPost || !onRegisterManual) return;
    
    onRegisterManual({
      staffId: manualRegStaff.id,
      staffName: manualRegStaff.name,
      post: selectedPost,
      timestamp: new Date().toISOString(),
      date: formatDate(new Date()),
      time: getCurrentTimeStr(),
      status: 'Llegada normal', // Extensión se considera entrada válida manual
      registeredBy: currentUser.name,
      isExtension: true
    });

    setManualRegStaff(null);
    setSelectedPost('');
    alert(`Extensión de Horario registrada para ${manualRegStaff.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic">Inventario de Personal</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Gestión de Seguridad CDC</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center gap-2 active:scale-95 transition-all">
          <Plus className="w-4 h-4" /> Nuevo Registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <Shield className="w-8 h-8 text-blue-600" />
          <div><p className="text-[10px] font-black text-slate-400 uppercase">Total</p><p className="text-2xl font-black">{stats.total}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-green-500">
          <UserCheck className="w-8 h-8 text-green-600" />
          <div><p className="text-[10px] font-black text-slate-400 uppercase">Activos</p><p className="text-2xl font-black text-green-600">{stats.active}</p></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-500">
          <UserMinus className="w-8 h-8 text-rose-600" />
          <div><p className="text-[10px] font-black text-slate-400 uppercase">Inactivos</p><p className="text-2xl font-black text-rose-600">{stats.inactive}</p></div>
        </div>
      </div>

      <div className="flex gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
        <Search className="w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Buscar por nombre o ID..." className="flex-1 outline-none text-sm font-bold" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(staff => (
          <div key={staff.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative group">
            <div className="p-6 flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${staff.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 uppercase text-xs tracking-tight">{staff.name}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{staff.role}</p>
                </div>
              </div>
              <button onClick={() => onUpdateStatus(staff.id, !staff.active)} className={`p-2 transition-all ${staff.active ? 'text-green-500' : 'text-slate-300'}`}>
                {staff.active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 border-y border-slate-50">
               <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <QRCodeSVG value={staff.id} size={100} />
               </div>
               <p className="text-[9px] font-mono text-slate-400 mt-3 font-bold">ID: {staff.employeeId}</p>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2">
              <button 
                onClick={() => setManualRegStaff(staff)}
                disabled={!staff.active}
                className="col-span-2 bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-30 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                Registro Manual (Extensión)
              </button>
              <button onClick={() => onRemove(staff.id)} className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all flex justify-center"><Trash2 className="w-4 h-4" /></button>
              <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-all flex justify-center"><FileImage className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL REGISTRO MANUAL */}
      {manualRegStaff && (
        <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-slate-900 p-10 text-white relative">
                 <Zap className="w-12 h-12 text-yellow-400 mb-4 animate-pulse" />
                 <h3 className="text-2xl font-black uppercase italic">Extensión de Horario</h3>
                 <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Colaborador: {manualRegStaff.name}</p>
                 <button onClick={() => setManualRegStaff(null)} className="absolute top-8 right-8 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seleccionar Puesto de Arribo</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                       {POSTS.map(p => (
                         <button 
                            key={p} 
                            onClick={() => setSelectedPost(p)}
                            className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${selectedPost === p ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                          >
                           {p}
                         </button>
                       ))}
                    </div>
                 </div>
                 <button 
                    onClick={handleManualReg}
                    disabled={!selectedPost}
                    className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-30"
                 >
                    Confirmar Registro Extensión
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// Fixed: Component now uses imported ToggleRight and avoids conflict with ToggleLeft import
const ToggleLeft = ({ className }: { className?: string }) => <ToggleRight className={`${className} rotate-180 opacity-50`} />;
