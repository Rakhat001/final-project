import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($userInput: UserInput!) {
    signup(userInput: $userInput) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKENS_MUTATION = gql`
  mutation RefreshTokens {
    refreshTokens {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($createEventInput: CreateEventInput!) {
    createEvent(createEventInput: $createEventInput) {
      id
      title
      description
      date
      img
      organizer {
        id
        name
      }
    }
  }
`;

export const REGISTER_FOR_EVENT_MUTATION = gql`
  mutation RegisterForEvent($id: ID!) {
    registerForEvent(id: $id) {
      id
      participants {
        id
        name
      }
    }
  }
`;

export const CANCEL_REGISTRATION_MUTATION = gql`
  mutation CancelRegistration($id: ID!) {
    cancelRegistration(id: $id) {
      id
      participants {
        id
        name
      }
    }
  }
`;
