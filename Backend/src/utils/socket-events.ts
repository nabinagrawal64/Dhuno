import { EventEmitter } from "events";

// Shared event bus for socket.io broadcasts triggered from REST controllers
const socketEvents = new EventEmitter();
socketEvents.setMaxListeners(20);

export default socketEvents;
