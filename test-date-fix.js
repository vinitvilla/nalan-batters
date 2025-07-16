// Quick test to verify date formatting fix
const { formatDateOnly } = require('./src/lib/utils/commonFunctions.ts');

const testCases = [
    '2025-07-17T00:00:00.000Z',
    '2025-07-16T00:00:00.000Z', 
    '2025-07-18T00:00:00.000Z',
    '2025-07-17T12:30:00.000Z',
    '2025-07-17'
];

console.log('Testing formatDateOnly function:');
testCases.forEach(testCase => {
    const result = formatDateOnly(testCase);
    console.log(`${testCase} -> ${result}`);
});

// Test the date extraction
console.log('\nTesting date extraction:');
const sampleDate = '2025-07-17T00:00:00.000Z';
console.log(`Original: ${sampleDate}`);
console.log(`Split result: ${sampleDate.split('T')[0]}`);
console.log(`Date parts: ${sampleDate.split('T')[0].split('-')}`);

const [year, month, day] = sampleDate.split('T')[0].split('-').map(Number);
console.log(`Parsed: year=${year}, month=${month}, day=${day}`);
const localDate = new Date(year, month - 1, day);
console.log(`Local date: ${localDate.toLocaleDateString()}`);
