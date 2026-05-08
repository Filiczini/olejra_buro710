import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError, ConflictError } from '../errors';

describe('AppError', () => {
  it('sets message and statusCode', () => {
    const err = new AppError('Something broke', 500);

    expect(err.message).toBe('Something broke');
    expect(err.statusCode).toBe(500);
  });

  it('sets name to AppError', () => {
    const err = new AppError('fail', 400);

    expect(err.name).toBe('AppError');
  });

  it('is an instance of Error', () => {
    const err = new AppError('fail', 400);

    expect(err).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('has statusCode 400', () => {
    const err = new ValidationError('Invalid input');

    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
    expect(err.name).toBe('ValidationError');
  });

  it('is an instance of AppError', () => {
    const err = new ValidationError('bad');

    expect(err).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('has statusCode 404', () => {
    const err = new NotFoundError('Missing');

    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Missing');
    expect(err.name).toBe('NotFoundError');
  });

  it('is an instance of AppError', () => {
    const err = new NotFoundError('gone');

    expect(err).toBeInstanceOf(AppError);
  });
});

describe('ConflictError', () => {
  it('has statusCode 409', () => {
    const err = new ConflictError('Duplicate');

    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Duplicate');
    expect(err.name).toBe('ConflictError');
  });

  it('is an instance of AppError', () => {
    const err = new ConflictError('dup');

    expect(err).toBeInstanceOf(AppError);
  });
});
