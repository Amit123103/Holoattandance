import { build } from 'vite';

console.log('Starting programmatic build...');

try {
    await build({
        configFile: './vite.config.js',
        logLevel: 'info',
    });
    console.log('Build completed successfully!');
} catch (e) {
    console.error('Build failed with error:');
    console.error(e);
}
