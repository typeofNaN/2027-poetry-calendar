import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from './ui/button';
export function PoetryReader({ text }: { text: string }) {
  const supported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [state, setState] = useState<'idle' | 'playing'>('idle');
  const [error, setError] = useState('');
  const active = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(
    () => () => {
      active.current = null;
      if (supported) window.speechSynthesis.cancel();
    },
    [text, supported],
  );
  function play() {
    const synth = window.speechSynthesis;
    active.current = null;
    synth.cancel();
    setError('');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    const voice = synth.getVoices().find((v) => v.lang.startsWith('zh'));
    if (voice) utterance.voice = voice;
    active.current = utterance;
    utterance.onend = () => {
      if (active.current === utterance) setState('idle');
    };
    utterance.onerror = (e) => {
      if (active.current !== utterance) return;
      setState('idle');
      if (e.error !== 'canceled' && e.error !== 'interrupted')
        setError('当前设备无法朗读，请检查中文语音或换用系统浏览器。');
    };
    synth.speak(utterance);
    setState('playing');
  }
  const label = !supported
    ? '此浏览器不支持朗读'
    : state === 'playing'
      ? '停止朗读'
      : '朗读全文';
  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        disabled={!supported}
        aria-label={label}
        title={label}
        aria-pressed={state === 'playing'}
        className={
          state === 'playing'
            ? 'reader-playing text-primary'
            : 'text-muted-foreground'
        }
        onClick={() => {
          if (state === 'playing') {
            active.current = null;
            speechSynthesis.cancel();
            setState('idle');
          } else play();
        }}
      >
        <Volume2 aria-hidden="true" className="size-5" />
      </Button>
      <span
        role="status"
        className={error ? 'block text-xs text-muted-foreground' : 'sr-only'}
      >
        {error || (state === 'playing' ? '正在朗读' : '')}
      </span>
    </div>
  );
}
