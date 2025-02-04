'use client';

import { IoClose } from "react-icons/io5";
import { User } from '@/app/dashboard/users/types';

interface Session {
  id: string;
  ip: string;
  startTime: Date;
  endTime: Date | null;
}

interface SessionHistoryModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock data - reemplazar con datos reales
const mockSessions: Session[] = [
  {
    id: '1',
    ip: '192.168.1.100',
    startTime: new Date('2024-03-20T08:30:00'),
    endTime: new Date('2024-03-20T17:45:00'),
  },
  {
    id: '2',
    ip: '192.168.1.105',
    startTime: new Date('2024-03-19T09:15:00'),
    endTime: new Date('2024-03-19T18:20:00'),
  },
  {
    id: '3',
    ip: '192.168.1.110',
    startTime: new Date('2024-03-18T08:45:00'),
    endTime: new Date('2024-03-18T16:30:00'),
  },
];

export function SessionHistoryModal({ user, isOpen, onClose }: SessionHistoryModalProps) {
  if (!isOpen || !user) return null;

  const formatDateTime = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(date);
  };

  return (
    <div className="absolute z-50 overflow-y-auto mt-0 w-full h-full top-0 left-0 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute bg-black bg-opacity-50 transition-opacity w-full h-full" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl m-4 bg-white rounded-lg shadow-xl">
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <IoClose className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Historial de Sesiones
            </h2>
            
            {/* User Info */}
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium text-gray-700">Usuario: </span>
                {user.username}
              </div>
              <div>
                <span className="font-medium text-gray-700">Rol: </span>
                {user.role}
              </div>
              <div>
                <span className="font-medium text-gray-700">Oficina: </span>
                {user.office}
              </div>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora Apertura
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora Cierre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(session.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(session.endTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 