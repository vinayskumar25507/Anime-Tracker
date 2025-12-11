// 1. DATABASE SETUP
// We check if there is data in LocalStorage. If not, start with an empty list.
// Requirement: Backend Database for User Data 
let animeList = JSON.parse(localStorage.getItem('aniFocusDB'));
if (animeList == null) {
    animeList = [];
}

const grid = document.getElementById('animeGrid');
let currentFilter = 'All';

// 2. MAIN DISPLAY FUNCTION
function render() {
    grid.innerHTML = "";
    
    // Filter the list based on which tab is clicked
    let filteredList = [];
    if (currentFilter === 'All') {
        filteredList = animeList;
    } else {
        // Simple filter logic
        for (let i = 0; i < animeList.length; i++) {
            if (animeList[i].status === currentFilter) {
                filteredList.push(animeList[i]);
            }
        }
    }

    // Show message if list is empty
    if (filteredList.length === 0) {
        grid.innerHTML = '<p style="color:#ccc; padding:20px;">No anime found here. Add some using the Admin Panel!</p>';
        return;
    }

    // Loop through data and create HTML cards
    filteredList.forEach(function(anime) {
        
        // Calculate Progress Percentage
        let percent = 0;
        let displayWatched = anime.watched;
        let actionButtonHTML = '';

        // Requirement: Progress Tracking [cite: 22]
        if (anime.status === 'Completed') {
            percent = 100;
            displayWatched = anime.total;
            // Show "Watch Again" button
            actionButtonHTML = '<button class="btn-restart" onclick="watchAgain(' + anime.id + ')">Watch Again</button>';
        } else {
            if (anime.total > 0) {
                percent = (anime.watched / anime.total) * 100;
            }
            // Show "+1 Ep" button
            actionButtonHTML = '<button class="btn-ep" onclick="updateEp(' + anime.id + ', 1)">+1 Ep</button>';
        }

        // Create the card div
        const card = document.createElement('div');
        card.classList.add('card');
        
        // Use Template Literals (Backticks) for cleaner HTML
        card.innerHTML = `
            <img src="${anime.image}" alt="${anime.title}">
            <div class="card-info">
                <div class="card-title">${anime.title}</div>
                <div class="card-meta">Status: <span style="color:#4361ee">${anime.status}</span></div>
                
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <div style="font-size: 12px; margin-bottom: 8px; color: #ccc;">
                    Progress: ${displayWatched} / ${anime.total} eps
                </div>

                <div class="card-actions">
                    ${actionButtonHTML}
                    <button class="btn-del" onclick="deleteAnime(${anime.id})">Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 3. ADMIN PANEL: ADD ANIME
function addAnime() {
    // Get values from input boxes
    const title = document.getElementById('adminTitle').value;
    const img = document.getElementById('adminImg').value;
    const total = parseInt(document.getElementById('adminTotal').value);
    const status = document.getElementById('adminStatus').value;

    if (title === "" || isNaN(total)) {
        alert("Please enter a Title and Total Episodes.");
        return;
    }

    // If adding as 'Completed', set watched to total immediately
    let initialWatched = 0;
    if (status === 'Completed') {
        initialWatched = total;
    }

    // Create new object
    const newAnime = {
        id: Date.now(), // Uses time as a unique ID
        title: title,
        image: img || "https://via.placeholder.com/220x280?text=No+Image",
        total: total,
        watched: initialWatched,
        status: status
    };

    // Add to list and save
    animeList.push(newAnime);
    saveAndRender();
    
    // Clear the form
    document.getElementById('adminTitle').value = "";
    document.getElementById('adminImg').value = "";
    document.getElementById('adminTotal').value = "";
}

// 4. UPDATE PROGRESS (+1 Episode)
function updateEp(id, amount) {
    // Find the anime by ID
    for (let i = 0; i < animeList.length; i++) {
        if (animeList[i].id === id) {
            
            if (animeList[i].watched < animeList[i].total) {
                animeList[i].watched += amount;

                // Auto-Complete logic
                if (animeList[i].watched >= animeList[i].total) {
                    animeList[i].watched = animeList[i].total;
                    animeList[i].status = "Completed";
                    alert("Show Completed!");
                }
                saveAndRender();
            }
            break;
        }
    }
}

// 5. WATCH AGAIN FUNCTION
function watchAgain(id) {
    for (let i = 0; i < animeList.length; i++) {
        if (animeList[i].id === id) {
            if (confirm("Start watching this again?")) {
                animeList[i].watched = 0;
                animeList[i].status = "Watching";
                saveAndRender();
            }
            break;
        }
    }
}

// 6. DELETE ANIME
function deleteAnime(id) {
    if (confirm("Are you sure you want to delete this?")) {
        // Filter out the one we want to delete
        animeList = animeList.filter(function(anime) {
            return anime.id !== id;
        });
        saveAndRender();
    }
}

// 7. TAB FILTERING
function filterAnime(category) {
    currentFilter = category;
    
    // Highlight the active button
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.innerText === category) {
            btn.classList.add('active');
        }
    });

    render();
}

// 8. SEARCH FUNCTION
function searchLocal() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(function(card) {
        const title = card.querySelector('.card-title').innerText.toLowerCase();
        if (title.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// HELPER: Save to LocalStorage and Refresh
function saveAndRender() {
    localStorage.setItem('aniFocusDB', JSON.stringify(animeList));
    render();
}

// Start the app
render();