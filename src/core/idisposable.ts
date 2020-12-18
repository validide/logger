/**
 * Disposable object.
 */
export interface IDisposable {
  /**
   * Clear all resources and dispose of the instance.
   */
  dispose(): Promise<void>;
}
