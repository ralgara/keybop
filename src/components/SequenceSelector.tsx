import type { SequenceMetadata } from '../types/index.ts';

interface SequenceSelectorProps {
  sequences: SequenceMetadata[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  beginner: '#00ff88',
  intermediate: '#ffcc00',
  advanced: '#ff4444',
};

export function SequenceSelector({ sequences, selectedId, onSelect }: SequenceSelectorProps) {
  return (
    <div className="sequence-selector">
      <h3>Select Exercise</h3>
      <div className="sequence-list">
        {sequences.map(seq => (
          <button
            key={seq.id}
            className={`sequence-item ${selectedId === seq.id ? 'selected' : ''}`}
            onClick={() => onSelect(seq.id)}
          >
            <div className="sequence-title">{seq.title}</div>
            <div className="sequence-meta">
              <span
                className="difficulty-badge"
                style={{ color: difficultyColors[seq.difficulty] }}
              >
                {seq.difficulty}
              </span>
              <span className="bpm-badge">{seq.bpm} BPM</span>
            </div>
            <div className="sequence-desc">{seq.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
