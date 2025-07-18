// Notification Manager for StumbleLele Friends Chat System
// Handles sound and visual notifications for messages and friend requests
// Author: Agent 4 - Real-time Specialist

// Notification types
export type NotificationType = 'message' | 'friend_request' | 'friend_accepted' | 'system';

// Notification options
export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  onClick?: () => void;
  sound?: boolean;
  vibrate?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

// Toast options
export interface ToastOptions {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClick?: () => void;
}

class NotificationManager {
  private audio: HTMLAudioElement | null = null;
  private permission: NotificationPermission = 'default';
  private toastContainer: HTMLElement | null = null;
  private isInitialized = false;

  // Initialize the notification manager
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request notification permission
      if ('Notification' in window) {
        this.permission = await Notification.requestPermission();
      }

      // Create audio element for notification sounds
      this.audio = new Audio();
      this.audio.volume = 0.5;
      this.audio.preload = 'auto';

      // Create toast container
      this.createToastContainer();

      this.isInitialized = true;
      console.log('Notification manager initialized');
    } catch (error) {
      console.error('Failed to initialize notification manager:', error);
    }
  }

  // Create toast container in DOM
  private createToastContainer(): void {
    if (this.toastContainer) return;

    this.toastContainer = document.createElement('div');
    this.toastContainer.id = 'stumblelele-toast-container';
    this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2 pointer-events-none';
    this.toastContainer.style.fontFamily = 'var(--font-nunito), sans-serif';
    document.body.appendChild(this.toastContainer);
  }

  // Show native notification
  showNotification(options: NotificationOptions): void {
    if (!this.isInitialized) {
      console.warn('Notification manager not initialized');
      return;
    }

    // Show toast notification (always visible)
    this.showToast({
      title: options.title,
      message: options.body,
      type: 'info',
      duration: 4000,
      onClick: options.onClick
    });

    // Show native notification if permitted and app is in background
    if (this.permission === 'granted' && document.hidden) {
      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/lele-icon.png',
          badge: options.badge || '/badge.png',
          tag: options.tag || 'stumblelele-chat',
          requireInteraction: false,
          silent: false
        });

        // Handle click event
        if (options.onClick) {
          notification.onclick = () => {
            options.onClick!();
            notification.close();
          };
        }

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.error('Failed to show native notification:', error);
      }
    }

    // Play sound if enabled
    if (options.sound !== false) {
      this.playNotificationSound();
    }

    // Vibrate if enabled and supported
    if (options.vibrate !== false && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // Show toast notification
  showToast(options: ToastOptions): void {
    if (!this.toastContainer) {
      this.createToastContainer();
    }

    const toast = document.createElement('div');
    toast.className = `
      pointer-events-auto bg-white rounded-lg shadow-lg border-l-4 p-4 max-w-sm
      transform transition-all duration-300 ease-out opacity-0 translate-x-full
      ${this.getToastBorderColor(options.type)}
    `;

    // Add click handler if provided
    if (options.onClick) {
      toast.style.cursor = 'pointer';
      toast.onclick = () => {
        options.onClick!();
        this.removeToast(toast);
      };
    }

    // Toast content
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0 mr-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center ${this.getToastIconBg(options.type)}">
            ${this.getToastIcon(options.type)}
          </div>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-gray-800">${this.escapeHtml(options.title)}</h4>
          <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(options.message)}</p>
        </div>
        <button class="ml-3 text-gray-400 hover:text-gray-600 text-lg font-bold" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `;

    // Add to container
    this.toastContainer!.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-x-full');
      toast.classList.add('opacity-100', 'translate-x-0');
    });

    // Auto-remove after duration
    const duration = options.duration || 4000;
    setTimeout(() => {
      this.removeToast(toast);
    }, duration);
  }

  // Remove toast with animation
  private removeToast(toast: HTMLElement): void {
    toast.classList.remove('opacity-100', 'translate-x-0');
    toast.classList.add('opacity-0', 'translate-x-full');

    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }

  // Get toast border color
  private getToastBorderColor(type: ToastOptions['type']): string {
    switch (type) {
      case 'success':
        return 'border-green-400';
      case 'warning':
        return 'border-yellow-400';
      case 'error':
        return 'border-red-400';
      default:
        return 'border-blue-400';
    }
  }

  // Get toast icon background
  private getToastIconBg(type: ToastOptions['type']): string {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  }

  // Get toast icon
  private getToastIcon(type: ToastOptions['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
    }
  }

  // Escape HTML characters
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Play notification sound
  playNotificationSound(): void {
    if (!this.audio) return;

    try {
      // Use a simple beep sound or load a custom sound
      this.audio.src = this.getNotificationSound();
      this.audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Get notification sound URL
  private getNotificationSound(): string {
    // Try to use a custom sound file, fallback to data URI beep
    const customSound = '/sounds/notification.mp3';
    
    // Simple beep sound as data URI fallback
    const beepSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+j2xHkpBSh+zPHaizsIGGS57OScTgwOUarm7blmFgU';
    
    return beepSound;
  }

  // Show message notification
  showMessageNotification(senderName: string, message: string, onClick?: () => void): void {
    this.showNotification({
      title: `💬 ${senderName}`,
      body: message,
      onClick,
      sound: true,
      vibrate: true,
      priority: 'normal'
    });
  }

  // Show friend request notification
  showFriendRequestNotification(senderName: string, onClick?: () => void): void {
    this.showNotification({
      title: '👥 Nova solicitação de amizade!',
      body: `${senderName} quer ser seu amigo`,
      onClick,
      sound: true,
      vibrate: true,
      priority: 'high'
    });
  }

  // Show friend accepted notification
  showFriendAcceptedNotification(friendName: string, onClick?: () => void): void {
    this.showNotification({
      title: '🎉 Amizade aceita!',
      body: `${friendName} aceitou sua solicitação de amizade`,
      onClick,
      sound: true,
      vibrate: true,
      priority: 'normal'
    });
  }

  // Show system notification
  showSystemNotification(title: string, message: string, onClick?: () => void): void {
    this.showNotification({
      title: `⚙️ ${title}`,
      body: message,
      onClick,
      sound: false,
      vibrate: false,
      priority: 'low'
    });
  }

  // Set notification volume
  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  // Request permission again
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
    }
    return this.permission;
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Clear all toasts
  clearAllToasts(): void {
    if (this.toastContainer) {
      this.toastContainer.innerHTML = '';
    }
  }

  // Cleanup method
  cleanup(): void {
    this.clearAllToasts();
    if (this.toastContainer && this.toastContainer.parentElement) {
      this.toastContainer.parentElement.removeChild(this.toastContainer);
      this.toastContainer = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Initialize immediately
notificationManager.initialize();

// Export helper functions for convenience
export function showNotification(options: NotificationOptions): void {
  notificationManager.showNotification(options);
}

export function showToast(options: ToastOptions): void {
  notificationManager.showToast(options);
}

export function playNotificationSound(): void {
  notificationManager.playNotificationSound();
}

export function showMessageNotification(senderName: string, message: string, onClick?: () => void): void {
  notificationManager.showMessageNotification(senderName, message, onClick);
}

export function showFriendRequestNotification(senderName: string, onClick?: () => void): void {
  notificationManager.showFriendRequestNotification(senderName, onClick);
}

export function showFriendAcceptedNotification(friendName: string, onClick?: () => void): void {
  notificationManager.showFriendAcceptedNotification(friendName, onClick);
}

export function showSystemNotification(title: string, message: string, onClick?: () => void): void {
  notificationManager.showSystemNotification(title, message, onClick);
}

export default notificationManager;