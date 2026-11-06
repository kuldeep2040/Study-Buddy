// Real full screen + landscape where the browser allows it (Android Chrome, desktop).
// iPhone Safari supports neither for normal pages: there our full-screen timer is simply a layer
// over the whole app, and the student turns the phone sideways himself. Everything fails quietly.

export async function enterFullscreen() {
  try {
    await document.documentElement.requestFullscreen?.();
    await screen.orientation?.lock?.('landscape'); // only works while in full screen
  } catch {
    /* not supported: the overlay still covers the screen */
  }
}

export function exitFullscreen() {
  try {
    screen.orientation?.unlock?.();
    if (document.fullscreenElement) document.exitFullscreen();
  } catch {
    /* ignore */
  }
}
