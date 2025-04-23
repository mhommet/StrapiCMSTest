import { useEffect, useState } from 'react';
import { Game } from '../types/Game';
import { ApiService } from '../services/api.service';

interface GameListProps {
  onEdit?: (game: Game) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
  refreshTrigger?: number;
}

const GameList = ({ onEdit, onDelete, onView, refreshTrigger = 0 }: GameListProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        // Utiliser le service API pour récupérer les jeux
        const gamesData = await ApiService.getGames();
        console.log('API Response Data:', { data: gamesData });
        setGames(gamesData);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error fetching games:', err);
          setError(err.message);
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [refreshTrigger]); // Réexécuter le fetch quand refreshTrigger change

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] bg-black text-white">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-800 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1c1c1e] border-l-4 border-red-600 p-4 my-4 text-white">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-400">
              Error: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-10 bg-black text-white">
        <h3 className="mt-2 text-lg font-medium text-gray-200">Aucun jeu disponible</h3>
        <p className="mt-1 text-sm text-gray-400">Commencez par ajouter un nouveau jeu.</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-10 text-center tracking-tight">
          Ludothèque
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div 
              key={game.id}
              className="bg-[#1c1c1e] rounded-2xl overflow-hidden transform transition duration-300 hover:scale-[1.02] backdrop-blur-sm border border-[#2c2c2e] hover:border-[#3c3c3e]"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2">{game.title}</h2>
                {game.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-3">{game.description}</p>
                )}
                {game.release_date && (
                  <p className="text-xs text-gray-500 mb-4">Date de sortie : {new Date(game.release_date).toLocaleDateString('fr-FR')}</p>
                )}
                
                <div className="flex justify-end space-x-2 mt-4">
                  {onView && (
                    <button 
                      onClick={() => onView(game.id as number)}
                      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] focus:ring-offset-[#1c1c1e]"
                    >
                      Voir
                    </button>
                  )}
                  
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(game)}
                      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-[#1c1c1e] text-[#0071e3] border border-[#0071e3] hover:bg-[#0071e3] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] focus:ring-offset-[#1c1c1e]"
                    >
                      Modifier
                    </button>
                  )}
                  
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(game.id as number)}
                      className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-[#1c1c1e] text-[#ff453a] border border-[#ff453a] hover:bg-[#ff453a] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff453a] focus:ring-offset-[#1c1c1e]"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameList;
