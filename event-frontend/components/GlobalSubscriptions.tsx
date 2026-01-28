'use client';

import { useAuth } from '@/context/AuthContext';
import OrganizerNotificationListener from '@/components/EventSubscriptionListener';

export default function GlobalSubscriptions() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <OrganizerNotificationListener />;
}
