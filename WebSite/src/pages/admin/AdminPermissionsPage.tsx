import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, User } from 'lucide-react';
import { apiService } from '../../services/api';
import { UserPermissionClaim, Permission, User as UserType } from '../../types/api';
import { useToast } from '../../components/ui/ToastContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export const AdminPermissionsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [userPermissions, setUserPermissions] = useState<UserPermissionClaim[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [selectedPermissionId, setSelectedPermissionId] = useState<number>(0);

  const canView = currentUser?.permissions.includes('Admin') || currentUser?.permissions.includes('UserPermissionClaim.GetAll');
  const canCreate = currentUser?.permissions.includes('Admin') || currentUser?.permissions.includes('UserPermissionClaim.Create');

  useEffect(() => {
    if (canView) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [canView]);

  const loadData = async () => {
    try {
      const [userPermissionsData, permissionsData, usersData] = await Promise.all([
        apiService.getAllUserPermissionClaims(),
        apiService.getAllPermissions(),
        apiService.getAllUsers()
      ]);
      
      setUserPermissions(userPermissionsData);
      setPermissions(permissionsData);
      console.log(permissionsData)
      console.log(permissions)
      setUsers(usersData);
    } catch (error) {
      showError('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!selectedUserId || !selectedPermissionId) {
      showError('Hata', 'Lütfen kullanıcı ve yetki seçin.');
      return;
    }

    const existingPermission = userPermissions.find(
      up => up.userId === selectedUserId && up.permissionId === selectedPermissionId
    );
    
    if (existingPermission) {
      showError('Hata', 'Bu kullanıcı zaten bu yetkiye sahip.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPermission = await apiService.createUserPermissionClaim({
        userId: selectedUserId,
        permissionId: selectedPermissionId
      });
      
      setUserPermissions(prev => [...prev, newPermission]);
      setSelectedUserId(0);
      setSelectedPermissionId(0);
      setShowAddModal(false);
      showSuccess('Başarılı', 'Yetki başarıyla eklendi.');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Yetki eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const resetForm = () => {
    setSelectedUserId(0);
    setSelectedPermissionId(0);
    setShowAddModal(false);
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} ${user.surname}` : 'Bilinmiyor';
  };

  const getPermissionName = (permissionId: number) => {
    console.log(permissions)
    const permission = permissions.find(p => p.id === permissionId);
    return permission?.name || 'Bilinmiyor';
  };

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-600" />
              Yetkilendirmeler
            </h1>
            <p className="text-gray-600 mt-1">
              Kullanıcı yetkilerini görüntüleyin ve yönetin.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yetki Ekle
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı veya yetki ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Yetki</p>
            <p className="text-2xl font-bold text-blue-600">{userPermissions.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {userPermissions.length == 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Arama kriterlerine uygun yetki bulunamadı.' : 'Henüz hiç yetki ataması yapılmamış.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userPermissions.map((userPermission) => (
              <div key={userPermission.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userPermission.userName || getUserName(userPermission.userId)}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Yetki: {userPermission.permissionName || getPermissionName(userPermission.permissionId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {userPermission.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Yetki Ekle</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kullanıcı *
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(parseInt(e.target.value));
                      setSelectedPermissionId(0); // Reset permission when user changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value={0}>Kullanıcı seçin</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.surname} ({user.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yetki *
                  </label>
                  <select
                    value={selectedPermissionId}
                    onChange={(e) => setSelectedPermissionId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value={0}>Yetki seçin</option>
                    {permissions.map(permission => (
                      <option key={permission.id} value={permission.id}>
                        {permission.name}
                      </option>
                    ))}
                  </select>
                  {selectedUserId > 0 && permissions.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Bu kullanıcı tüm yetkilere sahip.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  İptal
                </button>
                <button
                  onClick={handleAddPermission}
                  disabled={isSubmitting || !selectedUserId || !selectedPermissionId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Ekleniyor...
                    </>
                  ) : (
                    'Ekle'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};