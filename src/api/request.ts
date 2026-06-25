/**
 * Axios 请求封装
 * - 自动携带 Token
 * - 统一处理 code 200/500/401
 * - 自动 Toast 错误提示
 */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { storage } from './storage';

// ============ 全局配置 ============
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const TIMEOUT = 15000;

// ============ 全局错误处理 ============
let globalErrorHandler: ((msg: string) => void) | null = null;
let globalAuthHandler: (() => void) | null = null;

export const setupRequestHandlers = (options: {
  onError?: (msg: string) => void;
  onUnauthorized?: () => void;
}) => {
  if (options.onError) globalErrorHandler = options.onError;
  if (options.onUnauthorized) globalAuthHandler = options.onUnauthorized;
};

// ============ Axios 实例 ============
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

// ============ 请求拦截器 ============
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getToken();
    if (token && config.headers) {
      // 若依标准：Authorization: Bearer xxx
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ 响应拦截器 ============
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 文件下载等二进制响应，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }

    const code = res.code ?? 200;

    if (code === 401) {
      // 游客模式：静默忽略，不跳登录
      if (storage.isGuest()) {
        return Promise.reject(new Error('游客模式无法使用此功能'));
      }
      storage.clearAll();
      if (globalAuthHandler) {
        globalAuthHandler();
      }
      return Promise.reject(new Error(res.msg || '登录状态已过期，请重新登录'));
    }

    // 500 业务失败
    if (code === 500) {
      const msg = res.msg || '操作失败';
      if (globalErrorHandler) {
        globalErrorHandler(msg);
      }
      return Promise.reject(new Error(msg));
    }

    // 200 成功
    if (code === 200) {
      return res;
    }

    // 其他业务错误码
    const msg = res.msg || '未知错误';
    if (globalErrorHandler) {
      globalErrorHandler(msg);
    }
    return Promise.reject(new Error(msg));
  },
  (error) => {
    // 网络错误 / 超时
    let msg = '网络异常，请稍后重试';
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        if (storage.isGuest()) {
        // 游客静默
        return Promise.reject(error);
        }
        storage.clearAll();
        if (globalAuthHandler) globalAuthHandler();
        msg = '登录状态已过期，请重新登录';
      } else if (status === 403) {
        msg = '没有权限访问';
      } else if (status === 404) {
        msg = '请求的资源不存在';
      } else if (status >= 500) {
        msg = '服务器异常，请稍后重试';
      }
    } else if (error.code === 'ECONNABORTED') {
      msg = '请求超时';
    }
    if (globalErrorHandler) {
      globalErrorHandler(msg);
    }
    return Promise.reject(error);
  }
);

// ============ 通用 API 返回类型 ============
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
  [key: string]: any; // 兼容 token / rows / total 等顶层字段
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// ============ 请求工具函数 ============
export const request = {
  get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.get(url, { params, ...config });
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.post(url, data, config);
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.put(url, data, config);
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return service.delete(url, config);
  },
  // multipart/form-data
  upload<T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    return service.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default service;