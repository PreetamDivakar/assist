import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, BellRing } from 'lucide-react';

import { API_BASE } from '../api/client';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationToggle() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setSupported(false);
      return;
    }
    // Check existing subscription
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => {
        setSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const keyRes = await fetch(`${API_BASE}/notifications/vapid-public-key`);
      const { public_key } = await keyRes.json();

      if (!public_key) {
        console.warn('VAPID key not configured on server');
        setLoading(false);
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setLoading(false);
        return;
      }

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key),
      });

      const subJson = subscription.toJSON();

      // Send to server
      await fetch(`${API_BASE}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      setSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe:', err);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await fetch(`${API_BASE}/notifications/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        });
      }
      setSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  const Icon = subscribed ? BellRing : Bell;

  return (
    <motion.button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={`rounded-full p-3 backdrop-blur-md border transition-all ${
        subscribed
          ? 'bg-primary/20 border-primary/30 text-primary-light'
          : 'bg-white/10 dark:bg-white/5 border-white/20'
      }`}
      whileHover={{ scale: 1.1, rotate: subscribed ? 0 : 15 }}
      whileTap={{ scale: 0.9 }}
      title={subscribed ? 'Disable notifications' : 'Enable notifications'}
    >
      <Icon size={20} className={loading ? 'animate-pulse' : ''} />
    </motion.button>
  );
}
