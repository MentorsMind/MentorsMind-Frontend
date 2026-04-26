import { useCallback, useMemo } from 'react';

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareResult {
  method: 'native' | 'clipboard';
  copiedText?: string;
}

const isLikelyMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const coarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  return coarsePointer || mobileUa;
};

const toClipboardText = ({ title, text, url }: SharePayload): string => {
  const segments = [title, text, url].filter(Boolean) as string[];
  return segments.join('\n');
};

export const useShare = () => {
  const canUseNativeShare = useMemo(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    []
  );

  const isMobile = useMemo(() => isLikelyMobileDevice(), []);

  const copyToClipboard = useCallback(async (content: string): Promise<void> => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      throw new Error('Clipboard API is not available in this browser.');
    }

    await navigator.clipboard.writeText(content);
  }, []);

  const share = useCallback(async (payload: SharePayload): Promise<ShareResult> => {
    const shareData: ShareData = {
      title: payload.title,
      text: payload.text,
      url: payload.url,
    };

    if (canUseNativeShare && isMobile) {
      await navigator.share(shareData);
      return { method: 'native' };
    }

    const clipboardText = toClipboardText(payload);
    await copyToClipboard(clipboardText);
    return {
      method: 'clipboard',
      copiedText: clipboardText,
    };
  }, [canUseNativeShare, copyToClipboard, isMobile]);

  return {
    share,
    copyToClipboard,
    canUseNativeShare,
    isMobile,
  };
};

export default useShare;