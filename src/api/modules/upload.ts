/**
 * 文件上传接口
 */
import { request } from '../request';
import type { UploadResultDTO } from '../types';

export const uploadApi = {
  /** 单文件上传 */
  upload(file: File): Promise<UploadResultDTO> {
    const formData = new FormData();
    formData.append('file', file);
    return request.upload<UploadResultDTO>('/common/upload', formData) as any;
  },

  /** 多文件上传 */
  uploads(files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return request.upload<any>('/common/uploads', formData);
  },

  /** 拼接完整图片URL */
  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}${path}`;
  },
};