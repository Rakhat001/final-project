import { gql } from '@apollo/client';

export const EVENTS_QUERY = gql`
  query Events($offset: Int, $limit: Int) {
    events(offset: $offset, limit: $limit) {
      id
      title
      description
      date
      img
      organizer {
        id
        name
      }
      participants {
        id
        name
      }
    }
  }
`;

export const EVENT_QUERY = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      date
      img
      organizer {
        id
        name
      }
      participants {
        id
        name
      }
    }
  }
`;

export const MY_EVENTS_QUERY = gql`
  query MyEvents {
    myEvents {
      id
      title
      description
      date
      img
      organizer {
        id
        name
      }
      participants {
        id
        name
      }
    }
  }
`;

export const SUBSCRIBED_EVENTS_QUERY = gql`
  query SubscribedEvents {
    subscribedEvents {
      id
      title
      description
      date
      img
      organizer {
        id
        name
      }
      participants {
        id
        name
      }
    }
  }
`;
