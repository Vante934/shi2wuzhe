/**
 * 认证模块接口
 * 
   重要说明：
 * 若依自带的认证接口不带 /api 前缀，分别是：
 *   GET  /captchaImage  - 验证码
 *   POST /login         - 登录
 *   GET  /getInfo       - 用户信息
 *   POST /logout        - 退出
 * 
 * 业务接口（食材、菜谱等）才带 /api 前缀
 * 
 * 所以这里用独立的 axios 实例 ruoyiRequest（baseURL='/'）
 * 业务接口继续用 request（baseURL='/api'）
 */
import axios, { AxiosInstance } from 'axios';
import type { CaptchaDTO, LoginParamsDTO, UserInfoDTO } from '../types';
import { storage } from '../storage';

// ==================== 创建若依专用 axios 实例 ====================
// baseURL = '/'，不带 /api 前缀
// 通过 vite proxy 转发到 http://localhost:8080
const ruoyiRequest: AxiosInstance = axios.create({
  baseURL: '/',
  timeout: 30000,
});

// 请求拦截器：自动带上 Token
ruoyiRequest.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：错误处理
ruoyiRequest.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // code 不存在或为 200 视为成功
    if (res.code === undefined || res.code === 200) {
      return res;  // 返回完整数据，包含 token / img / uuid 等顶层字段
    }
    
    // 业务错误（验证码错误、密码错误等）
    return Promise.reject(new Error(res.msg || '操作失败'));
  },
  (error) => {
    let message = '网络异常';
    if (error.response) {
      message = error.response.data?.msg || `请求失败(${error.response.status})`;
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时';
    }
    console.error('[Auth Request Error]', message, error);
    return Promise.reject(new Error(message));
  }
);

// ==================== 接口定义 ====================

export const authApi = {
  /**
   * 获取验证码
   * GET /captchaImage
   * 返回：{ code, msg, captchaEnabled, uuid, img }
   */
  async getCaptcha(): Promise<CaptchaDTO> {
    const res: any = await ruoyiRequest.get('/captchaImage');
    return res as CaptchaDTO;
  },

  /**
   * 登录
   * POST /login
   * 参数：{ username, password, code, uuid }
   * 返回：{ code, msg, token }
   */
  async login(params: LoginParamsDTO) {
    const res: any = await ruoyiRequest.post('/login', params);
    // 若依的 token 在顶层
    if (res.token) {
      storage.setToken(res.token);
    }
    return res;
  },

  /**
   * 获取当前用户信息
   * GET /getInfo
   * 返回：{ code, msg, user, roles, permissions }
   */
  async getInfo(): Promise<UserInfoDTO> {
    const res: any = await ruoyiRequest.get('/getInfo');
    const userInfo = {
      user: res.user,
      roles: res.roles,
      permissions: res.permissions,
    };
    storage.setUserInfo(userInfo);
    return userInfo as UserInfoDTO;
  },

  /**
   * 退出登录
   * 1. 调用后端 /logout 使 Token 失效
   * 2. 清除本地缓存
   */
  async logout() {
    try {
      await ruoyiRequest.post('/logout');
    } catch (e) {
      console.warn('退出接口调用失败', e);
    } finally {
      storage.clearAll();
    }
  },

    /**
   * 注册
   * POST /register（若依自带，需后端开启）
   * 参数：{ username, password, code, uuid, nickName?, avatar?, remark? }
   * 
   * 注意：
   *   1. 后端 application.yml 必须打开 user.register=true
   *   2. 若依标准注册接口字段是 username/password/code/uuid
   *   3. nickName/avatar/remark 是我们前端额外传的，让后端在 SysRegisterService 里处理
   *      （如果后端没改源码，这些字段会被忽略，注册成功后用户首次进个人中心再补）
   */
    async register(params: {
      username: string;
      password: string;
      code: string;
      uuid: string;
      nickName?: string;
      avatar?: string;
      remark?: string;
    }) {
      const res: any = await ruoyiRequest.post('/register', params);
      // 注册成功不自动登录（因验证码一次性，需用户重新输入）
      // 注册成功的标识：code 为 undefined 或 200
      return res;
    },
};