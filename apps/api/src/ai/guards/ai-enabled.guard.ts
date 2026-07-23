import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';

// Gates every /ai route except /ai/status behind DEEPSEEK_API_KEY: without a
// key, resumes are pointless to upload (nothing can ever analyze them), so
// the whole feature — not just /analyze — is blocked at the route level per
// the product requirement, not just hidden client-side.
@Injectable()
export class AiEnabledGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new ServiceUnavailableException('AI features are disabled: DEEPSEEK_API_KEY is not configured.');
    }
    return true;
  }
}
