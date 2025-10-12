export enum PresentationalExceptionCode {
  NotFound = 1,
  BadRequest = 2,
  Forbidden = 3,
  Unauthorized = 4,
}

export class PresentationErrorExtension {
  constructor(
    public field: string | null = null,
    public message: string,
  ) {}
}

export class PresentationException extends Error {
  constructor(
    public message: string,
    public code: PresentationalExceptionCode,
    public extensions: PresentationErrorExtension[],
  ) {
    super(message);
  }
}

export class BadRequestPresentationalException extends PresentationException {
  constructor(extensions: PresentationErrorExtension[]) {
    super('Bad Request', PresentationalExceptionCode.BadRequest, extensions);
  }

  static create(message?: string, field?: string) {
    return new this(
      message ? [new PresentationErrorExtension(field, message)] : [],
    );
  }

  static createMany(data: PresentationErrorExtension[]) {
    return new this(data);
  }
}
