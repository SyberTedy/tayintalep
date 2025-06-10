import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/ToastContainer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { NewTransferRequestPage } from './pages/NewTransferRequestPage';
import { MyTransferRequestsPage } from './pages/MyTransferRequestsPage';
import { AdminCourthousesPage } from './pages/admin/AdminCourthousesPage';
import { AdminTitlesPage } from './pages/admin/AdminTitlesPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminTransferRequestsPage } from './pages/admin/AdminTransferRequestsPage';
import { AdminTransferTypesPage } from './pages/admin/AdminTransferTypesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPermissionsPage } from './pages/admin/AdminPermissionsPage';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/home" replace />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/new-request" element={<NewTransferRequestPage />} />
                      <Route path="/my-requests" element={<MyTransferRequestsPage />} />
                      
                      <Route 
                        path="/admin/courthouses" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'Courthouse.Create']}>
                            <AdminCourthousesPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/titles" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'Title.Create']}>
                            <AdminTitlesPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/logs" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'LogEntry.GetAll']}>
                            <AdminLogsPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/transfer-requests" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'TransferRequest.GetAllUsers', 'TransferRequest.UpdateApproveStatus']}>
                            <AdminTransferRequestsPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/transfer-types" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'TransferRequestType.Create']}>
                            <AdminTransferTypesPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'User.GetAll', 'User.Register']}>
                            <AdminUsersPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/permissions" 
                        element={
                          <ProtectedRoute requiredPermissions={['Admin', 'UserPermissionClaim.Create', 'UserPermissionClaim.Delete']}>
                            <AdminPermissionsPage />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;