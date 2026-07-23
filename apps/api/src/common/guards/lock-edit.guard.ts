import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Shared across modules (settings, ai) — when LOCK_EDIT=true, this is a
// read-only deployment: no reconfiguring the stack/profile and no adding or
// removing resumes. Blocks the route itself, not just the UI, so the
// restriction can't be bypassed by calling the API directly.
@Injectable()
export class LockEditGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    if (process.env.LOCK_EDIT === 'true') {
      throw new ForbiddenException('Editing is locked in this environment (LOCK_EDIT=true).');
    }
    return true;
  }
}
