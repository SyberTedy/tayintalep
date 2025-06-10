import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  FileText, 
  FolderOpen, 
  Building, 
  Users, 
  Activity, 
  Settings, 
  FileX, 
  Shield,
  LogOut,
  Scale
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { path: '/home', label: 'Ana Sayfa', icon: Home, requiredPermissions: [] },
  { path: '/profile', label: 'Profil', icon: User, requiredPermissions: [] },
  { path: '/new-request', label: 'Yeni Tayin Talebi', icon: FileText, requiredPermissions: [] },
  { path: '/my-requests', label: 'Tayin Taleplerim', icon: FolderOpen, requiredPermissions: [] },
];

const adminMenuItems = [
  { 
    path: '/admin/courthouses', 
    label: 'Adliyeler', 
    icon: Building, 
    requiredPermissions: ['Admin', 'Courthouse.Create'] 
  },
  { 
    path: '/admin/titles', 
    label: 'Ünvanlar', 
    icon: Scale, 
    requiredPermissions: ['Admin', 'Title.Create'] 
  },
  { 
    path: '/admin/logs', 
    label: 'Loglar', 
    icon: Activity, 
    requiredPermissions: ['Admin', 'LogEntry.GetAll'] 
  },
  { 
    path: '/admin/transfer-requests', 
    label: 'Tayin Talepleri', 
    icon: FileX, 
    requiredPermissions: ['Admin', 'TransferRequest.GetAllUsers', 'TransferRequest.UpdateApproveStatus'] 
  },
  { 
    path: '/admin/transfer-types', 
    label: 'Tayin Tipleri', 
    icon: Settings, 
    requiredPermissions: ['Admin', 'TransferRequestType.Create'] 
  },
  { 
    path: '/admin/users', 
    label: 'Personeller', 
    icon: Users, 
    requiredPermissions: ['Admin', 'User.GetAll', 'User.Register'] 
  },
  { 
    path: '/admin/permissions', 
    label: 'Yetkilendirmeler', 
    icon: Shield, 
    requiredPermissions: ['Admin', 'UserPermissionClaim.Create', 'UserPermissionClaim.Delete'] 
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">Tayin Yönetimi</h1>
        {user && (
          <p className="text-sm text-gray-300 mt-2">
            {user.name} {user.surname}
          </p>
        )}
      </div>


      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>


        { user && user.permissions != null && user.permissions.length > 0 && (
          <div className="mt-8">
            <div className="px-6 py-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Yönetim
              </h2>
            </div>
            <div className="space-y-1 px-3">
              {adminMenuItems.map((item) => {
                if (!item.requiredPermissions.some( p => user.permissions.some(up => up == p) )) {
                  return null;
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>


      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:text-white hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};