import React, { useState, useEffect } from 'react';
import { Scale, Plus, Search } from 'lucide-react';
import { apiService } from '../../services/api';
import { Title } from '../../types/api';
import { useToast } from '../../components/ui/ToastContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../contexts/AuthContext';

export const AdminTitlesPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [titles, setTitles] = useState<Title[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<Title[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [titleToDelete, setTitleToDelete] = useState<Title | null>(null);
  const [newTitleName, setNewTitleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canCreate = user?.permissions.includes('Admin') || user?.permissions.includes('Title.Create');

  useEffect(() => {
    loadTitles();
  }, []);

  useEffect(() => {
    const filtered = titles.filter(title =>
      title.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTitles(filtered);
  }, [titles, searchTerm]);

  const loadTitles = async () => {
    try {
      const data = await apiService.getAllTitles();
      setTitles(data);
    } catch (error) {
      showError('Hata', 'Ünvanlar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTitle = async () => {
    if (!newTitleName.trim()) {
      showError('Hata', 'Lütfen ünvan adını girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTitle = await apiService.createTitle({
        name: newTitleName.trim()
      });
      
      setTitles(prev => [...prev, newTitle]);
      setNewTitleName('');
      setShowAddModal(false);
      showSuccess('Başarılı', 'Ünvan başarıyla eklendi.');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Ünvan eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTitle = async () => {
    if (!editingTitle || !newTitleName.trim()) {
      showError('Hata', 'Lütfen ünvan adını girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      
      setNewTitleName('');
      setEditingTitle(null);
      setShowAddModal(false);
      showSuccess('Başarılı', 'Ünvan başarıyla güncellendi.');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Ünvan güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTitle = async () => {
    if (!titleToDelete) return;

    try {
      setTitles(prev => prev.filter(title => title.id !== titleToDelete.id));
      showSuccess('Başarılı', 'Ünvan başarıyla silindi.');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Ünvan silinirken bir hata oluştu.');
    } finally {
      setTitleToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const resetForm = () => {
    setNewTitleName('');
    setEditingTitle(null);
    setShowAddModal(false);
  };

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
              <Scale className="w-6 h-6 mr-2 text-blue-600" />
              Ünvanlar
            </h1>
            <p className="text-gray-600 mt-1">
              Sistem içindeki ünvanları görüntüleyin ve yönetin.
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ünvan
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
              placeholder="Ünvan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Ünvan</p>
            <p className="text-2xl font-bold text-blue-600">{titles.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {filteredTitles.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Arama kriterlerine uygun ünvan bulunamadı.' : 'Henüz hiç ünvan eklenmemiş.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTitles.map((title, index) => (
              <div key={title.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Scale className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {title.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {title.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 mr-4">
                      #{index + 1}
                    </span>
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingTitle ? 'Ünvan Düzenle' : 'Yeni Ünvan Ekle'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ünvan Adı *
                  </label>
                  <input
                    type="text"
                    value={newTitleName}
                    onChange={(e) => setNewTitleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ünvan adını girin"
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
                  onClick={editingTitle ? handleEditTitle : handleAddTitle}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {editingTitle ? 'Güncelleniyor...' : 'Ekleniyor...'}
                    </>
                  ) : (
                    editingTitle ? 'Güncelle' : 'Ekle'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setTitleToDelete(null);
        }}
        onConfirm={handleDeleteTitle}
        title="Ünvan Sil"
        message={`"${titleToDelete?.name}" ünvanını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        type="danger"
      />
    </div>
  );
};