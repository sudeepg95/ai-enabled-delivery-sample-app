declare module 'supertest' {
  // Extend the Test interface from supertest
  interface Test {
    post(url: string): Test;
    get(url: string): Test;
    put(url: string): Test;
    delete(url: string): Test;
    set(header: string, value: string): Test;
    send(data: any): Test;
    expect(status: number): Test;
  }
}