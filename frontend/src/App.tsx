import React, { useState } from "react";
import GameList from "./components/GameList";
import GameForm from "./components/GameForm";
import GameDetails from "./components/GameDetails";
import { Game } from "./types/Game";
import { ApiService } from "./services/api.service";

const App: React.FC = () => {
  const [view, setView] = useState<"list" | "form" | "details">("list");
  const [selectedGame, setSelectedGame] = useState<Game>();
  const [refreshList, setRefreshList] = useState(0);

  const handleEdit = (game: Game) => {
    console.log("Editing game:", game);
    setSelectedGame(game);
    setView("form");
  };

  const handleView = (id: number) => {
    const game: Game = { id, title: "" }; // Create a minimum Game object with required fields
    setSelectedGame(game);
    setView("details");
  };

  const handleAddNew = () => {
    setSelectedGame(undefined);
    setView("form");
  };

  const handleSave = async (game: Game) => {
    try {
      const isUpdate = Boolean(game.id);
      console.log(`${isUpdate ? 'Updating' : 'Creating'} game:`, game);
      
      let savedGame: Game;
      
      if (isUpdate) {
        // Mettre à jour un jeu existant
        if (typeof game.id !== 'number') {
          throw new Error('Game ID is required for updates');
        }
        savedGame = await ApiService.updateGame(game.id, game);
        console.log('Game updated successfully:', savedGame);
      } else {
        // Créer un nouveau jeu
        savedGame = await ApiService.createGame(game);
        console.log('Game created successfully:', savedGame);
      }
      
      // Rafraîchir la liste et revenir à l'affichage liste
      setRefreshList(prev => prev + 1);
      setView("list");
    } catch (error) {
      console.error("Error saving game:", error);
      alert(`Erreur lors de la sauvegarde du jeu : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce jeu ?")) {
      try {
        // Utiliser le service API pour supprimer le jeu
        await ApiService.deleteGame(id);
        
        // Attendre un peu pour s'assurer que la suppression a eu le temps de se propager
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Rafraîchir la liste avec un timestamp très précis pour éviter toute mise en cache
        const uniqueRefreshId = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 15)}`;
        console.log(`Refreshing game list with unique ID: ${uniqueRefreshId}`);
        setRefreshList(prev => prev + 1);
        
        // Forcer un second rafraîchissement après un court délai pour s'assurer que les changements sont appliqués
        setTimeout(() => {
          console.log('Performing secondary refresh of game list');
          setRefreshList(prev => prev + 2);
          
          // Afficher une alerte de succès seulement après le second rafraîchissement
          alert("Jeu supprimé avec succès !");
        }, 500);
        
        // Retourner immédiatement à la vue liste sans attendre le second rafraîchissement
        setView("list");
      } catch (error) {
        console.error("Error deleting game:", error);
        alert(`Erreur lors de la suppression du jeu : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
  };

  const handleCancel = () => {
    setView("list");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {view === "list" && (
        <>
          <GameList 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onView={handleView}
            refreshTrigger={refreshList}
          />
          <button
            onClick={handleAddNew}
            className="fixed bottom-8 right-8 w-16 h-16 bg-[#0071e3] rounded-full flex items-center justify-center text-white text-3xl shadow-lg hover:bg-[#0077ed] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Ajouter un jeu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </>
      )}
      
      {view === "form" && (
        <GameForm 
          game={selectedGame} 
          onSave={handleSave} 
          onCancel={handleCancel}
        />
      )}
      
      {view === "details" && selectedGame?.id !== undefined && (
        <GameDetails 
          gameId={selectedGame.id} 
          onBack={() => setView("list")} 
        />
      )}
    </div>
  );
};

export default App;
