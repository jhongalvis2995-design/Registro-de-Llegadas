
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getCurrentStatus, getCurrentTimeStr, formatDate, getStatusForTime } from '../utils/timeUtils';
import { Staff, AttendanceRecord, User } from '../types';
import { POSTS, POST_CONFIG } from '../constants';
import { Clock, AlertTriangle, CheckCircle2, UserCheck, Camera, MapPin, ShieldAlert, X } from 'lucide-react';

interface ScannerProps {
  staffList: Staff[];
  attendance: AttendanceRecord[];
  onRegister: (record: Omit<AttendanceRecord, 'id'>) => void;
  currentUser: User;
  isManualOverride?: boolean;
}

export const Scanner: React.FC<ScannerProps> = ({ 
  staffList, 
  attendance, 
  onRegister, 
  currentUser,
  isManualOverride = false
}) => {
  const [time, setTime] = useState(getCurrentTimeStr());
  const [statusInfo, setStatusInfo] = useState(getCurrentStatus(undefined, isManualOverride));
  const [selectedPost, setSelectedPost] = useState<string>('');
  const [lastScan, setLastScan] = useState<{ name: string; status: string; time: string; role: string; post: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';

  useEffect(() => {
    const timer = setInterval(() => {
      const nowStr = getCurrentTimeStr();
      setTime(nowStr);
      setStatusInfo(getCurrentStatus(nowStr, isManualOverride));
    }, 1000);
    return () => clearInterval(timer);
  }, [isManualOverride]);

  const availablePosts = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();

    return POSTS.filter(post => {
      if (post === "RESERVA TECNICA") return true;
      const config = POST_CONFIG[post];
      if (!config) return false;
      if (config.days && !config.days.includes(currentDay)) return false;

      return config.starts.some(startTime => {
        const [startH, startM] = startTime.split(':').map(Number);
        const startTotalMin = startH * 60 + startM;
        const windowStartMin = startTotalMin - 30; // 30 min antes
        const windowEndMin = startTotalMin + 30;   // 30 min después (Nueva Regla)
        
        const [currentH, currentM] = time.split(':').map(Number);
        const currentTotalMin = currentH * 60 + currentM;
        
        return currentTotalMin >= windowStartMin && currentTotalMin <= windowEndMin;
      });
    });
  }, [time]);

  const startScanner = async () => {
    if (scannerRef.current || !selectedPost) return;
    setError(null);
    setIsCameraActive(true); 
    
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode(scannerContainerId, { 
          verbose: false,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        });
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: 'environment' },
          { 
            fps: 30, 
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return { width: Math.floor(minEdge * 0.7), height: Math.floor(minEdge * 0.7) };
            },
            aspectRatio: 1.0,
            disableFlip: true
          },
          handleScanSuccess,
          () => {}
        );
      } catch (err) {
        setError('Error de cámara o permisos.');
        setIsCameraActive(false);
        scannerRef.current = null;
      }
    }, 150);
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (navigator.vibrate) navigator.vibrate(100);

    const staff = staffList.find(s => s.id === decodedText || s.employeeId === decodedText);
    if (!staff || !staff.active) {
      setError('ID INVÁLIDO O INACTIVO');
      await stopScanner();
      return;
    }

    const today = formatDate(new Date());
    const hasTodayRecord = attendance.some(r => r.staffId === staff.id && r.date === today);

    if (hasTodayRecord) {
      setError('REGISTRO DUPLICADO: Solicite Extensión Manual al Administrador.');
      await stopScanner();
      return;
    }

    executeRegistration(staff);
  };

  const executeRegistration = (staff: Staff) => {
    const currentT = getCurrentTimeStr();
    const calculatedStatus = getStatusForTime(currentT, selectedPost);
    
    onRegister({
      staffId: staff.id,
      staffName: staff.name,
      post: selectedPost,
      timestamp: new Date().toISOString(),
      date: formatDate(new Date()),
      time: currentT,
      status: calculatedStatus as 'Llegada normal' | 'Retardo',
      registeredBy: currentUser.name,
      isExtension: false
    });

    stopScanner();
    setLastScan({
      name: staff.name,
      role: staff.role,
      status: calculatedStatus,
      time: currentT,
      post: selectedPost
    });
    setSelectedPost('');
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsCameraActive(false);
      } catch (err) {
        setIsCameraActive(false);
        scannerRef.current = null;
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center animate-in fade-in duration-500 relative">
      <style>{`
        #qr-reader { width: 100% !important; height: 100% !important; border: none !important; position: relative; background: #000; }
        #qr-reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; border-radius: 2rem !important; }
        @keyframes scanLine { 0% { transform: translateY(-120px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(120px); opacity: 0; } }
        .scanner-laser { position: absolute; width: 80%; height: 4px; background: #3b82f6; box-shadow: 0 0 20px #3b82f6; top: 50%; left: 10%; z-index: 10; animation: scanLine 2s ease-in-out infinite; border-radius: 2px; }
        .pulse-ring { position: absolute; inset: 0; border: 4px solid #3b82f6; border-radius: 3rem; animation: pulse 2s infinite; z-index: 1; }
        @keyframes pulse { 0%, 100% { opacity: 0.6; scale: 1; } 50% { opacity: 0.1; scale: 1.02; } }
      `}</style>

      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Control Operativo</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Validación de Única Lectura</p>
        </div>
        <div className="bg-white border border-slate-200 px-8 py-4 rounded-[2.5rem] flex items-center gap-8 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="w-7 h-7 text-blue-600" />
            <span className="text-4xl font-mono font-black tracking-tighter tabular-nums">{time}</span>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3.5rem] shadow-xl p-10 border border-slate-100 flex flex-col h-[650px]">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-4 uppercase italic mb-8">
             <MapPin className="w-6 h-6 text-blue-600" /> Seleccionar Puesto
          </h3>
          <div className="flex-1 overflow-y-auto pr-3 space-y-3 custom-scrollbar">
            {availablePosts.length > 0 ? availablePosts.map(post => (
              <button key={post} onClick={() => { if(!isCameraActive) setSelectedPost(post); }} className={`w-full text-left px-8 py-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${selectedPost === post ? 'border-blue-600 bg-blue-50 text-blue-900 translate-x-2' : 'border-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-50/50'} ${isCameraActive ? 'opacity-50' : ''}`}>
                <span className="font-black text-[14px] uppercase">{post}</span>
                {selectedPost === post && <CheckCircle2 className="w-6 h-6 text-blue-600 animate-in zoom-in" />}
              </button>
            )) : (
              <div className="text-center py-20">
                <ShieldAlert className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 uppercase font-black text-[10px]">Sin Turnos Disponibles</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl p-10 border-[14px] border-slate-800 flex flex-col h-[650px] relative overflow-hidden">
          <div className="flex-1 relative rounded-[3rem] overflow-hidden bg-black border-4 border-slate-700 shadow-inner flex items-center justify-center">
             <div id={scannerContainerId} className={`w-full h-full transition-opacity duration-500 ${!isCameraActive ? 'opacity-0 absolute' : 'opacity-100'}`}></div>
             {isCameraActive && <><div className="pulse-ring" /><div className="scanner-laser" /></>}
             {!isCameraActive && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-20">
                  {lastScan ? (
                    <div className="animate-in zoom-in text-white">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"><CheckCircle2 className="w-10 h-10" /></div>
                      <h4 className="text-2xl font-black uppercase italic">{lastScan.name}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{lastScan.post}</p>
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${lastScan.status === 'Retardo' ? 'text-rose-400' : 'text-green-400'}`}>
                          {lastScan.status} ({lastScan.time})
                        </p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-rose-500 px-6">
                       <AlertTriangle className="w-16 h-16 mx-auto mb-6 animate-bounce" />
                       <p className="text-[12px] font-black uppercase tracking-tight leading-tight">{error}</p>
                    </div>
                  ) : (
                    <div className="text-slate-700">
                      <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase opacity-40">Listo para Escaneo de Arribo</p>
                    </div>
                  )}
               </div>
             )}
          </div>
          
          <button 
            disabled={!selectedPost && !isCameraActive} 
            onClick={isCameraActive ? stopScanner : startScanner} 
            className={`mt-10 w-full py-8 rounded-[2.2rem] font-black uppercase tracking-[0.4em] text-[12px] transition-all flex items-center justify-center gap-5 border-b-8 active:scale-95 ${
              isCameraActive ? 'bg-rose-600 text-white border-rose-800' : selectedPost ? 'bg-blue-600 text-white border-blue-800 shadow-2xl' : 'bg-slate-800 text-slate-600 border-slate-900 opacity-50'
            }`}
          >
            {isCameraActive ? <X className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
            {isCameraActive ? 'Cancelar' : 'Iniciar Escaneo'}
          </button>
        </div>
      </div>
    </div>
  );
};
