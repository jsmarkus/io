import ClientRequest from './ClientRequest';

export default function Api(template, options = {}) {
  var client = new ClientRequest(template, options);

  var fn = function(params) {
    return client
      .execute(params)
      .then(processHttpResponse, processHttpError);
  }
  fn.displayName = `API: ${template}`;
  return fn;
}


function processHttpResponse(httpResponse) {
  return httpResponse.data;
}

function processHttpError(httpErrorResponse) {
  //throw new Error(httpErrorResponse);
  return Promise.reject(httpErrorResponse);
}
