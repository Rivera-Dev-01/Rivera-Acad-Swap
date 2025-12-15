import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    rollbackDelay?: number;
}

export const useOptimisticUpdate = <T,>(
    initialData: T[],
    options: OptimisticUpdateOptions<T> = {}
) => {
    const [data, setData] = useState<T[]>(initialData);
    const [isUpdating, setIsUpdating] = useState(false);

    // Add item optimistically
    const addOptimistic = useCallback(
        async (newItem: T, apiCall: () => Promise<any>) => {
            // Immediately add to UI
            setData((prev) => [newItem, ...prev]);
            setIsUpdating(true);

            try {
                // Make API call in background
                const result = await apiCall();

                if (result.success) {
                    options.onSuccess?.(newItem);
                } else {
                    // Rollback on failure
                    setData((prev) => prev.filter((item) => item !== newItem));
                    options.onError?.(result);
                }
            } catch (error) {
                // Rollback on error
                setData((prev) => prev.filter((item) => item !== newItem));
                options.onError?.(error);
            } finally {
                setIsUpdating(false);
            }
        },
        [options]
    );

    // Update item optimistically
    const updateOptimistic = useCallback(
        async (
            itemId: string | number,
            updates: Partial<T>,
            apiCall: () => Promise<any>,
            idKey: keyof T = 'id' as keyof T
        ) => {
            // Store original data for rollback
            const originalData = [...data];

            // Immediately update UI
            setData((prev) =>
                prev.map((item) =>
                    item[idKey] === itemId ? { ...item, ...updates } : item
                )
            );
            setIsUpdating(true);

            try {
                // Make API call in background
                const result = await apiCall();

                if (result.success) {
                    options.onSuccess?.(updates as T);
                } else {
                    // Rollback on failure
                    setData(originalData);
                    options.onError?.(result);
                }
            } catch (error) {
                // Rollback on error
                setData(originalData);
                options.onError?.(error);
            } finally {
                setIsUpdating(false);
            }
        },
        [data, options]
    );

    // Delete item optimistically
    const deleteOptimistic = useCallback(
        async (
            itemId: string | number,
            apiCall: () => Promise<any>,
            idKey: keyof T = 'id' as keyof T
        ) => {
            // Store original data for rollback
            const originalData = [...data];

            // Immediately remove from UI
            setData((prev) => prev.filter((item) => item[idKey] !== itemId));
            setIsUpdating(true);

            try {
                // Make API call in background
                const result = await apiCall();

                if (result.success) {
                    options.onSuccess?.(result);
                } else {
                    // Rollback on failure
                    setData(originalData);
                    options.onError?.(result);
                }
            } catch (error) {
                // Rollback on error
                setData(originalData);
                options.onError?.(error);
            } finally {
                setIsUpdating(false);
            }
        },
        [data, options]
    );

    // Refresh data from API
    const refresh = useCallback(async (apiCall: () => Promise<T[]>) => {
        try {
            const newData = await apiCall();
            setData(newData);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, []);

    return {
        data,
        setData,
        isUpdating,
        addOptimistic,
        updateOptimistic,
        deleteOptimistic,
        refresh
    };
};
