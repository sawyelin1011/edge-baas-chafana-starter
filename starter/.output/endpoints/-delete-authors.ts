import { D1DeleteEndpoint } from 'chanfana';
import { z } from 'zod';
import { AuthorsSchema } from '../schemas/authors.js';

export class DeleteAuthors extends D1DeleteEndpoint {
  _meta = { 
    model: { 
      schema: AuthorsSchema, 
      primaryKeys: ['id'], 
      tableName: 'authorss' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    return super.handle(c);
  }
}