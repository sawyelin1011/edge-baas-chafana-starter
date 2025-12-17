import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostSchema, UpdatePostRequestSchema } from '../schemas/post.js';

export class UpdatePost extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: PostSchema, 
      primaryKeys: ['id'], 
      tableName: 'posts' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = UpdatePostRequestSchema.parse(requestData);
    
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