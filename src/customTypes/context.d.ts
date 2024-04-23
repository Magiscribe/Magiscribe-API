export interface Context {
  auth: {
    sub: string;
  };
  roles: { roles: string }[];
}

export default Context;
