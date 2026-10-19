import React, { useEffect, useRef, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { providerConfigService } from '../services/providerConfigService';
import { effectiveProviderService } from '../services/effectiveProviderService';
import { ChatMessage } from '../types';
import { Icon } from '../shell/Icon';
import { Markdown } from '../ui/Markdown';
import { BreezyLogo } from './BreezyLogo';
import { CHAT_STARTERS } from '../lib/starters';
import { providerLabel } from '../lib/providers';

const CHAT_STORAGE_KEY = 'breezy_chat_history_v1';

export const ChatWorkspace: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => { try { const s = localStorage.getItem(CHAT_STORAGE_KEY); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [copied, setCopied] = useState<number | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null); const end = useRef<HTMLDivElement>(null); const ctrl = useRef<AbortController | null>(null);
  const active = effectiveProviderService.getActiveRoutableModel();

  useEffect(() => { try { localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)); } catch { /* storage full */ } end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);
  const grow = () => { const el = ta.current; if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 180)}px`; } };
  useEffect(grow, [input]);

  const run = async (history: ChatMessage[]) => {
    if (!active) { setError('No model is connected. Add a provider key or a local Ollama URL in Models first.'); return; }
    setError(null); setBusy(true); const c = new AbortController(); ctrl.current = c;
    try {
      const last = history[history.length - 1];
      const res = await apiClient.chatBreezy({ prompt: last.content, history: history.map((m) => ({ role: m.role, content: m.content })), provider: active.provider, model: active.model, apiKey: providerConfigService.getKeys()[active.provider] }, { signal: c.signal } as any);
      setMessages([...history, { role: 'assistant', content: res.text || 'The model returned an empty response.' }]);
    } catch (e: any) { if (e?.name !== 'AbortError') setError(e?.message || 'The model did not respond.'); }
    finally { setBusy(false); ctrl.current = null; }
  };
  const send = (text = input) => {
    const t = text.trim(); if (!t || busy) return;
    if (!active) { setError('No model is connected. Add a provider key or a local Ollama URL in Models first.'); return; }
    setInput(''); const next = [...messages, { role: 'user' as const, content: t }]; setMessages(next); void run(next);
  };
  const regenerate = () => { if (busy) return; const i = messages.map((m) => m.role).lastIndexOf('user'); if (i < 0) return; const next = messages.slice(0, i + 1); setMessages(next); void run(next); };
  const copy = (text: string, i: number) => { void navigator.clipboard.writeText(text).then(() => { setCopied(i); window.setTimeout(() => setCopied(null), 1500); }).catch(() => {}); };
  const clear = () => { if (window.confirm('Clear this conversation from this device?')) { setMessages([]); localStorage.removeItem(CHAT_STORAGE_KEY); } };
  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 px-gutter lg:px-space-lg py-space-sm flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm min-w-0"><h1 className="font-headline-md text-headline-md">Chat</h1>
          <span className="hidden sm:flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container font-code-sm text-code-sm min-w-0"><span className={`w-1.5 h-1.5 rounded-circle ${active ? 'bg-tertiary' : 'bg-outline'}`} /><span className={`truncate ${active ? 'text-on-surface-variant' : 'text-outline'}`}>{active ? `${providerLabel(active.provider)} · ${active.model}` : 'No model assigned'}</span></span></div>
        <div className="flex items-center gap-space-xs">
          {!active && <a href="#models" className="flex items-center gap-space-xs px-space-md min-h-[36px] rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] font-label-md text-label-md"><Icon name="link" className="text-[16px]" />Connect a model</a>}
          {messages.length > 0 && <button type="button" onClick={clear} className="flex items-center gap-space-xs px-space-sm min-h-[36px] rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors"><Icon name="delete_sweep" className="text-[18px]" /><span className="hidden sm:inline">Clear</span></button>}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-gutter lg:px-space-lg pb-space-lg flex flex-col gap-space-lg min-h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-space-lg py-space-xl">
              <span className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-[0_0_32px_rgba(76,214,251,0.18)]"><BreezyLogo size={34} /></span>
              <div><h2 className="font-headline-lg text-headline-lg">What are we working on?</h2><p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-md">A direct conversation with your connected model. For sourced, cross-checked answers, use Research.</p></div>
              <div className="grid sm:grid-cols-3 gap-space-sm w-full text-left">{CHAT_STARTERS.map((st) => (
                <button key={st.id} type="button" onClick={() => { setInput(st.prompt); ta.current?.focus(); }} className="group text-left p-space-md bg-surface-container hover:bg-surface-container-high rounded-2xl transition-colors coat min-h-[88px]">
                  <Icon name={st.icon} className="text-[20px] text-primary" /><div className="font-headline-sm text-headline-sm mt-space-sm">{st.title}</div><div className="font-body-sm text-body-sm text-on-surface-variant">{st.meta}</div></button>))}</div>
            </div>
          ) : messages.map((m, i) => m.role === 'user' ? (
            <div key={i} className="flex justify-end"><div className="max-w-[85%] bg-surface-container-high rounded-3xl rounded-br-lg px-space-lg py-space-md whitespace-pre-wrap break-words font-body-md text-body-md">{m.content}</div></div>
          ) : (
            <div key={i} className="flex gap-space-md group">
              <span className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5"><BreezyLogo size={20} /></span>
              <div className="min-w-0 flex-1"><Markdown>{m.content}</Markdown>
                <div className="flex items-center gap-space-xs mt-space-xs opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button type="button" onClick={() => copy(m.content, i)} className="flex items-center gap-1 px-space-sm min-h-[32px] rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md"><Icon name={copied === i ? 'check' : 'content_copy'} className="text-[16px]" />{copied === i ? 'Copied' : 'Copy'}</button>
                  {i === messages.length - 1 && <button type="button" onClick={regenerate} disabled={busy} className="flex items-center gap-1 px-space-sm min-h-[32px] rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md disabled:opacity-40"><Icon name="refresh" className="text-[16px]" />Regenerate</button>}
                </div></div>
            </div>))}
          {busy && <div className="flex gap-space-md items-center" role="status" aria-label="Model is responding"><span className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"><BreezyLogo size={20} /></span><span className="flex gap-1.5">{[0, 1, 2].map((d) => <span key={d} className="w-2 h-2 rounded-circle bg-primary/70 animate-bounce" style={{ animationDelay: `${d * 140}ms` }} />)}</span></div>}
          {error && <div role="alert" className="flex gap-space-sm items-start bg-error-container/30 text-error rounded-xl p-space-md font-body-sm text-body-sm"><Icon name="error" className="text-[20px] shrink-0" /><span className="flex-1">{error}</span>{!lastIsAssistant && messages.length > 0 && active && <button type="button" onClick={regenerate} className="underline underline-offset-2 shrink-0">Retry</button>}</div>}
          <div ref={end} />
        </div>
      </div>

      <div className="shrink-0 px-gutter lg:px-space-lg pb-space-md pt-space-xs">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-space-sm bg-surface-container rounded-[1.75rem] coat hairline p-space-sm pl-space-lg focus-within:shadow-[inset_0_0_0_1px_rgba(76,214,251,0.5),0_0_0_4px_rgba(76,214,251,0.08)] transition-shadow">
            <textarea ref={ta} rows={1} value={input} onChange={(e) => setInput(e.target.value)} aria-label="Message" placeholder={active ? 'Message Breezy…' : 'Connect a model in Models to start chatting'}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
              className="flex-1 min-w-0 bg-transparent resize-none py-[10px] text-base lg:text-body-lg font-body-lg placeholder:text-outline focus:outline-none max-h-[180px]" />
            {busy ? <button type="button" aria-label="Stop" onClick={() => ctrl.current?.abort()} className="w-11 h-11 shrink-0 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-outline-variant transition-colors"><Icon name="stop" className="text-[22px]" fill /></button>
              : <button type="button" aria-label="Send" onClick={() => send()} disabled={!input.trim()} className="w-11 h-11 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center glow-primary hover:bg-primary-fixed transition-all disabled:opacity-30 disabled:shadow-none disabled:cursor-not-allowed"><Icon name="arrow_upward" className="text-[22px]" /></button>}
          </div>
          <p className="text-center font-code-sm text-code-sm text-outline-variant mt-space-xs">Shift + Return for a new line. Replies are not checked against sources.</p>
        </div>
      </div>
    </div>
  );
};
