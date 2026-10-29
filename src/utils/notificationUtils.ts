/**
 * Browser Notification & Subtle Web Audio Sound Effects
 */

export function canUseNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!canUseNotifications()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!canUseNotifications()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    console.error('Failed to request notification permission:', e);
    return false;
  }
}

export function sendHabitNotification(title: string, body: string): boolean {
  if (!canUseNotifications()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
    return true;
  } catch (e) {
    console.error('Error dispatching browser notification:', e);
    return false;
  }
}

/**
 * Play a pleasant, subtle harmonic chime using Web Audio API
 * No external audio files needed!
 */
export function playCompletionSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic frequencies for an uplifting, soft major chime: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.4);
    });
  } catch (e) {
    // AudioContext might be blocked until user interaction, ignore safely
  }
}
