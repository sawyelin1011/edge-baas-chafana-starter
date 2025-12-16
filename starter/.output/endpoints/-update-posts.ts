import { D1UpdateEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostsSchema, UpdatePostsRequestSchema } from '../schemas/posts.js';

export class UpdatePosts extends D1UpdateEndpoint {
  _meta = { 
    model: { 
      schema: PostsSchema, 
      primaryKeys: ['id'], 
      tableName: 'postss' 
    } 
  };
  
  dbName = 'DB';

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = UpdatePostsRequestSchema.parse(requestData);
    
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