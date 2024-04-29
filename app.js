
function getWeaknessesAndStrengths(typesData) {
    const weaknesses = [];
    const strengths = [];
    typesData.forEach(typeData => {
        typeData.damage_relations.double_damage_from.forEach(weakness => {
            weaknesses.push(weakness.name);
        });
        typeData.damage_relations.double_damage_to.forEach(strength => {
            strengths.push(strength.name);
        });
    });
    return {
        weaknesses: weaknesses.filter((value, index, self) => self.indexOf(value) === index),
        strengths: strengths.filter((value, index, self) => self.indexOf(value) === index),
    };
}


function clearPokemonContainer() {
    const pokemonCardContainer = document.getElementById('pokemon-grid');
    pokemonCardContainer.innerHTML = '';
}

function filterPokemonByName(searchTerm) {
    const pokemonCards = document.querySelectorAll('.pokemon-card');
    
    pokemonCards.forEach(card => {
        const nameElement = card.querySelector('p');
        const pokemonName = nameElement.textContent.toLowerCase();
        card.style.display = pokemonName.includes(searchTerm) ? 'block' : 'none';
    });
}
function getGenerationInfo(pokemonId) {
    return fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`)
    .then(response => response.json())
    .then(speciesData => speciesData.generation.name)
    .catch(error => {
        console.error('Erreur lors de la récupération des informations de génération :', error);
        return null;
    });
}

    function createPokemonCard(pokemonName) {
        const pokemonCardContainer = document.getElementById('pokemon-grid');
    
        return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}/`)
            .then(response => response.json())
            .then(data => {
                const imageElement = document.createElement('img');
                imageElement.src = data.sprites.front_default;
                imageElement.alt = `Image de ${pokemonName}`;
                imageElement.classList.add('pokemon-image');
                imageElement.loading = 'lazy';
    
                const nameElement = document.createElement('p');
                nameElement.classList.add('pokemon-name');  
                nameElement.textContent = `Nom :  ${pokemonName}`;
    
                const typesLabelElement = document.createElement('p');
                typesLabelElement.classList.add('types-label');
                typesLabelElement.textContent = 'Types : ' + data.types.map(type => type.type.name).join(', ');
    
                const weaknessesElement = document.createElement('p');
                weaknessesElement.classList.add('type-info-w');
    
                const strengthsElement = document.createElement('p');
                strengthsElement.classList.add('type-info-s');
    
                Promise.all(data.types.map(type => fetch(`https://pokeapi.co/api/v2/type/${type.type.name}/`)))
                    .then(responses => Promise.all(responses.map(response => response.json())))
                    .then(typesData => {
                        const { weaknesses, strengths } = getWeaknessesAndStrengths(typesData);
    
                        const generationLabelElement = document.createElement('p');
                        generationLabelElement.classList.add('generation-label');
                        getGenerationInfo(data.id)
                            .then(generationName => {
                                generationLabelElement.textContent = `Génération : ${generationName || 'N/A'}`;
    
                                weaknessesElement.innerHTML = `<span class="weaknesses-label">Faiblesses aux :</span> <span>${weaknesses.join(', ')}</span>`;
                                strengthsElement.innerHTML = `<span class="strengths-label">Forces contre :</span> <span>${strengths.join(', ')}</span>`;
                                const pokemonCard = document.createElement('div');
                                pokemonCard.classList.add('pokemon-card');
                                const pokemonInfoContainer = document.createElement('div');
                                pokemonInfoContainer.classList.add('pokemon-info');
                                data.types.forEach(type => {
                                    pokemonCard.classList.add(type.type.name);
                                }); 
                                pokemonInfoContainer.appendChild(nameElement);
                                pokemonInfoContainer.appendChild(typesLabelElement);
                                pokemonCard.appendChild(pokemonInfoContainer);
                                pokemonCard.appendChild(imageElement);
                                pokemonCard.appendChild(weaknessesElement);
                                pokemonCard.appendChild(strengthsElement);
                                pokemonCard.appendChild(generationLabelElement);
                                pokemonCardContainer.appendChild(pokemonCard);
                                return pokemonCardContainer;
                            })
                            .catch(error => {
                                console.error('Erreur lors de la création de la carte Pokémon :', error);
                                return null;
                            });
                    });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des faiblesses et forces :', error);
                return null;
            });
    }
    function handleSearch(event) {
        event.preventDefault();
        const inputValue = document.getElementById('saisie').value.toLowerCase();
    
        if (inputValue.trim() === '') {
            restoreAllPokemon();
        } else {
            clearPokemonContainer();
            createPokemonCard(inputValue);
        }
    }
    function filterPokemonsByType() {
        const selectedType = document.getElementById('pokemon-types-dropdown').value.toLowerCase();

        const pokemonCards = document.querySelectorAll('.pokemon-card');

        pokemonCards.forEach(card => {
            const typesLabel = card.querySelector('.types-label').textContent.toLowerCase();
            card.style.display = typesLabel.includes(selectedType) ? 'block' : 'none';
        });
    }
    function filterPokemonsByGeneration() {
        const selectedGeneration = document.getElementById('generation-select').value.toLowerCase();
        const pokemonCards = document.querySelectorAll('.pokemon-card');

        pokemonCards.forEach(card => {
            const generationLabel = card.querySelector('.generation-label').textContent.toLowerCase();
            const shouldDisplay = selectedGeneration === '0' || generationLabel.includes(selectedGeneration);

            card.style.display = shouldDisplay ? 'block' : 'none';
        });
    }
    

    async function fetchAllPokemon() {
        const url = 'https://pokeapi.co/api/v2/pokemon/?limit=898';
    
        try {
            const response = await fetch(url);
            const data = await response.json();
            const pokemonList = data.results;
    
            const pokemonCardContainer = document.getElementById('pokemon-grid');
            const cards = await Promise.all(pokemonList.map(async (pokemon) => {
                try {
                    const response = await fetch(pokemon.url);
                    const pokemonData = await response.json();
                    return createPokemonCard(pokemonData.name);
                } catch (error) {
                    console.error('Erreur lors de la création de la carte Pokémon :', error);
                    return null;
                }
            }))
            cards.forEach(card => {
                pokemonCardContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la liste des Pokémon :', error);
        }
    }
    
    function restoreAllPokemon() {
        clearPokemonContainer();
        fetchAllPokemon();
    }
    
    
    document.addEventListener('DOMContentLoaded', () => {
        const searchForm = document.querySelector('#search-form');
        searchForm.addEventListener('submit', handleSearch);
    
        fetchAllPokemon();
    });

