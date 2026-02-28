import { motion } from 'framer-motion';
import { getBezierPath } from '../../algorithms/connections';

interface Props {
  id: string;
  fromX: number; fromY: number; fromIsRoot: boolean;
  toX: number; toY: number; toIsRoot: boolean;
  gradientId: string;
  arrowId: string;
}

export function BezierConnection({ id, fromX, fromY, fromIsRoot, toX, toY, toIsRoot, gradientId, arrowId }: Props) {
  const d = getBezierPath(fromX, fromY, fromIsRoot, toX, toY, toIsRoot);
  return (
    <motion.path
      key={id}
      d={d}
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={1.5}
      strokeLinecap="round"
      opacity={0.7}
      markerEnd={`url(#${arrowId})`}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.7 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    />
  );
}
