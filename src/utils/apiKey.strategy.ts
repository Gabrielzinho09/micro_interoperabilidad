import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(
  Strategy,
  'api-key',
) {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  // Passport llama este metodo en cada endpoint protegido con AuthGuard('api-key').
  // La API key llega en X-API-KEY y se compara contra la variable API_KEY.
  authenticate(req: Request) {
    const apiKey: string = (req.headers['x-api-key'] as string) || '';
    const configuredApiKey = this.configService.get<string>('API_KEY');
    if (apiKey && apiKey === configuredApiKey) {
      this.success(true); // Indica éxito
    } else {
      this.fail(401); // Indica fallo - 401 Unauthorized
    }
  }

  validate(): boolean {
    // Se mantiene para satisfacer la interfaz de PassportStrategy.
    // La validacion real ya ocurrio en authenticate().
    return true; // Se llama para satisfacer la interfaz pero no es necesario para la validacion.
  }
}
