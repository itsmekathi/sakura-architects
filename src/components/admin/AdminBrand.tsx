import { LogoMark } from '../Logo'

/** Payload admin: logo on the login / create-account screens. */
export function AdminLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
      <LogoMark size={48} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 24, letterSpacing: '0.34em', fontWeight: 500 }}>
          SAKURA
        </span>
        <span style={{ fontSize: 10, letterSpacing: '0.47em', marginTop: 8, opacity: 0.6 }}>ARCHITECTS</span>
      </span>
    </span>
  )
}

/** Payload admin: small icon in the navigation. */
export function AdminIcon() {
  return <LogoMark size={26} />
}
