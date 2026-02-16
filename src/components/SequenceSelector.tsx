import type { SequenceMetadata } from '../types/sequence';

interface Props {
  sequences: SequenceMetadata[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#00ff88',
  intermediate: '#ffcc00',
  advanced: '#ff4444',
};

export default function SequenceSelector({ sequences, selectedId, onSelect }: Props) {
  return (
    <div className="sequence-selector">
      <h3>Select Exercise</h3>
      <div className="sequence-list">
        {sequences.map((seq) => (
          <button
            key={seq.id}
            className={`sequence-item ${selectedId === seq.id ? 'selected' : ''}`}
            onClick={() => onSelect(seq.id)}
          >
            <div className="sequence-title">{seq.title}</div>
            <div className="sequence-meta">
              <span
                className="sequence-difficulty"
                style={{ color: DIFFICULTY_COLORS[seq.difficulty] ?? '#eaeaea' }}
              >
                {seq.difficulty}
              </span>
              <span className="sequence-bpm">{seq.bpm} BPM</span>
            </div>
            <div className="sequence-desc">{seq.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
