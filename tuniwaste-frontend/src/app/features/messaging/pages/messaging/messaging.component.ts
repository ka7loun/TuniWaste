import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SectionHeadingComponent } from '../../../../shared/components/section-heading/section-heading.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { MessagingService } from '../../../../core/services/messaging.service';
import { Message, MessageThread } from '../../../../core/models/message.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SectionHeadingComponent, LoadingSkeletonComponent],
  templateUrl: './messaging.component.html',
  styleUrl: './messaging.component.scss',
})
export class MessagingComponent implements OnInit, OnDestroy {
  readonly selectedThreadId = new FormControl<string>('', { nonNullable: true });
  readonly composer = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(1)],
  });

  messages: Message[] = [];
  selectedThread: MessageThread | null = null;
  sending = false;
  loadingMessages = false;
  showWarningDialog = false;
  warningAccepted = false;

  private destroy$ = new Subject<void>();

  get threads() {
    return this.messagingService.threads();
  }

  get loading() {
    return this.messagingService.loading();
  }

  constructor(
    private readonly messagingService: MessagingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastService,
    private readonly authService: AuthService
  ) {
    // Auto-select first thread when threads load
    effect(() => {
      const threads = this.messagingService.threads();
      if (!this.selectedThreadId.value && threads.length > 0) {
        this.selectedThreadId.setValue(threads[0].id, { emitEvent: true });
      }
    });

    // Load messages when thread is selected
    this.selectedThreadId.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((threadId) => {
      if (threadId) {
        if (!this.warningAccepted) {
          // Show warning if not accepted yet
          this.showWarningDialog = true;
        } else {
        this.loadMessages(threadId);
        this.updateSelectedThread();
        }
      } else {
        this.messages = [];
        this.selectedThread = null;
      }
    });

    // Listen for real-time new messages (for notifications/toasts)
    this.messagingService.newMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        // Only show notification if message is for a different thread or user is not viewing this thread
        if (message.threadId !== this.selectedThreadId.value) {
          // Could show a toast notification here if desired
          // this.toastService.show(`New message from ${message.sender}`, 'info');
        }
      });
  }

  ngOnInit(): void {
    // Load threads on init
    this.messagingService.loadThreads();

    // Check for query params to auto-select thread
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['threadId']) {
        const threads = this.messagingService.threads();
        const thread = threads.find((t) => t.id === params['threadId']);
        if (thread) {
          this.selectedThreadId.setValue(thread.id, { emitEvent: true });
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up thread subscription when leaving
    const threadId = this.selectedThreadId.value;
    if (threadId) {
      this.messagingService.cleanupThread(threadId);
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateSelectedThread(): void {
    const threadId = this.selectedThreadId.value;
    if (!threadId) {
      this.selectedThread = null;
      return;
    }

    const threads = this.messagingService.threads();
    this.selectedThread = threads.find((t) => t.id === threadId) || null;
  }

  private loadMessages(threadId: string): void {
    if (!threadId) return;

    this.loadingMessages = true;
    
    // Load initial messages from API
    this.messagingService.getMessages(threadId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loadingMessages = false;
        
        // Subscribe to real-time updates for this thread
        this.messagingService.getMessagesObservable(threadId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((updatedMessages) => {
            this.messages = updatedMessages;
          });
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messages = [];
        this.loadingMessages = false;
        // Only show error if it's not an auth error (auth errors are handled by interceptor)
        if (error?.status !== 401 && error?.status !== 403) {
          this.toastService.show('Failed to load messages', 'error');
        }
      },
    });
  }

  selectThread(id: string): void {
    if (!id || id === this.selectedThreadId.value) return;

    // Show warning if not accepted yet and no messages exist
    if (!this.warningAccepted) {
      this.showWarningDialog = true;
      return;
    }

    this.selectedThreadId.setValue(id, { emitEvent: true });

    // Mark as read (fire and forget - don't wait)
    this.messagingService.markThreadAsRead(id).catch(() => {
      // Silently fail
    });
  }

  acceptWarning(): void {
    this.warningAccepted = true;
    this.showWarningDialog = false;
    // Now load the selected thread
    const threadId = this.selectedThreadId.value;
    if (threadId) {
      this.loadMessages(threadId);
      this.updateSelectedThread();
    }
  }

  dismissWarning(): void {
    this.showWarningDialog = false;
    // Don't load messages if warning is dismissed
  }

  async sendMessage(event?: Event): Promise<void> {
    // Prevent default form submission
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('📝 sendMessage() called', {
      sending: this.sending,
      invalid: this.composer.invalid,
      threadId: this.selectedThreadId.value,
      messageLength: this.composer.value?.length,
      composerValue: this.composer.value
    });

    if (this.sending) {
      console.warn('⚠️ Already sending a message');
      return;
    }

    if (this.composer.invalid) {
      console.warn('⚠️ Form is invalid:', this.composer.errors);
      return;
    }

    if (!this.selectedThreadId.value) {
      console.warn('⚠️ No thread selected');
      return;
    }

    const messageText = this.composer.value.trim();
    if (!messageText) {
      console.warn('⚠️ Empty message text');
      return;
    }

    const threadId = this.selectedThreadId.value;
    console.log('📤 Preparing to send message:', { threadId, messageLength: messageText.length });
    
    this.sending = true;
    this.composer.disable();

    try {
      console.log('📤 Calling messagingService.sendMessage()...');
      // Send message - backend will save to MongoDB and emit via WebSocket
      // The message will appear in real-time via the WebSocket subscription
      await this.messagingService.sendMessage(threadId, messageText);
      console.log('✅ Message sent successfully from component');
      
      // Clear composer on success
      this.composer.reset('');
      this.composer.enable();
      this.sending = false;
      
      // Note: Message will appear automatically via WebSocket, no need to manually add it
      // The real-time subscription will handle updating the messages array
    } catch (error: any) {
      this.sending = false;
      this.composer.enable();
      this.composer.setValue(messageText);

      console.error('❌ Failed to send message from component:', error);
      console.error('Error details:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error
      });

      // Extract error message
      let errorMessage = 'Failed to send message. Please try again.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Show error toast
      this.toastService.show(errorMessage, 'error');
      
      // IMPORTANT: Don't navigate or logout - just show error
      // The user should stay on the messaging page
    }
  }
}
