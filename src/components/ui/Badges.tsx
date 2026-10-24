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

const topicClasses: Record<Topic, string> = {
  'Stack': 'topic-stack',
  'Queue': 'topic-queue',
  'Deque': 'topic-deque',
  'Linked List': 'topic-linked',
  'Binary Tree': 'topic-tree',
  'Mixed': 'topic-mixed',
};

export function TopicBadge({ topic }: TopicBadgeProps) {
  const cls = topicClasses[topic] || 'topic-stack';
  return (
    <span className={`chip ${cls}`}>
      {topic}
    </span>
  );
}
