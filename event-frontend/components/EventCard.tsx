import React from 'react';
import { CalendarOutlined, UserOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@apollo/client/react';
import { REGISTER_FOR_EVENT_MUTATION, CANCEL_REGISTRATION_MUTATION } from '@/lib/graphql/mutations';
import { EVENTS_QUERY, MY_EVENTS_QUERY, SUBSCRIBED_EVENTS_QUERY } from '@/lib/graphql/queries';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  img?: string;
  organizerName: string;
  organizerId: string;
  participants: Array<{ id: string; name: string }>;
}

const EventCard: React.FC<EventCardProps> = ({ id, title, description, date, img, organizerName, organizerId, participants }) => {
  const { user } = useAuth();
  
  const isSubscribed = participants?.some(p => p.id === user?.id);
  const isOrganizer = user?.id === organizerId;

  const [register, { loading: registering }] = useMutation(REGISTER_FOR_EVENT_MUTATION, {
    variables: { id },
    refetchQueries: [{ query: EVENTS_QUERY }, { query: MY_EVENTS_QUERY }, { query: SUBSCRIBED_EVENTS_QUERY }],
    onCompleted: () => message.success('Successfully subscribed to event!'),
    onError: (error) => message.error(error.message)
  });

  const [cancel, { loading: cancelling }] = useMutation(CANCEL_REGISTRATION_MUTATION, {
    variables: { id },
    refetchQueries: [{ query: EVENTS_QUERY }, { query: MY_EVENTS_QUERY }, { query: SUBSCRIBED_EVENTS_QUERY }],
    onCompleted: () => message.success('Successfully unsubscribed from event!'),
    onError: (error) => message.error(error.message)
  });

  const handleToggleSubscription = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      message.warning('Please login to subscribe to events');
      return;
    }
    if (isSubscribed) {
      cancel();
    } else {
      register();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {img ? (
            <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
             <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-indigo-50 to-slate-100">
                <span className="text-sm font-medium">No Image Available</span>
             </div>
        )}

        {!isOrganizer && user && (
          <button 
            onClick={handleToggleSubscription}
            disabled={registering || cancelling}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-xl z-10 ${
              isSubscribed 
                ? 'bg-red-500 text-white hover:bg-red-600 scale-110 opacity-100' 
                : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white scale-100 hover:scale-110 opacity-100'
            }`}
          >
            {isSubscribed ? <HeartFilled className="text-lg" /> : <HeartOutlined className="text-lg" />}
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center text-xs text-muted-foreground mb-2 gap-3">
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                <CalendarOutlined /> {formatDate(date)}
            </span>
            <span className="flex items-center gap-1">
                <UserOutlined /> {organizerName}
            </span>
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {description}
        </p>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
           <span className="text-sm font-semibold text-primary">Free</span>
           <div className="flex gap-2">
             {isSubscribed && (
               <Button 
                 danger 
                 shape="round" 
                 size="small" 
                 onClick={handleToggleSubscription}
                 loading={cancelling}
               >
                 Unsubscribe
               </Button>
             )}
             <Button type="primary" shape="round" size="small" className="bg-primary hover:bg-indigo-500 shadow-md shadow-indigo-200">
               Details
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
