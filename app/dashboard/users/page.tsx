'use client';

import { useState } from 'react';
import { IoSearch } from "react-icons/io5"
import { EditUserModal } from '@/app/dashboard/users/components/EditUserModal';
import { User } from '@/app/dashboard/users/types';
import { SessionHistoryModal } from '@/app/dashboard/users/components/SessionHistoryModal';

// Mock data - replace with your actual data fetching logic
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    role: 'Admin',
    createdAt: new Date('2024-01-15'),
    office: 'Main Office',
    status: 'active',
    receivesWithdrawals: true,
  },
  {
    id: '2',
    username: 'jane_smith',
    role: 'User',
    createdAt: new Date('2024-02-20'),
    office: 'Branch Office',
    status: 'inactive',
    receivesWithdrawals: false,
  },
  {
    id: '3',
    username: 'alice_johnson',
    role: 'Admin',
    createdAt: new Date('2024-03-10'),
    office: 'Main Office',
    status: 'active',
    receivesWithdrawals: true,
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedUserForSessions, setSelectedUserForSessions] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (updatedUser: Partial<User>) => {
    console.log('Saving user updates:', updatedUser);
    // Aquí implementarías la lógica para guardar los cambios
    handleCloseModal();
  };

  const handleViewSessions = (user: User) => {
    setSelectedUserForSessions(user);
    setIsSessionModalOpen(true);
  };

  const handleCloseSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedUserForSessions(null);
  };

  const filteredUsers = mockUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.office.toLowerCase().includes(searchLower) ||
      user.status.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="relative min-h-full p-6 gap-6 flex flex-col">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 text-gray-500 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Buscar por usuario, estado, retiros..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oficina
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retiros
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.role}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.office}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.receivesWithdrawals ? 'Recibe' : 'No recibe'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    className="text-white px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-700 transition-colors"
                    onClick={() => handleEditUser(user)}
                  >
                    Editar

                  </button>
                  <button
                    className="text-white px-2 py-1 rounded-md bg-purple-500 hover:bg-purple-700 transition-colors"
                    onClick={() => handleViewSessions(user)}
                  >
                    Sesiones

                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      <EditUserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
      />

      <SessionHistoryModal
        user={selectedUserForSessions}
        isOpen={isSessionModalOpen}
        onClose={handleCloseSessionModal}
      />
    </div>
  );
}
