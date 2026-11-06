// The buttons under a running timer. Which ones show depends on the phase:
//   studying / focus → Pause · End
//   paused           → Resume · End
//   break            → Skip break · End
//   break-over       → Start round N (pulsing) · End
import Button from '../ui/Button.jsx';
import Icon from '../ui/Icon.jsx';

export default function TimerControls({ view, busy, onPause, onResume, onStop, large = false }) {
  const size = large ? 'lg' : 'md';
  const shape = `flex-1 whitespace-nowrap rounded-full ${large ? 'min-w-40' : ''}`;

  let main;
  if (view.phase === 'paused') {
    main = (
      <Button size={size} className={shape} loading={busy} onClick={onResume}>
        <Icon name="play" className="h-5 w-5" /> Resume
      </Button>
    );
  } else if (view.phase === 'break') {
    main = (
      <Button variant="secondary" size={size} className={shape} loading={busy} onClick={onResume}>
        Skip break
      </Button>
    );
  } else if (view.phase === 'break-over') {
    main = (
      <Button size={size} className={`${shape} animate-pulse`} loading={busy} onClick={onResume}>
        <Icon name="play" className="h-5 w-5" /> Start round {view.nextRoundLabel}
      </Button>
    );
  } else {
    main = (
      <Button variant="secondary" size={size} className={shape} loading={busy} onClick={onPause}>
        <Icon name="pause" className="h-5 w-5" /> Pause
      </Button>
    );
  }

  return (
    <div className={`flex w-full gap-2 ${large ? 'landscape:flex-col' : ''}`}>
      {main}
      <Button variant="danger" size={size} className={shape} disabled={busy} onClick={onStop}>
        <Icon name="stop" className="h-4 w-4" /> End
      </Button>
    </div>
  );
}
