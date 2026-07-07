/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).global = (window as any).global || window;
  (window as any).Buffer = (window as any).Buffer || Buffer;
}
