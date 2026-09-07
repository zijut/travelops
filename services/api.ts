/**
 * TravelOps Central API Client Service
 * Connects frontend React components to the Express backend API.
 */

const API_BASE_URL = '/api';

// Helper to get authorization token
function getAuthToken(): string | null {
  return localStorage.getItem('travelops_token');
}

// HTTP request helper with auto Authorization Bearer injection
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config: RequestInit = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
    throw error;
  }
}

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export const authApi = {
  login: async (credentials: { email: string; password?: string }) => {
    return request<{ success: boolean; message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    agency?: string;
    role?: string;
    region?: string;
    address?: string;
  }) => {
    return request<{ success: boolean; message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getMe: async () => {
    return request<{ success: boolean; user: any }>('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return request<{ success: boolean; message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  logout: async () => {
    try {
      await request<{ success: boolean; message: string }>('/auth/logout', {
        method: 'POST'
      });
    } catch (e) {
      // Ignored on logout
    }
  }
};

// ----------------------------------------------------
// Admin API
// ----------------------------------------------------
export const adminApi = {
  getUsers: async () => {
    return request<{ success: boolean; users: any[] }>('/admin/users');
  },

  createUser: async (userData: any) => {
    return request<{ success: boolean; message: string; user: any }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id: string, updates: any) => {
    return request<{ success: boolean; message: string; user: any }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteUser: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  getStats: async () => {
    return request<{ success: boolean; stats: any }>('/admin/stats');
  },

  getAuditLogs: async (limit: number = 100) => {
    return request<{ success: boolean; logs: any[] }>(`/admin/audit-logs?limit=${limit}`);
  },

  resetSeeds: async () => {
    return request<{ success: boolean; message: string }>('/admin/reset-seeds', {
      method: 'POST'
    });
  }
};

// ----------------------------------------------------
// Packages API
// ----------------------------------------------------
export const packagesApi = {
  getAll: async () => {
    return request<{ success: boolean; packages: any[] }>('/packages');
  },

  create: async (pkgData: any) => {
    return request<{ success: boolean; package: any }>('/packages', {
      method: 'POST',
      body: JSON.stringify(pkgData)
    });
  },

  update: async (id: string, pkgData: any) => {
    return request<{ success: boolean; package: any }>(`/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pkgData)
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/packages/${id}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Jamaah (Pilgrims) API
// ----------------------------------------------------
export const jamaahApi = {
  getAll: async () => {
    return request<{ success: boolean; jamaah: any[] }>('/jamaah');
  },

  create: async (jamaahData: any) => {
    return request<{ success: boolean; jamaah: any }>('/jamaah', {
      method: 'POST',
      body: JSON.stringify(jamaahData)
    });
  },

  update: async (id: string, jamaahData: any) => {
    return request<{ success: boolean; jamaah: any }>(`/jamaah/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jamaahData)
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/jamaah/${id}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Operations Tasks API
// ----------------------------------------------------
export const tasksApi = {
  getAll: async () => {
    return request<{ success: boolean; tasks: any[] }>('/tasks');
  },

  create: async (taskData: any) => {
    return request<{ success: boolean; task: any }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  update: async (id: string, taskData: any) => {
    return request<{ success: boolean; task: any }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  toggle: async (id: string) => {
    return request<{ success: boolean; task: any }>(`/tasks/${id}/toggle`, {
      method: 'PATCH'
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Finance API
// ----------------------------------------------------
export const financeApi = {
  getAll: async () => {
    return request<{ success: boolean; finance: any[] }>('/finance');
  },

  create: async (txData: any) => {
    return request<{ success: boolean; transaction: any }>('/finance', {
      method: 'POST',
      body: JSON.stringify(txData)
    });
  },

  delete: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/finance/${id}`, {
      method: 'DELETE'
    });
  }
};

// ----------------------------------------------------
// Visa Records API
// ----------------------------------------------------
export const visaApi = {
  getAll: async () => {
    return request<{ success: boolean; visaRecords: Record<string, any> }>('/visa');
  },

  update: async (jamaahId: string, visaData: any) => {
    return request<{ success: boolean; visaRecord: any }>(`/visa/${jamaahId}`, {
      method: 'PUT',
      body: JSON.stringify(visaData)
    });
  }
};

// ----------------------------------------------------
// Notifications API
// ----------------------------------------------------
export const notificationsApi = {
  getAll: async () => {
    return request<{ success: boolean; notifications: any[] }>('/notifications');
  },

  create: async (notifData: any) => {
    return request<{ success: boolean; notification: any }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData)
    });
  },

  markRead: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  markAllRead: async () => {
    return request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PATCH'
    });
  }
};
