import resetCollections from "../scripts/resetCollections.js";

/**
 * Controller for database reset operations
 */
export default {
  /**
   * Reset specific collections
   * @param {Object} req - Express request object with collections in the body
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async resetCollections(req, res) {
    try {
      const { collections } = req.body;

      // Results object to track reset operations
      const results = {
        success: true,
        resetCollections: [],
        failedCollections: [],
        errors: [],
      };

      // Reset regular collections if specified
      if (collections && Array.isArray(collections) && collections.length > 0) {
        const collectionResults = await resetCollections(collections);

        results.resetCollections = collectionResults.resetCollections;
        results.failedCollections = collectionResults.failedCollections;
        results.errors = [...results.errors, ...collectionResults.errors];

        if (!collectionResults.success) {
          results.success = false;
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Please provide collections to reset",
        });
      }

      return res.status(results.success ? 200 : 207).json({
        success: results.success,
        message: results.success
          ? "Reset operations completed successfully"
          : "Some reset operations failed",
        data: results,
      });
    } catch (error) {
      console.error("Database reset error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to perform reset operations",
        error: error.message,
      });
    }
  },
};
