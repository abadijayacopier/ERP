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
  
  const text = await response.text();
  if (!text) return null;

  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response from ${endpoint}`);
  }

  if (!result.success) {
    throw new Error(result.error?.message || result.message || 'Something went wrong');
  }

  return result.data;
}
