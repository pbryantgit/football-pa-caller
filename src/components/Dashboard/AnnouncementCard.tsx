import React, { useState } from 'react';
import { Volume2, Copy, Check, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnnouncementCardProps {
  announcementText: string;
  onUpdateAnnouncementText: (text: string) => void;
  onCommitPlay: () => void;
  onUndoLastPlay: () => void;
  canUndo: boolean;
  isTouchdown?: boolean;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcementText,
  onUpdateAnnouncementText,
  onCommitPlay,
  onUndoLastPlay,
  canUndo,
  isTouchdown = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(announcementText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove the phonetic hints in parentheses before reading aloud
      const textToSpeak = announcementText.replace(/\s*\([^)]*\)/g, '');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommit = () => {
    if (isTouchdown) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    onCommitPlay();
  };

  return (
    <div className="announcement-panel glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="section-title">Live Announcement Preview</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={handleSpeak}
            title="Read Announcement Aloud (Text-to-Speech)"
          >
            <Volume2 size={14} color={isSpeaking ? '#60a5fa' : 'currentColor'} />
            <span>{isSpeaking ? 'Speaking...' : 'Read Aloud'}</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            onClick={handleCopy}
            title="Copy Announcement Text"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="announcement-box">
        <textarea
          value={announcementText}
          onChange={(e) => onUpdateAnnouncementText(e.target.value)}
          placeholder="Generated announcement will appear here..."
        />
      </div>

      <button
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '1.05rem',
          fontWeight: 800,
          background: isTouchdown ? 'linear-gradient(135deg, #10b981, #059669)' : undefined,
        }}
        onClick={handleCommit}
      >
        <CheckCircle2 size={20} />
        <span>COMMIT PLAY</span>
      </button>

      <button
        className="btn btn-secondary"
        style={{ width: '100%', opacity: canUndo ? 1 : 0.4 }}
        onClick={onUndoLastPlay}
        disabled={!canUndo}
      >
        <RotateCcw size={16} />
        <span>Undo Last Play</span>
      </button>
    </div>
  );
};
