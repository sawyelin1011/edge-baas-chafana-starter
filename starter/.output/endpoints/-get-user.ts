import { D1ReadEndpoint } from 'chanfana';
import { z } from 'zod';
import { UserSchema } from '../schemas/user.js';

export class GetUser extends D1ReadEndpoint {
  _meta = { 
    model: { 
      schema: UserSchema, 
      primaryKeys: ['id'], 
      tableName: 'users' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}