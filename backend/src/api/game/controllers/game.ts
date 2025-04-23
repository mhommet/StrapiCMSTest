/**
 * game controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::game.game', ({ strapi }) => ({
  // On garde les méthodes par défaut
  ...factories.createCoreController('api::game.game'),
  
  // On surcharge la méthode update pour utiliser l'API Query Engine
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body || {};
      
      if (!id) {
        return ctx.badRequest('ID is required');
      }

      if (!data) {
        return ctx.badRequest('Update data is required');
      }

      console.log(`Controller: Attempting to update game with ID ${id}`);
      console.log('Update data:', data);
      
      // Utiliser l'API Query Engine pour mettre à jour le jeu
      const updatedGame = await strapi.db.query('api::game.game').update({
        where: { id },
        data: data
      });
      
      if (!updatedGame) {
        return ctx.notFound(`Game with ID ${id} not found or could not be updated`);
      }
      
      console.log(`Controller: Game with ID ${id} successfully updated`);
      
      // Renvoyer le jeu mis à jour
      return ctx.send({
        data: updatedGame
      });
    } catch (error) {
      console.error('Controller: Error updating game:', error);
      return ctx.badRequest('Failed to update game', { error: error.message });
    }
  },
  
  // On surcharge la méthode delete pour utiliser l'API Query Engine via le service
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('ID is required');
      }

      console.log(`Controller: Attempting to delete game with ID ${id}`);
      
      // Utiliser la méthode de service mise à jour qui utilise l'API Query Engine
      const gameService = strapi.service('api::game.game');
      const deletedEntry = await gameService.delete(id);
      
      if (!deletedEntry) {
        return ctx.notFound(`Game with ID ${id} not found or could not be deleted`);
      }
      
      console.log(`Controller: Game with ID ${id} successfully deleted`);
      
      // Renvoyer une réponse de succès
      return ctx.send({
        data: null,
        meta: {},
        message: 'Game deleted successfully'
      }, 200);
    } catch (error) {
      console.error('Controller: Error deleting game:', error);
      return ctx.badRequest('Failed to delete game', { error: error.message });
    }
  }
}));
