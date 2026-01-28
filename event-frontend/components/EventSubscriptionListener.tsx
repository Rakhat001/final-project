import React from 'react';
import { useSubscription } from '@apollo/client/react';
import { USER_REGISTERED_SUBSCRIPTION } from '@/lib/graphql/subscriptions';
import { notification } from 'antd';

const OrganizerNotificationListener: React.FC = () => {
  useSubscription<any>(USER_REGISTERED_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (data?.onUserRegistered) {
        notification.success({
          message: '🎉 Новый участник!',
          description: `${data.onUserRegistered.name} зарегистрировался на ваше событие`,
          placement: 'topRight',
          duration: 5,
        });
      }
    },
    onError: (err) => {
      console.error("Subscription error:", err);
    }
  });

  return null;
};

export default OrganizerNotificationListener;
