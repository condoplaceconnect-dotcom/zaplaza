// XSS Protection - Sanitizar inputs do usuário
export const sanitize = {
  // Remover HTML perigoso (previne XSS)
  html: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text; // textContent escapa HTML
    return div.innerHTML;
  },

  // Sanitizar atributos HTML (data-*, aria-*, etc)
  attribute: (attr: string): string => {
    return attr
      .replace(/[<>"']/g, '') // Remover caracteres perigosos
      .replace(/javascript:/gi, '') // Bloquear javascript: protocol
      .replace(/on\w+=/gi, ''); // Remover event handlers (onclick, onerror, etc)
  },

  // Sanitizar URLs (previne javascript: e data: URLs)
  url: (url: string): string => {
    try {
      const parsed = new URL(url, window.location.origin);
      // Apenas permitir http/https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  },

  // Sanitizar nomes de arquivo (remover path traversal)
  filename: (filename: string): string => {
    return filename
      .replace(/\.\./g, '') // Bloquear ../
      .replace(/\//g, '') // Bloquear /
      .replace(/\\/g, '') // Bloquear \
      .replace(/[<>:"|?*]/g, ''); // Caracteres inválidos em filename
  },

  // Sanitizar JSON string (previne JSON injection)
  json: (obj: unknown): string => {
    return JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }
};
