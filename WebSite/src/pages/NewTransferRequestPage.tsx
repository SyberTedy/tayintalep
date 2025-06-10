import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Upload, FileText } from 'lucide-react';
import { apiService } from '../services/api';
import { TransferRequestType, Courthouse, User as UserType } from '../types/api';
import { useToast } from '../components/ui/ToastContainer';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface FormData {
  typeId: number;
  description: string;
  preferences: number[];
  files: File[];
}

export const NewTransferRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  
  const [formData, setFormData] = useState<FormData>({
    typeId: 0,
    description: '',
    preferences: [],
    files: []
  });
  
  const [transferTypes, setTransferTypes] = useState<TransferRequestType[]>([]);
  const [courthouses, setCourthouses] = useState<Courthouse[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);


  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [types, courts, userData] = await Promise.all([
        apiService.getAllTransferRequestTypes(),
        apiService.getAllCourthouses(),
        apiService.getCurrentUser()
      ]);
      setTransferTypes(types);
      setCourthouses(courts);
      setUser(userData)
    } catch (error) {
      showError('Hata', 'Veriler yüklenirken bir hata oluştu.');
    }
  };

  const handleTypeChange = (value: number) => {
    setFormData(prev => ({ ...prev, typeId: value }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const addPreference = () => {
    if (selectedPreferences.length < 12) {
      setSelectedPreferences(prev => [...prev, 0]);
    }
  };

  const removePreference = (index: number) => {
    setSelectedPreferences(prev => prev.filter((_, i) => i !== index));
  };

  const updatePreference = (index: number, courthouseId: number) => {
    setSelectedPreferences(prev => {
      const updated = [...prev];
      updated[index] = courthouseId;
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

    for (const file of files) {
      if (file.size > maxSize) {
        showError('Dosya Hatası', `${file.name} dosyası 10MB'dan büyük olamaz.`);
        continue;
      }
      
      if (!allowedTypes.includes(file.type)) {
        showError('Dosya Hatası', `${file.name} desteklenmeyen dosya formatında. Sadece DOCX, JPG ve PNG dosyaları kabul edilir.`);
        continue;
      }
      
      validFiles.push(file);
    }

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles].slice(0, 5)
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.typeId) return 'Lütfen tayin türünü seçin.';
    if (!formData.description.trim()) return 'Lütfen açıklama girin.';
    if (selectedPreferences.length === 0) return 'En az bir adliye tercihi ekleyin.';
    if (formData.files.length == 0) return 'Lütfen Dosya Ekleyiniz.';
    
    const validPreferences = selectedPreferences.filter(p => p > 0);
    if (validPreferences.length === 0) return 'Lütfen geçerli adliye tercihleri seçin.';
    
    // Check for duplicate preferences
    const uniquePreferences = new Set(validPreferences);
    if (uniquePreferences.size !== validPreferences.length) {
      return 'Aynı adliyeyi birden fazla kez seçemezsiniz.';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      showError('Form Hatası', error);
      return;
    }

    setIsLoading(true);
    try {
      const validPreferences = selectedPreferences.filter(p => p > 0);
      await apiService.createTransferRequest({
        TypeId: formData.typeId,
        Description: formData.description,
        PreferenceIds: validPreferences,
        Sources: formData.files
      });

      showSuccess('Başarılı', 'Tayin talebiniz başarıyla oluşturuldu.');
      navigate('/dashboard');
    } catch (error: any) {
      showError(
        'Hata',
        error.response?.data?.message || 'Tayin talebi oluşturulurken bir hata oluştu.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('image')) {
      return '🖼️';
    } else if (file.type.includes('document')) {
      return '📄';
    }
    return '📎';
  };

  const getAvailableCourthouses = (currentIndex: number) => {
    const selectedIds = selectedPreferences.filter((id, index) => index !== currentIndex && id > 0);
    return courthouses.filter(courthouse => !selectedIds.includes(courthouse.id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Yeni Tayin Talebi
          </h1>
          <p className="text-gray-600 mt-1">
            Yeni bir tayin talebi oluşturmak için aşağıdaki formu doldurun.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tayin Türü *
            </label>
            <select
              value={formData.typeId}
              onChange={(e) => handleTypeChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Tayin türünü seçin</option>
              {transferTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tayin talebinizin detaylarını açıklayın..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adliye Tercihleri * (En fazla 12 tercih)
            </label>
            <div className="space-y-3">
              {selectedPreferences.filter( p => courthouses.find(c => c.id === p)?.name != user?.activeCourthouse )
                .map((preference, index) => {
                const availableCourthouses = getAvailableCourthouses(index);
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500 w-8">
                      {index + 1}.
                    </span>
                    <select
                      value={preference}
                      onChange={(e) => updatePreference(index, parseInt(e.target.value))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Adliye seçin</option>
                      {availableCourthouses.map(courthouse => (
                        <option key={courthouse.id} value={courthouse.id}>
                          {courthouse.name}
                        </option>
                      ))}
                      {preference > 0 && !availableCourthouses.find(c => c.id === preference) && (
                        <option value={preference}>
                          {courthouses.find(c => c.id === preference)?.name}
                        </option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => removePreference(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
              
              {selectedPreferences.length < 12 && (
                <button
                  type="button"
                  onClick={addPreference}
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Tercih Ekle
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Belgeler (En fazla 5 dosya, her biri max 10MB)
            </label>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  Dosyalarınızı sürükleyip bırakın veya seçin
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  DOCX, JPG, PNG formatları desteklenir
                </p>
                <input
                  type="file"
                  multiple
                  accept=".docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={formData.files.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors ${
                    formData.files.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Dosya Seç
                </label>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getFileIcon(file)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Oluşturuluyor...
                </>
              ) : (
                'Talebi Oluştur'
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleSubmit}
        title="Tayin Talebi Oluştur"
        message="Bu tayin talebini oluşturmak istediğinizden emin misiniz?"
        confirmText="Evet, Oluştur"
        type="info"
      />
    </div>
  );
};