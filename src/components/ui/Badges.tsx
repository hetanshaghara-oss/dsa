import type { Difficulty, Topic } from '../../data/problems';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const cls = difficulty === 'Easy' ? 'badge-easy' : difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';
  return (
    <span className={`chip ${cls}`}>
      {difficulty}
    </span>
  );
}

interface TopicBadgeProps {
  topic: Topic;
}

const topicClasses: Record<string, string> = {
  'Stack': 'topic-stack',
  'Queue': 'topic-queue',
  'Deque': 'topic-deque',
  'Linked List': 'topic-linked',
  'Binary Tree': 'topic-tree',
  'Mixed': 'topic-mixed',
};

export function TopicBadge({ topic }: TopicBadgeProps) {
  const cls = topicClasses[topic];
  if (cls) {
    return (
      <span className={`chip ${cls}`}>
        {topic}
      </span>
    );
  }

  // Dynamic hue for any custom topic
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = topic.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);

  return (
    <span
      className="chip"
      style={{
        background: `hsla(${hue}, 70%, 50%, 0.12)`,
        color: `hsl(${hue}, 80%, 75%)`,
        border: `1px solid hsla(${hue}, 70%, 50%, 0.3)`,
      }}
    >
      {topic}
    </span>
  );
}
