const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult = {
  token: string;
  user?: unknown;
  source: "api" | "mock";
};

const normalizeBaseUrl = (url?: string) => {
  if (!url) return "";
  return url.replace(/\/+$/, "");
};

const getCandidateUrls = () => {
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (!baseUrl) return [];
  return [`${baseUrl}/auth/login`, `${baseUrl}/api/auth/login`];
};

const tryLoginFromApi = async (payload: LoginPayload): Promise<LoginResult | null> => {
  const candidateUrls = getCandidateUrls();

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const token = data?.token ?? data?.accessToken ?? data?.data?.token;

      if (typeof token !== "string" || token.length === 0) {
        continue;
      }

      return {
        token,
        user: data?.user ?? data?.data?.user,
        source: "api",
      };
    } catch {
      continue;
    }
  }

  return null;
};

const tryLoginFromMock = async (payload: LoginPayload): Promise<LoginResult | null> => {
  await new Promise((resolve) => window.setTimeout(resolve, 250));

  if (payload.email === "Andrew@c.com" && payload.password === "123456") {
    return {
      token: "mock-token-andrew",
      user: { name: "Andrew", email: payload.email },
      source: "mock",
    };
  }

  return null;
};

export const login = async (payload: LoginPayload): Promise<LoginResult | null> => {
  const apiResult = await tryLoginFromApi(payload);
  if (apiResult) return apiResult;
  return tryLoginFromMock(payload);
};

export const saveSession = (token: string, user?: unknown, remember = true) => {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user !== undefined) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  if (user !== undefined) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(USER_KEY);
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
};

export const isAuthenticated = () => Boolean(getToken());

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
