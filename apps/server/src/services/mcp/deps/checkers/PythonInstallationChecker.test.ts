import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PythonInstallationChecker } from './PythonInstallationChecker';

// Hoist the mock to ensure it's available in the factory
const { mockExecFilePromise } = vi.hoisted(() => {
  return {
    mockExecFilePromise: vi.fn(),
  };
});

// Mock node:child_process
vi.mock('node:child_process');

// Mock node:util to return our hoisted mock when promisify is called
vi.mock('node:util', () => ({
  default: {
    promisify: () => mockExecFilePromise,
  },
  promisify: () => mockExecFilePromise,
}));

describe('PythonInstallationChecker', () => {
  let checker: PythonInstallationChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    checker = new PythonInstallationChecker();
  });

  describe('checkPackageInstalled', () => {
    describe('validation', () => {
      it('should return error when packageName is not provided', async () => {
        const result = await checker.checkPackageInstalled({});

        expect(result).toEqual({
          error: 'Package name not provided',
          installed: false,
          packageName: '',
        });
        expect(mockExecFilePromise).not.toHaveBeenCalled();
      });

      it('should return error when packageName is undefined', async () => {
        const result = await checker.checkPackageInstalled({ packageName: undefined });

        expect(result).toEqual({
          error: 'Package name not provided',
          installed: false,
          packageName: '',
        });
      });

      it('should return error when packageName is empty string', async () => {
        const result = await checker.checkPackageInstalled({ packageName: '' });

        expect(result).toEqual({
          error: 'Package name not provided',
          installed: false,
          packageName: '',
        });
      });
    });

    describe('pip show detection', () => {
      it('should detect installed package via pip show', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'Name: numpy\nVersion: 1.24.3\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(mockExecFilePromise).toHaveBeenCalledWith('python', ['-m', 'pip', 'show', 'numpy']);
        expect(result).toEqual({
          installed: true,
          packageName: 'numpy',
        });
      });

      it('should detect installed package via pip show (case insensitive result)', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'Name: NumPy\nVersion: 1.24.3\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(true);
        expect(result.packageName).toBe('numpy');
      });

      it('should detect package with hyphen in name', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'Name: scikit-learn\nVersion: 1.2.2\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'scikit-learn' });

        expect(result.installed).toBe(true);
      });

      it('should use custom python command when provided', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'Name: requests\nVersion: 2.28.1\n',
          stderr: '',
        });

        await checker.checkPackageInstalled({
          packageName: 'requests',
          pythonCommand: 'python3',
        });

        expect(mockExecFilePromise).toHaveBeenCalledWith('python3', ['-m', 'pip', 'show', 'requests']);
      });

      it('should handle pip show output with extra whitespace', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '  Name: pandas  \n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'pandas' });

        expect(result.installed).toBe(true);
      });
    });

    describe('fallback import check', () => {
      it('should use import fallback when pip show fails', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('Package(s) not found'))
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        const result = await checker.checkPackageInstalled({ packageName: 'requests' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(
          1,
          'python', ['-m', 'pip', 'show', 'requests']
        );
        expect(mockExecFilePromise).toHaveBeenNthCalledWith(
          2,
          'python', ['-c', 'import sys; __import__(sys.argv[1].replace("-", "_")); print("Package installed")', 'requests']
        );
        expect(result).toEqual({
          installed: true,
          packageName: 'requests',
        });
      });

      it('should convert hyphens to underscores for import check', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('Package(s) not found'))
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({ packageName: 'scikit-learn' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(
          2,
          'python', ['-c', 'import sys; __import__(sys.argv[1].replace("-", "_")); print("Package installed")', 'scikit-learn']
        );
      });

      it('should use custom python command for import check', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('Package(s) not found'))
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({
          packageName: 'numpy',
          pythonCommand: 'python3.11',
        });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(
          2,
          'python3.11', ['-c', 'import sys; __import__(sys.argv[1].replace("-", "_")); print("Package installed")', 'numpy']
        );
      });

      it('should return not installed when import fallback fails', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('Package(s) not found'))
          .mockRejectedValueOnce(new Error('ModuleNotFoundError'));

        const result = await checker.checkPackageInstalled({ packageName: 'nonexistent' });

        expect(result).toEqual({
          installed: false,
          packageName: 'nonexistent',
        });
      });
    });

    describe('package not found scenarios', () => {
      it('should return not installed when pip show finds no match', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('Package(s) not found'))
          .mockRejectedValueOnce(new Error('ModuleNotFoundError'));

        const result = await checker.checkPackageInstalled({ packageName: 'nonexistent-pkg' });

        expect(result).toEqual({
          installed: false,
          packageName: 'nonexistent-pkg',
        });
      });
    });

    describe('error handling', () => {
      it('should handle pip show command execution error', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('pip: command not found'))
          .mockRejectedValueOnce(new Error('pip: command not found')); // Fallback import also fails

        const result = await checker.checkPackageInstalled({ packageName: 'requests' });

        expect(result).toEqual({
          installed: false,
          packageName: 'requests',
        });
      });

      it('should handle python command not found error', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('python: command not found. Try installing Python'))
          .mockRejectedValueOnce(new Error('python: command not found. Try installing Python'));

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(false);
      });

      it('should handle non-Error exceptions', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce('string error')
          .mockRejectedValueOnce('string error');

        const result = await checker.checkPackageInstalled({ packageName: 'pandas' });

        expect(result).toEqual({
          installed: false,
          packageName: 'pandas',
        });
      });

      it('should handle timeout errors gracefully', async () => {
        const timeoutError = new Error('Command execution timeout');
        mockExecFilePromise
          .mockRejectedValueOnce(timeoutError)
          .mockRejectedValueOnce(timeoutError);

        const result = await checker.checkPackageInstalled({ packageName: 'slow-package' });

        expect(result.installed).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle package name with multiple hyphens', async () => {
        mockExecFilePromise
          .mockRejectedValueOnce(new Error('Package(s) not found'))
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({ packageName: 'my-test-package' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(
          2,
          'python', ['-c', 'import sys; __import__(sys.argv[1].replace("-", "_")); print("Package installed")', 'my-test-package']
        );
      });

      it('should handle multiline pip show output', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout:
            'Name: numpy\nVersion: 1.24.3\nSummary: Fundamental package for array computing in Python\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(true);
      });

      it('should handle different python version commands', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'Name: requests\nVersion: 2.28.1\n',
          stderr: '',
        });

        await checker.checkPackageInstalled({
          packageName: 'requests',
          pythonCommand: 'python3.10',
        });

        expect(mockExecFilePromise).toHaveBeenCalledWith('python3.10', ['-m', 'pip', 'show', 'requests']);
      });
    });
  });
});
