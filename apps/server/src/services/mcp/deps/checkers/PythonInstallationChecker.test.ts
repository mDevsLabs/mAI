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

    describe('pip list detection', () => {
      it('should detect installed package via pip list (exact match)', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'numpy                1.24.3\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(mockExecFilePromise).toHaveBeenCalledWith('python', ['-m', 'pip', 'list']);
        expect(result).toEqual({
          installed: true,
          packageName: 'numpy',
        });
      });

      it('should detect installed package via pip list (case insensitive)', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'NumPy                1.24.3\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(true);
        expect(result.packageName).toBe('numpy');
      });

      it('should detect package with hyphen in name', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'scikit-learn         1.2.2\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'scikit-learn' });

        expect(result.installed).toBe(true);
      });

      it('should use custom python command when provided', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'requests             2.28.1\n',
          stderr: '',
        });

        await checker.checkPackageInstalled({
          packageName: 'requests',
          pythonCommand: 'python3',
        });

        expect(mockExecFilePromise).toHaveBeenCalledWith('python3', ['-m', 'pip', 'list']);
      });

      it('should handle pip list output with extra whitespace', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '  pandas               2.0.0  \n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'pandas' });

        expect(result.installed).toBe(true);
      });
    });

    describe('fallback import check', () => {
      it('should use import fallback when pip list returns empty', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        const result = await checker.checkPackageInstalled({ packageName: 'requests' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(1, 'python', ['-m', 'pip', 'list']);
        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, 'python', [
          '-c',
          `
import importlib
import sys

try:
    pkg = sys.argv[1].replace('-', '_')
    importlib.import_module(pkg)
    print('Package installed')
except ImportError:
    pass
        `,
          'requests',
        ]);
        expect(result).toEqual({
          installed: true,
          packageName: 'requests',
        });
      });

      it('should convert hyphens to underscores for import check', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({ packageName: 'scikit-learn' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, 'python', [
          '-c',
          `
import importlib
import sys

try:
    pkg = sys.argv[1].replace('-', '_')
    importlib.import_module(pkg)
    print('Package installed')
except ImportError:
    pass
        `,
          'scikit-learn',
        ]);
      });

      it('should use custom python command for import check', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({
          packageName: 'numpy',
          pythonCommand: 'python3.11',
        });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, 'python3.11', [
          '-c',
          `
import importlib
import sys

try:
    pkg = sys.argv[1].replace('-', '_')
    importlib.import_module(pkg)
    print('Package installed')
except ImportError:
    pass
        `,
          'numpy',
        ]);
      });

      it('should return not installed when import fallback fails', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '',
            stderr: '',
          })
          .mockRejectedValueOnce(new Error('ModuleNotFoundError'));

        const result = await checker.checkPackageInstalled({ packageName: 'nonexistent' });

        expect(result).toEqual({
          installed: false,
          packageName: 'nonexistent',
        });
      });
    });

    describe('package not found scenarios', () => {
      it('should return not installed when pip list finds no match', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '',
            stderr: '',
          })
          .mockRejectedValueOnce(new Error('ModuleNotFoundError'));

        const result = await checker.checkPackageInstalled({ packageName: 'nonexistent-pkg' });

        expect(result).toEqual({
          installed: false,
          packageName: 'nonexistent-pkg',
        });
      });

      it('should return not installed when pip list output does not contain package', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: 'other-package        1.0.0\n',
            stderr: '',
          })
          .mockRejectedValueOnce(new Error('Import failed'));

        const result = await checker.checkPackageInstalled({ packageName: 'target-package' });

        expect(result.installed).toBe(false);
      });
    });

    describe('error handling', () => {
      it('should handle pip list command execution error', async () => {
        mockExecFilePromise.mockRejectedValueOnce(new Error('pip: command not found'));

        const result = await checker.checkPackageInstalled({ packageName: 'requests' });

        expect(result).toEqual({
          error: 'pip: command not found',
          installed: false,
          packageName: 'requests',
        });
      });

      it('should handle python command not found error', async () => {
        mockExecFilePromise.mockRejectedValueOnce(
          new Error('python: command not found. Try installing Python'),
        );

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(false);
        expect(result.error).toContain('python: command not found');
      });

      it('should handle non-Error exceptions', async () => {
        mockExecFilePromise.mockRejectedValueOnce('string error');

        const result = await checker.checkPackageInstalled({ packageName: 'pandas' });

        expect(result).toEqual({
          error: 'Unknown error',
          installed: false,
          packageName: 'pandas',
        });
      });

      it('should handle timeout errors gracefully', async () => {
        const timeoutError = new Error('Command execution timeout');
        mockExecFilePromise.mockRejectedValueOnce(timeoutError);

        const result = await checker.checkPackageInstalled({ packageName: 'slow-package' });

        expect(result.installed).toBe(false);
        expect(result.error).toBe('Command execution timeout');
      });
    });

    describe('edge cases', () => {
      it('should handle package name with multiple hyphens', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: 'Package installed\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({ packageName: 'my-test-package' });

        // Note: The implementation only replaces the first hyphen, not all hyphens
        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, 'python', [
          '-c',
          `
import importlib
import sys

try:
    pkg = sys.argv[1].replace('-', '_')
    importlib.import_module(pkg)
    print('Package installed')
except ImportError:
    pass
        `,
          'my-test-package',
        ]);
      });

      it('should handle pip list output with version in parentheses', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'numpy                1.24.3 (from /usr/lib/python3)\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(true);
      });

      it('should handle multiline pip list output', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout:
            'package1             1.0.0\nnumpy                1.24.3\npackage2             2.0.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        expect(result.installed).toBe(true);
      });

      it('should not match partial package names', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: 'numpy-extras         1.0.0\n',
            stderr: '',
          })
          .mockRejectedValueOnce(new Error('ModuleNotFoundError'));

        const result = await checker.checkPackageInstalled({ packageName: 'numpy' });

        // Should not be installed since 'numpy' is only a substring of 'numpy-extras'
        // The grep -i will match, but the actual contains check should verify exact match
        expect(result.installed).toBe(false);
      });

      it('should handle different python version commands', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: 'requests             2.28.1\n',
          stderr: '',
        });

        await checker.checkPackageInstalled({
          packageName: 'requests',
          pythonCommand: 'python3.10',
        });

        expect(mockExecFilePromise).toHaveBeenCalledWith('python3.10', ['-m', 'pip', 'list']);
      });
    });
  });
});
