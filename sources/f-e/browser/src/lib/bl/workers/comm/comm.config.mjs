import {
  PUBLIC_WS_PROTO,
  PUBLIC_WS_HOST,
  PUBLIC_WS_PORT,
  PUBLIC_WS_PATH,
} from '$env/static/public';

export default Object.freeze({
  proto: PUBLIC_WS_PROTO,
  host: PUBLIC_WS_HOST,
  port: parseInt(PUBLIC_WS_PORT, 10),
  path: PUBLIC_WS_PATH,
});
