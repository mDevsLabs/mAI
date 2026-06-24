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

      // Use pip list to check if package is installed
      const { stdout } = await execFilePromise(pythonCommand, ['-m', 'pip', 'list']);

      // If there's output and it contains the package name, consider it installed
      // Split by line and check if any line starts with the package name (case-insensitive)
      // to avoid matching partial names in the middle of other packages.
      // E.g. pip list format: packageName 1.0.0
      const lines = stdout.split('\n');
      const isInstalled = lines.some((line) => {
        const parts = line.trim().split(/\s+/);
        return parts.length >= 1 && parts[0].toLowerCase() === packageName.toLowerCase();
      });

      if (isInstalled) {
        return {
          installed: true,
          packageName,
        };
      }

      // Try to directly import the package to verify
      try {
        // Pass the package name safely as an argument to the python script
        const importScript = `
import importlib
import sys

try:
    pkg = sys.argv[1].replace('-', '_')
    importlib.import_module(pkg)
    print('Package installed')
except ImportError:
    pass
        `;
        const { stdout: importStdout } = await execFilePromise(pythonCommand, [
          '-c',
          importScript,
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
