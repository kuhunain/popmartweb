import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let user;

/*window.addEventListener('DOMContentLoaded', () => {
    await checkUserSession();
    fetchAndDisplayFigurines();
    logoutButton();

});*/

//async function checkUserSession() {
    // check for existing user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
    window.location.href = 'login.html'; // force login if not logged in
    }
    user = session.user;
//}

//async function fetchAndDisplayFigurines() {
    // fetch figurines
    const { data, error } = await supabase
        .from('figurines')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
    console.error('Failed to load figurines:', error);
    } else {
        const container = document.getElementById('figurine-list');
        
        data.forEach(fig => {

            const card = document.createElement('div');
            card.className = 'figurine-card';

            const img = new Image();
            img.src = fig.image_url;
            img.alt = fig.name;

            img.onload = () => {
                card.appendChild(img);

                const name = document.createElement('h4');
                name.textContent = fig.name;
                card.appendChild(name);

                const date = document.createElement('div');
                date.className = 'figurine-date';
                date.textContent = fig.date_acquired || ''; // fallback in case it's missing
                card.appendChild(date);


                removeButton(fig, card);

                container.appendChild(card);
            };
            
            img.onerror = () => {
                console.warn('Image failed to load:', fig.image_url);
            };
            
        });
    }
//}

async function removeButton(fig, card) {
    // button logic
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-button';

   

    // add event listener to remove button
    removeButton.addEventListener('click', async () => {
      const { error: deleteError } = await supabase
        .from('figurines')
        .delete()
        .eq('id', fig.id)
        .eq('user_id', user.id) // security check
        
      console.log('Removing figurine:', fig.id);

      if (deleteError) {
        console.error('Failed to remove figurine:', deleteError.message);
      } else {
        console.log('Figurine removed successfully');
        card.remove(); // remove from DOM
      }
    });

    card.appendChild(removeButton);
}

//async function logoutButton() {
    document.getElementById('logout-button').addEventListener('click', async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            alert('Logged out successfully.');
            window.location.href = 'login.html';
        }
    });
//}
