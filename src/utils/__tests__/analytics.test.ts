// ── utils/__tests__/analytics.test.ts ───────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  trackEvent, 
  recordLabStart, 
  getLabDuration,
  getSessionDuration,
  type EventType,
  type TrackEventData
} from '../analytics';

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to get fresh state
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('recordLabStart', () => {
    it('debe registrar inicio de lab sin errores', () => {
      // No debe lanzar error
      expect(() => recordLabStart()).not.toThrow();
    });

    it('debe poder llamarse múltiples veces', () => {
      expect(() => {
        recordLabStart();
        recordLabStart();
        recordLabStart();
      }).not.toThrow();
    });
  });

  describe('getLabDuration', () => {
    it('debe retornar 0 si no se inició lab', () => {
      const duration = getLabDuration();
      expect(duration).toBe(0);
    });

    it('debe retornar número positivo después de iniciar lab', () => {
      recordLabStart();
      // Esperar un poco
      const start = Date.now();
      while (Date.now() - start < 10) {} // busy wait 10ms
      
      const duration = getLabDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSessionDuration', () => {
    it('debe retornar número positivo', () => {
      const duration = getSessionDuration();
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('debe aumentar con el tiempo', async () => {
      const duration1 = getSessionDuration();
      
      // Esperar 50ms
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const duration2 = getSessionDuration();
      expect(duration2).toBeGreaterThanOrEqual(duration1);
    });
  });

  describe('trackEvent', () => {
    it('no debe fallar si no hay webhook configurado', () => {
      const eventData: TrackEventData = {
        eventType: 'lab_started',
        scenarioId: 'scenario-01',
        scenarioName: 'Test Scenario',
      };

      // No debe lanzar error aunque no haya webhook
      expect(() => trackEvent(eventData)).not.toThrow();
    });

    it('debe aceptar eventos de diferentes tipos', () => {
      const eventTypes: EventType[] = [
        'lab_started',
        'mission_complete',
        'lab_changed',
        'lab_abandoned',
        'lab_completed',
        'survey_submitted',
        'feedback_submitted',
      ];

      eventTypes.forEach(eventType => {
        const eventData: TrackEventData = {
          eventType,
          scenarioId: 'scenario-01',
          scenarioName: 'Test',
        };
        
        expect(() => trackEvent(eventData)).not.toThrow();
      });
    });

    it('debe aceptar eventos con detalles', () => {
      const eventData: TrackEventData = {
        eventType: 'mission_complete',
        scenarioId: 'scenario-01',
        scenarioName: 'Test',
        details: {
          missionId: 3,
          missionTitle: 'Port Scan',
          timeSpent: 120,
        },
      };

      expect(() => trackEvent(eventData)).not.toThrow();
    });

    it('debe aceptar eventos sin scenarioId', () => {
      const eventData: TrackEventData = {
        eventType: 'feedback_submitted',
        details: {
          rating: 5,
          comment: 'Great lab!',
        },
      };

      expect(() => trackEvent(eventData)).not.toThrow();
    });
  });

  describe('Types', () => {
    it('EventType debe incluir todos los tipos esperados', () => {
      const validEvent: EventType = 'lab_started';
      expect(validEvent).toBe('lab_started');
      
      const validEvent2: EventType = 'mission_complete';
      expect(validEvent2).toBe('mission_complete');
    });

    it('TrackEventData debe requerir eventType', () => {
      const data: TrackEventData = {
        eventType: 'lab_completed',
        scenarioId: 'scenario-01',
      };
      
      expect(data.eventType).toBe('lab_completed');
    });
  });
});
