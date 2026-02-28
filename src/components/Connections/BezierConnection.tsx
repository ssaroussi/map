import { motion } from 'framer-motion';
import { getBezierPath } from '../../algorithms/connections';

interface Props {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  gradientId: string;
}

export function BezierConnection({ id, x1, y1, x2, y2, gradientId }: Props) {
  const d = getBezierPath(x1, y1, x2, y2);
  return (
    <motion.path
      key={id}
      d={d}
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={2}
      strokeLinecap="round"
      opacity={0.7}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.7 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    />
  );
}
