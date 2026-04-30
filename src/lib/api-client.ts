export async function apiRequest(endpoint: string, method = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`/api/${endpoint}`, options);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message || 'Something went wrong');
  }

  return result.data;
}
