import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { type InstallationChecker, type PackageInstallCheckResult } from '../types';

const execFilePromise = promisify(execFile);

/**
 * Python Installation Checker
 */
export class PythonInstallationChecker implements InstallationChecker {
  /**
   * Check if Python package is installed
   */
  async checkPackageInstalled(details: {
    packageName?: string;
    pythonCommand?: string;
  }): Promise<PackageInstallCheckResult> {
    if (!details.packageName) {
      return {
        error: 'Package name not provided',
        installed: false,
        packageName: '',
      };
    }

    try {
      const packageName = details.packageName;
      const pythonCommand = details.pythonCommand || 'python';

      // Use pip show to check if package is installed (safe from command injection)
      try {
        await execFilePromise(pythonCommand, ['-m', 'pip', 'show', packageName]);

        return {
          installed: true,
          packageName,
        };
      } catch {
        // pip show failed, package not found or pip error. Let's fall back to import
      }

      // Try to directly import the package to verify
      try {
        const { stdout: importStdout } = await execFilePromise(pythonCommand, [
          '-c',
          `import sys; __import__(sys.argv[1].replace("-", "_")); print("Package installed")`,
          packageName,
        ]);
        if (importStdout.includes('Package installed')) {
          return {
            installed: true,
            packageName,
          };
        }
      } catch {
        // Import failed, package may not exist
      }

      return {
        installed: false,
        packageName,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        installed: false,
        packageName: details.packageName,
      };
    }
  }
}
