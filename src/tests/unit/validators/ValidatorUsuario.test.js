import UsuarioValidator from "../../../utils/ValidatorUsuario";

describe('ValidatorUsuario', () =>{
    let usuarioValidator;
    beforeEach(()=>{
        usuarioValidator =  UsuarioValidator
    });
    afterEach(() => {
        jest.clearAllMocks()
    });
    describe('validarCPF', ()=>{
        it('deve validar um cpf válido e retornar true', () =>{
            const resultado = usuarioValidator.validarCPF('22790660093')
            expect(resultado).toEqual(true)
        });
        it('não deve validar um cpf cujo o tamanho ultrapasse 11 caracteres e retornar false', ()=> {
            const resultado = usuarioValidator.validarCPF('227906600933')
            expect(resultado).toEqual(false)
        });
        it('não deve validar um cpf com numeros repetidos e retornar false', ()=> {
            const resultado = usuarioValidator.validarCPF('33333333333')
            expect(resultado).toEqual(false)
        });
        it('não deve validar um CPF com menos de 11 caracteres', () => {
        const resultado = usuarioValidator.validarCPF('22790660'); // Apenas 8 dígitos
        expect(resultado).toEqual(false);
        });

        it('deve validar um CPF formatado com pontos e traços', () => {
            const resultado = usuarioValidator.validarCPF('227.906.600-93')
            expect(resultado).toEqual(true)
        });

        it('não deve validar um CPF com dígitos verificadores incorretos', () => {
            const resultado = usuarioValidator.validarCPF('22790660099') // Dígitos verificadores errados
            expect(resultado).toEqual(false)
        });

        it('deve validar CPF com caracteres especiais misturados', () => {
            const resultado = usuarioValidator.validarCPF('227a906b600c93')
            expect(resultado).toEqual(true) // Remove caracteres não numéricos
        });
    });
    describe('validarData', () => {
        it('retornar true se a data de nascimento for igual ou maior que 18', () =>{
            const resultado = usuarioValidator.validarData('2000-01-01')
            expect(resultado).toEqual(true)
        });
        
        it('retornar false se a data de nascimento for menor que 18', () =>{
            const resultado = usuarioValidator.validarData('2010-01-01')
            expect(resultado).toEqual(false)
        });

        it('retornar true para pessoa que completa exatamente 18 anos hoje', () => {
            const hoje = new Date()
            const dataHa18Anos = new Date(hoje.getFullYear() - 18, hoje.getMonth(), hoje.getDate())
            const dataFormatada = dataHa18Anos.toISOString().split('T')[0]
            
            const resultado = usuarioValidator.validarData(dataFormatada)
            expect(resultado).toEqual(true)
        });

        it('retornar false para pessoa que ainda não completou 18 anos este ano', () => {
            const hoje = new Date()
            const dataFutura = new Date(hoje.getFullYear() - 17, hoje.getMonth() + 1, hoje.getDate())
            const dataFormatada = dataFutura.toISOString().split('T')[0]
            
            const resultado = usuarioValidator.validarData(dataFormatada)
            expect(resultado).toEqual(false)
        });

        it('retornar true para pessoa que já fez aniversário este ano', () => {
            const hoje = new Date()
            const dataPassada = new Date(hoje.getFullYear() - 20, hoje.getMonth() - 1, hoje.getDate())
            const dataFormatada = dataPassada.toISOString().split('T')[0]
            
            const resultado = usuarioValidator.validarData(dataFormatada)
            expect(resultado).toEqual(true)
        });
    })
})