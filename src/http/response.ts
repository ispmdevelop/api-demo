export const createSuccessResponse = (
  statusCode: number,
  message: string,
  data: any
) => {
  return data;
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
