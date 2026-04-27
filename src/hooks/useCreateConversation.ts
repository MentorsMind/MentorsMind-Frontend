import { useState, useCallback } from 'react';
import MessagingService, {
  NoSharedBookingError,
  SelfMessageError,
  type Conversation,
} from '../services/messaging.service';

export type ConversationStatus = 'idle' | 'loading' | 'forbidden' | 'self' | 'error' | 'success';

const service = new MessagingService();

export function useCreateConversation() {
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [conversation, setConversation] = useState<Conversation | null>(null);

  const create = useCallback(async (participantId: string) => {
    setStatus('loading');
    try {
      const res = await service.createConversation(participantId);
      setConversation(res.data);
      setStatus('success');
      return res.data;
    } catch (err) {
      if (err instanceof NoSharedBookingError) {
        setStatus('forbidden');
      } else if (err instanceof SelfMessageError) {
        setStatus('self');
      } else {
        setStatus('error');
      }
      return null;
    }
  }, []);

  return { status, conversation, create };
}
