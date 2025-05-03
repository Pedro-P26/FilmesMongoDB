let allMovies = [];
let currentPage = 1;
const limit = 20;

function renderMovieList(movies) {
  const ul = document.getElementById('movie-list');
  ul.innerHTML = '';

  if (movies.length === 0) {
    ul.innerHTML = '<p>Nenhum filme encontrado.</p>';
    return;
  }

  movies.forEach(movie => {
    const li = document.createElement('li');
    li.dataset.id = movie._id;

    li.innerHTML = `
      <img src="${movie.poster || 'https://via.placeholder.com/300x450?text=Sem+Imagem'}" alt="${movie.title}" class="movie-poster">
      <h3>${movie.title}</h3>
    `;

    li.addEventListener('click', () => showMovieDetails(movie._id));
    ul.appendChild(li);
  });
}

function renderPagination(total) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(total / limit);
  const maxPagesToShow = 5;
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + maxPagesToShow - 1);

  const summary = document.createElement('div');
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);
  summary.textContent = `${startItem} - ${endItem} de ${total} filmes`;
  summary.className = 'pagination-summary';
  paginationContainer.appendChild(summary);

  const nav = document.createElement('div');
  nav.className = 'pagination-nav';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchMovies();
    }
  });
  nav.appendChild(prevBtn);

  if (start > 1) {
    nav.appendChild(createPageButton(1));
    if (start > 2) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      nav.appendChild(dots);
    }
  }

  for (let i = start; i <= end; i++) {
    nav.appendChild(createPageButton(i));
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      nav.appendChild(dots);
    }
    nav.appendChild(createPageButton(totalPages));
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies();
    }
  });
  nav.appendChild(nextBtn);

  paginationContainer.appendChild(nav);
}

function createPageButton(pageNumber) {
  const btn = document.createElement('button');
  btn.textContent = pageNumber;
  if (pageNumber === currentPage) {
    btn.className = 'active';
  }
  btn.addEventListener('click', () => {
    currentPage = pageNumber;
    fetchMovies();
  });
  return btn;
}

function showMovieDetails(id) {
  fetch(`/api/movie/${id}`)
    .then(res => res.json())
    .then(data => {
      const detailsDiv = document.getElementById('movie-details');
      if (!data.movie) {
        detailsDiv.innerHTML = '<p>Filme não encontrado.</p>';
        return;
      }

      const { movie, comments } = data;
      detailsDiv.dataset.movieId = id;

      detailsDiv.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="${movie.poster || 'https://via.placeholder.com/300x450?text=Sem+Imagem'}" alt="${movie.title}" class="movie-poster" style="max-width: 300px; margin-bottom: 1rem;">
        <p><strong>Gênero:</strong> ${movie.genres?.join(', ') || 'N/A'}</p>
        <p><strong>Nota:</strong> ${movie.imdb?.rating || 'N/A'}</p>
        <p><strong>Sinopse:</strong> ${movie.plot || 'N/A'}</p>

        <h3>Comentários:</h3>
        <ul id="comment-list">
          ${comments.length > 0
            ? comments.map(c => `
              <li data-id="${c._id}">
                <strong>${c.name}</strong>: ${c.text}
                <button class="edit-comment" data-id="${c._id}">Editar</button>
                <button class="delete-comment" data-id="${c._id}">Apagar</button>
              </li>`).join('')
            : '<li>Sem comentários disponíveis.</li>'
          }
        </ul>
        <div>
          <input type="text" id="new-comment-name" placeholder="Nome..." />
          <textarea id="new-comment-text" placeholder="Comentário..."></textarea>
          <button id="submit-comment">Comentar</button>
        </div>
      `;

      detailsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

      document.querySelectorAll('.edit-comment').forEach(btn => {
        btn.addEventListener('click', () => {
          const li = btn.closest('li');
          const commentId = btn.getAttribute('data-id');
          const commentName = li.querySelector('strong').textContent;
          const commentText = li.childNodes[1].textContent.split(':').slice(1).join(':').trim();

          document.getElementById('new-comment-name').value = commentName;
          document.getElementById('new-comment-text').value = commentText;
          const submitBtn = document.getElementById('submit-comment');
          submitBtn.textContent = 'Atualizar Comentário';

          submitBtn.onclick = () => {
            updateComment(commentId);
          };
        });
      });

      document.querySelectorAll('.delete-comment').forEach(btn => {
        btn.addEventListener('click', () => {
          const commentId = btn.getAttribute('data-id');
          if (confirm('Tens a certeza que queres apagar este comentário?')) {
            deleteComment(commentId);
          }
        });
      });

      setSubmitButtonForAdd(id);
    })
    .catch(err => {
      console.error('Erro ao procurar detalhes do filme:', err);
    });
}

function setSubmitButtonForAdd(movieId) {
  const submitBtn = document.getElementById('submit-comment');
  submitBtn.textContent = 'Comentar';
  submitBtn.onclick = () => {
    const name = document.getElementById('new-comment-name').value;
    const text = document.getElementById('new-comment-text').value;
    if (name && text) {
      addComment(movieId, name, text);
    }
  };
}

function updateComment(commentId) {
  const newName = document.getElementById('new-comment-name').value;
  const newText = document.getElementById('new-comment-text').value;
  if (newName && newText) {
    fetch(`/api/comment/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName, text: newText }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Comentário atualizado com sucesso!');
        showMovieDetails(document.getElementById('movie-details').dataset.movieId);
      }
    })
    .catch(err => {
      console.error('Erro ao atualizar comentário:', err);
    });
  }
}

function deleteComment(commentId) {
  fetch(`/api/comment/${commentId}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Comentário removido com sucesso!');
      const movieId = document.getElementById('movie-details').dataset.movieId;
      showMovieDetails(movieId);
    }
  })
  .catch(err => {
    console.error('Erro ao remover comentário:', err);
  });
}

function addComment(movieId, name, text) {
  fetch(`/api/movie/${movieId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, text }),
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert('Comentário adicionado com sucesso!');
      showMovieDetails(movieId);
    }
  })
  .catch(err => {
    console.error('Erro ao adicionar comentário:', err);
  });
}

function handleSearchInput(e) {
  const searchTerm = e.target.value.toLowerCase();
  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm)
  );
  renderMovieList(filteredMovies);
}

function fetchMovies() {
  fetch(`/api/movies?page=${currentPage}&limit=${limit}`)
    .then(res => res.json())
    .then(data => {
      allMovies = data.movies;
      renderMovieList(data.movies);
      renderPagination(data.total);
    })
    .catch(err => {
      console.error('Erro ao procurar filmes:', err);
    });
}

document.getElementById('search-input').addEventListener('input', handleSearchInput);
fetchMovies();
