import { io } from "socket.io-client";

// Realtime is an enhancement — chat persists over HTTP (see API_CONTRACT.md).
export function connectSkt() {
  return io(import.meta.env.VITE_SOCKET_URL);
}
