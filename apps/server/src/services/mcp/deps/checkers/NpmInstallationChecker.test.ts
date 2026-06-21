import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NpmInstallationChecker } from './NpmInstallationChecker';

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

describe('NpmInstallationChecker', () => {
  let checker: NpmInstallationChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    checker = new NpmInstallationChecker();
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

      it('should return error when packageName has command injection characters (e.g. &)', async () => {
        const result = await checker.checkPackageInstalled({ packageName: 'foo&calc' });

        expect(result).toEqual({
          error: 'Invalid package name format',
          installed: false,
          packageName: 'foo&calc',
        });
        expect(mockExecFilePromise).not.toHaveBeenCalled();
      });

      it('should return error when packageName has command injection characters (e.g. ;)', async () => {
        const result = await checker.checkPackageInstalled({ packageName: 'package;rm -rf /' });

        expect(result).toEqual({
          error: 'Invalid package name format',
          installed: false,
          packageName: 'package;rm -rf /',
        });
        expect(mockExecFilePromise).not.toHaveBeenCalled();
      });

    });

    describe('global package detection', () => {
      it('should detect globally installed package', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── typescript@5.0.4\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'typescript' });

        expect(mockExecFilePromise).toHaveBeenCalledWith(expect.any(String), ['list', '-g', 'typescript', '--depth=0'], expect.objectContaining({ shell: expect.any(Boolean) }));
        expect(result).toEqual({
          installed: true,
          packageName: 'typescript',
        });
      });

      it('should detect globally installed package with @scope', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── @angular/cli@16.0.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: '@angular/cli' });

        expect(mockExecFilePromise).toHaveBeenCalledWith(expect.any(String), ['list', '-g', '@angular/cli', '--depth=0'], expect.objectContaining({ shell: expect.any(Boolean) }));
        expect(result.installed).toBe(true);
      });

      it('should detect package with different version format', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── eslint@8.41.0 (deduped)\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'eslint' });

        expect(result.installed).toBe(true);
      });

      it('should handle npm list output with multiple packages', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n├── package1@1.0.0\n├── react@18.2.0\n└── package2@2.0.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'react' });

        expect(result.installed).toBe(true);
      });
    });

    describe('npm list empty detection', () => {
      it('should fallback to npx when npm list returns (empty)', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '/usr/local/lib\n(empty)\n',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: '1.0.0\n',
            stderr: '',
          });

        const result = await checker.checkPackageInstalled({ packageName: 'create-react-app' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(
          1,
          expect.any(String),
          ['list', '-g', 'create-react-app', '--depth=0'],
          expect.objectContaining({ shell: expect.any(Boolean) })
        );
        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, expect.any(String), ['-y', 'create-react-app', '--version'], expect.objectContaining({ shell: expect.any(Boolean) }));
        expect(result).toEqual({
          installed: true,
          packageName: 'create-react-app',
        });
      });

      it('should fallback to npx when package not in global list', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '/usr/local/lib\n└── other-package@1.0.0\n',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: '2.3.1\n',
            stderr: '',
          });

        const result = await checker.checkPackageInstalled({ packageName: 'cowsay' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, expect.any(String), ['-y', 'cowsay', '--version'], expect.objectContaining({ shell: expect.any(Boolean) }));
        expect(result.installed).toBe(true);
      });
    });

    describe('npx fallback mechanism', () => {
      it('should use npx -y flag to auto-install if needed', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '(empty)\n',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: '5.1.0\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({ packageName: 'prettier' });

        expect(mockExecFilePromise).toHaveBeenCalledWith(expect.any(String), ['-y', 'prettier', '--version'], expect.objectContaining({ shell: expect.any(Boolean) }));
      });

      it('should succeed if npx can execute package', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '(empty)\n',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: '3.2.1\n',
            stderr: '',
          });

        const result = await checker.checkPackageInstalled({ packageName: 'http-server' });

        expect(result.installed).toBe(true);
        expect(result.packageName).toBe('http-server');
      });

      it('should handle npx with @scope packages', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '(empty)\n',
            stderr: '',
          })
          .mockResolvedValueOnce({
            stdout: '7.0.0\n',
            stderr: '',
          });

        await checker.checkPackageInstalled({ packageName: '@vue/cli' });

        expect(mockExecFilePromise).toHaveBeenNthCalledWith(2, expect.any(String), ['-y', '@vue/cli', '--version'], expect.objectContaining({ shell: expect.any(Boolean) }));
      });
    });

    describe('package not found scenarios', () => {
      it('should return not installed when npm list fails and npx fails', async () => {
        mockExecFilePromise
          .mockResolvedValueOnce({
            stdout: '(empty)\n',
            stderr: '',
          })
          .mockRejectedValueOnce(new Error('command not found'));

        const result = await checker.checkPackageInstalled({ packageName: 'nonexistent-pkg' });

        expect(result).toEqual({
          error: 'command not found',
          installed: false,
          packageName: 'nonexistent-pkg',
        });
      });

      it('should return not installed when both checks fail', async () => {
        mockExecFilePromise.mockRejectedValue(new Error('Network error'));

        const result = await checker.checkPackageInstalled({ packageName: 'some-package' });

        expect(result.installed).toBe(false);
        expect(result.error).toBe('Network error');
      });
    });

    describe('error handling', () => {
      it('should handle npm not installed error', async () => {
        mockExecFilePromise.mockRejectedValueOnce(new Error('npm: command not found'));

        const result = await checker.checkPackageInstalled({ packageName: 'es-toolkit' });

        expect(result).toEqual({
          error: 'npm: command not found',
          installed: false,
          packageName: 'es-toolkit',
        });
      });

      it('should handle permission errors', async () => {
        mockExecFilePromise.mockRejectedValueOnce(new Error('EACCES: permission denied'));

        const result = await checker.checkPackageInstalled({ packageName: 'webpack' });

        expect(result.installed).toBe(false);
        expect(result.error).toContain('EACCES');
      });

      it('should handle non-Error exceptions', async () => {
        mockExecFilePromise.mockRejectedValueOnce('string error');

        const result = await checker.checkPackageInstalled({ packageName: 'babel' });

        expect(result).toEqual({
          error: 'Unknown error',
          installed: false,
          packageName: 'babel',
        });
      });

      it('should handle npm registry timeout', async () => {
        mockExecFilePromise.mockRejectedValueOnce(new Error('ETIMEDOUT: connection timeout'));

        const result = await checker.checkPackageInstalled({ packageName: 'axios' });

        expect(result.installed).toBe(false);
        expect(result.error).toBe('ETIMEDOUT: connection timeout');
      });
    });

    describe('edge cases', () => {
      it('should handle package names with hyphens', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── create-next-app@13.4.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'create-next-app' });

        expect(result.installed).toBe(true);
      });

      it('should handle package names with dots', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── package.name@1.0.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'package.name' });

        expect(result.installed).toBe(true);
      });

      it('should handle npm list with warnings in stderr', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── typescript@5.0.4\n',
          stderr: 'npm WARN deprecated package@1.0.0\n',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'typescript' });

        expect(result.installed).toBe(true);
      });

      it('should handle npm list with extra whitespace', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '  /usr/local/lib  \n  └── jest@29.5.0  \n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'jest' });

        expect(result.installed).toBe(true);
      });

      it('should reject invalid package names (e.g. uppercase characters are not allowed in npm packages)', async () => {
        const result = await checker.checkPackageInstalled({ packageName: 'MyPackage' });

        expect(result.installed).toBe(false);
        expect(result.error).toBe('Invalid package name format');
      });

      it('should handle npm list output with symlink info', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── react@18.2.0 -> /custom/path/react\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'react' });

        expect(result.installed).toBe(true);
      });

      it('should handle npm list with peer dependency warnings', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── UNMET PEER DEPENDENCY eslint@8.0.0\n└── webpack@5.88.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'webpack' });

        expect(result.installed).toBe(true);
      });

      it('should match substring package names in global list', async () => {
        mockExecFilePromise.mockResolvedValueOnce({
          stdout: '/usr/local/lib\n└── react-native@0.72.0\n',
          stderr: '',
        });

        const result = await checker.checkPackageInstalled({ packageName: 'react' });

        // Note: The implementation uses includes(), so 'react' will match 'react-native'
        // This is intentional behavior - grep would also match substring
        expect(result.installed).toBe(true);
      });
    });
  });
});
