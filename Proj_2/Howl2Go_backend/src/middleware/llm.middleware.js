import { llmService } from '../services/llm.service.js';

/**
 * Middleware to apply user preferences to parsed criteria
 * Merges user's saved preferences with LLM-parsed criteria
 * User preferences act as defaults, LLM criteria takes precedence
 * 
 * @requires optionalAuth middleware to run first (req.user.preferences)
 * @requires parseLLMQuery middleware to run first (req.parsedCriteria)
 */
export const applyUserPreferences = (req, res, next) => {
  try {
    // Only apply if user is authenticated and has preferences
    if (!req.user?.preferences) {
      return next();
    }

    const prefs = req.user.preferences;
    const criteria = req.parsedCriteria || {};

    // Apply maxCalories as default if user has it set and query doesn't specify
    if (prefs.maxCalories && !criteria.calories?.max) {
      criteria.calories = criteria.calories || {};
      criteria.calories.max = prefs.maxCalories;
    }

    // Apply minProtein as default if user has it set and query doesn't specify
    if (prefs.minProtein && !criteria.protein?.min) {
      criteria.protein = criteria.protein || {};
      criteria.protein.min = prefs.minProtein;
    }

    // Store favorite restaurants to boost in results (handled in controller)
    if (prefs.favoriteRestaurants?.length > 0) {
      req.favoriteRestaurants = prefs.favoriteRestaurants;
    }

    // Store dietary restrictions for filtering (handled in controller)
    if (prefs.dietaryRestrictions?.length > 0) {
      req.dietaryRestrictions = prefs.dietaryRestrictions;
    }

    req.parsedCriteria = criteria;
    req.preferencesApplied = true;

    next();
  } catch (error) {
    console.error('Apply User Preferences Error:', error);
    // Don't fail the request if preferences can't be applied
    next();
  }
};

/**
 * Middleware to parse natural language queries using LLM
 * Attaches parsed criteria to req.parsedCriteria
 *
 * @example
 * // In routes:
 * router.post('/search', parseLLMQuery, searchController);
 *
 * // In controller:
 * const criteria = req.parsedCriteria; // { protein: { min: 30 }, calories: { max: 500 } }
 */
export const parseLLMQuery = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required and must be a string',
        message: 'Please provide a natural language food query in the request body'
      });
    }

    // Parse the query using LLM service
    const result = await llmService.parseQuery(query);

    // Attach parsed criteria to request object
    req.parsedCriteria = result.criteria;
    req.llmRawResponse = result.rawResponse;

    // Log for debugging
    // console.log('Parsed Query:', {
    //   original: query,
    //   criteria: result.criteria
    // });

    next();
  } catch (error) {
    console.error('LLM Middleware Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to parse query',
      message: error.message
    });
  }
};

/**
 * Middleware to build MongoDB query from parsed criteria
 * Requires parseLLMQuery to be run first
 * Attaches MongoDB query to req.mongoQuery
 */
export const buildMongoQuery = (req, res, next) => {
  try {
    if (!req.parsedCriteria) {
      return res.status(400).json({
        success: false,
        error: 'No parsed criteria found',
        message: 'parseLLMQuery middleware must be run first'
      });
    }

    // Build MongoDB query from criteria
    const mongoQuery = llmService.buildMongoQuery(req.parsedCriteria);
    req.mongoQuery = mongoQuery;

    // console.log('MongoDB Query:', mongoQuery);

    next();
  } catch (error) {
    console.error('Build Mongo Query Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to build database query',
      message: error.message
    });
  }
};

/**
 * Middleware to validate that the query resulted in meaningful criteria
 * Returns 400 if criteria is empty
 */
export const validateCriteria = (req, res, next) => {
  if (!req.parsedCriteria || Object.keys(req.parsedCriteria).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No nutritional criteria found',
      message: 'Your query does not contain recognizable food or nutritional requirements. Please try again with a food-related query.'
    });
  }
  next();
};
