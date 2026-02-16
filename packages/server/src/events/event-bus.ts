import { EventEmitter } from 'events';
import { DomainEvents, DomainEventName } from './domain-events';

class TypedEventBus extends EventEmitter {
  emit<K extends DomainEventName>(event: K, payload: DomainEvents[K]): boolean {
    if (process.env.NODE_ENV === 'development') {
      const homeId = 'homeId' in payload ? payload.homeId : undefined;
      console.log(`[EventBus] ${String(event)}`, { homeId });
    }
    return super.emit(event, payload);
  }

  on<K extends DomainEventName>(
    event: K,
    listener: (payload: DomainEvents[K]) => void
  ): this {
    return super.on(event, listener);
  }

  once<K extends DomainEventName>(
    event: K,
    listener: (payload: DomainEvents[K]) => void
  ): this {
    return super.once(event, listener);
  }

  off<K extends DomainEventName>(
    event: K,
    listener: (payload: DomainEvents[K]) => void
  ): this {
    return super.off(event, listener);
  }

  // Suscribirse a múltiples eventos
  onMany(
    events: DomainEventName[],
    listener: (event: DomainEventName, payload: DomainEvents[DomainEventName]) => void
  ): this {
    events.forEach((event) => {
      this.on(event, (payload) => listener(event, payload));
    });
    return this;
  }
}

// Singleton - única instancia en toda la app
export const eventBus = new TypedEventBus();
eventBus.setMaxListeners(30);
