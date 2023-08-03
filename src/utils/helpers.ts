import type { Instance } from 'simple-peer'
import adapter from 'webrtc-adapter';

type Maybe<T> = T | null | undefined

export function transformSdp(sdp: string, bandwidth: number, _?: Instance) {
  let modifier = 'AS';
  if (adapter.browserDetails.browser === 'firefox') {
    bandwidth = (bandwidth >>> 0) * 1000;
    modifier = 'TIAS';
  }
  if (sdp.indexOf('b=' + modifier + ':') === -1) {
    // insert b= after c= line.
    sdp = sdp.replace(/c=IN (.*)\r\n/, 'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
  } else {
    sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'), 'b=' + modifier + ':' + bandwidth + '\r\n');
  }
  return sdp;
}

export const capitalize = (str?: Maybe<string>) => {
  if (!str) return ''
  return `${str[0].toLocaleUpperCase()}${str.slice(1)}`
}

export const truncate = (
  str?: Maybe<string>,
  max: number = 0,
  suffix: string = '...',
) => {
  if (!str) return ''
  return str.length <= max ? str : str.slice(0, max) + suffix
}

export const userLabel = ({
  userId,
  userName,
}: {
  userName?: string
  userId: string
}) => {
  return capitalize(userName) || `<${userId}>`
}

export const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(...args)
  }
}
