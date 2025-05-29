// Simple test script to verify file writing functionality
const fs = require('fs');
const path = require('path');
const os = require('os');

// Test the file writing utility functions
async function testFileWriting() {
    console.log('Testing file writing functionality...');
    
    // Set environment variables for testing
    process.env.FILE_WRITE_ENABLED = 'true';
    process.env.FILE_WRITE_LINE_LIMIT = '50';
    
    // Import the module after setting env vars
    const { writeResearchFile, isPathAllowed, validateWritePath } = require('./dist/index.js');
    
    const testDir = path.join(os.homedir(), 'test-deep-research');
    const testFile = path.join(testDir, 'test-output.md');
    
    try {
        // Test path validation
        console.log('✓ Testing path validation...');
        const validPath = await validateWritePath(testFile);
        console.log(`✓ Valid path: ${validPath}`);
        
        // Test file writing
        console.log('✓ Testing file writing...');
        const testContent = '# Test File\n\nThis is a test of the file writing functionality.\n\n- Feature 1\n- Feature 2\n- Feature 3';
        await writeResearchFile(testFile, testContent, 'rewrite');
        console.log(`✓ File written successfully: ${testFile}`);
        
        // Verify file exists and has correct content
        if (fs.existsSync(testFile)) {
            const content = fs.readFileSync(testFile, 'utf8');
            if (content === testContent) {
                console.log('✓ File content verified successfully');
            } else {
                console.log('✗ File content mismatch');
            }
        } else {
            console.log('✗ File was not created');
        }
        
        // Test append mode
        console.log('✓ Testing append mode...');
        const appendContent = '\n\n## Additional Section\n\nThis was appended to the file.';
        await writeResearchFile(testFile, appendContent, 'append');
        console.log('✓ Content appended successfully');
        
        // Clean up
        fs.unlinkSync(testFile);
        fs.rmdirSync(testDir);
        console.log('✓ Test cleanup completed');
        
        console.log('\n🎉 All file writing tests passed!');
        
    } catch (error) {
        console.error('✗ Test failed:', error.message);
        
        // Clean up on error
        try {
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
            if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
        } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError.message);
        }
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testFileWriting().catch(console.error);
}

module.exports = { testFileWriting };