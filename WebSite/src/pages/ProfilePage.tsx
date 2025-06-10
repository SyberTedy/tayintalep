import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Car as IdCard, Building, Briefcase } from 'lucide-react';
import { apiService } from '../services/api';
import { User as UserType, Title } from '../types/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [title] = useState<Title | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const [userData] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getAllCourthouses(),
        apiService.getAllTitles()
      ]);

      setUser(userData);
      
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Profil bilgileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">
                {user.name} {user.surname}
              </h1>
              <p className="text-blue-100 mt-1">
                {title?.name || 'Ünvan belirtilmemiş'}
              </p>
            </div>
          </div>
        </div>


        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Kişisel Bilgiler
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <IdCard className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Sicil Numarası</p>
                    <p className="font-medium text-gray-900">{user.registrationNumber}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <IdCard className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">T.C. Kimlik No</p>
                    <p className="font-medium text-gray-900">{user.tcNo}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Ad Soyad</p>
                    <p className="font-medium text-gray-900">
                      {user.name} {user.surname}
                    </p>
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">E-posta</p>
                    <p className="font-medium text-gray-900">{user.eMail}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Telefon</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
              </div>
            </div>


            <div className="space-y-4 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Çalışma Bilgileri
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Ünvan</p>
                    <p className="font-medium text-gray-900">
                      {user.title || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Çalıştığı Adliye</p>
                    <p className="font-medium text-gray-900">
                      {user.activeCourthouse || 'Belirtilmemiş'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hesap Bilgileri
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hesap Oluşturma Tarihi</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Aktif
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};