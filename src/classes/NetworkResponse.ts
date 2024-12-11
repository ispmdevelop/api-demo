export class NetworkResponse {
  static CreateSuccessResponse(data: any, message: string, code = 200) {
    return {
      statusCode: code,
      body: {
        message: message,
        data: data,
      },
    };
  }

  static CreateErrorResponse(error: string, code = 500) {
    return {
      statusCode: code,
      body: {
        error: error,
      },
    };
  }
}
