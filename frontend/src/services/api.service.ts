import { Game } from '../types/Game';
import { Genre } from '../types/Genre';

// URL de base de l'API
const API_URL = 'http://localhost:1337/api';

// Configuration par défaut pour les requêtes
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

/**
 * Service pour gérer toutes les interactions avec l'API Strapi
 */
export class ApiService {
  /**
   * Récupère la liste des jeux depuis l'API
   * @returns Promise<Game[]> Liste des jeux
   */
  static async getGames(): Promise<Game[]> {
    try {
      // Ajout d'un timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/games?timestamp=${timestamp}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch games: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        // Transformer les données au format attendu - Strapi 5 utilise un format plus direct
        return data.data.map((item: Game) => ({
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          release_date: item.release_date || '',
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  /**
   * Récupère les détails d'un jeu spécifique
   * @param id ID du jeu à récupérer
   * @returns Promise<Game> Détails du jeu
   */
  static async getGameById(id: number): Promise<Game> {
    try {
      // Essayer d'abord de récupérer le jeu directement
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/games/${id}?timestamp=${timestamp}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        cache: 'no-store'
      });

      if (!response.ok) {
        // Si la requête directe échoue, essayer de récupérer depuis la liste complète
        const games = await this.getGames();
        const game = games.find(g => g.id === id);
        
        if (!game) {
          throw new Error(`Game with ID ${id} not found`);
        }
        
        return game;
      }

      const data = await response.json();
      
      if (data && data.data) {
        const item = data.data;
        return {
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          release_date: item.release_date || '',
        };
      }
      
      throw new Error(`Game with ID ${id} not found`);
    } catch (error) {
      console.error(`Error fetching game ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau jeu
   * @param game Données du jeu à créer
   * @returns Promise<Game> Jeu créé
   */
  static async createGame(game: Game): Promise<Game> {
    try {
      // Préparer les données selon le format attendu par Strapi
      const gameData = { ...game };
      delete gameData.id; // Supprimer l'ID pour la création

      // Format de données pour Strapi
      const dataToSend = { data: gameData };

      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response (create):', errorText);
        throw new Error(`Failed to create game: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result && result.data) {
        const item = result.data;
        return {
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          release_date: item.release_date || '',
        };
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  /**
   * Met à jour un jeu existant
   * @param id ID du jeu à mettre à jour
   * @param game Nouvelles données du jeu
   * @returns Promise<Game> Jeu mis à jour
   */
  static async updateGame(id: number, game: Game): Promise<Game> {
    try {
      console.log(`Attempting to update game with ID ${id}`);
      
      // Nettoyer et formater les données du jeu
      const cleanedGame = { ...game };
      delete cleanedGame.id; // Supprimer l'ID pour la mise à jour
      
      // Nettoyer les champs texte
      if (cleanedGame.title) cleanedGame.title = cleanedGame.title.trim();
      if (cleanedGame.description) cleanedGame.description = cleanedGame.description.trim();
      
      // Traiter les genres (si présents)
      if (cleanedGame.genres && Array.isArray(cleanedGame.genres)) {
        // S'assurer que tous les genres ont un titre trimé
        cleanedGame.genres = cleanedGame.genres.map(genre => ({
          ...genre,
          title: genre.title ? genre.title.trim() : ""
        }));
      }

      // Format de données pour Strapi
      const dataToSend = { data: cleanedGame };

      console.log('Update data being sent:', JSON.stringify(dataToSend));
      const response = await fetch(`${API_URL}/games/${id}`, {
        method: 'PUT',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response (update):', errorText);
        
        // Si l'erreur est 404 Not Found, essayer avec POST comme fallback
        if (response.status === 404) {
          console.log(`Game with ID ${id} not found with PUT, trying alternative update method`);
          
          // Essayer de récupérer le jeu d'abord
          const gameExists = await this.getGameById(id).catch(() => null);
          
          if (gameExists) {
            // Essayer avec PATCH au lieu de PUT
            console.log("Trying PATCH method instead");
            const patchResponse = await fetch(`${API_URL}/games/${id}`, {
              method: 'PATCH',
              headers: DEFAULT_HEADERS,
              body: JSON.stringify(dataToSend)
            });
            
            if (patchResponse.ok) {
              const patchResult = await patchResponse.json();
              if (patchResult && patchResult.data) {
                const item = patchResult.data;
                return {
                  id: item.id,
                  title: item.title || '',
                  description: item.description || '',
                  release_date: item.release_date || '',
                  genres: item.genres || []
                };
              }
            }
            
            // Si PATCH échoue également, créer un nouveau jeu et supprimer l'ancien
            console.log("Both PUT and PATCH failed, creating new and deleting old");
            const newGame = await this.createGame(cleanedGame);
            
            // Essayer de supprimer l'ancien jeu en silence
            this.deleteGame(id).catch(e => console.log("Non-critical error:", e));
            
            return newGame;
          } else {
            // Le jeu n'existe pas, créons-le simplement avec l'ID spécifié
            return await this.createGame(cleanedGame);
          }
        }
        
        throw new Error(`Failed to update game: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Update response:', result);
      
      if (result && result.data) {
        const item = result.data;
        return {
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          release_date: item.release_date || '',
          genres: item.genres || []
        };
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error(`Error updating game ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un jeu
   * @param id ID du jeu à supprimer
   * @returns Promise<void>
   */
  static async deleteGame(id: number): Promise<void> {
    try {
      console.log(`Attempting to delete game with ID ${id}`);
      
      // Envoyer la requête de suppression à l'API
      const response = await fetch(`${API_URL}/games/${id}`, {
        method: 'DELETE',
        headers: DEFAULT_HEADERS,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response (delete):', errorText);
        throw new Error(`Failed to delete game: ${response.status} ${response.statusText}`);
      }
      
      // Vérifier la réponse pour s'assurer que la suppression a réussi
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result && result.message === 'Game deleted successfully') {
        console.log(`Successfully deleted game with ID ${id}`);
      }
      
      // Vider TOUS les caches pour s'assurer d'un rafraîchissement complet
      if ('caches' in window) {
        try {
          // Récupérer tous les noms de cache et les supprimer
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('All browser caches cleared');
          
          // Pour être absolument certain, on supprime également les caches spécifiques
          const cache = await caches.open('strapi-cache');
          await cache.delete(`${API_URL}/games`);
          await cache.delete(`${API_URL}/games/${id}`);
          console.log('Specific cache entries cleared');
        } catch (cacheError) {
          console.log('Note: Cache clearing was not fully possible', cacheError);
        }
      }
      
      // Force un délai pour s'assurer que toutes les opérations ont le temps de se terminer
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Faire une requête pour invalider le cache côté serveur
      try {
        await fetch(`${API_URL}/games?timestamp=${new Date().getTime()}&invalidate=true`, {
          method: 'GET',
          headers: {
            ...DEFAULT_HEADERS,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Force-Reload': 'true'
          },
          cache: 'no-store'
        });
      } catch (invalidateError) {
        console.log('Cache invalidation request failed, but this is non-critical', invalidateError);
      }
    } catch (error) {
      console.error(`Error deleting game ${id}:`, error);
      throw error;
    }
  }

  /**
   * Recherche des genres par terme de recherche
   * @param query Terme de recherche
   * @returns Promise<Genre[]> Liste des genres correspondants
   */
  static async searchGenres(query: string): Promise<Genre[]> {
    try {
      if (!query || query.trim() === '') {
        return [];
      }
      
      // Ajout d'un timestamp pour éviter le cache
      const timestamp = new Date().getTime();
      
      // Récupérer tous les genres et filtrer côté client
      console.log(`Attempting to fetch genres with query: "${query}"`);
      const response = await fetch(`${API_URL}/genres?timestamp=${timestamp}`, {
        method: 'GET',
        headers: DEFAULT_HEADERS,
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error(`Search genres failed with status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        // Filtrer côté client avec le nom du genre (l'attribut est 'name' et non 'title')
        const lowercaseQuery = query.toLowerCase();
        const filteredGenres = data.data.filter((item: any) => {
          // Vérifier dans les attributs ou directement dans l'objet
          const name = item.attributes?.name || item.name || '';
          return name.toLowerCase().includes(lowercaseQuery);
        });
        
        // Mapper les résultats au format attendu par le frontend
        return filteredGenres.map((item: any) => ({
          id: item.id,
          // Pour maintenir la compatibilité, on mappe name à title
          title: item.attributes?.name || item.name || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching genres:', error);
      return [];
    }
  }

  /**
   * Crée un nouveau genre
   * @param title Titre du genre (sera mappé à l'attribut 'name' dans Strapi)
   * @returns Promise<Genre> Genre créé
   */
  static async createGenre(title: string): Promise<Genre> {
    try {
      // Nettoyer et normaliser le titre du genre (trim + minuscules)
      const cleanedTitle = title.trim().toLowerCase();
      
      // Vérifier si un genre avec ce nom existe déjà (insensible à la casse)
      const existingGenres = await this.searchGenres(cleanedTitle);
      const exactMatch = existingGenres.find(g => 
        g.title.toLowerCase() === cleanedTitle
      );
      
      if (exactMatch) {
        console.log(`Genre "${cleanedTitle}" already exists, returning existing genre`);
        return exactMatch;
      }
      
      // Utiliser 'name' au lieu de 'title' pour correspondre au schéma Strapi
      const genreData = { name: cleanedTitle };
      const dataToSend = { data: genreData };

      console.log('Creating genre with data:', dataToSend);
      const response = await fetch(`${API_URL}/genres`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response (create genre):', errorText);
        throw new Error(`Failed to create genre: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Genre creation response:', result);
      
      if (result && result.data) {
        const item = result.data;
        return {
          id: item.id,
          // On mappe 'name' à 'title' pour maintenir la cohérence du frontend
          title: item.attributes?.name || item.name || ''
        };
      }
      
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Error creating genre:', error);
      throw error;
    }
  }
}

export default ApiService;