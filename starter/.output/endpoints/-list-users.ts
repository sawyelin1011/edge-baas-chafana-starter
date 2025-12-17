import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { UserSchema } from '../schemas/user.js';
import { UserQuerySchema } from '../schemas/user.js';

export class ListUsers extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: UserSchema, 
      primaryKeys: ['id'], 
      tableName: 'users' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = ['active'];
  searchFields = [];
  orderByFields = [];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = UserQuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}