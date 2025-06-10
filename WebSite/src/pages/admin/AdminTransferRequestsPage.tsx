import React, { useState, useEffect } from 'react';
import { FileX, Search, Calendar, User, Eye, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { TransferRequest, TransferRequestStatus, TransferRequestType, Courthouse, User as UserType } from '../../types/api';
import { useToast } from '../../components/ui/ToastContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export const AdminTransferRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<TransferRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TransferRequest[]>([]);
  const [statuses, setStatuses] = useState<TransferRequestStatus[]>([]);
  const [types, setTypes] = useState<TransferRequestType[]>([]);
  const [courthouses, setCourthouses] = useState<Courthouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [selectedCourthouseId, setSelectedCourthouseId] = useState<number>(0);
  const [users, setUsers] = useState<UserType[]>([]);

  const canView = user?.permissions.includes('Admin') || user?.permissions.includes('TransferRequest.GetAllUsers');
  const canApprove = user?.permissions.includes('Admin') || user?.permissions.includes('TransferRequest.UpdateApproveStatus');

  useEffect(() => {
    if (canView) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    applyFilters();
  }, [requests, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const [requestsData, statusesData, typesData, courthousesData, usersData] = await Promise.all([
        apiService.getAllTransferRequestsForAdmin(),
        apiService.getAllTransferRequestStatuses(),
        apiService.getAllTransferRequestTypes(),
        apiService.getAllCourthouses(),
        apiService.getAllUsers()
      ]);

      setUsers(usersData);
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
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (users.find( u => u.id == req.userId )?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (users.find( u => u.id == req.userId )?.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (users.find( u => u.id == req.userId )?.registrationNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())) 
      );
    }

    if (statusFilter > 0) {
      filtered = filtered.filter(req => req.statuId === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleApprovalAction = async () => {
    if (!selectedRequest) return;

    try {
      const updateData = {
        statuId: approvalAction === 'approve' ? 2 : 3,
        approvedCourthousePreferenceId: approvalAction === 'approve' ? selectedCourthouseId : undefined
      };

      await apiService.updateTransferRequest(selectedRequest.id, updateData);
      
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, statuId: updateData.statuId, ApprovedCourthousePreferenceId: updateData.approvedCourthousePreferenceId }
          : req
      ));

      showSuccess(
        'Başarılı', 
        `Tayin talebi ${approvalAction === 'approve' ? 'onaylandı' : 'reddedildi'}.`
      );
    } catch (error: any) {
      showError('Hata', error.response?.data?.message || 'İşlem gerçekleştirilirken bir hata oluştu.');
    } finally {
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setSelectedCourthouseId(0);
    }
  };

  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 3:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (statusId: number) => {
    const status = statuses.find(s => s.id === statusId);
    return status?.name || 'Bilinmiyor';
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
              <FileX className="w-6 h-6 mr-2 text-blue-600" />
              Tayin Talepleri Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">
              Tüm tayin taleplerini görüntüleyin ve onay/red işlemlerini gerçekleştirin.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Talep</p>
            <p className="text-2xl font-bold text-blue-600">{requests.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Talep ara (açıklama, kullanıcı)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0}>Tüm Durumlar</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || statusFilter ? 'Filtrelere uygun talep bulunamadı.' : 'Henüz hiç tayin talebi bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(request.statuId)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getTypeText(request.typeId)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.statuId)}`}>
                        {getStatusText(request.statuId)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4 mr-1" />
                      `Personel: { 
                      users.find( u => u.id == request.userId )?.name + " " + 
                      users.find( u => u.id == request.userId )?.surname + " - AB" +
                      users.find( u => u.id == request.userId )?.registrationNumber 
                      }
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
                    {canApprove && request.statuId === 1 && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setApprovalAction('approve');
                            setShowApprovalDialog(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Onayla"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setApprovalAction('reject');
                            setShowApprovalDialog(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Reddet"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı</label>
                  <p className="text-gray-900">`Personel: { 
                      users.find( u => u.id == selectedRequest.userId )?.name + " " + 
                      users.find( u => u.id == selectedRequest.userId )?.surname + " - AB" +
                      users.find( u => u.id == selectedRequest.userId )?.registrationNumber 
                      }
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tür</label>
                  <p className="text-gray-900">{getTypeText(selectedRequest.typeId)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.statuId)}`}>
                    {getStatusText(selectedRequest.statuId)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adliye Tercihleri</label>
                  <div className="space-y-1">
                    {selectedRequest.preferences.map((pref, index) => (
                      <div key={pref.id} className="flex items-center">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <span className="text-gray-900">
                          {courthouses.find(c => c.id === pref.courthouseId)?.name || `Courthouse ID: ${pref.courthouseId}`}
                        </span>
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

      {showApprovalDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Tayin Talebi {approvalAction === 'approve' ? 'Onayla' : 'Reddet'}
              </h2>
              
              {approvalAction === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Onaylanacak Adliye *
                  </label>
                  <select
                    value={selectedCourthouseId}
                    onChange={(e) => setSelectedCourthouseId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Adliye seçin</option>
                    {selectedRequest.preferences.map((pref) => {
                      const courthouse = courthouses.find(c => c.id === pref.courthouseId);
                      return (
                        <option key={pref.id} value={pref.id}>
                          {courthouse?.name || `Courthouse ID: ${pref.courthouseId}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                Bu tayin talebini {approvalAction === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalDialog(false);
                    setSelectedRequest(null);
                    setSelectedCourthouseId(0);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleApprovalAction}
                  disabled={approvalAction === 'approve' && selectedCourthouseId === 0}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Onayla' : 'Reddet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};