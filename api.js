/**
 * Comprehensive API Service Module
 * Features: Secure data fetching, error handling, request/response interceptors,
 * authentication, caching, and rate limiting
 */

class APIService {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.cacheTTL = config.cacheTTL || 300000; // 5 minutes default

    // Authentication configuration
    this.authToken = config.authToken || null;
    this.refreshToken = config.refreshToken || null;
    this.tokenExpiryTime = null;

    // Request/Response interceptors
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];

    // Cache management
    this.cache = new Map();
    this.cacheTimers = new Map();

    // Rate limiting
    this.rateLimitConfig = config.rateLimit || {
      maxRequests: 100,
      windowMs: 60000, // 1 minute
    };
    this.requestTimestamps = [];
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token or API key
   * @param {string} type - Token type (Bearer, Basic, etc.)
   */
  setAuthToken(token, type = 'Bearer') {
    this.authToken = { token, type };
  }

  /**
   * Set refresh token for automatic token renewal
   * @param {string} refreshToken - Refresh token
   * @param {number} expiryTime - Token expiry time in milliseconds
   */
  setRefreshToken(refreshToken, expiryTime = 3600000) {
    this.refreshToken = refreshToken;
    this.tokenExpiryTime = Date.now() + expiryTime;
  }

  /**
   * Check if token needs refresh
   * @private
   */
  isTokenExpired() {
    if (!this.tokenExpiryTime) return false;
    return Date.now() > this.tokenExpiryTime - 60000; // Refresh 1 minute before expiry
  }

  /**
   * Register request interceptor
   * @param {Function} callback - Interceptor function
   */
  addRequestInterceptor(callback) {
    this.requestInterceptors.push(callback);
  }

  /**
   * Register response interceptor
   * @param {Function} callback - Interceptor function
   */
  addResponseInterceptor(callback) {
    this.responseInterceptors.push(callback);
  }

  /**
   * Register error interceptor
   * @param {Function} callback - Interceptor function
   */
  addErrorInterceptor(callback) {
    this.errorInterceptors.push(callback);
  }

  /**
   * Execute request interceptors
   * @private
   */
  async executeRequestInterceptors(config) {
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }
    return config;
  }

  /**
   * Execute response interceptors
   * @private
   */
  async executeResponseInterceptors(response) {
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }
    return response;
  }

  /**
   * Execute error interceptors
   * @private
   */
  async executeErrorInterceptors(error) {
    for (const interceptor of this.errorInterceptors) {
      error = await interceptor(error);
    }
    return error;
  }

  /**
   * Check rate limiting
   * @private
   */
  checkRateLimit() {
    const now = Date.now();
    const windowStart = now - this.rateLimitConfig.windowMs;

    // Remove old timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > windowStart
    );

    if (this.requestTimestamps.length >= this.rateLimitConfig.maxRequests) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = this.rateLimitConfig.windowMs - (now - oldestRequest);
      throw new Error(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    this.requestTimestamps.push(now);
  }

  /**
   * Generate cache key
   * @private
   */
  generateCacheKey(url, config) {
    const method = (config.method || 'GET').toUpperCase();
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${method}:${url}:${params}`;
  }

  /**
   * Get cached response if available
   * @private
   */
  getFromCache(cacheKey) {
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      return {
        ...cachedData,
        fromCache: true,
      };
    }
    return null;
  }

  /**
   * Store response in cache
   * @private
   */
  setCache(cacheKey, data, ttl = this.cacheTTL) {
    // Clear existing timer if any
    if (this.cacheTimers.has(cacheKey)) {
      clearTimeout(this.cacheTimers.get(cacheKey));
    }

    this.cache.set(cacheKey, data);

    // Set cache expiry timer
    const timer = setTimeout(() => {
      this.cache.delete(cacheKey);
      this.cacheTimers.delete(cacheKey);
    }, ttl);

    this.cacheTimers.set(cacheKey, timer);
  }

  /**
   * Clear specific cache entry
   * @param {string} cacheKey - Cache key to clear
   */
  clearCache(cacheKey) {
    if (this.cacheTimers.has(cacheKey)) {
      clearTimeout(this.cacheTimers.get(cacheKey));
      this.cacheTimers.delete(cacheKey);
    }
    this.cache.delete(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cacheTimers.forEach((timer) => clearTimeout(timer));
    this.cacheTimers.clear();
    this.cache.clear();
  }

  /**
   * Build fetch configuration
   * @private
   */
  buildFetchConfig(url, config = {}) {
    const method = (config.method || 'GET').toUpperCase();
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Add authentication header if token is available
    if (this.authToken) {
      headers.Authorization = `${this.authToken.type} ${this.authToken.token}`;
    }

    const fetchConfig = {
      method,
      headers,
      signal: this.createAbortSignal(this.timeout),
    };

    // Add body for non-GET requests
    if (method !== 'GET' && config.data) {
      fetchConfig.body = JSON.stringify(config.data);
    }

    // Add query parameters
    if (config.params) {
      const queryString = new URLSearchParams(config.params).toString();
      url = `${url}${queryString ? '?' + queryString : ''}`;
    }

    return { url, fetchConfig };
  }

  /**
   * Create abort signal with timeout
   * @private
   */
  createAbortSignal(timeout) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller.signal;
  }

  /**
   * Handle response
   * @private
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('text')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `HTTP Error: ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      error.headers = response.headers;
      throw error;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data,
      fromCache: false,
    };
  }

  /**
   * Retry logic with exponential backoff
   * @private
   */
  async retryRequest(url, config, attempt = 0) {
    try {
      return await this.performRequest(url, config);
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(url, config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   * @private
   */
  isRetryableError(error) {
    // Retry on network errors and 5xx status codes
    if (!error.status) return true; // Network error
    return error.status >= 500;
  }

  /**
   * Perform the actual fetch request
   * @private
   */
  async performRequest(url, config) {
    let { url: fullUrl, fetchConfig } = this.buildFetchConfig(url, config);

    // Apply request interceptors
    const interceptedConfig = await this.executeRequestInterceptors({
      url: fullUrl,
      ...fetchConfig,
      originalConfig: config,
    });

    const response = await fetch(
      interceptedConfig.url,
      interceptedConfig
    );
    let result = await this.handleResponse(response);

    // Apply response interceptors
    result = await this.executeResponseInterceptors(result);

    return result;
  }

  /**
   * Main request method
   * @param {string} url - Request URL
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response data
   */
  async request(url, config = {}) {
    try {
      // Check token expiry and refresh if needed
      if (this.isTokenExpired() && this.refreshToken) {
        await this.refreshAuthToken();
      }

      // Check rate limiting
      this.checkRateLimit();

      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      const cacheKey = this.generateCacheKey(fullUrl, config);

      // Check cache for GET requests
      if (config.method?.toUpperCase() !== 'POST' && config.cache !== false) {
        const cachedResponse = this.getFromCache(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // Perform request with retry logic
      const response = await this.retryRequest(fullUrl, config);

      // Cache successful GET responses
      if (config.method?.toUpperCase() !== 'POST' && config.cache !== false) {
        this.setCache(cacheKey, response, config.cacheTTL);
      }

      return response;
    } catch (error) {
      // Apply error interceptors
      const handledError = await this.executeErrorInterceptors(error);
      throw handledError;
    }
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.request(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url, data, config = {}) {
    return this.request(url, { ...config, method: 'POST', data, cache: false });
  }

  /**
   * PUT request
   */
  async put(url, data, config = {}) {
    return this.request(url, { ...config, method: 'PUT', data, cache: false });
  }

  /**
   * PATCH request
   */
  async patch(url, data, config = {}) {
    return this.request(url, {
      ...config,
      method: 'PATCH',
      data,
      cache: false,
    });
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.request(url, { ...config, method: 'DELETE', cache: false });
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthToken() {
    // Override this method in subclass or set custom refresh logic
    console.warn('Token refresh not implemented. Please set custom refresh logic.');
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    const now = Date.now();
    const windowStart = now - this.rateLimitConfig.windowMs;
    const recentRequests = this.requestTimestamps.filter(
      (timestamp) => timestamp > windowStart
    );

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.rateLimitConfig.maxRequests,
      remaining: this.rateLimitConfig.maxRequests - recentRequests.length,
      windowMs: this.rateLimitConfig.windowMs,
      resetTime: new Date(
        (recentRequests[0] || now) + this.rateLimitConfig.windowMs
      ),
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalSize: JSON.stringify(Array.from(this.cache.values())).length,
    };
  }
}

// Export for Node.js and Browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
}

// For use as ES6 module
export default APIService;
