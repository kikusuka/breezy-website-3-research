import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { BreezyLogo } from '../components/BreezyLogo';
import { ActiveTab, LAB_NAV, MAIN_NAV, MOBILE_NAV, MORE_IDS, TITLES } from '../lib/nav';
import { useModelState } from '../lib/useModelState';
import { userProfileService } from '../services/userProfileService';

declare const __APP_VERSION__: string;
const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '3.0';
export const initialsOf = (name: string) => { const v = name.trim(); return v ? v.split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase() || '').join('') : 'B'; };

interface ShellProps { tab: ActiveTab; go: (t: ActiveTab) => void; backendOnline: boolean; endpointName: string; children: React.ReactNode; }

function useProfile() {
  const [p, setP] = useState(() => userProfileService.getProfile());
  useEffect(() => {
    const on = () => setP(userProfileService.getProfile());
    window.addEventListener('storage', on); window.addEventListener('breezy:profile-changed', on);
    return () => { window.removeEventListener('storage', on); window.removeEventListener('breezy:profile-changed', on); };
  }, []);
  return p;
}
function Avatar({ name, photo, size = 'w-8 h-8' }: { name: string; photo?: string; size?: string }) {
  return (
    <span className={`${size} rounded-circle bg-surface-container-high text-primary font-code-sm text-code-sm flex items-center justify-center overflow-hidden shrink-0`}>
      {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initialsOf(name)}
    </span>
  );
}

function Sidebar({ tab, go, backendOnline, endpointName }: Omit<ShellProps, 'children'>) {
  const profile = useProfile();
  const name = profile.displayName.trim() || 'Guest';
  const role = profile.roleTitle.trim() || 'Profile not set up';
  const item = (n: { id: ActiveTab; label: string; icon: string }) => {
    const active = tab === n.id;
    return (
      <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); go(n.id); }} aria-current={active ? 'page' : undefined}
        className={`relative flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-colors ${active ? 'bg-surface-container-high text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}>
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-circle bg-primary" />}
        <Icon name={n.icon} className="text-[20px]" fill={active} /><span className="font-body-md text-body-md">{n.label}</span>
      </a>
    );
  };
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-50 flex-col justify-between bg-surface-container-low/95 backdrop-blur-xl shadow-[1px_0_0_rgba(61,73,77,0.35)]">
      <div className="flex flex-col min-h-0 overflow-y-auto">
        <a href="#landing" onClick={(e) => { e.preventDefault(); go('landing'); }} className="h-16 px-space-lg flex items-center gap-space-sm shrink-0">
          <BreezyLogo size={30} /><span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">Breezy</span>
          <span className="ml-auto font-code-sm text-code-sm text-primary bg-surface-container-highest px-space-xs py-0.5 rounded">v{VERSION}</span>
        </a>
        <nav className="px-space-md py-space-sm flex flex-col gap-space-xs" aria-label="Main">{MAIN_NAV.map(item)}</nav>
        <div className="px-space-md pt-space-md">
          <div className="px-space-md pb-space-xs font-label-sm text-label-sm uppercase tracking-wider text-outline">Laboratories</div>
          <nav className="flex flex-col gap-space-xs" aria-label="Laboratories">{LAB_NAV.map(item)}</nav>
        </div>
      </div>
      <div className="p-space-md flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm px-space-md py-space-xs rounded-xl bg-surface-container font-code-sm text-code-sm" title={`Backend: ${endpointName}`}>
          <span className={`w-1.5 h-1.5 rounded-circle shrink-0 ${backendOnline ? 'bg-tertiary' : 'bg-error'}`} />
          <span className="text-on-surface-variant truncate">{backendOnline ? 'Backend reachable' : 'Backend unreachable'}</span>
        </div>
        <button type="button" onClick={() => go('profile')} className="w-full text-left flex items-center gap-space-md p-space-sm bg-surface-container hover:bg-surface-container-high transition-colors rounded-2xl">
          <Avatar name={name} photo={profile.photoURL} />
          <span className="flex flex-col min-w-0 flex-1"><span className="font-label-md text-label-md text-on-surface truncate">{name}</span><span className="font-label-sm text-label-sm text-on-surface-variant truncate">{role}</span></span>
          <Icon name="more_vert" className="text-outline-variant text-[20px]" />
        </button>
      </div>
    </aside>
  );
}

function DesktopHeader({ go }: { go: (t: ActiveTab) => void }) {
  const profile = useProfile(); const model = useModelState(); const [q, setQ] = useState('');
  const name = profile.displayName.trim() || 'Guest';
  const chip = model.routable ? { dot: 'bg-tertiary', text: 'text-tertiary', label: model.label } : model.serverGemini ? { dot: 'bg-tertiary', text: 'text-tertiary', label: 'Server Gemini' } : { dot: 'bg-outline', text: 'text-outline', label: 'No model assigned' };
  return (
    <header className="hidden lg:flex shrink-0 h-16 items-center justify-between gap-space-md px-space-lg bg-surface/70 backdrop-blur-xl shadow-[0_1px_0_rgba(61,73,77,0.3)] relative z-40">
      <form className="flex-1 max-w-xl" onSubmit={(e) => { e.preventDefault(); try { sessionStorage.setItem('breezy:history-q', q); } catch { /* ignore */ } window.dispatchEvent(new Event('breezy:history-q')); go('history'); }}>
        <label className="flex items-center gap-space-sm px-space-md py-space-xs bg-surface-container-low text-on-surface-variant focus-within:text-on-surface focus-within:bg-surface-container rounded-full hairline transition-colors">
          <Icon name="search" className="text-[20px] text-outline" />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search research history" placeholder="Search your research history…" className="font-body-sm text-body-sm bg-transparent flex-1 min-w-0 focus:outline-none placeholder:text-on-surface-variant" />
          <kbd className="hidden xl:inline font-code-sm text-code-sm text-outline bg-surface-container-high px-1.5 rounded">↵</kbd>
        </label>
      </form>
      <div className="flex items-center gap-space-md">
        <button type="button" onClick={() => go('models')} title="Open Models" className={`flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors ${chip.text} font-code-sm text-code-sm max-w-[240px]`}>
          <span className={`w-1.5 h-1.5 rounded-circle shrink-0 ${chip.dot}`} /><span className="truncate">{chip.label}</span>
        </button>
        <button type="button" aria-label="Settings" onClick={() => go('settings')} className="p-space-sm rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"><Icon name="tune" className="text-[20px]" /></button>
        <span className="w-px h-6 bg-surface-container-high" />
        <button type="button" aria-label="Open profile" title={name} onClick={() => go('profile')}><Avatar name={name} photo={profile.photoURL} /></button>
      </div>
    </header>
  );
}

function MobileHeader({ tab, go }: { tab: ActiveTab; go: (t: ActiveTab) => void }) {
  const profile = useProfile(); const name = profile.displayName.trim() || 'Guest';
  return (
    <header className="lg:hidden shrink-0 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_0_rgba(61,73,77,0.3)] relative z-40">
      <div className="h-14 px-gutter flex items-center justify-between">
        <button type="button" onClick={() => go('landing')} className="flex items-center gap-space-sm text-left min-h-[44px]">
          <BreezyLogo size={34} />
          <span className="flex flex-col"><span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">Breezy</span><span className="font-code-sm text-code-sm text-on-surface-variant leading-none mt-1">{TITLES[tab]}</span></span>
        </button>
        <div className="flex items-center">
          <button aria-label="Search history" type="button" onClick={() => go('history')} className="w-11 h-11 flex items-center justify-center rounded-xl text-on-surface-variant hover:text-primary transition-colors"><Icon name="search" className="text-2xl" /></button>
          <button aria-label="Profile" type="button" onClick={() => go('profile')} className="w-11 h-11 flex items-center justify-center"><Avatar name={name} photo={profile.photoURL} /></button>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ tab, go }: { tab: ActiveTab; go: (t: ActiveTab) => void }) {
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [tab]);
  const moreActive = MORE_IDS.includes(tab);
  const all = [...MAIN_NAV, ...LAB_NAV].filter((n) => MORE_IDS.includes(n.id));
  return (
    <>
      {more && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="More destinations">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-surface-container-lowest/75 backdrop-blur-sm" onClick={() => setMore(false)} />
          <div className="absolute left-space-md right-space-md bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] bg-surface-container rounded-3xl coat p-space-md shadow-[0_16px_40px_-8px_rgba(0,0,0,0.7)]">
            <div className="grid grid-cols-3 gap-space-sm">
              {all.map((n) => (
                <button key={n.id} type="button" onClick={() => go(n.id)} className={`min-h-[76px] flex flex-col items-center justify-center gap-1 rounded-2xl transition-colors ${tab === n.id ? 'bg-surface-container-high text-primary' : 'bg-surface-container-low text-on-surface-variant active:bg-surface-container-high'}`}>
                  <Icon name={n.icon} className="text-2xl" fill={tab === n.id} /><span className="font-label-sm text-label-sm">{n.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav aria-label="Primary" className="lg:hidden shrink-0 relative z-[70] pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_0_rgba(61,73,77,0.35)]">
        <div className="flex items-center justify-around h-16 px-space-xs">
          {MOBILE_NAV.map((n) => {
            const active = n.id === 'more' ? moreActive || more : tab === n.id;
            return (
              <button key={n.id} type="button" aria-current={active ? 'page' : undefined} onClick={() => (n.id === 'more' ? setMore((v) => !v) : go(n.id as ActiveTab))} className={`relative flex flex-col items-center justify-center min-w-[60px] min-h-[48px] px-space-xs transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                {active && <span className="absolute -top-px h-0.5 w-8 rounded-circle bg-primary" />}
                <Icon name={n.icon} className="text-[24px]" fill={active} /><span className="font-label-sm text-label-sm mt-0.5">{n.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function Shell({ tab, go, backendOnline, endpointName, children }: ShellProps) {
  return (
    <div className="h-[100dvh] w-full flex bg-surface text-on-surface overflow-hidden">
      <Sidebar tab={tab} go={go} backendOnline={backendOnline} endpointName={endpointName} />
      <div className="flex-1 min-w-0 flex flex-col lg:pl-64">
        <DesktopHeader go={go} /><MobileHeader tab={tab} go={go} />
        {!backendOnline && (
          <div role="alert" className="shrink-0 flex items-center gap-space-sm px-gutter py-space-xs bg-error-container/40 text-on-error-container font-body-sm text-body-sm">
            <Icon name="cloud_off" className="text-[18px]" /> Backend unreachable — research and chat need it. Retrying every 30s.
          </div>
        )}
        <main className="flex-1 min-h-0 overflow-y-auto splatter-soft" id="main">{children}</main>
        <MobileNav tab={tab} go={go} />
      </div>
    </div>
  );
}
