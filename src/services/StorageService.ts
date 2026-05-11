// StorageService handles saving and loading persistent data such as
// high scores and preferences. It wraps localStorage access to allow
// easy mocking during tests.

export class StorageService {
  getNumber(key: string, defaultValue = 0): number {
    const value = localStorage.getItem(key);
    return value ? parseInt(value, 10) : defaultValue;
  }
  setNumber(key: string, value: number): void {
    localStorage.setItem(key, String(value));
  }
  getString(key: string, defaultValue = ''): string {
    const value = localStorage.getItem(key);
    return value ?? defaultValue;
  }
  setString(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}
