// Little helpers for "something changed" moments (Pomodoro round over, break over):
//   playChime()  → a short tone made with the Web Audio API (no sound file needed)
//   notify()     → a browser notification, if the student allowed them
//   keepAwake()  → asks the phone not to dim/lock the screen (Wake Lock API)
// All of them fail quietly: they're nice extras, never required.
// Note: a web app can only do these while it is open. With the phone locked, nothing fires
// (that would need push notifications from a server).

let audioContext = null;

/** Browsers only allow sound after a tap, so call this from a click (e.g. "Start"). */
export function unlockSound() {
  try {
    audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  } catch {
    audioContext = null;
  }
}

const CHIMES = {
  break: [784, 659, 523], // going down: time to rest
  focus: [523, 659, 784], // going up: back to work
  alert: [880, 660, 880, 660], // break over: attention!
};

export function playChime(kind = 'focus') {
  unlockSound();
  if (!audioContext) return;
  CHIMES[kind].forEach((frequency, i) => {
    const t = audioContext.currentTime + i * 0.18;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    // Quick fade in and out, so it sounds like a soft "ding" instead of a click.
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(t);
    oscillator.stop(t + 0.45);
  });
}

/** Ask once (from a tap) whether we may show notifications. */
export function askNotificationPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  } catch {
    /* not supported */
  }
}

/** Shows a notification when the tab isn't visible (on screen, the app's own alert is enough). */
export async function notify(title, body) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted' || document.visibilityState === 'visible') return;
    // Android Chrome only allows notifications through the service worker.
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) await registration.showNotification(title, { body, icon: '/pwa-192x192.png', tag: 'study-buddy-timer' });
    else new Notification(title, { body, icon: '/pwa-192x192.png' });
  } catch {
    /* ignore */
  }
}

/**
 * Keeps the screen on (used by the full-screen timer). Returns a function that releases it.
 * The browser drops the lock when the tab is hidden, so we ask again when it comes back.
 */
export function keepAwake() {
  let lock = null;
  let released = false;
  const request = async () => {
    try {
      if (!released && 'wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen');
    } catch {
      /* not supported or not allowed */
    }
  };
  const onVisibility = () => request();
  request();
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    released = true;
    document.removeEventListener('visibilitychange', onVisibility);
    lock?.release().catch(() => {});
  };
}
