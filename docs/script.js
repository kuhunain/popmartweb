// supabase initialization
const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
let supabaseClient;

window.addEventListener('DOMContentLoaded', () => {
    initializeSupabase();

    // call only if categories exists - meaning on add page
    if (document.getElementById('categories')) {
        loadCategories();
        categoryFilter();
    }
    
    // save figurines to local storage -- subject to change
    //logSavedFigurines();

    //login handling
    loginHandling();
});

async function initializeSupabase() {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // enable session persistence for user login
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        // user is logged in
        console.log('User is still logged in:', session.user);
    } else {
        // not logged in
        console.log('No user session found.');
    }

    const accountButton = document.getElementById('account-button');
    if (accountButton) {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                accountButton.href = 'account.html';
            } else {
                accountButton.href = 'login.html';
            }
        });
    }
}

async function loginHandling() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // authenticate user
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.log('login failed');
                alert('Login failed: ' + error.message);
            } else {
                console.log('login successful');
                alert('Welcome back, ' + data.user.email + '!');
                // redirect to index (home) page
                window.location.href = 'index.html'; 
            }
        });
    }
}

/*async function logSavedFigurines() {
    const saved = JSON.parse(localStorage.getItem('myFigurineList')) || [];
    console.log('saved figurines: ', saved);
}*/

//*** gets and loads all categories into html dropdown menu
async function loadCategories() {
    // get the categories
    //const response = await fetch('docs/categories.txt');
    const response = await fetch('../category.txt');
    const categories = await response.text();

    // create an arr of all categories, and remove white space
    const categoryList = categories.split('\n').filter(cat => cat.trim() !== '');
    //const categoryList = ['Hello', 'No', 'Yes'];


    // references html id that is "categories"
    const dropdown = document.getElementById('categories');

    // for each loop
    categoryList.forEach(category => {
        // creates option element for dropdown
        const option = document.createElement('option');
        // set options value to current category
        option.value = category.trim();
        // set text inside option to category
        option.textContent = category.trim();

        // add to "categories"
        dropdown.appendChild(option);

    });
}

//*** parses through CSV File of all blind boxes, and converts to array with Name, Image Url, and Category type
function parseCSV(csv) {
    // split all rows by newline
    const rows = csv.trim().split('\n');
    // headers not included
    const headers = rows[0].split(',').map(h => h.trim());
    
    return rows.slice(1).map(line => {
        const values = [];
        let current = '';
        let insideQuotes = false;

        // add all 3 sections for each line to values obj
        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"' && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        // add each corresponding value to index of headers to obj
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = values[i] || '';
        });
        return obj;
    });
}

/*
//*** saves each added item to a list
async function saveToLocalStorage(currFigurine) {

    // load up existing list or create a new one
    let saved = JSON.parse(localStorage.getItem('myFigurineList')) || [];

    // add new figurine
    saved.push(currFigurine);

    // save back to local storage
    localStorage.setItem('myFigurineList', JSON.stringify(saved));
}*/

async function saveToUserStorage(figToSave) {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("You must be logged in to save figurines.");
        return;
    }

    // Add user_id to the figurine object
    const figurineData = {
        id: crypto.randomUUID(), // Generate a unique ID for the figurine saved
        user_id: user.id,  // users unique ID
        name: figToSave.name,
        image_url: figToSave.image,
        category: figToSave.category,
        secret: figToSave.secret === 'yes' ? true : false, // convert to boolean
        date_acquired: figToSave.date_acquired || null, // use date acquired if provided
        created_at: new Date().toISOString() // add timestamp
    };

    // Insert into 'figurines' table
    const { error } = await supabaseClient
        .from('figurines')
        .insert([figurineData]);

    if (error) {
        console.error('Error saving figurine:', error.message);
        alert("Failed to save figurine.");
    } else {
        console.log("Figurine saved successfully!");
        alert("Figurine saved!");
    }
}


//*** load the figurines in, and has 'add' functionality
// called onSecretClick(), onNotSecretClick(), and saveToLocalStorage()
async function categoryFilter() {
    // loads csv sorted blind boxes
    //const response = await fetch('docs/sorted_blind_boxes_with_category.csv');
    const response2 = await fetch('../new_bb.csv');
    const dataCSV = await response2.text();

    const figurines = parseCSV(dataCSV);

    console.log('parsed figurines:', figurines);

    // get references to 2 elements in HTML (dropdown menu, container div)
    const dropdown = document.getElementById('categories');
    const displayArea = document.getElementById('figurines');
    
    // listen for changes, runs whenever user picks new categories
    dropdown.addEventListener('change', () => {
        const selected = dropdown.value;
        console.log('Selected category:', selected);
        displayArea.innerHTML = ''; // Clear previous results

        if (!selected) return;

        // get all selected categories in figurines array
        const filtered = figurines.filter(f => f.Category === selected);
        console.log('filtered', filtered);
        //console.log('Display area:', displayArea);
        
        // for each matching figurine
        filtered.forEach(fig => {
            // debug
            //console.log('Display area:', displayArea);
            // create new div element for card
            const card = document.createElement('div');
            card.className = 'figurine-card';

            // add image and figurine name
            const img = new Image();
            img.src = fig['Image URL'];
            img.alt = fig.Name;

            // image loaded, add image to card and name to card
            // finally add it to obj
            img.onload = () => {
                card.appendChild(img);
                const name = document.createElement('h4');
                name.textContent = fig.Name;
                card.appendChild(name);

                // button logic
                const addButton = document.createElement('button');
                addButton.textContent = 'Add';
                addButton.className = 'add-button';

                addButton.addEventListener('click', () => {
                    // pop-up logic for if secret or not
                    const popup = document.getElementById('popup');
                    const overlay = document.getElementById('overlay');
                    const nonSecret = document.getElementById('nonSecret');
                    const secret = document.getElementById('secret');

                    popup.style.display = 'block';
                    overlay.style.display = 'block';

                    function onNonSecretClick() {
                        const dateValue = document.getElementById('figurine-date').value; //Example output: '2025-07-19'
                        if (!dateValue) {
                            alert("Please select a date!");
                            return;
                        }
                        // alert user
                        alert('Non-Secret option clicked for ' + fig.Name);
                        
                        // create attributes for figurine
                        const figToSave = {
                            name: fig.Name,
                            image: fig['Image URL'],
                            category: fig.category,
                            secret: 'no',
                            date_acquired: dateValue // add date acquired
                        };
                        // call method to save to local storage
                        saveToUserStorage(figToSave);
                        popup.style.display = 'none';
                        overlay.style.display = 'none';
                        
                        cleanup();
                    }

                    function onSecretClick() {
                        const dateValue = document.getElementById('figurine-date').value; //Example output: '2025-07-19'

                        if (!dateValue) {
                            alert("Please select a date!");
                            return;
                        }

                        // alert user
                        alert('Secret option clicked for ' + fig.Name);
                        
                        // create attributes for figurine
                        const figToSave = {
                            name: fig.Name,
                            image: fig['Image URL'],
                            category: fig.category,
                            secret: 'yes',
                            date_acquired: dateValue
                        };
                        // call method to save to local storage
                        saveToUserStorage(figToSave);
                        popup.style.display = 'none';
                        overlay.style.display = 'none';
                        
                        cleanup();
                    }

                    // Cleanup event listeners to avoid stacking listeners on multiple clicks
                    function cleanup() {
                        nonSecret.removeEventListener('click', onNonSecretClick);
                        secret.removeEventListener('click', onSecretClick);
                    }

                    // Add listeners
                    nonSecret.addEventListener('click', onNonSecretClick);
                    secret.addEventListener('click', onSecretClick);

                    // clicking outside the box goes back to original website
                    overlay.onclick = () => {
                        popup.style.display = 'none';
                        overlay.style.display = 'none';
                        cleanup();
                    };
                });

                updateUserScore(supabaseClient.auth.getUser().then(({ data }) => data.user.id));
                card.appendChild(addButton);
                displayArea.appendChild(card);
            }

            // if no image loading
            img.onerror = () => {
                console.warn('Image failed to load');
            }

        });
    });
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
    if (fig.secret === 'yes') {
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

  // update user score in database
  const { error: updateError } = await supabase
    .from('users')
    .update({ score })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Failed to update user score:', updateError);
  }
}
