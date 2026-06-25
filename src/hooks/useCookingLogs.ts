/**
 * 烹饪日志 Hook
 * 游客模式：不调接口，只有内存里的临时数据（刷新就丢）
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { userApi } from '../api/modules/user';
import { storage } from '../api';
import {
  mapCookingRecordDTOToLog,
  mapLogVMToCookingRecordAddDTO,
} from '../api/mappers';

export interface CookingLog {
  id: string;
  name: string;
  date: string;
  stars: number;
  note: string;
  emoji: string;
  duration: number;
  steps?: string[];
  images?: string[];
  tags?: string[];
  recipeId?: number;
  fromRecipe?: boolean;
}

const isGuest = () => storage.isGuest() || !storage.getToken();

export function useCookingLogs() {
  const [cookingLogs, setCookingLogs] = useState<CookingLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedLogDetail, setSelectedLogDetail] = useState<CookingLog | null>(null);
  const [isEditingLogDetail, setIsEditingLogDetail] = useState(false);

  const [tempLogName, setTempLogName] = useState('');
  const [tempLogNote, setTempLogNote] = useState('');
  const [tempLogStars, setTempLogStars] = useState(5);

  const fetchLogs = useCallback(async () => {
    if (isGuest()) {
      setCookingLogs([]);
      return;
    }
    setLoading(true);
    try {
      const res = await userApi.getCookingRecords({ pageNum: 1, pageSize: 100 });
      const records = (res.data?.records || []) as any[];
      const logs = records.map(mapCookingRecordDTOToLog) as CookingLog[];
      setCookingLogs(logs);
    } catch (err) {
      console.warn('[useCookingLogs] 拉取失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchLogs();
  }, [fetchLogs]);

  const openManualLogEdit = useCallback((log: CookingLog) => {
    setSelectedLogDetail(log);
    setTempLogName(log.name);
    setTempLogStars(log.stars);
    setTempLogNote(log.note);
    setIsEditingLogDetail(true);
  }, []);

  const closeLogEdit = useCallback(() => {
    setIsEditingLogDetail(false);
  }, []);

  const saveLogEdit = useCallback(async () => {
    if (!selectedLogDetail) return;
    const updated: CookingLog = {
      ...selectedLogDetail,
      name: tempLogName,
      stars: tempLogStars,
      note: tempLogNote,
    };

    setCookingLogs((prev) =>
      prev.map((l) => (l.id === selectedLogDetail.id ? updated : l))
    );
    setIsEditingLogDetail(false);

    if (isGuest()) return;

    try {
      await userApi.updateCookingRecord(
        selectedLogDetail.id,
        mapLogVMToCookingRecordAddDTO(updated)
      );
    } catch (err) {
      console.warn('[useCookingLogs] 编辑接口暂未联通，已本地保存', err);
    }
  }, [selectedLogDetail, tempLogName, tempLogStars, tempLogNote]);

  const deleteLog = useCallback(async () => {
    if (!selectedLogDetail) return;
    const id = selectedLogDetail.id;

    setCookingLogs((prev) => prev.filter((log) => log.id !== id));
    setIsEditingLogDetail(false);

    if (isGuest()) return;

    try {
      await userApi.deleteCookingRecord(id);
    } catch (err) {
      console.warn('[useCookingLogs] 删除接口暂未联通，已本地删除', err);
    }
  }, [selectedLogDetail]);

  const addCookingLog = useCallback(
    async (log: CookingLog) => {
      setCookingLogs((prev) => [log, ...prev]);

      if (isGuest()) return;

      try {
        const res: any = await userApi.addCookingRecord(
          mapLogVMToCookingRecordAddDTO(log)
        );
        await fetchLogs();
        return res;
      } catch (err) {
        console.warn('[useCookingLogs] 新增接口失败，已本地保存', err);
      }
    },
    [fetchLogs]
  );

  const updateCookingLog = useCallback(
    async (log: CookingLog) => {
      setCookingLogs((prev) =>
        prev.map((l) => (l.id === log.id ? log : l))
      );

      if (isGuest()) return;

      try {
        await userApi.updateCookingRecord(
          log.id,
          mapLogVMToCookingRecordAddDTO(log)
        );
      } catch (err) {
        console.warn('[useCookingLogs] 更新接口暂未联通', err);
      }
    },
    []
  );

  return {
    cookingLogs,
    setCookingLogs,
    loading,
    selectedLogDetail,
    isEditingLogDetail,
    tempLogName,
    tempLogNote,
    tempLogStars,
    setTempLogName,
    setTempLogNote,
    setTempLogStars,
    openManualLogEdit,
    closeLogEdit,
    saveLogEdit,
    deleteLog,
    addCookingLog,
    updateCookingLog,
    refresh: fetchLogs,
  };
}