"use client";

import { useState, useEffect } from 'react';

/**
 * SWR benzeri veri alım kancası
 * @param key String veya fonksiyon olabilir, veri alım anahtarı
 * @param fetcher Asenkron veri alım fonksiyonu
 * @param initialData Opsiyonel başlangıç verileri
 */
export function useSWRData<T>(
  key: string | (() => string | null),
  fetcher: (key: string) => Promise<T>,
  initialData?: T
) {
  // State
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  useEffect(() => {
    // Anahtarı hesapla
    const resolvedKey = typeof key === 'function' ? key() : key;

    // Anahtar yoksa hiçbir şey yapma
    if (resolvedKey === null) {
      setIsLoading(false);
      return;
    }

    // Asenkron veri alım işlevi
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetcher(resolvedKey);
        setData(result);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsLoading(false);
      }
    };

    // Veriyi getir
    fetchData();

    // Cleanup fonksiyonu
    return () => {
      // İsteği iptal etmek gerekirse burada yapabiliriz
    };
  }, [key, fetcher]);

  // Veriyi yeniden almak için ek fonksiyon
  const mutate = async (
    newData?: T | Promise<T> | ((currentData?: T) => T | Promise<T>)
  ) => {
    try {
      setIsLoading(true);
      
      if (newData) {
        // Doğrudan veri veya veri vaat edildiyse
        if (typeof newData !== 'function') {
          const finalData = await newData;
          setData(finalData);
          setError(null);
          setIsLoading(false);
          return finalData;
        } 
        
        // Fonksiyon olarak veri güncelleme sağlandıysa
        else {
          const updateFn = newData as (currentData?: T) => T | Promise<T>;
          const updatedData = await updateFn(data);
          setData(updatedData);
          setError(null);
          setIsLoading(false);
          return updatedData;
        }
      }
      
      // Yeniden veri al (newData yoksa)
      const resolvedKey = typeof key === 'function' ? key() : key;
      if (resolvedKey !== null) {
        const freshData = await fetcher(resolvedKey);
        setData(freshData);
        setError(null);
        setIsLoading(false);
        return freshData;
      }
      
      setIsLoading(false);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setIsLoading(false);
      throw e;
    }
  };

  return {
    data,
    error,
    isLoading,
    mutate
  };
}

// Otomatik yenilemeli versiyonu
export function useSWRDataWithRefresh<T>(
  url: string | null,
  refreshInterval: number = 5000, // 5 saniyede bir yenileme
  options?: SWRConfiguration
) {
  return useSWRData<T>(url, {
    ...options,
    refreshInterval
  });
}

// Sayfalandırma için özel hook
export function useSWRPagination<T>(
  getUrl: (pageIndex: number, previousPageData: T[] | null) => string | null,
  options?: SWRConfiguration
) {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [allData, setAllData] = useState<T[]>([]);
  
  // Şu anki sayfa için URL hesapla
  const currentUrl = getUrl(pageIndex, allData.length > 0 ? allData : null);
  
  const { data, error, isLoading } = useSWRData<T[]>(
    currentUrl,
    options
  );
  
  // Veri yüklendiğinde tüm verileri birleştir
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setAllData(prev => [...prev, ...data]);
    }
  }, [data]);
  
  // Bir sonraki sayfaya geç
  const loadMore = useCallback(() => {
    if (data && data.length > 0) {
      setPageIndex(prev => prev + 1);
    }
  }, [data]);
  
  return {
    data: allData,
    currentPageData: data,
    error,
    isLoading,
    loadMore,
    hasMore: data && data.length > 0,
    pageIndex
  };
}

// Sonsuz kaydırma için özel hook
export function useSWRInfiniteScroll<T>(
  getUrl: (pageIndex: number, previousPageData: T[] | null) => string | null,
  options?: SWRConfiguration & { threshold?: number }
) {
  const { data, loadMore, isLoading, error, hasMore } = useSWRPagination<T>(getUrl, options);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const threshold = options?.threshold || 0.5;
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMore();
        }
      },
      { threshold }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMore, isLoading, hasMore, threshold]);
  
  return {
    data,
    isLoading,
    error,
    loadMoreRef
  };
} 