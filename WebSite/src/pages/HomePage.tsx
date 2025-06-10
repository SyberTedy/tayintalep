import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Building, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { TransferRequest } from '../types/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const requests = await apiService.getMyTransferRequests();
      
      const dashboardStats: DashboardStats = {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.statuId === 1).length,
        approvedRequests: requests.filter(r => r.statuId === 2).length,
        rejectedRequests: requests.filter(r => r.statuId === 3).length,
      };

      setStats(dashboardStats);
      setRecentRequests(requests.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Hoş Geldiniz, {user?.name} {user?.surname}
            </h1>
            <p className="text-blue-100 mt-2">
              Tayin talepleri ve sistem durumunuza genel bakış
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Bugün</p>
            <p className="text-xl font-semibold">
              {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Toplam Talep
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Bekleyen
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Onaylanan
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.approvedRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Reddedilen
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.rejectedRequests}
              </p>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Son Tayin Talepleriniz
            </h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6">
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz hiç tayin talebiniz bulunmuyor.</p>
              <p className="text-sm text-gray-400 mt-1">
                İlk tayin talebinizi oluşturmak için "Yeni Tayin Talebi" menüsünü kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(request.statuId)}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {request.typeId}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.description.substring(0, 60)}
                        {request.description.length > 60 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.statuId)}`}>
                    {getStatusText(request.statuId)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Yeni Talep Oluştur</h3>
              <p className="text-green-100 mt-1">
                Hızlıca yeni bir tayin talebi başlatın
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Taleplerinizi İnceleyin</h3>
              <p className="text-purple-100 mt-1">
                Mevcut tayin taleplerinizin durumunu görün
              </p>
            </div>
            <Building className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  );
};