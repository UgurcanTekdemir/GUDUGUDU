export const resolveSiteImageUrl = (inputUrl: string | undefined | null): string => {
  const url = (inputUrl || '').trim();
  if (!url) return '';

  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url;
  }

  const baseUrl = (import.meta as any).env?.BASE_URL || '/';

  if (url.startsWith('/public/')) {
    return baseUrl + url.slice('/public/'.length);
  }

  if (url.startsWith('/src/assets/') || url.startsWith('src/assets/')) {
    const fileName = url.split('/').pop() as string;
    const resolved = resolveFromSrcAssetsByFileName(fileName);
    if (resolved) return resolved;
  }

  if (url.startsWith('/')) {
    return baseUrl + url.slice(1);
  }

  return url;
};

const resolveFromSrcAssetsByFileName = (fileName: string): string | null => {
  const modules = (import.meta as any).glob('/src/assets/**/*', { eager: true, as: 'url' }) as Record<string, string>;
  for (const path in modules) {
    if (path.endsWith('/' + fileName)) {
      return modules[path];
    }
  }
  return null;
};

export const getPlaceholderImageUrl = (): string => {
  const baseUrl = (import.meta as any).env?.BASE_URL || '/';
  return baseUrl + 'placeholder.svg';
};


