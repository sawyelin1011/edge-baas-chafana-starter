import { D1ListEndpoint } from 'chanfana';
import { z } from 'zod';
import { AuthorsSchema } from '../schemas/authors.js';
import { AuthorsQuerySchema } from '../schemas/authors.js';

export class ListAuthorss extends D1ListEndpoint {
  _meta = { 
    model: { 
      schema: AuthorsSchema, 
      primaryKeys: ['id'], 
      tableName: 'authorss' 
    } 
  };
  
  dbName = 'DB';
  
  filterFields = ['active'];
  searchFields = ['name'];
  orderByFields = [];

  async handle(c: Context): Promise<Response> {
    const queryParams = Object.fromEntries(new URL(c.req.url).searchParams);
    const validatedQuery = AuthorsQuerySchema.parse(queryParams);
    
    return super.handle(c);
  }
}