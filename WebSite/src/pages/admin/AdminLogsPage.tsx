import React, { useState, useEffect } from 'react';
import { Activity, Search, Calendar, User, Eye, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { LogEntry } from '../../types/api';
import { useToast } from '../../components/ui/ToastContainer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export const AdminLogsPage: React.FC = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const canView = user?.permissions.includes('Admin') || user?.permissions.includes('LogEntry.GetAll');

  useEffect(() => {
    if (canView) {
      loadLogs();
    } else {
      setIsLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    const filtered = logs.filter(log =>
      log.actionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.registratioNumber
    );
    setFilteredLogs(filtered);
  }, [logs, searchTerm]);

  const loadLogs = async () => {
    try {
      const data = await apiService.getAllLogs();
      setLogs(data);
    } catch (error) {
      showError('Hata', 'Loglar yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('add')) {
      return 'bg-green-100 text-green-800';
    } else if (lowerAction.includes('update') || lowerAction.includes('edit')) {
      return 'bg-blue-100 text-blue-800';
    } else if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      return 'bg-red-100 text-red-800';
    } else if (lowerAction.includes('login') || lowerAction.includes('auth')) {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-600" />
              Sistem Logları
            </h1>
            <p className="text-gray-600 mt-1">
              Sistem içindeki tüm aktiviteleri görüntüleyin ve takip edin.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Toplam Log</p>
            <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Log ara (aksiyon, detay, kullanıcı)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>


      <div className="bg-white shadow-md rounded-lg">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Arama kriterlerine uygun log bulunamadı.' : 'Henüz hiç log kaydı bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredLogs.sort( ( a, b ) => b.id - a.id ).map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.actionName)}`}>
                        {log.actionName}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        { `Personel: ${log.registratioNumber}`}
                      </div>
                    </div>
                    <p className="text-gray-900 mb-2">
                      {log.message.length > 100 
                        ? `${log.message.substring(0, 100)}...` 
                        : log.message
                      }
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(log.date)}
                      </div>
                      <div>
                        IP: {log.ipAddress}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
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

      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Log Detayları</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aksiyon</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActionColor(selectedLog.actionName)}`}>
                    {selectedLog.actionName}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Personel</label>
                  <p className="text-gray-900">{selectedLog.registratioNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Detaylar</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedLog.message}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Controller</label>
                  <p className="text-gray-900">{selectedLog.controllerName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <p className="text-gray-900">{formatDate(selectedLog.date)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Adresi</label>
                  <p className="text-gray-900">{selectedLog.ipAddress}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Log ID</label>
                  <p className="text-gray-900">{selectedLog.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};