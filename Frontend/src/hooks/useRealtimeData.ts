import { useEffect, useState, useCallback } from 'react';
import { supabase, getCurrentUserId } from '../utils/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeDataOptions {
    table: string;
    filter?: {
        column: string;
        value: string | number;
    };
    onInsert?: (payload: any) => void;
    onUpdate?: (payload: any) => void;
    onDelete?: (payload: any) => void;
}

export const useRealtimeData = (options: UseRealtimeDataOptions) => {
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        const userId = getCurrentUserId();
        if (!userId) return;

        // Create channel name based on table and filter
        const channelName = options.filter
            ? `${options.table}:${options.filter.column}=eq.${options.filter.value}`
            : options.table;

        // Subscribe to realtime changes
        const realtimeChannel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: options.table,
                    filter: options.filter
                        ? `${options.filter.column}=eq.${options.filter.value}`
                        : undefined
                },
                (payload) => {
                    console.log(`Realtime ${payload.eventType} on ${options.table}:`, payload);

                    switch (payload.eventType) {
                        case 'INSERT':
                            options.onInsert?.(payload.new);
                            break;
                        case 'UPDATE':
                            options.onUpdate?.(payload.new);
                            break;
                        case 'DELETE':
                            options.onDelete?.(payload.old);
                            break;
                    }
                }
            )
            .subscribe((status) => {
                console.log(`Realtime subscription status for ${options.table}:`, status);
            });

        setChannel(realtimeChannel);

        // Cleanup on unmount
        return () => {
            console.log(`Unsubscribing from ${options.table}`);
            realtimeChannel.unsubscribe();
        };
    }, [options.table, options.filter?.column, options.filter?.value]);

    return channel;
};

// Hook for notifications
export const useRealtimeNotifications = (userId: string, onNewNotification: (notification: any) => void) => {
    return useRealtimeData({
        table: 'notifications',
        filter: { column: 'user_id', value: userId },
        onInsert: onNewNotification,
        onUpdate: onNewNotification
    });
};

// Hook for friend requests
export const useRealtimeFriendRequests = (userId: string, onNewRequest: (request: any) => void) => {
    return useRealtimeData({
        table: 'friendships',
        filter: { column: 'friend_id', value: userId },
        onInsert: onNewRequest,
        onUpdate: onNewRequest
    });
};

// Hook for offers
export const useRealtimeOffers = (userId: string, onNewOffer: (offer: any) => void) => {
    return useRealtimeData({
        table: 'offers',
        filter: { column: 'seller_id', value: userId },
        onInsert: onNewOffer,
        onUpdate: onNewOffer
    });
};

// Hook for messages
export const useRealtimeMessages = (userId: string, onNewMessage: (message: any) => void) => {
    return useRealtimeData({
        table: 'messages',
        filter: { column: 'receiver_id', value: userId },
        onInsert: onNewMessage,
        onUpdate: onNewMessage
    });
};

// Hook for items (marketplace)
export const useRealtimeItems = (onItemChange: (item: any) => void) => {
    return useRealtimeData({
        table: 'items',
        onInsert: onItemChange,
        onUpdate: onItemChange,
        onDelete: onItemChange
    });
};

// Hook for meetups
export const useRealtimeMeetups = (userId: string, onMeetupChange: (meetup: any) => void) => {
    return useRealtimeData({
        table: 'meetups',
        onInsert: onMeetupChange,
        onUpdate: onMeetupChange,
        onDelete: onMeetupChange
    });
};
