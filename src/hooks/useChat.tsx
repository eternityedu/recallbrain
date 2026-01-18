import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_email?: string;
}

export function useChat() {
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchMessages();
    fetchAdminId();

    // Set up realtime subscription
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add if relevant to current user
          if (newMessage.sender_id === user.id || newMessage.receiver_id === user.id || isAdmin) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const fetchAdminId = async () => {
    const { data } = await supabase.rpc('get_admin_user_id');
    setAdminUserId(data);
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!isAdmin) {
        // Regular users only see their own messages
        query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, receiverId?: string) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId || adminUserId,
        message,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to send message');
      throw error;
    }

    return data;
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  // Group messages by sender for admin view
  const getConversations = () => {
    if (!isAdmin) return {};
    
    const conversations: Record<string, ChatMessage[]> = {};
    messages.forEach(msg => {
      const otherId = msg.sender_id === user?.id ? msg.receiver_id : msg.sender_id;
      if (otherId && otherId !== user?.id) {
        if (!conversations[otherId]) {
          conversations[otherId] = [];
        }
        conversations[otherId].push(msg);
      }
    });
    return conversations;
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    adminUserId,
    getConversations,
    refetch: fetchMessages,
  };
}
