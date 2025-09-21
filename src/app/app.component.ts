import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface UserData {
  username: string;
  name: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Authentication State
  isAuthenticated: WritableSignal<boolean> = signal(false);
  user: WritableSignal<UserData> = signal({ username: '', name: '' });
  
  // Form State
  username: WritableSignal<string> = signal('');
  password: WritableSignal<string> = signal('');
  errorMessage: WritableSignal<string | null> = signal(null);
  isLoading: WritableSignal<boolean> = signal(false);

  // Image URL State
  imageUrl: WritableSignal<string | null> = signal(null);

  // NOTE: In a real app, use environment variables for the API URL
  private readonly API_BASE_URL = 'http://localhost:3000';

  constructor() {
    // Optional: Check if user data exists in sessionStorage on load (for persistence)
    const storedUser = sessionStorage.getItem('auth_user');
    if (storedUser) {
        try {
            this.user.set(JSON.parse(storedUser));
            this.isAuthenticated.set(true);
            this.fetchImageUrl('gcp.png');
        } catch (e) {
            console.error('Failed to parse stored user data:', e);
            sessionStorage.removeItem('auth_user');
        }
    }
  }

  onUsernameInput(event: Event) {
    this.username.set((event.target as HTMLInputElement).value);
  }

  onPasswordInput(event: Event) {
    this.password.set((event.target as HTMLInputElement).value);
  }

  /**
   * Handles the login attempt by calling the Node.js backend.
   * Uses exponential backoff for retries.
   */
  async handleLogin(event: Event) {
    event.preventDefault();

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${this.API_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.username(),
            password: this.password(),
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Success: Update state and store data
          const userData: UserData = data.userData;
          this.user.set(userData);
          this.isAuthenticated.set(true);
          sessionStorage.setItem('auth_user', JSON.stringify(userData));

          // Fetch the signed URL for the image after successful login
          this.fetchImageUrl('gcp.png');
          
          // Clear credentials after successful login
          this.username.set('');
          this.password.set('');
          this.isLoading.set(false);
          return; // Exit the retry loop successfully
        } else {
          // Failure: Show error message
          this.errorMessage.set(data.message || 'Login failed due to a server error.');
          this.isLoading.set(false);
          return; // Exit the retry loop on known failure (401, 400)
        }
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          this.errorMessage.set('Could not connect to the server. Please ensure the Node.js server is running on port 3000.');
          this.isLoading.set(false);
          console.error('Login request failed after multiple retries:', error);
          return;
        }
        
        // Implement exponential backoff delay
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Fetches a signed URL from the backend for a given image name.
   */
  async fetchImageUrl(imageName: string) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/images/${imageName}`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      this.imageUrl.set(data.imageUrl);
    } catch (error) {
      console.error('Failed to fetch signed image URL:', error);
      // Optionally set an error message for the user
      this.errorMessage.set('Could not load the display image.');
    }
  }

  /**
   * Clears authentication state and session storage.
   */
  handleLogout() {
    this.isAuthenticated.set(false);
    this.user.set({ username: '', name: '' });
    this.imageUrl.set(null); // Clear the image URL on logout
    sessionStorage.removeItem('auth_user');
    // Clear any previous error messages
    this.errorMessage.set(null);
    console.log('User logged out.');
  }
}
