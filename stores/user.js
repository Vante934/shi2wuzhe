import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getStorage, setStorage, clearStorage, KEYS } from '@/utils/storage';

export const useUserStore = defineStore('user', () => {
  const token = ref(getStorage(KEYS.TOKEN, ''));
  const userInfo = ref(getStorage(KEYS.USER_INFO, null));
  const isLoggedIn = computed(() => !!token.value);

  function setToken(val) {
    token.value = val;
    setStorage(KEYS.TOKEN, val);
  }

  function setUserInfo(info) {
    userInfo.value = info;
    setStorage(KEYS.USER_INFO, info);
  }

  function clearUserInfo() {
    token.value = '';
    userInfo.value = null;
    clearStorage(KEYS.TOKEN);
    clearStorage(KEYS.USER_INFO);
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    clearUserInfo,
  };
});
