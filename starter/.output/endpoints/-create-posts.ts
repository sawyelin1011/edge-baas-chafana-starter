import { D1CreateEndpoint } from 'chanfana';
import { z } from 'zod';
import { PostsSchema, CreatePostsSchema } from '../schemas/posts.js';

export class CreatePosts extends D1CreateEndpoint {
  _meta = { 
    model: { 
      schema: PostsSchema, 
      primaryKeys: ['id'], 
      tableName: 'postss' 
    } 
  };
  
  dbName = 'DB';

  constructor() {
    super();
  }

  async handle(c: Context): Promise<Response> {
    const requestData = await c.req.json();
    const validatedData = CreatePostsSchema.parse(requestData);
    
    // Add default values and timestamps
    const finalData = {
      id: crypto.randomUUID(),
      ...validatedData,
      createdAt: new Date().toISOString(),
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