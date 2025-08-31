import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let user;

// get current session (account signed in)
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
window.location.href = 'login.html'; // force login if not logged in
}
user = session.user;

// if user is logged in, fetch their display name and score
if (user) {
    const { data, error } = await supabase
        .from('users')
        .select('display_name, score')
        .eq('user_id', user.id) // match Supabase Auth user ID
        .single();

    if (error) {
        console.error('Error fetching display name:', error);
    } else {
        /*
      // get score for html 
        const scoreElement = document.getElementById('user-score');
        console.log('score', data.score);
        scoreElement.textContent = `Score: ${data.score || 0}`;*/

        // update name for html
        const figurinesLabel = document.querySelector('label[for="name"]');
        figurinesLabel.textContent = `${data.display_name}'s Figurines`;

        //update score display at first
        updateScoreDisplay(data.score || 0);

        // calculate and update score on page load
        await updateUserScore(user.id);
    }
}



// get all figurines linked the user.id
const { data, error } = await supabase
    .from('figurines')
    .select('*')
    .eq('user_id', user.id);

if (error) { //error handling
    console.error('Failed to load figurines:', error);
} else {
    const container = document.getElementById('figurine-list');
    
    // sort figurines by date acquired, newest first
    const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.date_acquired || 0); // fallback to epoch if missing
        const dateB = new Date(b.date_acquired || 0);
        return dateB - dateA; // descending order
    });
    
    // display each figurine logic
    // includes name, image url, and date acquired
    sortedData.forEach(fig => {

        const card = document.createElement('div');
        card.className = 'figurine-card';

        // if secret figurine, add badge
        if (fig.secret === true) {
            const secretBadge = document.createElement('div');
            secretBadge.className = 'secret-badge';
            secretBadge.textContent = 'SECRET';
            card.appendChild(secretBadge);
        }

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
        
        // image error handling
        img.onerror = () => {
            console.warn('Image failed to load:', fig.image_url);
        };
        
    });
}

// logout button logic
// this will sign out the user and redirect to login page
document.getElementById('logout-button').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error.message);
    } else {
        alert('Logged out successfully.');
        window.location.href = 'login.html';
    }
});

// remove button logic for removing from 'figurines' table
// this will also remove from the DOM
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

        //update score after successful removal
        await updateUserScore(user.id);
      }
    });

    card.appendChild(removeButton);
}

// helper to update the score display in html
function updateScoreDisplay(score) {
  const scoreElement = document.getElementById('user-score');
  if (scoreElement) {
    scoreElement.textContent = `Score: ${score}`;
  } 
}

/* updates user score whenever there is a change (add, remove) 
Non-Secret figurine: 10 points
Secret figurine: 50 points
For every 10 figurines in the same category: 5-point bonus
Collect 15 of the exact same Pop Mart figurine collection: special 20-point bonus */
async function updateUserScore(userId) {
  // get all figurines linked to user
  const { data: figurines, error } = await supabase
    .from('figurines')
    .select('name, category, secret')
    .eq('user_id', userId);

  // error handling
    if (error) {
        console.error('Error fetching figurines:', error);
        return;
    }

  // start at 0 score
  let score = 0;

  // create dictionaries to track categories and names count
  const categoryCounts = {};
  const nameCounts = {};

  figurines.forEach(fig => {
    // secret or nonsecret logic
    if (fig.secret === true) {
      score += 50;
    } else {
      score += 10;
    }

    // track category number count
    categoryCounts[fig.category] = (categoryCounts[fig.category] || 0) + 1;

    // track name number count
    nameCounts[fig.name] = (nameCounts[fig.name] || 0) + 1;
  });

  // add bonus points for categories (5 points per 10 figurines)
  for (const cat in categoryCounts) {
    // divide by 10 to get number of 10s, then multiply by 5 for bonus
    // 25 figurines in category / 10 = 2 * 5 = 10 bonus points
    const bonus = Math.floor(categoryCounts[cat] / 10) * 5;
    score += bonus;
  }

  // add bonus points for names (20 points per 15 same-named figurines)
  for (const name in nameCounts) {
    // divide by 15 to get number of 15s, then multiply by 20 for bonus
    // 30 figurines with same name / 15 = 2 * 20 = 40 bonus points
    const bonus = Math.floor(nameCounts[name] / 15) * 20;
    score += bonus;
  }

  console.log('Calculated score:', score); //debug 

  // update user score in database
  const { error: updateError } = await supabase
    .from('users')
    .update({ score })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Failed to update user score:', updateError);
  } else {
    console.log('User score updated successfully');
    // update score display on page
    updateScoreDisplay(score);
  }
}

