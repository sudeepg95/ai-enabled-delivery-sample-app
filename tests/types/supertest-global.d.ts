import supertest from 'supertest';

declare global {
  namespace Express {
    interface Response {
      body: Record<string, unknown>;
    }
  }
}

declare module 'supertest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SuperTest<T> {
    post(url: string): supertest.Test;
    get(url: string): supertest.Test;
    put(url: string): supertest.Test;
    delete(url: string): supertest.Test;
  }
  
  interface Test {
    post(url: string): supertest.Test;
    get(url: string): supertest.Test;
    put(url: string): supertest.Test;
    delete(url: string): supertest.Test;
    set(field: string, val: string): supertest.Test;
    send(data: Record<string, unknown>): supertest.Test;
    expect(status: number): supertest.Test;
    then(
      resolve: (res: supertest.Response) => unknown,
      reject?: (err: Error) => unknown
    ): Promise<unknown>;
  }
}

export {};