/* 
Author: Zankat Kalpesh
Email: zankatkalpesh@gmail.com
*/
import URL from 'urijs';

export function SetData(value: any): any {
  return JSON.stringify({ type: (typeof value), data: value });
}

export function GetData(value: any): string | any | null {
  if (!!value) {
    try {
      value = JSON.parse(value);
    } catch (e) {
      return value;
    }
    return (value.data !== undefined) ? value.data : null;
  } else {
    return value;
  }
}

export function GetUrl(link: string, domain?: 'server' | 'public'): string {
  const domains: any = {
    server: process.env.REACT_APP_API_ENDPOINT,
    public: process.env.PUBLIC_URL,
  };

  const host = (link: string, domain: string) => {
    if (!link) { return link; }
    const host = domains[domain];
    let url = URL(link);
    if (url.is('relative')) {
      url = url.absoluteTo(host);
    }
    return url.toString();
  }

  return (domain) ? host(link, domain) : link;
}