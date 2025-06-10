import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, Eye, Trash2, Filter, X } from 'lucide-react';
import { apiService } from '../services/api';
import { Courthouse, TransferRequest, TransferRequestStatus, TransferRequestType } from '../types/api';
import { useToast } from '../components/ui/ToastContainer';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const MyTransferRequestsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TransferRequest[]>([]);
  const [statuses, setStatuses] = useState<TransferRequestStatus[]>([]);
  const [types, setTypes] = useState<TransferRequestType[]>([]);
  const [courthouses, setCourthouses] = useState<Courthouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, typeFilter]);

  const loadData = async () => {
    try {
      const [requestsData, statusesData, typesData, courthousesData ] = await Promise.all([
        apiService.getMyTransferRequests(),
        apiService.getAllTransferRequestStatuses(),
        apiService.getAllTransferRequestTypes(),
        apiService.getAllCourthouses()
      ]);

      setRequests(requestsData);
      setStatuses(statusesData);
      setTypes(typesData);
      setCourthouses(courthousesData);
    } catch (error) {
      showError('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter > 0) {
      filtered = filtered.filter(req => (req.statuId || req.statuId) === statusFilter);
    }

    if (typeFilter > 0) {
      filtered = filtered.filter(req => req.typeId === typeFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      await apiService.deleteTransferRequest(requestToDelete);
      setRequests(prev => prev.filter(req => req.id !== requestToDelete));
      showSuccess('Başarılı', 'Tayin talebi başarıyla silindi.');
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'Tayin talebi silinirken bir hata oluştu.');
    } finally {
      setRequestToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 3:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'Beklemede';
      case 2:
        return 'Onaylandı';
      case 3:
        return 'Reddedildi';
      case 4:
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'bg-yellow-100 text-yellow-800';
      case 2:
        return 'bg-green-100 text-green-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (typeId: number) => {
    const type = types.find(t => t.id === typeId);
    return type?.name || 'Bilinmiyor';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDeleteRequest = (request: TransferRequest) => {
    const statusId = request.statuId || request.statuId;
    return statusId === 1; // Only pending requests can be deleted
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
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Tayin Taleplerim
            </h1>
            <p className="text-gray-600 mt-1">
              Oluşturduğunuz tayin taleplerini görüntüleyin ve yönetin.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Talep</p>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Tüm Durumlar</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tür
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0}>Tüm Türler</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {requests.length === 0 ? 'Henüz hiç tayin talebiniz bulunmuyor.' : 'Filtrelere uygun talep bulunamadı.'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {requests.length === 0 && 'İlk tayin talebinizi oluşturmak için "Yeni Tayin Talebi" menüsünü kullanabilirsiniz.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => {
              const statusId = request.statuId || request.statuId;
              return (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(statusId)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getTypeText(request.typeId)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusId)}`}>
                          {getStatusText(statusId)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {request.description.length > 100 
                          ? `${request.description.substring(0, 100)}...` 
                          : request.description
                        }
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canDeleteRequest(request) && (
                        <button
                          onClick={() => {
                            setRequestToDelete(request.id);
                            setShowDeleteDialog(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Talebi İptal Et"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Tayin Talebi Detayları</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tür</label>
                  <p className="text-gray-900">{getTypeText(selectedRequest.typeId)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.statuId || selectedRequest.statuId)}`}>
                    {getStatusText(selectedRequest.statuId || selectedRequest.statuId)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adliye Tercihleri</label>
                  <div className="space-y-1">
                    {
                    selectedRequest.preferences.map((pref) => (
                      <div key={pref.id} className="flex items-center">
                        <span className="text-sm text-gray-500 w-6">{pref.preferenceOrder}.</span>
                        <span className="text-gray-900">{courthouses.find( c => c.id == pref.courthouseId )?.name || "undefined"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Oluşturma Tarihi</label>
                  <p className="text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                
                {selectedRequest.sources && selectedRequest.sources.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Belgeler</label>
                    <p className="text-gray-600 text-sm">{selectedRequest.sources.length} dosya yüklendi</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setRequestToDelete(null);
        }}
        onConfirm={handleDeleteRequest}
        title="Tayin Talebini İptal Et"
        message="Bu tayin talebini iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, İptal Et"
        type="danger"
      />
    </div>
  );
};