// Connection status for the phone header: one small coloured dot (green connected, amber connecting, red reconnecting).
// The words live only in the accessible label, so the header shows no text.
const LABEL = { connecting: 'Connecting', connected: 'Connected', reconnecting: 'Reconnecting' } as const;
const COLOR = { connecting: '#E0A100', connected: 'var(--a-good, #2FA84F)', reconnecting: '#D9362B' } as const;

export function StatusChip({ link }: { link: keyof typeof LABEL }) {
  return (
    <span role="status" data-link={link} aria-label={`${LABEL[link]} to the big screen`} title={`${LABEL[link]} to the big screen`}
      style={{ display: 'block', flex: 'none', marginLeft: 'auto', width: 12, height: 12, borderRadius: '50%', background: COLOR[link], animation: link === 'connected' ? undefined : 'blink 1s infinite' }} />
  );
}
