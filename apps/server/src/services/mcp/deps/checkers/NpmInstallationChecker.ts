import { execFile } from 'node:child_process';
import os from 'node:os';
import { promisify } from 'node:util';

import { type InstallationChecker, type PackageInstallCheckResult } from '../types';

const execFilePromise = promisify(execFile);

const isWindows = os.platform() === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const npxCommand = isWindows ? 'npx.cmd' : 'npx';

// strict regex based on npm package naming rules
const NPM_PACKAGE_NAME_REGEX = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

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

    if (!NPM_PACKAGE_NAME_REGEX.test(details.packageName)) {
      return {
        error: 'Invalid package name format',
        installed: false,
        packageName: details.packageName,
      };
    }

    try {
      const packageName = details.packageName;
      // Use npm list to check if package is globally installed
      const { stdout: globalStdout } = await execFilePromise(
        npmCommand,
        ['list', '-g', packageName, '--depth=0'],
        { shell: isWindows },
      );
      if (!globalStdout.includes('(empty)') && globalStdout.includes(packageName)) {
        return {
          installed: true,
          packageName,
        };
      }

      // Check if package can be used directly via npx (which also verifies if package is available)
      await execFilePromise(npxCommand, ['-y', packageName, '--version'], { shell: isWindows });
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
