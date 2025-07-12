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
    default: jest.fn().mockImplementation((input) => ({
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(
            // Criar um buffer com header PNG válido mais completo
            Buffer.from([
                0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
                0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
                0x49, 0x48, 0x44, 0x52, // IHDR chunk type
                0x00, 0x00, 0x03, 0x20, // Width: 800
                0x00, 0x00, 0x02, 0x58, // Height: 600
                0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
                ...Array(200).fill(0) // dados fictícios do PNG
            ])
        )
    }))
}));

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid-value')
}));

jest.mock('image-size', () => jest.fn(() => ({ width: 800, height: 600 })));

// Mock do fs para arquivos de imagem
jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn(() => true),
    statSync: jest.fn(() => ({ size: 1024 })),
    readFileSync: jest.fn(() => 
        Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
            0x49, 0x48, 0x44, 0x52, // IHDR chunk type
            0x00, 0x00, 0x03, 0x20, // Width: 800
            0x00, 0x00, 0x02, 0x58, // Height: 600
            0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
            ...Array(200).fill(0) // dados fictícios do PNG
        ])
    )
}));

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
    // jest.spyOn(console, 'log').mockImplementation(() => { });
});

afterAll(() => {
    if (console.error.mockRestore) {
        console.error.mockRestore();
    }
    if (console.log.mockRestore) {
        console.log.mockRestore();
    }
});