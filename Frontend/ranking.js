import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let user;

window.addEventListener('DOMContentLoaded', () => {
    // all methods called here
});

async function 