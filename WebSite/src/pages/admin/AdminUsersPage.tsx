import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Eye, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { User, UserRegisterDTO, Courthouse, Title } from '../../types/api';
import { useToast } from '../../components/ui/ToastContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [courthouses, setCourthouses] = useState<Courthouse[]>([]);
  const [titles, setTitles] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<UserRegisterDTO>({
    registratioNumber: 0,
    tcNo: '',
    name: '',
    surname: '',
    eMail: '',
    phone: '',
    titleId: 0,
    password: '',
    activeCourthouseId: 0
  });

  const canView = currentUser?.permissions.includes('Admin') || currentUser?.permissions.includes('User.GetAll');
  const canCreate = currentUser?.permissions.includes('Admin') || currentUser?.permissions.includes('User.Register');

  useEffect(() => {
    if (canView) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.eMail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.registrationNumber?.toString().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const loadData = async () => {
    try {
      const [usersData, courthousesData, titlesData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllCourthouses(),
        apiService.getAllTitles()
      ]);
      
      setUsers(usersData);
      setCourthouses(courthousesData);
      setTitles(titlesData);
    } catch (error) {
      showError('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const newUser = await apiService.registerUser(formData);
      setUsers(prev => [...prev, newUser]);
      resetForm();
      showSuccess('Başarılı', 'Personel başarıyla eklendi.');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Personel eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.registratioNumber || formData.registratioNumber <= 0) {
      showError('Hata', 'Lütfen geçerli bir sicil numarası girin.');
      return false;
    }
    if (!formData.tcNo || formData.tcNo.length !== 11) {
      showError('Hata', 'Lütfen geçerli bir T.C. kimlik numarası girin.');
      return false;
    }
    if (!formData.name.trim()) {
      showError('Hata', 'Lütfen ad girin.');
      return false;
    }
    if (!formData.surname.trim()) {
      showError('Hata', 'Lütfen soyad girin.');
      return false;
    }
    if (!formData.eMail.trim() || !formData.eMail.includes('@')) {
      showError('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }
    if (!formData.phone.trim()) {
      showError('Hata', 'Lütfen telefon numarası girin.');
      return false;
    }
    if (!formData.titleId || formData.titleId <= 0) {
      showError('Hata', 'Lütfen ünvan seçin.');
      return false;
    }
    if (!formData.activeCourthouseId || formData.activeCourthouseId <= 0) {
      showError('Hata', 'Lütfen adliye seçin.');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      showError('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      registratioNumber: 0,
      tcNo: '',
      name: '',
      surname: '',
      eMail: '',
      phone: '',
      titleId: 0,
      password: '',
      activeCourthouseId: 0
    });
    setShowAddModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
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
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Personeller
            </h1>
            <p className="text-gray-600 mt-1">
              Sistem içindeki personelleri görüntüleyin ve yeni personel ekleyin.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Personel
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
              placeholder="Personel ara (ad, soyad, e-posta, sicil)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Personel</p>
            <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Arama kriterlerine uygun personel bulunamadı.' : 'Henüz hiç personel eklenmemiş.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name} {user.surname}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Sicil: {user.registrationNumber} | {user.eMail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.title} - {user.activeCourthouse}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Detayları Görüntüle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yeni Personel Ekle</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sicil Numarası *
                  </label>
                  <input
                    type="number"
                    value={formData.registratioNumber || ''}
                    onChange={(e) => setFormData({...formData, registratioNumber: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sicil numarası"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    T.C. Kimlik No *
                  </label>
                  <input
                    type="text"
                    value={formData.tcNo}
                    onChange={(e) => setFormData({...formData, tcNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="T.C. kimlik numarası"
                    maxLength={11}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ad"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Soyad"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    value={formData.eMail}
                    onChange={(e) => setFormData({...formData, eMail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E-posta adresi"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Telefon numarası"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ünvan *
                  </label>
                  <select
                    value={formData.titleId}
                    onChange={(e) => setFormData({...formData, titleId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value={0}>Ünvan seçin</option>
                    {titles.map(title => (
                      <option key={title.id} value={title.id}>
                        {title.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adliye *
                  </label>
                  <select
                    value={formData.activeCourthouseId}
                    onChange={(e) => setFormData({...formData, activeCourthouseId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value={0}>Adliye seçin</option>
                    {courthouses.map(courthouse => (
                      <option key={courthouse.id} value={courthouse.id}>
                        {courthouse.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Şifre (en az 6 karakter)"
                    disabled={isSubmitting}
                  />
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
                  onClick={handleAddUser}
                  disabled={isSubmitting}
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

      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Personel Detayları</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sicil Numarası</label>
                  <p className="text-gray-900">{selectedUser.registrationNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">T.C. Kimlik No</label>
                  <p className="text-gray-900">{selectedUser.tcNo}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <p className="text-gray-900">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <p className="text-gray-900">{selectedUser.surname}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <p className="text-gray-900">{selectedUser.eMail}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ünvan</label>
                  <p className="text-gray-900">{selectedUser.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adliye</label>
                  <p className="text-gray-900">{selectedUser.activeCourthouse}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Kayıt Tarihi</label>
                  <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};