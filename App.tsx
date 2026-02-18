
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Scanner } from './components/Scanner';
import { Dashboard } from './components/Dashboard';
import { PersonnelList } from './components/PersonnelList';
import { AttendanceHistory } from './components/AttendanceHistory';
import { ActivityLog } from './components/ActivityLog';
import { Login } from './components/Login';
import { ViewState, Staff, AttendanceRecord, User, ActivityLogEntry } from './types';
import { MOCK_STAFF } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [manualOverrideExpiry, setManualOverrideExpiry] = useState<number>(0);

  const logActivity = useCallback((action: string, details: string, type: ActivityLogEntry['type'] = 'info') => {
    if (!user) return;
    const newLog: ActivityLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: user.username,
      userName: user.name,
      action,
      details,
      type
    };
    const updated = [newLog, ...activityLogs].slice(0, 1000);
    setActivityLogs(updated);
    localStorage.setItem('guardscan_activity_logs', JSON.stringify(updated));
  }, [user, activityLogs]);

  const loadData = useCallback(() => {
    const savedStaff = localStorage.getItem('guardscan_staff');
    const savedAttendance = localStorage.getItem('guardscan_attendance');
    const savedLogs = localStorage.getItem('guardscan_activity_logs');
    const savedUser = localStorage.getItem('guardscan_user');
    
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
    else {
      setStaffList(MOCK_STAFF);
      localStorage.setItem('guardscan_staff', JSON.stringify(MOCK_STAFF));
    }
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedLogs) setActivityLogs(JSON.parse(savedLogs));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem('guardscan_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    logActivity('Inicio de Sesión', 'El usuario ingresó exitosamente al sistema', 'success');
    if (loggedUser.role === 'supervisor') setView('scanner');
    else setView('dashboard');
  };

  const handleLogout = () => {
    logActivity('Cierre de Sesión', 'El usuario salió del sistema', 'info');
    localStorage.removeItem('guardscan_user');
    setUser(null);
    setView('dashboard'); 
  };

  const registerAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    const newRecord: AttendanceRecord = { ...record, id: Math.random().toString(36).substr(2, 9) };
    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    localStorage.setItem('guardscan_attendance', JSON.stringify(updated));
    
    const activityMsg = record.isExtension 
      ? `EXTENSIÓN: ${record.staffName} en ${record.post} (Manual)`
      : `${record.staffName} registrado en ${record.post} (${record.status})`;
    
    logActivity('Registro de Asistencia', activityMsg, record.isExtension ? 'warning' : 'success');
  };

  const deleteAttendanceRecord = (id: string) => {
    const recordToDelete = attendance.find(r => r.id === id);
    if (!recordToDelete) return;

    const updated = attendance.filter(r => r.id !== id);
    setAttendance(updated);
    localStorage.setItem('guardscan_attendance', JSON.stringify(updated));
    
    logActivity('Eliminación de Registro', `Se eliminó el registro de ${recordToDelete.staffName} del día ${recordToDelete.date}`, 'danger');
  };

  const addStaff = (newStaff: Omit<Staff, 'id'>) => {
    const staff: Staff = { ...newStaff, id: Math.random().toString(36).substr(2, 9) };
    const updated = [...staffList, staff];
    setStaffList(updated);
    localStorage.setItem('guardscan_staff', JSON.stringify(updated));
    logActivity('Registro de Personal', `Se agregó a ${staff.name} al inventario`, 'success');
  };

  const removeStaff = (id: string) => {
    const staffToRemove = staffList.find(s => s.id === id);
    const updated = staffList.filter(s => s.id !== id);
    setStaffList(updated);
    localStorage.setItem('guardscan_staff', JSON.stringify(updated));
    logActivity('Eliminación de Personal', `Se eliminó a ${staffToRemove?.name}`, 'danger');
  };

  const updateStaffStatus = (id: string, active: boolean) => {
    const staff = staffList.find(s => s.id === id);
    const updated = staffList.map(s => s.id === id ? { ...s, active } : s);
    setStaffList(updated);
    localStorage.setItem('guardscan_staff', JSON.stringify(updated));
    logActivity('Cambio de Estado', `${staff?.name} -> ${active ? 'ACTIVO' : 'INACTIVO'}`, 'info');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <Layout currentView={view} setView={setView} user={user} onLogout={handleLogout} isManualActive={false} onToggleManual={() => {}}>
      {view === 'scanner' && (user.role === 'admin' || user.role === 'supervisor') && (
        <Scanner 
          staffList={staffList} 
          attendance={attendance}
          onRegister={registerAttendance} 
          currentUser={user}
        />
      )}
      {view === 'dashboard' && (
        <Dashboard attendance={attendance} userRole={user.role} />
      )}
      {view === 'personnel' && user.role === 'admin' && (
        <PersonnelList 
          staffList={staffList} 
          onAdd={addStaff} 
          onRemove={removeStaff} 
          onUpdateStatus={updateStaffStatus}
          onRegisterManual={registerAttendance}
          currentUser={user}
        />
      )}
      {view === 'history' && (user.role === 'admin' || user.role === 'auditor') && (
        <AttendanceHistory 
          attendance={attendance} 
          userRole={user.role} 
          onDeleteRecord={deleteAttendanceRecord}
        />
      )}
      {view === 'activity_log' && (user.role === 'admin' || user.role === 'auditor') && (
        <ActivityLog logs={activityLogs} />
      )}
    </Layout>
  );
};

export default App;
