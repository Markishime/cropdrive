'use client';

import { motion } from 'framer-motion';
import PalmiraKnowledgeBaseAdmin from '@/components/PalmiraKnowledgeBaseAdmin';

export default function KnowledgeBaseAdminPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PalmiraKnowledgeBaseAdmin />
    </motion.div>
  );
}
