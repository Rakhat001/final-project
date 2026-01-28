import { gql } from '@apollo/client';

export const USER_REGISTERED_SUBSCRIPTION = gql`
  subscription OnUserRegistered {
    onUserRegistered {
      id
      name
      email
    }
  }
`;
