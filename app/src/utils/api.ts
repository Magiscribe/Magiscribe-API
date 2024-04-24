/**
 * Creates a response object for API Gateway
 * @param {number} statusCode - HTTP status code (200, 400, 500, etc.)
 * @param {...any} body - Response body
 * @returns {any} Response object
 */
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createResponse(statusCode: number, body?: any): any {
  if (!body.message) {
    switch (statusCode) {
      case 200:
        body.message = 'Success';
        break;
      case 202:
        body.message = 'Accepted';
        break;
      case 400:
        body.message = 'Bad Request';
        break;
      case 404:
        body.message = 'Not Found';
        break;
      case 405:
        body.message = 'Method Not Allowed';
        break;
      case 500:
        body.message = 'Internal Server Error';
        break;
      default:
        body.message = 'Unknown';
        break;
    }
  }

  return {
    statusCode,
    body: JSON.stringify(body),
  };
}
