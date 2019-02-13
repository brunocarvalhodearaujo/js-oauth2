'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _AuthenticationService;

function _load_AuthenticationService() {
  return _AuthenticationService = require('./AuthenticationService');
}

var _fetchIntercept;

function _load_fetchIntercept() {
  return _fetchIntercept = _interopRequireDefault(require('fetch-intercept'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * intercept and manipulate requests
 */
class HttpRequestInterceptor {
  /**
   * @param {AuthenticationService} service
   */
  constructor(service) {
    if (!(service instanceof (_AuthenticationService || _load_AuthenticationService()).AuthenticationService)) {
      throw new Error('service must be a instance of `AuthenticationService`');
    }

    this.service = service;
    this.request = this.request.bind(this);
    this.response = this.response.bind(this);
  }

  /**
   * @param {string|Request} url
   * @param {RequestInfo} config
   */
  async request(url, config) {
    try {
      if (url.includes(this.service.config.baseUrl)) {
        const authorizationHeader = await this.service.keychain.getAuthorizationHeader();

        config = _extends({
          headers: {}
        }, config);

        // Inject `Authorization` header.
        if (!config.headers.hasOwnProperty('Authorization') && authorizationHeader) {
          config.headers.Authorization = authorizationHeader;
        }
      }

      return [url, config];
    } catch (err) {
      this.service.events.emit('oauth:exception', err);
      return [url, config];
    }
  }

  /**
   * @param {Response} response
   */
  async response(response) {
    try {
      if (response.url.includes(this.service.config.baseUrl)) {
        /**
         * @type {{ code: number, message: string, type: string }}
         */
        const rejection = await response.clone().json();

        // Catch `invalid_request` and `invalid_grant` errors and ensure that the `token` is removed.
        if (response.status === 400 && (rejection.error.message === 'invalid_grant' || rejection.error.message === 'invalid_request')) {
          await this.service.keychain.removeToken();

          this.service.events.emit('oauth:error', rejection);

          return Promise.reject(response);
        }

        // Catch `invalid_token` and `unauthorized` errors.
        // The token isn't removed here so it can be refreshed when the `invalid_token` error occurs.
        if (response.status === 401 && (rejection.error.message === 'invalid_token' || response.headers && response.headers('www-authenticate') && response.headers('www-authenticate').indexOf('Bearer') === 0)) {
          this.service.events.emit('oauth:error', rejection);

          return Promise.reject(response);
        }
      }

      return response;
    } catch (err) {
      this.service.events.emit('oauth:exception', err);
      return response;
    }
  }
}

/**
 * @param {AuthenticationService} service
 * @returns {{ unregister: () => void }}
 */
const interceptor = service => {
  return (_fetchIntercept || _load_fetchIntercept()).default.register(new HttpRequestInterceptor(service));
};

exports.default = interceptor;