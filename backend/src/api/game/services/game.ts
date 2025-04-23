/**
 * game service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::game.game', ({ strapi }) => ({
  // Garder les fonctionnalités du service par défaut
  ...factories.createCoreService('api::game.game'),
  
  // Surcharger la méthode delete pour utiliser l'API Query Engine
  async delete(id) {
    try {
      console.log(`Service: Attempting to delete game with ID ${id} using Query Engine`);
      
      // Utiliser l'API Query Engine pour supprimer directement avec l'ID
      const deletedEntry = await strapi.db.query('api::game.game').delete({
        where: { id },
      });
      
      console.log('Service: Deleted entry:', deletedEntry);
      
      return deletedEntry;
    } catch (error) {
      console.error('Service: Error deleting game:', error);
      throw error;
    }
  },
}));
