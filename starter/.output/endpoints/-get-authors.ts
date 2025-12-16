import { D1ReadEndpoint } from 'chanfana';
import { z } from 'zod';
import { AuthorsSchema } from '../schemas/authors.js';

export class GetAuthors extends D1ReadEndpoint {
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