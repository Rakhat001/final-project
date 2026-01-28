import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Events GraphQL (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Query: events', () => {
    const EVENTS_QUERY = `
      query GetEvents($offset: Int!, $limit: Int!) {
        events(offset: $offset, limit: $limit) {
          id
          title
          description
          date
          img
          organizer {
            id
            email
            name
          }
          participants {
            id
            email
            name
          }
        }
      }
    `;

    it('should return events list with correct structure (snapshot)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: EVENTS_QUERY,
          variables: { offset: 0, limit: 10 },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();

      const events = response.body.data.events;
      
      const structureSnapshot = events.map((event: any) => ({
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
        date: expect.any(String),
        img: event.img !== null ? expect.any(String) : null,
        organizer: event.organizer ? {
          id: expect.any(String),
          email: expect.any(String),
          name: expect.any(String),
        } : null,
        participants: expect.any(Array),
      }));

      expect(events).toMatchSnapshot({
      });
    });

    it('should match events response schema structure', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: EVENTS_QUERY,
          variables: { offset: 0, limit: 5 },
        });

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('events');
      expect(Array.isArray(response.body.data.events)).toBe(true);

      const schemaSnapshot = {
        hasData: true,
        hasEvents: true,
        isEventsArray: true,
        eventFields: response.body.data.events[0] 
          ? Object.keys(response.body.data.events[0]).sort()
          : [],
      };

      expect(schemaSnapshot).toMatchSnapshot();
    });
  });

  describe('Query: event (single)', () => {
    const EVENT_QUERY = `
      query GetEvent($id: ID!) {
        event(id: $id) {
          id
          title
          description
          date
          img
          organizer {
            id
            email
            name
          }
          participants {
            id
            email
            name
          }
        }
      }
    `;

    it('should return error for non-existent event (snapshot)', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: EVENT_QUERY,
          variables: { id: '000000000000000000000000' }, 
        });
          
      expect(response.body.errors).toBeDefined();
      
      const errorSnapshot = {
        hasErrors: true,
        errorMessage: response.body.errors?.[0]?.message,
        errorExtensions: response.body.errors?.[0]?.extensions?.code,
      };

      expect(errorSnapshot).toMatchSnapshot();
    });
  });

  describe('GraphQL Schema Introspection (snapshot)', () => {
    const INTROSPECTION_QUERY = `
      query {
        __type(name: "Event") {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;

    it('should match Event type schema', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: INTROSPECTION_QUERY })
        .expect(200);

      expect(response.body.data.__type).toMatchSnapshot();
    });
  });
});
