import supertest from 'supertest';

declare global {
  namespace Express {
    interface Response {
      body: any;
    }
  }
}

declare module 'supertest' {
  interface SuperTest<TServer> {
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
    send(data: any): supertest.Test;
    expect(status: number): supertest.Test;
    then(resolve: (res: supertest.Response) => any, reject?: (err: Error) => any): Promise<any>;
  }
}

export {};