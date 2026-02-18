
# ODS&SCAN - Sistema de Gestión de Asistencia por QR 🛡️

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38b2ac.svg)

**ODS&SCAN** es una plataforma de alta gama diseñada para el control y registro de personal de seguridad en entornos críticos (como clínicas y complejos industriales). Optimizado para supervisores de turno y administradores de operaciones.

## ✨ Características Principales

- 📸 **Escáner QR de Alta Velocidad**: Implementación con `html5-qrcode` para lectura instantánea en dispositivos móviles.
- 📊 **Dashboard de Analítica Avanzada**: Visualización en tiempo real de eficiencia, puntualidad y minutos de retardo acumulados.
- ⏰ **Gestión de Turnos Dinámica**: Reglas de negocio automatizadas para determinar estados de llegada (Normal, Retardo, Suspendido).
- 🔐 **Sistema de Roles (RBAC)**: Accesos diferenciados para Administradores, Supervisores y Auditores.
- 📑 **Exportación Inteligente**: Generación de reportes detallados en formato Excel (.xlsx).
- 🛠️ **Override Remoto**: Capacidad administrativa para liberar escáneres fuera de horario.

## 🚀 Instalación y Uso

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/ods-scan.git
   ```
2. **Abrir en el navegador**: 
   Dado que utiliza ES6 Modules, se recomienda servir los archivos con un servidor local (como Live Server en VS Code).

## 🗃️ Arquitectura del Proyecto

```text
├── components/          # Componentes de UI (Layout, Dashboard, Scanner...)
├── utils/               # Lógica de cálculo de tiempos y formatos
├── constants.ts         # Base de datos mock y reglas de negocio
├── types.ts             # Definiciones de TypeScript
└── App.tsx              # Componente raíz y gestión de estado
```

## 🔐 Credenciales de Acceso (Demo)

| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| `Administrador` | `1093781185AmyJavid/` | Full Access |
| `SupervisorCDC` | `Country2026/` | Operativo |
| `VistaPrevia` | `VistaPrevia123` | Auditoría |

## 🛠️ Tecnologías

- **React 19** + **TypeScript**
- **Tailwind CSS** (Diseño Atómico & Dark Mode compatible)
- **Lucide React** (Iconografía minimalista)
- **Recharts** (Visualización de datos avanzada)
- **SheetJS** (Procesamiento de archivos Excel)

---
Desarrollado con precisión técnica para G4S Secure Solutions.
