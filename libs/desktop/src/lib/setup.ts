import { fetchBinaryContent } from './data-fetcher';
import { baseUrl$ } from '@qspider/game-state';
import { isExternalUrl } from '@qspider/utils';
import { platform } from '@tauri-apps/plugin-os';
import { isGameUrl } from './game-url';

/** Windows serves game files over https://qsp.localhost, so only linux/macos need the XHR shim. */
export function shouldShimXhr(baseUrl: string): boolean {
  return isGameUrl(baseUrl) && platform() !== 'windows';
}

export function setupEnv() {
  const OriginalXMLHttpRequest = XMLHttpRequest;

  class XMLHttpRequestShim extends OriginalXMLHttpRequest {
    private is_replacing = false;
    private is_replacing_ready = false;
    private url = '';
    private replaceContent: string | ArrayBuffer | null = null;

    override get readyState(): number {
      if (this.is_replacing) {
        if (this.is_replacing_ready) {
          return XMLHttpRequestShim.DONE;
        }
        return XMLHttpRequestShim.LOADING;
      }
      return super.readyState;
    }

    override get response(): unknown {
      if (this.is_replacing) {
        if (this.is_replacing_ready) {
          return this.replaceContent;
        }
        return '';
      }
      return super.response;
    }

    override get responseText(): string {
      if (this.is_replacing) {
        return '';
      }
      return super.responseText;
    }

    override get status(): number {
      if (this.is_replacing) {
        if (this.is_replacing_ready) {
          if (this.replaceContent) return 200;
          return 404;
        }
        return 0;
      }
      return super.status;
    }

    override get statusText(): string {
      if (this.is_replacing) {
        if (this.is_replacing_ready) {
          if (this.replaceContent) return 'OK';
          return 'Not Found';
        }
        return '';
      }
      return super.statusText;
    }

    override open(
      method: string,
      url: string,
      async = true,
      user: string | null | undefined = undefined,
      password: string | null | undefined = undefined,
    ): void {
      if (shouldShimXhr(baseUrl$.value) && !isExternalUrl(url)) {
        this.url = url;
        this.is_replacing = true;
      } else {
        super.open(method, url, async, user, password);
      }
    }

    override send(body?: XMLHttpRequestBodyInit | null): void {
      if (this.is_replacing) {
        this.fetchReplaceContent();
      } else {
        super.send(body);
      }
    }

    private async fetchReplaceContent() {
      try {
        this.replaceContent = await fetchBinaryContent(baseUrl$.value, this.url);
        this.is_replacing_ready = true;
        this.dispatchEvent(new Event('readystatechange'));
        this.onreadystatechange?.call(this, new Event('readystatechange'));
        this.dispatchEvent(new ProgressEvent('load'));
        this.onload?.call(this, new ProgressEvent('load'));
      } catch {
        this.is_replacing_ready = true;
        this.dispatchEvent(new ProgressEvent('error'));
        this.onerror?.call(this, new ProgressEvent('error'));
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.XMLHttpRequest = class extends XMLHttpRequestShim {};
}
