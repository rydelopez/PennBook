import io from "socket.io-client";

const ENDPOINT = "http://localhost:3000";
const socket = io(ENDPOINT, {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});
export default socket;
