import { nanoid } from "nanoid";

export function generatePublicId(): string {
  return nanoid(10);
}

export function generateManageToken(): string {
  return nanoid(32);
}
