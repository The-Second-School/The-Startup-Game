// Small pill in the phone header: Connecting / Connected / Reconnecting. Styles are inline so it never fights admin.css.
const LABEL = { connecting: 'Connecting', connected: 'Connected', reconnecting: 'Reconnecting' } as const;
const COLOR = { connecting: '#E0A100', connected: 'var(--a-good, #2FA84F)', reconnecting: '#D9362B' } as const;

export function StatusChip({ link }: { link: keyof typeof LABEL }) {
  return (
    <span role="status" data-link={link} aria-label={`${LABEL[link]} to the big screen`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none', fontSize: 12, fontWeight: 800, padding: '3px 9px 3px 7px', borderRadius: 999, background: 'rgba(0,0,0,.07)' }}>
      <i style={{ width: 9, height: 9, borderRadius: '50%', background: COLOR[link], animation: link === 'connected' ? undefined : 'blink 1s infinite' }} />
      {LABEL[link]}
    </span>
  );
}
