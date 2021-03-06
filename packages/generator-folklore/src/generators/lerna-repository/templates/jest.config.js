const path = require('path');
const fs = require('fs');
const lernaJson = require('./lerna.json');
const getPackagesPaths = require('./build/utils/getPackagesPaths');

const packagesIgnorePatterns = lernaJson.packages.map(packagePath => (
    `<rootDir>/${packagePath}/(lib|es|dist)/`
));

const coveragePatterns = lernaJson.packages.map(packagePath => (
    `<rootDir>/${packagePath}/*/src/**/*.{js,jsx}`
));

const moduleNameMapper = getPackagesPaths().reduce((map, packagePath) => {
    const packageJsonPath = path.join(packagePath, '/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return {
        ...map,
        [packageJson.name]: `<rootDir>/${packagePath}/src/index.js`,
    };
}, {});

module.exports = {
    globals: {
        __DEV__: true,
    },
    setupFiles: [
        '<rootDir>/__tests__/shim.js',
        '<rootDir>/__tests__/setup.js',
    ],
    testPathIgnorePatterns: [
        ...packagesIgnorePatterns,
        '<rootDir>/__tests__/shim.js',
        '<rootDir>/__tests__/setup.js',
        '<rootDir>/__tests__/storyshots.test.js',
    ],
    modulePathIgnorePatterns: [
        ...packagesIgnorePatterns,
    ],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
        '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
        ...moduleNameMapper,
    },
    transformIgnorePatterns: [
        'node_modules/(?!(@folklore|react-intl)/)',
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        ...coveragePatterns,
        '!**/node_modules/**',
        '!**/vendor/**',
        '!**/templates/**',
        '!**/__tests__/**',
        '!**/__stories__/**',
    ],
};
