'use client';

import { User } from '@/app/dashboard/users/types';
import { IoClose } from "react-icons/io5";

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

const ROLES = ['Operador', 'Supervisor', 'Administrador'];
const OFFICES = ['Oficina Principal', 'Sucursal Norte', 'Sucursal Sur'];

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedUser = {
      status: formData.get('status') as 'active' | 'inactive',
      role: formData.get('role') as string,
      receivesWithdrawals: formData.get('receivesWithdrawals') === 'true',
      office: formData.get('office') as string,
    };

    onSave(updatedUser);
  };

  return (
    <div className="absolute z-50 overflow-y-auto mt-0 w-full h-full top-0 left-0">
      {/* Backdrop */}
      <div className="absolute bg-black bg-opacity-50 transition-opacity w-full h-full flex items-center justify-center" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <IoClose className="h-6 w-6" />
          </button>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Editar Usuario</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-gray-500">
            {/* Username (disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                type="text"
                value={user.username}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
              />
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Ingrese nueva contraseña"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                id="role"
                name="role"
                defaultValue={user.role}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={user.status}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            {/* Receives Withdrawals */}
            <div>
              <label htmlFor="receivesWithdrawals" className="block text-sm font-medium text-gray-700">
                Recibe Retiros
              </label>
              <select
                id="receivesWithdrawals"
                name="receivesWithdrawals"
                defaultValue={user.receivesWithdrawals.toString()}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Office */}
            <div>
              <label htmlFor="office" className="block text-sm font-medium text-gray-700">
                Oficina
              </label>
              <select
                id="office"
                name="office"
                defaultValue={user.office}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                {OFFICES.map((office) => (
                  <option key={office} value={office}>
                    {office}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 