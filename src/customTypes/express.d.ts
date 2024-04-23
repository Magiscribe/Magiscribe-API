declare namespace Express {
  interface Request {
    auth: {
      auth: string;
      userId: string;
    };
  }
}
