export enum DomainExceptionCode {
  NotFound = 1,
  BadRequest = 2,
  Forbidden = 3,
  Unauthorized = 4,
}

export class ErrorExtension {
  constructor(
    public message: string,
    public field: string | null = null,
  ) {}
}

export class DomainException extends Error {
  constructor(
    public message: string,
    public code: DomainExceptionCode,
    public extensions: ErrorExtension[],
  ) {
    super(message);
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(extensions: ErrorExtension[]) {
    super('Bad Request', DomainExceptionCode.BadRequest, extensions);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorExtension(message, field)] : []);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor(extensions: ErrorExtension[]) {
    super('Unauthorized', DomainExceptionCode.Unauthorized, extensions);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorExtension(message, field)] : []);
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(extensions: ErrorExtension[]) {
    super('Forbidden', DomainExceptionCode.Forbidden, extensions);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorExtension(message, field)] : []);
  }
}

export class NotFoundDomainException extends DomainException {
  constructor(extensions: ErrorExtension[]) {
    super('Not Found', DomainExceptionCode.NotFound, extensions);
  }

  static create(message?: string, field?: string) {
    return new this(message ? [new ErrorExtension(message, field)] : []);
  }
}
