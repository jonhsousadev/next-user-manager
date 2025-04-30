import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt'; 

describe('UserService', () => {
  let service: UserService;

  let mockUserRepository: { find: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve criar um usuário com senha hash', async () => {
    const user = { nome: 'Jonh', email: 'jonh@email.com', senha: '123456' };
    const hashedPassword = await bcrypt.hash(user.senha, 10);
    mockUserRepository.save.mockResolvedValue({
      ...user,
      senha: hashedPassword,
    });
  
    const result = await service.create(user as User);
  
    expect(result.senha).toEqual(hashedPassword);
    expect(mockUserRepository.save).toBeCalledWith({
      ...user,
      senha: hashedPassword,
    });
  });

  it('deve listar todos os usuários', async () => {
    mockUserRepository.find.mockResolvedValue([
      {
        id: 1,
        nome: 'Jonh',
        email: 'jonh@email.com',
      },
    ]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Jonh');
  });

});
