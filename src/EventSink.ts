/* -*- indent-tabs-mode: nil; tab-width: 2; -*- */
/* vim: set ts=2 sw=2 et ai : */
/**
  Copyright (C) 2023 WebExtensions Experts Group

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  @license
*/

export type EventListener<T> = (details: T) => void | Promise<void>;
export type ErrorHandler = (error: unknown) => void;

export class EventSink<T> {
  private readonly _listeners = new Set<EventListener<T>>();
  private readonly _errorHandlers = new Set<ErrorHandler>();

  public logErrors = true;

  public constructor() {
    this.addErrorHandler((error) => {
      if (this.logErrors) {
        console.error(error);
      }
    });
  }

  public addListener(listener: EventListener<T>): void {
    this._listeners.add(listener);
  }

  public removeListener(listener: EventListener<T>): void {
    this._listeners.delete(listener);
  }

  public addErrorHandler(errorHandler: ErrorHandler): void {
    this._errorHandlers.add(errorHandler);
  }

  public removeErrorHandler(errorHandler: ErrorHandler): void {
    this._errorHandlers.delete(errorHandler);
  }

  public hasListener(listener: EventListener<T>): boolean {
    return this._listeners.has(listener);
  }

  public hasErrorHandler(errorHandler: ErrorHandler): boolean {
    return this._errorHandlers.has(errorHandler);
  }

  private handleError(error: unknown): void {
    for (const errorHandler of this._errorHandlers) {
      try {
        errorHandler(error);
      } catch (e) {
        // Ignore
      }
    }
  }

  public dispatch(details: T): void {
    for (const listener of this._listeners) {
      try {
        const promise = Promise.resolve(listener(details));
        promise.catch((e) => {
          this.handleError(e);
        });
      } catch (e) {
        this.handleError(e);
      }
    }
  }
}
