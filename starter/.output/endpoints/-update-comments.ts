import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { CommentsSchema, UpdateCommentsRequestSchema } from '../schemas/comments.js';

export class UpdateComments extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: CommentsSchema, 
      primaryKeys: ['id'], 
      tableName: 'commentss' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = UpdateCommentsRequestSchema.parse(requestData);
    
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