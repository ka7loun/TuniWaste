import { Injectable, signal, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError, firstValueFrom, of, Subject, BehaviorSubject } from 'rxjs';
import { Message, MessageThread } from '../models/message.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';

interface BackendThread {
  id: string;
  counterpart: string;
  role: string;
  unread: number;
  lastMessage: string;
  lastTimestamp: string;
}

interface BackendMessage {
  _id: string;
  threadId: string;
  sender: { _id: string; company: string; email: string } | string;
  body: string;
  timestamp: string;
  attachments?: string[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MessagingService implements OnDestroy {
  threads = signal<MessageThread[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Socket.IO connection
  private socket: Socket | null = null;
  private socketConnected = signal<boolean>(false);
  private messageSubject = new Subject<Message>();
  readonly newMessage$ = this.messageSubject.asObservable();

  // Store messages by thread ID for real-time updates
  private messagesByThread = new Map<string, BehaviorSubject<Message[]>>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize Socket.IO connection when user is authenticated
    // Use distinctUntilChanged to avoid reconnecting on every emission
    this.authService.user$.subscribe((user) => {
      if (user && this.authService.getToken()) {
        // Only initialize if we have a user AND a token
        if (!this.socket?.connected) {
          console.log('🔌 Initializing Socket.IO connection for user:', user.id);
          this.initializeSocket();
        }
      } else {
        // Only disconnect if we actually have a socket
        if (this.socket) {
          console.log('🔌 Disconnecting Socket.IO (user logged out)');
          this.disconnectSocket();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
    this.messageSubject.complete();
  }

  /**
   * Initialize Socket.IO connection for real-time messaging
   */
  private initializeSocket(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('⚠️ Cannot initialize Socket.IO: No token available');
      return;
    }

    if (this.socket?.connected) {
      console.log('✅ Socket.IO already connected');
      return;
    }

    // Disconnect existing socket if any
    this.disconnectSocket();

    // Get the base URL for Socket.IO (remove /api suffix)
    const socketUrl = environment.apiUrl.replace('/api', '');
    console.log('🔌 Connecting to Socket.IO server:', socketUrl);

    // Create Socket.IO connection with authentication
    this.socket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      this.socketConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      this.socketConnected.set(false);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket.IO connection error:', error);
      this.socketConnected.set(false);
    });

    // Listen for new messages in real-time
    this.socket.on('new-message', (messageData: BackendMessage) => {
      this.handleIncomingMessage(messageData);
    });

    // Listen for message received notifications
    this.socket.on('message-received', (data: { threadId: string; message: BackendMessage }) => {
      this.handleIncomingMessage(data.message);
    });
  }

  /**
   * Disconnect Socket.IO connection
   */
  private disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.socketConnected.set(false);
    }
  }

  /**
   * Handle incoming real-time message
   */
  private handleIncomingMessage(messageData: BackendMessage): void {
    const currentUser = this.authService.snapshot();
    const senderCompany = typeof messageData.sender === 'object' ? messageData.sender.company : messageData.sender;
    const isCurrentUser = currentUser && senderCompany === currentUser.company;

    const message: Message = {
      id: messageData._id,
      threadId: messageData.threadId,
      sender: isCurrentUser ? 'You' : senderCompany,
      body: messageData.body,
      timestamp: messageData.timestamp || messageData.createdAt,
      attachments: messageData.attachments || [],
    };

    // Update messages for the thread
    const threadId = messageData.threadId;
    const threadMessages = this.messagesByThread.get(threadId);
    if (threadMessages) {
      const currentMessages = threadMessages.value;
      // Check if message already exists (avoid duplicates)
      if (!currentMessages.find((m) => m.id === message.id)) {
        threadMessages.next([...currentMessages, message]);
      }
    }

    // Emit to subscribers
    this.messageSubject.next(message);

    // Update threads list to reflect new message
    this.loadThreads().catch(() => {
      // Silently fail - not critical
    });
  }

  /**
   * Join a thread room for real-time updates
   */
  joinThread(threadId: string): void {
    if (this.socket?.connected && threadId) {
      this.socket.emit('join-thread', threadId);
    }
  }

  /**
   * Leave a thread room
   */
  leaveThread(threadId: string): void {
    if (this.socket?.connected && threadId) {
      this.socket.emit('leave-thread', threadId);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  async loadThreads(): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      this.threads.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const threads = await firstValueFrom(
        this.http
          .get<BackendThread[]>(`${environment.apiUrl}/messages/threads`, {
            headers: this.getAuthHeaders(),
          })
          .pipe(
            map((threads) =>
              threads.map((t) => ({
                id: String(t.id),
                counterpart: t.counterpart,
                role: t.role as any,
                unread: t.unread,
                lastMessage: t.lastMessage,
                lastTimestamp: t.lastTimestamp,
              }))
            ),
            catchError((error) => {
              console.error('Load threads error:', error);
              this.error.set('Failed to load conversations');
              return of([]);
            })
          )
      );

      this.threads.set(threads || []);
    } catch (error: any) {
      console.error('Load threads error:', error);
      this.error.set('Failed to load conversations');
      this.threads.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  getMessages(threadId: string): Observable<Message[]> {
    const token = this.authService.getToken();
    if (!token || !threadId) {
      return of([]);
    }

    // Join the thread room for real-time updates
    this.joinThread(threadId);

    // Check if we already have a BehaviorSubject for this thread
    if (!this.messagesByThread.has(threadId)) {
      this.messagesByThread.set(threadId, new BehaviorSubject<Message[]>([]));
    }

    // Load initial messages from API
    return this.http
      .get<BackendMessage[]>(`${environment.apiUrl}/messages/threads/${threadId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((messages) => {
          const currentUser = this.authService.snapshot();
          const transformedMessages = messages.map((m) => {
            const senderObj = typeof m.sender === 'object' ? m.sender : { company: m.sender };
            const senderCompany = senderObj.company || 'User';
            const isCurrentUser = currentUser && senderCompany === currentUser.company;
            // Backend already returns anonymous names (Seller/Buyer), so use them directly
            const displayName = isCurrentUser ? 'You' : senderCompany;

            return {
              id: m._id,
              threadId: m.threadId,
              sender: displayName,
              body: m.body,
              timestamp: m.timestamp || m.createdAt,
              attachments: m.attachments || [],
            };
          });

          // Update the BehaviorSubject with initial messages
          const threadMessages = this.messagesByThread.get(threadId);
          if (threadMessages) {
            threadMessages.next(transformedMessages);
          }

          return transformedMessages;
        }),
        catchError((error) => {
          console.error('Load messages error:', error);
          return of([]);
        })
      );
  }

  /**
   * Get messages observable for a thread (includes real-time updates)
   */
  getMessagesObservable(threadId: string): Observable<Message[]> {
    if (!this.messagesByThread.has(threadId)) {
      this.messagesByThread.set(threadId, new BehaviorSubject<Message[]>([]));
    }
    return this.messagesByThread.get(threadId)!.asObservable();
  }

  async sendMessage(threadId: string, body: string): Promise<Message> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    if (!threadId || !body?.trim()) {
      throw new Error('Thread ID and message body are required');
    }

    try {
      console.log('📤 Sending message:', { threadId, body: body.trim().substring(0, 50) });
      
      // Send message via HTTP (backend will save to MongoDB and emit via WebSocket)
      const message = await firstValueFrom(
        this.http
          .post<BackendMessage>(
            `${environment.apiUrl}/messages`,
            { threadId, body: body.trim(), attachments: [] },
            {
              headers: this.getAuthHeaders(),
            }
          )
          .pipe(
            map((message) => {
              console.log('✅ Message sent successfully:', message._id);
              const currentUser = this.authService.snapshot();
              const senderCompany = typeof message.sender === 'object' ? message.sender.company : message.sender;
              const isCurrentUser = currentUser && senderCompany === currentUser.company;

              return {
                id: message._id,
                threadId: message.threadId,
                sender: isCurrentUser ? 'You' : senderCompany,
                body: message.body,
                timestamp: message.timestamp || message.createdAt,
                attachments: message.attachments || [],
              };
            }),
            catchError((error) => {
              console.error('❌ Send message error in pipe:', error);
              console.error('Error details:', {
                status: error?.status,
                statusText: error?.statusText,
                message: error?.message,
                error: error?.error
              });
              // Re-throw the error so it can be handled by the outer try-catch
              return throwError(() => error);
            })
          )
      );

      // The message will be added to the thread via WebSocket event
      // But we can also add it optimistically here for instant feedback
      const threadMessages = this.messagesByThread.get(threadId);
      if (threadMessages) {
        const currentMessages = threadMessages.value;
        if (!currentMessages.find((m) => m.id === message.id)) {
          threadMessages.next([...currentMessages, message]);
        }
      }

      // Reload threads to update last message (don't await - fire and forget)
      this.loadThreads().catch(() => {
        // Ignore errors in reload
      });

      return message;
    } catch (error: any) {
      console.error('❌ Send message error (outer catch):', error);
      console.error('Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error
      });
      
      // Extract user-friendly error message
      let errorMessage = 'Failed to send message';
      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // IMPORTANT: Don't throw errors that would cause logout
      // The interceptor should handle 401/403 for messaging endpoints
      // But we'll still throw so the component can show an error toast
      throw new Error(errorMessage);
    }
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    const token = this.authService.getToken();
    if (!token) {
      return; // Silently fail - not critical
    }

    try {
      await firstValueFrom(
        this.http.put(
          `${environment.apiUrl}/messages/threads/${threadId}/read`,
          {},
          {
            headers: this.getAuthHeaders(),
          }
        )
      );

      // Update local state
      const threads = this.threads();
      const updated = threads.map((t) =>
        t.id === threadId ? { ...t, unread: 0 } : t
      );
      this.threads.set(updated);
    } catch (error) {
      // Silently fail - not critical
      console.error('Mark thread as read error:', error);
    }
  }

  /**
   * Clean up messages for a thread when leaving
   */
  cleanupThread(threadId: string): void {
    this.leaveThread(threadId);
    this.messagesByThread.delete(threadId);
  }
}
