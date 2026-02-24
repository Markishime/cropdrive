'use client';

import { motion } from 'framer-motion';
import PodcastAdmin from '@/components/PodcastAdmin';

export default function AdminPodcastsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PodcastAdmin />
    </motion.div>
  );
}
