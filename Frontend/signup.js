import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('signup-form');
const message = document.getElementById('message');

// display name generation logic
const adjectives = [
  'Molly', 'Dimoo', 'Skullpanda', 'Hirono', 'Pucky', 'Labubu', 'Bunny', 'Crybaby', 'Kubo', 'Nyota'
];
const nouns = [
  'Collector', 'Hunter', 'Fanatic', 'Enthusiast', 'Seeker', 'Master', 'Curator', 'Trader', 'Explorer', 'Connoisseur'
];


/** creates a display name with random adjective, noun, and number, returns all together*/
function generateDisplayName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adj}${noun}${number}`;
}

// once submit clicked
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Generate a display name to include in metadata
  const displayName = generateDisplayName();

  console.log('Attempting signup with:', { email, displayName, passwordLength: password.length });

  try {
    // Sign up with display name in metadata - trigger will handle the rest (in supabase sql editor)
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    console.log('Signup response:', { data: authData, error: signupError });

    if (signupError) {
      console.error('Full signup error:', signupError);
      message.textContent = `Signup error: ${signupError.message}`;
      return;
    }

    if (!authData.user) {
      message.textContent = 'Signup failed: No user data returned.';
      return;
    }

    console.log('Signup successful! User ID:', authData.user.id);
    console.log('Display name:', displayName);
    
    message.textContent = 'Account created successfully, ' + displayName + '! Please check your email to confirm your account.';
    form.reset();

    // redirect to login after, delay to allow user to read message
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 3000);

  } catch (error) {
    console.error('Unexpected error during signup:', error);
    message.textContent = `Unexpected error: ${error.message}`;
  }
});