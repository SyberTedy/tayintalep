import axios, { AxiosInstance } from 'axios';
import { 
  UserLoginDTO, 
  UserRegisterDTO, 
  User,
  Courthouse,
  Title,
  TransferRequestType,
  TransferRequestStatus,
  TransferRequest,
  UpdateTransferRequestDTO,
  LogEntry,
  Permission,
  UserPermissionClaim,
  LoginResponse,
  CreateTransferRequestDTO
} from '../types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://localhost:7239/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401) {
          console.log('401 error - clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('permissions');
          
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: UserLoginDTO): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/Auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/User');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/User/mine');
    return response.data;
  }

  async registerUser(userData: UserRegisterDTO): Promise<User> {
    const response = await this.api.post<User>('/User/register', userData);
    return response.data;
  }

  async getAllCourthouses(): Promise<Courthouse[]> {
    const response = await this.api.get<Courthouse[]>('/Courthouse');
    return response.data;
  }

  async createCourthouse(courthouse: Omit<Courthouse, 'id'>): Promise<Courthouse> {
    const response = await this.api.post<Courthouse>('/Courthouse', courthouse);
    return response.data;
  }

  async getAllTitles(): Promise<Title[]> {
    const response = await this.api.get<Title[]>('/Title');
    return response.data;
  }

  async createTitle(title: Omit<Title, 'id'>): Promise<Title> {
    const response = await this.api.post<Title>('/Title', title);
    return response.data;
  }

  async getAllTransferRequestTypes(): Promise<TransferRequestType[]> {
    const response = await this.api.get<TransferRequestType[]>('/TransferRequestType');
    return response.data;
  }

  async createTransferRequestType(type: Omit<TransferRequestType, 'id'>): Promise<TransferRequestType> {
    const response = await this.api.post<TransferRequestType>('/TransferRequestType', type);
    return response.data;
  }

  async getAllTransferRequestStatuses(): Promise<TransferRequestStatus[]> {
    const response = await this.api.get<TransferRequestStatus[]>('/TransferRequestStatu');
    return response.data;
  }

  async createTransferRequest(requestData: CreateTransferRequestDTO): Promise<TransferRequest> {
    const formData = new FormData();
    formData.append('TypeId', requestData.TypeId.toString());
    formData.append('Description', requestData.Description);
    
    requestData.PreferenceIds.forEach(id => {
      formData.append('PreferenceIds', id.toString());
    });

    if (requestData.Sources.length === 0) {
      formData.append('Sources', new Blob([], { type: 'application/octet-stream' }), '');
    } else {
      requestData.Sources.forEach(file => {
        formData.append('Sources', file);
      });
    }

    const response = await this.api.post<TransferRequest>('/TransferRequest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async getMyTransferRequests(): Promise<TransferRequest[]> {
    const response = await this.api.get<TransferRequest[]>('/TransferRequest/mine');
    return response.data;
  }

  async getAllTransferRequestsForAdmin(): Promise<TransferRequest[]> {
    const response = await this.api.get<TransferRequest[]>('/TransferRequest/admin');
    return response.data;
  }

  async getTransferRequestById(id: number): Promise<TransferRequest> {
    const response = await this.api.get<TransferRequest>(`/TransferRequest/${id}`);
    return response.data;
  }

  async updateTransferRequest(id: number, updateData: UpdateTransferRequestDTO): Promise<TransferRequest> {
    console.log(updateData)
    const response = await this.api.put<TransferRequest>(`/TransferRequest/${id}`, updateData);
    return response.data;
  }

  async getAllLogs(): Promise<LogEntry[]> {
    const response = await this.api.get<LogEntry[]>('/LogEntry');
    return response.data;
  }

  async getAllPermissions(): Promise<Permission[]> {
    const response = await this.api.get<Permission[]>('/Permission');
    return response.data;
  }

  async checkPermissions(permissions: string[]): Promise<{ [key: string]: boolean }> {
    const response = await this.api.post('/Permission/permcheck', permissions);
    return response.data;
  }

  async getAllUserPermissionClaims(): Promise<UserPermissionClaim[]> {
    const response = await this.api.get<UserPermissionClaim[]>('/UserPermissionClaim');
    return response.data;
  }

  async createUserPermissionClaim(claim: Omit<UserPermissionClaim, 'id'>): Promise<UserPermissionClaim> {
    const response = await this.api.post<UserPermissionClaim>('/UserPermissionClaim', claim);
    return response.data;
  }

  async deleteTransferRequest(id: number): Promise<void> {
    await this.api.delete(`/TransferRequest/${id}`);
  }

}

export const apiService = new ApiService();