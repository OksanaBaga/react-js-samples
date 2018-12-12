function trimLeft(str, replacement) {
  while (str.charAt(0) === replacement) {
    str = str.substr(1);
  }
  return str;
}

/**
 * Prepend host of API server
 * @param hostname
 * @param path
 * @returns {String}
 * @private
 */
function createURL(hostname, path) {
  if (process.env.BROWSER) {
    return `//${hostname}/${trimLeft(path, '/')}`;
  }
  return `http://${hostname}/${trimLeft(path, '/')}`;
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * This is our overly complicated isomorphic "request"
 * @param hostname
 * @param basicAuthorization
 * @param login
 * @param accessToken
 * @returns {Function}
 */
export default (hostname, { basicAuthorization, login = '/login', accessToken }) => {
  let isTokenUpdating = false;
  /**
   * Parse response
   * @param resp
   * @returns {Promise}
   * @private
   */
  function handleResponse(resp) {
    const redirect = resp.headers.get('Location');
    if (redirect) {
      if (process.env.BROWSER) {
        window.location.replace(redirect);
      }
      return Promise.resolve({ redirect });
    }

    const contentType = resp.headers && resp.headers.get('Content-Type');
    const isJSON = contentType && contentType.includes('json');
    const response = resp[isJSON ? 'json' : 'text']();

    return resp.ok ?
      response : response.then((err) => {
        if (resp.status === 401) {
          localStorage.removeItem('accessToken');
          if (process.env.BROWSER) {
            const urlToReplace = `${login}?prev=${window.location.pathname}`;
            window.location.replace(urlToReplace);
          }
          return Promise.resolve({ redirect: login });
        }
        if (process.env.DEV) {
          console.error('requestError:', err);
        }
        throw err;
      });
  }

  /**
   * Make request
   * @param url
   * @param options
   * @returns {Promise}
   * @private
   */
  function request(url, options = {}) {
    const requestOptions = { ...options };
    const bearerToken = process.env.BROWSER ? getAccessToken() : accessToken;
    const requestURL = createURL(hostname, url);

    if (!requestOptions.headers) {
      requestOptions.headers = {};
    }

    const { headers, body } = requestOptions;

    if (body && !(body instanceof FormData)) {
      requestOptions.body = JSON.stringify(body);
      Object.assign(headers, {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      });
    }

    if (process.env.DEV) {
      console.info('requestURL:', requestURL);
    }

    // Append token to the headers
    if (!headers.Authorization) {
      headers.Authorization = bearerToken ? `Bearer ${bearerToken}` : basicAuthorization;
    }

    return fetch(requestURL, requestOptions);
  }

  /**
   * Update refresh token if access token is expired
   * @returns {Promise}
   * @private
   */
  function updateRefreshToken(options) {
    const body = {
      grant_type: 'refresh_token',
      refresh_token: localStorage.getItem('refreshToken'),
    };
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: basicAuthorization,
      },
    };
    const requestURL = createURL(hostname, '/oauth');

    if (process.env.DEV) {
      console.info('requestURL:', requestURL);
    }

    return fetch(requestURL, requestOptions)
      .then(data => data.json())
      .then((result) => {
        if (result.access_token) {
          localStorage.setItem('accessToken', result.access_token);
          localStorage.setItem('refreshToken', result.refresh_token);
          isTokenUpdating = false;
          return request(options.url, options.requestOptions).then(handleResponse);
        } else {
          isTokenUpdating = false;
          if (process.env.BROWSER) {
            const urlToReplace = `${login}?prev=${window.location.pathname}`;
            window.location.replace(urlToReplace);
          }
          return Promise.resolve({ redirect: login });
        }
      });
  }

  function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function* pollForUpdatingStatus({ url, requestOptions } = {}) {
    while (isTokenUpdating) {
      yield wait(50);
    }
    return isTokenUpdating ? Promise.resolve({}) : request(url, requestOptions);
  }

  function* pollForRequest({ url, requestOptions } = {}) {
    yield request(url, requestOptions);
  }

  function runPolling(generator, options) {
    const poll = generator.next();
    return poll.value.then((resp = {}) => {
      if (resp.status) {
        if (resp.status === 401) {
          if (isTokenUpdating) {
            // defer request
            const updateGenerator = pollForUpdatingStatus(options);
            return runPolling(updateGenerator, options);
          } else {
            // start to update access token
            isTokenUpdating = true;
            return updateRefreshToken(options);
          }
        }
        return handleResponse(resp);
      } else {
        return runPolling(generator, options);
      }
    });
  }

  return (url, requestOptions = {}) => {
    const generator = pollForRequest({ url, requestOptions });
    return runPolling(generator, { url, requestOptions });
  };
};
