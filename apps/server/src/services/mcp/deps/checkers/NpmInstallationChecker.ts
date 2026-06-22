import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { type InstallationChecker, type PackageInstallCheckResult } from '../types';

const execPromise = promisify(execFile);

/**
 * NPM Installation Checker
 */
export class NpmInstallationChecker implements InstallationChecker {
  /**
   * Check if npm package is installed
   */
  async checkPackageInstalled(details: {
    packageName?: string;
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

      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

      // Use npm list to check if package is globally installed
      const { stdout: globalStdout } = await execPromise(npmCmd, [
        'list',
        '-g',
        packageName,
        '--depth=0',
      ]);
      if (!globalStdout.includes('(empty)') && globalStdout.includes(packageName)) {
        return {
          installed: true,
          packageName,
        };
      }

      // Check if package can be used directly via npx (which also verifies if package is available)
      await execPromise(npxCmd, ['-y', packageName, '--version']);
      return {
        installed: true,
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
