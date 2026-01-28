'use client';

import React from 'react';
import { Typography, Spin, Alert } from 'antd';
import { useQuery } from '@apollo/client/react';
import { SUBSCRIBED_EVENTS_QUERY } from '@/lib/graphql/queries';
import EventCard from '@/components/EventCard';
import { useAuth } from '@/context/AuthContext';

const { Title } = Typography;

interface SubscribedEventsData {
  subscribedEvents: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    img?: string;
    organizer: {
      id: string;
      name: string;
    };
    participants: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export default function Subscriptions() {
  const { user, isInitialized } = useAuth();
  const { data, loading, error } = useQuery<SubscribedEventsData>(SUBSCRIBED_EVENTS_QUERY, {
    skip: !isInitialized || !user,
    fetchPolicy: 'cache-and-network'
  });

  if (!isInitialized || (loading && !data)) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" tip="Loading your subscriptions..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <Alert
          message="Authentication Required"
          description="Please login to view your subscriptions."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Title level={2} className="!mb-0">Subscriptions</Title>
        <p className="text-muted-foreground">Events you are planning to attend</p>
      </div>

      {error && (
        <Alert
          message="Error loading subscriptions"
          description={error.message}
          type="error"
          showIcon
        />
      )}

      {data?.subscribedEvents && data.subscribedEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.subscribedEvents.map((event: any) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              description={event.description}
              date={event.date}
              img={event.img}
              organizerName={event.organizer?.name || 'Unknown'}
              organizerId={event.organizer?.id}
              participants={event.participants || []}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl bg-muted/30">
          <p className="text-lg font-medium text-foreground">You haven't subscribed to any events yet.</p>
          <p className="text-sm text-muted-foreground mt-1">Explore upcoming events and join those you like!</p>
        </div>
      )}
    </div>
  );
}
