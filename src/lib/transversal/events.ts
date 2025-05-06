import { createEventBus } from './createEventBus.ts';

// observable of instance changes
export const changeInstanceEventBus = createEventBus<void>();

// open settings and more event
export const openSettingsViewEventBus = createEventBus<void>();


// open settings and more event
export const closeSettingsViewEventBus = createEventBus<void>();
