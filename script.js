// Configurações Globais
const limit = 20;
let offset = 0;
let currentPage = 1;

// Elementos do DOM
const pokemonList = document.getElementById('pokemon-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const errorMessage = document.getElementById('error-message');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const modal = document.getElementById('pokemon-modal');
const modalDetails = document.getElementById('pokemon-details');
const closeModal = document.querySelector('.close-modal');

/**
 * Função para buscar a lista de Pokémons da API
 */
async function fetchPokemons(currentOffset) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`);
        if (!response.ok) throw new Error('Erro ao buscar Pokémons');
        const data = await response.json();
        
        // Limpar a lista atual e renderizar os novos Pokémons
        renderPokemonList(data.results);
        updatePaginationButtons(data.next, data.previous);
    } catch (error) {
        console.error('Erro:', error);
        showError();
    }
}

/**
 * Função para renderizar os cards de cada Pokémon
 */
async function renderPokemonList(pokemons) {
    pokemonList.innerHTML = ''; // Limpa o grid
    errorMessage.classList.add('hidden'); // Esconde erro caso exista

    for (const pokemon of pokemons) {
        // Para cada Pokémon na lista, precisamos buscar os detalhes (imagem)
        try {
            const res = await fetch(pokemon.url);
            const data = await res.json();
            
            const card = createPokemonCard(data);
            pokemonList.appendChild(card);
        } catch (error) {
            console.error('Erro ao buscar detalhes do Pokémon:', error);
        }
    }
}

/**
 * Cria o elemento HTML do card de um Pokémon
 */
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    const primaryType = pokemon.types[0].type.name;
    card.className = `pokemon-card type-${primaryType}`;
    
    // Formata o ID (ex: #001)
    const pokemonId = String(pokemon.id).padStart(3, '0');
    
    // Tipos para o card
    const types = pokemon.types.map(typeInfo => 
        `<span class="type-badge ${typeInfo.type.name}">${typeInfo.type.name}</span>`
    ).join('');

    // Conteúdo do Card: ID, Imagem, Nome e Tipos
    card.innerHTML = `
        <span class="pokemon-id">#${pokemonId}</span>
        <img src="${pokemon.sprites.front_default || 'https://via.placeholder.com/120'}" alt="${pokemon.name}">
        <div class="pokemon-info">
            <h3>${pokemon.name}</h3>
            <div class="pokemon-types">
                ${types}
            </div>
        </div>
    `;

    // Evento de clique para mostrar detalhes
    card.onclick = () => showPokemonDetails(pokemon);
    
    return card;
}

/**
 * Função para buscar e exibir detalhes no Modal
 */
function showPokemonDetails(pokemon) {
    // Tipos do Pokémon (mapeia para badges)
    const types = pokemon.types.map(typeInfo => 
        `<span class="type-badge ${typeInfo.type.name}">${typeInfo.type.name}</span>`
    ).join('');

    // Preencher o modal com as informações detalhadas
    modalDetails.innerHTML = `
        <h2 class="details-name">${pokemon.name}</h2>
        <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}">
        <div class="details-info">
            <strong>Tipos:</strong> ${types}
        </div>
        <div class="details-info">
            <strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m
        </div>
        <div class="details-info">
            <strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg
        </div>
    `;

    modal.classList.remove('hidden'); // Mostra o modal
}

/**
 * Lógica de Busca por Nome
 */
async function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        // Se a busca estiver vazia, volta para a lista normal
        offset = 0;
        currentPage = 1;
        fetchPokemons(offset);
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');
        
        const data = await response.json();
        
        // Limpa a lista e mostra apenas o resultado da busca
        pokemonList.innerHTML = '';
        errorMessage.classList.add('hidden');
        const card = createPokemonCard(data);
        pokemonList.appendChild(card);
        
        // Desabilitar paginação durante a busca
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = 'Resultado da busca';

    } catch (error) {
        pokemonList.innerHTML = '';
        errorMessage.classList.remove('hidden');
        console.error('Erro na busca:', error);
    }
}

/**
 * Atualiza os botões de paginação
 */
function updatePaginationButtons(next, previous) {
    prevBtn.disabled = !previous;
    nextBtn.disabled = !next;
    pageInfo.textContent = `Página ${currentPage}`;
}

/**
 * Funções para Navegação entre Páginas
 */
function nextPage() {
    offset += limit;
    currentPage++;
    fetchPokemons(offset);
    window.scrollTo(0, 0); // Volta para o topo ao trocar de página
}

function prevPage() {
    if (offset >= limit) {
        offset -= limit;
        currentPage--;
        fetchPokemons(offset);
        window.scrollTo(0, 0);
    }
}

/**
 * Event Listeners
 */
searchButton.addEventListener('click', handleSearch);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

nextBtn.addEventListener('click', nextPage);
prevBtn.addEventListener('click', prevPage);

closeModal.onclick = () => modal.classList.add('hidden');

// Fechar modal ao clicar fora dele
window.onclick = (event) => {
    if (event.target === modal) {
        modal.classList.add('hidden');
    }
};

// Inicialização: Busca os primeiros 20 Pokémons
fetchPokemons(offset);
