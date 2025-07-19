window.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    categoryFilter();
    logSavedFigurines();
});

async function logSavedFigurines() {
    const saved = JSON.parse(localStorage.getItem('myFigurineList')) || [];
    console.log('saved figurines: ', saved);
}

//*** gets and loads all categories into html dropdown menu
async function loadCategories() {
    // get the categories
    const response = await fetch('/Frontend/categories.txt');
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

//*** saves each added item to a list
async function saveToLocalStorage(currFigurine) {

    // load up existing list or create a new one
    let saved = JSON.parse(localStorage.getItem('myFigurineList')) || [];

    // add new figurine
    saved.push(currFigurine);

    // save back to local storage
    localStorage.setItem('myFigurineList', JSON.stringify(saved));
}

//*** load the figurines in, and has 'add' functionality
// called onSecretClick(), onNotSecretClick(), and saveToLocalStorage()
async function categoryFilter() {
    // loads csv sorted blind boxes
    const response = await fetch('/Frontend/sorted_blind_boxes_with_category.csv');
    const dataCSV = await response.text();

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
        const filtered = figurines.filter(f => f.category === selected);
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
                        // alert user
                        alert('Non-Secret option clicked for ' + fig.Name);
                        
                        // create attributes for figurine
                        const figToSave = {
                            name: fig.Name,
                            image: fig['Image URL'],
                            category: fig.category,
                            secret: 'no'
                        };
                        // call method to save to local storage
                        saveToLocalStorage(figToSave);
                        popup.style.display = 'none';
                        overlay.style.display = 'none';
                        
                        cleanup();
                    }

                    function onSecretClick() {
                        // alert user
                        alert('Secret option clicked for ' + fig.Name);
                        
                        // create attributes for figurine
                        const figToSave = {
                            name: fig.Name,
                            image: fig['Image URL'],
                            category: fig.category,
                            secret: 'yes'
                        };
                        // call method to save to local storage
                        saveToLocalStorage(figToSave);
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