
import { SCHEDULE_RULES, POST_CONFIG } from '../constants';
import { RegistrationStatus, AttendanceRecord } from '../types';

export const getCurrentTimeStr = (): string => {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
};

/**
 * Calcula cuántos minutos de retardo tiene un registro específico.
 */
export const calculateLateMinutes = (record: AttendanceRecord): number => {
  if (record.status !== 'Retardo') return 0;
  if (record.post === "RESERVA TECNICA") return 0;

  const config = POST_CONFIG[record.post];
  if (!config) return 0;

  const [currH, currM] = record.time.split(':').map(Number);
  const currTotal = currH * 60 + currM;

  let minDiff = Infinity;
  let found = false;

  for (const startTime of config.starts) {
    const [startH, startM] = startTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;

    // Si la llegada es después del inicio pero dentro del rango de retardo (30 min)
    if (currTotal > startTotal && currTotal <= startTotal + 30) {
      const diff = currTotal - startTotal;
      if (diff < minDiff) {
        minDiff = diff;
        found = true;
      }
    }
  }

  return found ? minDiff : 0;
};

/**
 * Determina el estado basándose en el puesto y la hora de forma dinámica.
 * Regla: 30 min antes (Normal), hasta 30 min después (Retardo).
 */
export const getStatusForTime = (timeStr: string, postName?: string): RegistrationStatus => {
  if (postName === "RESERVA TECNICA") return 'Llegada normal';

  const config = postName ? POST_CONFIG[postName] : null;
  
  if (config) {
    const [currH, currM] = timeStr.split(':').map(Number);
    const currTotal = currH * 60 + currM;

    for (const startTime of config.starts) {
      const [startH, startM] = startTime.split(':').map(Number);
      const startTotal = startH * 60 + startM;

      // Ventana de 30 min antes hasta 30 min después
      if (currTotal >= startTotal - 30 && currTotal <= startTotal + 30) {
        return currTotal <= startTotal ? 'Llegada normal' : 'Retardo';
      }
    }
  }

  // Fallback a reglas globales si el puesto no tiene config específica
  const rule = SCHEDULE_RULES.find(r => timeStr >= r.start && timeStr <= r.end);
  if (!rule || rule.status === 'Registro suspendido') {
    return 'Retardo'; 
  }
  
  return rule.status;
};

export const getCurrentStatus = (
  timeOverride?: string, 
  isManualOverrideActive: boolean = false
): { status: RegistrationStatus; canScan: boolean; isManual: boolean } => {
  const time = timeOverride || getCurrentTimeStr();
  
  const rule = SCHEDULE_RULES.find(r => time >= r.start && time <= r.end);

  if (!rule) {
    return { status: 'Registro suspendido', canScan: false, isManual: false };
  }

  if (isManualOverrideActive && rule.status === 'Registro suspendido') {
    return { status: 'Retardo', canScan: true, isManual: true };
  }

  const canScan = rule.status !== 'Registro suspendido';
  
  return { 
    status: rule.status, 
    canScan, 
    isManual: false 
  };
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
