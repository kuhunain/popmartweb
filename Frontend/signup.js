import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Select DOM elements
const form = document.getElementById('signup-form');
const message = document.getElementById('message');

// word lists for readable names
const adjectives = [
  'Swift', 'Lucky', 'Golden', 'Clever', 'Mighty', 'Silent', 'Bright', 'Brave', 'Happy', 'Cool'
];
const nouns = [
  'Falcon', 'Tiger', 'Eagle', 'Panther', 'Wolf', 'Hawk', 'Shark', 'Bear', 'Lion', 'Fox'
];

// function to create readable display name
function generateDisplayName() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100); // 0-99
  return `${adj}${noun}${number}`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Generate readable display name
  const displayName = generateDisplayName();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName }
    }
  });

  if (error) {
    console.error('Signup error:', error.message);
  } else {
    console.log('Signup success:', data);
    console.log('Assigned display name:', displayName);
  }
});

/*import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('signup-form');
const message = document.getElementById('message');

const {
  data: { session },
  error,
} = await supabase.auth.getSession();

console.log('session access:', session?.access_token);  // should NOT be undefined

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const displayName = document.getElementById('display-name').value.trim();

  // check for uniqueness of display name
  const available = await isDisplayNameAvailable(displayName);
  if (!available) {
    message.textContent = 'Display name is already taken. Please choose another.';
    return;
  }
  
  // sign up with supabase authentication (email and password)
  const { data: authData, error: signupError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signupError) {
    message.textContent = `Signup error: ${signupError.message}`;
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  console.log('session user ID:', userId);  // should NOT be undefined

  if (!userId) {
    message.textContent = 'Signup failed: No user ID returned.';
    return;
  }

  console.log('starting user insert');

  // insert into 'users' table
  const { error: insertError } = await supabase.from('users').insert([
    {
      user_id: userId,
      display_name: displayName,
      score: 0,  // default value
      created_at: new Date().toISOString() // current timestamp
    }
  ]);

  console.log('table should have updated');

  // If DB unique constraint catches a race condition (same time display name chosen)
  if (insertError) {
    // 23505 = unique_violation in Postgres
    if (insertError.code === '23505') {
      message.textContent = 'That display name just got taken. Please choose another.';
    } else {
      message.textContent = `Could not save profile: ${insertError.message}`;
    }
    return;
  }

  // redirect ot login after successful signup
  message.textContent = 'Account created! Please verify your email, then log in.';
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1200);
});
*/
/* check is display name is contained within users
async function isDisplayNameAvailable(name) {
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('display_name', name)
    .limit(1);

  if (error) {
    console.error('display_name check failed:', error.message);
    // Fail closed: treat as not available or show an error to the user
    return false;
  }
  return data.length === 0;
}
  */
