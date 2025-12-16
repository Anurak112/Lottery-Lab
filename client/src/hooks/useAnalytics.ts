import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

// Generate or retrieve session ID
function getSessionId(): string {
  const key = 'lottery_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

// Detect device type
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Detect browser
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

export function useAnalytics() {
  const [location] = useLocation();
  const trackMutation = trpc.analytics.trackPageView.useMutation();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    // Avoid tracking the same path twice in a row
    if (lastTrackedPath.current === location) return;
    lastTrackedPath.current = location;

    trackMutation.mutate({
      sessionId: getSessionId(),
      path: location,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      deviceType: getDeviceType(),
      browser: getBrowser(),
    });
  }, [location]);
}
