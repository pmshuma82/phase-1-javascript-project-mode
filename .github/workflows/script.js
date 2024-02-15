// Function to fetch book data from Google Books API
async function searchBooks(query) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Function to add a book to favorites
async function addToFavorites(bookId) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const data = await response.json();
        const { volumeInfo: { title, authors, imageLinks } } = data;

        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.find(favorite => favorite.id === bookId)) {
            favorites.push({ id: bookId, title, authors, image: imageLinks?.thumbnail });
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesPanel();
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
    }
}

// Function to remove a book from favorites
function removeFromFavorites(bookId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(favorite => favorite.id !== bookId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesPanel();
}

// Function to update favorites panel
async function updateFavoritesPanel() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesPanel = document.getElementById('favoritesPanel');
    favoritesPanel.innerHTML = '';
    for (const { id, title, authors, image } of favorites) {
        const favoriteItem = document.createElement('div');
        favoriteItem.classList.add('favorite-item');
        const img = document.createElement('img');
        img.src = image || 'https://via.placeholder.com/150';
        img.alt = title;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeFromFavorites(id));
        favoriteItem.appendChild(img);
        const titleElement = document.createElement('p');
        titleElement.textContent = title;
        favoriteItem.appendChild(titleElement);
        const authorElement = document.createElement('p');
        authorElement.textContent = `Author: ${authors ? authors.join(', ') : 'Unknown Author'}`;
        favoriteItem.appendChild(authorElement);
        favoriteItem.appendChild(removeButton);
        favoritesPanel.appendChild(favoriteItem);
    }
}

// Function to display search results with basic information
function displaySearchResults(books) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    books.forEach(book => {
        const { id, volumeInfo: { title, authors, imageLinks } } = book;
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');
        bookCard.innerHTML = `
            <img src="${imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="${title}">
            <h2>${title}</h2>
            <p>${authors ? authors.join(', ') : 'Unknown Author'}</p>
            <button class="view-details-button" data-book-id="${id}">View Details</button>
            <button class="add-to-favorites-button" data-book-id="${id}">Add to Favorites</button>
        `;
        searchResults.appendChild(bookCard);
    });
}

// Function to fetch and display detailed book information
async function showBookDetails(bookId) {
    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const data = await response.json();
        const { volumeInfo: { title, authors, description, imageLinks } } = data;
        const bookDetails = document.getElementById('bookDetails');
        bookDetails.innerHTML = `
            <img src="${imageLinks?.thumbnail || 'https://via.placeholder.com/150'}" alt="${title}">
            <h2>${title}</h2>
            <p>Authors: ${authors ? authors.join(', ') : 'Unknown Author'}</p>
            <p>Description: ${description || 'No description available'}</p>
        `;
        bookDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
        console.error('Error fetching book details:', error);
        const bookDetails = document.getElementById('bookDetails');
        bookDetails.innerHTML = 'Error fetching book details';
    }
}

// Event listener for search button
document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        const books = await searchBooks(query);
        displaySearchResults(books);
        document.getElementById('searchResults').style.display = 'block';
    } else {
        document.getElementById('searchResults').style.display = 'none';
    }
});

// Event listener for view details buttons
document.getElementById('searchResults').addEventListener('click', async (event) => {
    if (event.target.classList.contains('view-details-button')) {
        const bookId = event.target.getAttribute('data-book-id');
        await showBookDetails(bookId);
    }
});

// Event listener for add to favorites buttons
document.getElementById('searchResults').addEventListener('click', async (event) => {
    if (event.target.classList.contains('add-to-favorites-button')) {
        const bookId = event.target.getAttribute('data-book-id');
        await addToFavorites(bookId);
    }
});

// New event listener for keyboard events
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        // Trigger search when Enter key is pressed
        const query = document.getElementById('searchInput').value.trim();
        if (query) {
            searchBooks(query).then(books => {
                displaySearchResults(books);
                document.getElementById('searchResults').style.display = 'block';
            });
        } else {
            document.getElementById('searchResults').style.display = 'none';
        }
    }
});

// Initialize favorites panel
updateFavoritesPanel();


