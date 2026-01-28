'use client';

import React from 'react';
import { Row, Col, Typography, Button, Spin, Alert } from 'antd';
import { CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons';
import EventCard from '@/components/EventCard';
import { useQuery } from '@apollo/client/react';
import { EVENTS_QUERY } from '@/lib/graphql/queries';

const { Title, Paragraph } = Typography;

interface EventsQueryData {
  events: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    img?: string;
    organizer: {
      id: string;
      name: string;
    };
  }>;
}

export default function Home() {
  const { data, loading, error } = useQuery<EventsQueryData>(EVENTS_QUERY, {
    variables: { offset: 0, limit: 10 }
  });

  return (
    <div className="space-y-12">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24 lg:py-32 flex flex-col items-start gap-6 max-w-4xl">
           <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
             Discover Your Next <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200">Unforgettable Experience</span>
           </h1>
           <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl leading-relaxed">
             From tech conferences to underground music festivals, find events that match your passion. Join a community of explorers today.
           </p>
           <div className="flex flex-wrap gap-4 mt-4">
             <Button type="primary" size="large" className="bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 border-none font-bold px-8 h-12 rounded-full shadow-lg shadow-indigo-900/20 flex items-center gap-2">
                Explore Events <ArrowRightOutlined />
             </Button>
             <Button size="large" type="default" ghost className="text-white border-white/40 hover:border-white hover:text-white font-semibold px-8 h-12 rounded-full backdrop-blur-sm">
                Learn More
             </Button>
           </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Upcoming Events</h2>
          <Button type="link" className="text-primary font-medium hover:underline">View all</Button>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip="Loading events..." />
          </div>
        )}

        {error && (
          <Alert
            message="Error loading events"
            description={error.message}
            type="error"
            showIcon
            className="mb-8"
          />
        )}

        {!loading && !error && data?.events && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.events.map((event: any) => (
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
        )}

        {!loading && !error && data?.events?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No events available at the moment.</p>
            <p className="text-sm mt-2">Check back soon for exciting new events!</p>
          </div>
        )}
      </section>
    </div>
  );
}
