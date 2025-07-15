/**
 * Shared API client with interceptors and error handling
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private baseURL = '';

  async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          error: errorText || 'Request failed',
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Typed API functions for board operations
export const boardApi = {
  getPosts: (params?: {
    page?: number;
    per_page?: number;
    category_id?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.category_id) searchParams.append('category_id', params.category_id);
    if (params?.search) searchParams.append('search', params.search);
    
    return apiClient.get(`/api/board/posts?${searchParams}`);
  },

  getCategories: () => apiClient.get('/api/board/categories'),

  createPost: (data: {
    category_id: string;
    title: string;
    content: string;
    author_name: string;
    author_email?: string;
  }) => apiClient.post('/api/board/posts', data),

  votePost: (postId: string, voteType: 'plus' | 'minus') =>
    apiClient.post(`/api/board/posts/${postId}/vote`, { voteType }),

  deletePost: (postId: string) => apiClient.delete(`/api/board/posts/${postId}`),
};