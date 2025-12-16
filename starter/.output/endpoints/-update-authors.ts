import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { AuthorsSchema, UpdateAuthorsRequestSchema } from '../schemas/authors.js';

export class UpdateAuthors extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: AuthorsSchema, 
      primaryKeys: ['id'], 
      tableName: 'authorss' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = UpdateAuthorsRequestSchema.parse(requestData);
    
    // Add updated timestamp
    const finalData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    return super.handle({
      ...c,
      req: {
        ...c.req,
        json: () => Promise.resolve(finalData)
      }
    } as Context);
  }
}