import { getToken } from "./auth";

type MessageHandler = (data: unknown) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url = "wss://g17miw3mel.execute-api.ap-south-1.amazonaws.com/production";
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectInterval: number = 2000;
  private shouldReconnect: boolean = true;
  private isConnecting: boolean = false;

  public connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const token = getToken();
    if (!token) return;

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.shouldReconnect = true;
      this.ws = new WebSocket(`${this.url}?token=${token}`);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
      
        this.isConnecting = false;
        this.reconnectInterval = 2000;
      };

      this.ws.onmessage = (event) => {
        console.log("INCOMING WS MESSAGE", event.data);
        try {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach((handler) => handler(data));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(
          "WebSocket closed:",
          event.code,
          event.reason
        );
      
        this.isConnecting = false;
        this.ws = null;
      
        if (this.shouldReconnect) {
          setTimeout(() => this.connect(), this.reconnectInterval);
          this.reconnectInterval = Math.min(
            this.reconnectInterval * 1.5,
            30000
          );
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        console.error("WebSocket error:", error);
        // It will automatically trigger onclose and then reconnect
      };
    } catch (err) {
      this.isConnecting = false;
      console.error("Failed to connect to WebSocket:", err);
    }
  }

  public disconnect() {
    console.trace("WebSocket disconnect() called");

  this.shouldReconnect = false;

  if (this.ws) {
    this.ws.close();
    this.ws = null;
  }
  }

  
  public sendMessage(receiverId: string, message: string) {

    if (!this.ws) {
      console.warn(
        "WebSocket instance missing. Reconnecting..."
      );
  
      this.connect();
      return;
    }
  
  
    if (this.ws.readyState !== WebSocket.OPEN) {
  
      console.warn(
        "WebSocket not ready:",
        this.ws.readyState
      );
  
      return;
    }
  
  
    console.log("Sending message:", {
      receiverId,
      message
    });
  
  
    this.ws.send(
      JSON.stringify({
        action:"sendMessage",
        receiverId,
        message
      })
    );
  }

  public getState(){

    return {
      exists: !!this.ws,
      state: this.ws?.readyState
    };
  
  }

  public addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
  }
}

export const wsService = new WebSocketService();
