// Fungsi untuk menghitung rate keacakan
function calculateSwitchRate(id) {
    let switchCount = 0;
    for (let i = 0; i < id.length - 1; i++) {
        const currentChar = id[i];
        const nextChar = id[i + 1];
        const isCurrentLetter = /[A-F]/.test(currentChar);
        const isNextLetter = /[A-F]/.test(nextChar);
        const isCurrentDigit = /[0-9]/.test(currentChar);
        const isNextDigit = /[0-9]/.test(nextChar);

        if ((isCurrentLetter && isNextDigit) || (isCurrentDigit && isNextLetter)) {
            switchCount++;
        }
    }
    return (switchCount / (id.length - 1)) * 100;
}

// Fungsi untuk menghitung distribusi huruf-angka
function calculateDistribution(id) {
    const letters = (id.match(/[A-F]/g) || []).length;
    const digits = (id.match(/[0-9]/g) || []).length;
    const total = letters + digits;
    return {
        letterRatio: (letters / total) * 100,
        digitRatio: (digits / total) * 100,
        letters,
        digits
    };
}

// Fungsi untuk menghasilkan Custom Key ID
function generateCustomKeyId() {
    const letters = 'ABCDEF'; // Hanya A-F
    const digits = '0123456789'; // Hanya 0-9
    let randomId = '';
    const targetLength = 32;

    const targetLetters = Math.random() < 0.5 ? 10 : 11;
    const targetDigits = targetLength - targetLetters;

    let charPool = [];
    for (let i = 0; i < targetLetters; i++) {
        charPool.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }
    for (let i = 0; i < targetDigits; i++) {
        charPool.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }

    for (let i = charPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [charPool[i], charPool[j]] = [charPool[j], charPool[i]];
    }

    randomId = charPool.join('');

    let switchRate = calculateSwitchRate(randomId);
    let attempts = 0;
    const maxAttempts = 10;

    while (switchRate < 45 && attempts < maxAttempts) {
        charPool = [];
        for (let i = 0; i < targetLetters; i++) {
            charPool.push(letters.charAt(Math.floor(Math.random() * letters.length)));
        }
        for (let i = 0; i < targetDigits; i++) {
            charPool.push(digits.charAt(Math.floor(Math.random() * digits.length)));
        }
        for (let i = charPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [charPool[i], charPool[j]] = [charPool[j], charPool[i]];
        }
        randomId = charPool.join('');
        switchRate = calculateSwitchRate(randomId);
        attempts++;
    }

    return randomId;
}

module.exports = {
    generateCustomKeyId,
    calculateSwitchRate,
    calculateDistribution
};