export interface IResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export const createSuccessResponse = (
  statusCode: number,
  message: string,
  data: any
) => {
  return {
    statusCode,
    message,
    data,
  };
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  errors: any
) => {
  return {
    statusCode,
    message,
    errors,
  };
};
