jest.mock('./src/utils/logger.js', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
}));

// Mocks globais para dependências problemáticas
jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
    genSalt: jest.fn()
}));

jest.mock('winston-daily-rotate-file', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        filename: 'test.log',
        level: 'info'
    }));
});

jest.mock('sharp', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-buffer'))
    }))
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid-value')
}));

jest.mock('image-size', () => jest.fn(() => ({ width: 800, height: 600 })));

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
});

afterAll(() => {
    if (console.error.mockRestore) {
        console.error.mockRestore();
    }
    if (console.log.mockRestore) {
        console.log.mockRestore();
    }
});