import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://ugjfitiztijiyxpzzhxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnamZpdGl6dGlqaXl4cHp6aHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2NzAsImV4cCI6MjA2ODUzMzY3MH0.UBgoJhBcJIedNEcFsn3LV0Q3jpyHTKBwsg5UOnGVzsw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let user;

window.addEventListener('DOMContentLoaded', async () => {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        user = session.user;
    }
    
    // Load and display leaderboard
    await loadLeaderboard();
});

// Function to interpolate between two colors
function interpolateColor(startColor, endColor, factor) {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    // Convert RGB to hex
    const rgbToHex = (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    
    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);
    
    const r = Math.round(start.r + factor * (end.r - start.r));
    const g = Math.round(start.g + factor * (end.g - start.g));
    const b = Math.round(start.b + factor * (end.b - start.b));
    
    return rgbToHex(r, g, b);
}

async function loadLeaderboard() {
    try {
        // Fetch all users with their display names and scores
        const { data: users, error } = await supabase
            .from('users')
            .select('display_name, score')
            .order('score', { ascending: false }); // highest score first

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return;
        } else {
            // Print all display names to console
            console.log('All display names:');
            users.forEach((userData, index) => {
                console.log(`${index + 1}. ${userData.display_name || 'Anonymous'}`);
            });
        }

        // Get the leaderboard container
        const leaderboard = document.getElementById("leaderboard");
        
        // Clear existing content
        leaderboard.innerHTML = '';

        const maxWidth = window.innerWidth * 0.9; // 90% of screen width
        const minWidth = window.innerWidth * 0.4; // lowest rank still visible

        // Add each user to the leaderboard
        users.forEach((userData, index) => {
            const item = document.createElement("div");
            item.className = "leaderboard-item";

            // Calculate width scaling (first bar longest, last bar shortest)
            const width = maxWidth - (index * ((maxWidth - minWidth) / Math.max(users.length - 1, 1)));
            item.style.width = width + "px";

            // Calculate gradient color from #ff0844 (rank 1) to #fad7ee (last rank)
            const colorFactor = users.length > 1 ? index / (users.length - 1) : 0;
            const backgroundColor = interpolateColor('#ff0844', '#fad7ee', colorFactor);
            item.style.backgroundColor = backgroundColor;

            // Rank number
            const rank = document.createElement("span");
            rank.textContent = `${index + 1}`;
            rank.className = "rank-number";

            // Name
            const name = document.createElement("span");
            name.textContent = userData.display_name || 'Anonymous';
            name.className = "player-name";

            // Score
            const score = document.createElement("span");
            score.textContent = userData.score || 0;
            score.className = "player-score";

            item.appendChild(rank);
            item.appendChild(name);
            item.appendChild(score);

            leaderboard.appendChild(item);
        });

        // Update user count display
        const userCountElement = document.getElementById('user-count');
        if (userCountElement) {
            userCountElement.textContent = `Total Users: ${users.length}`;
        }

    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
}