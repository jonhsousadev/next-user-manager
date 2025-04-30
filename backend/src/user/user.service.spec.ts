import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt'; 
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;

  let mockUserRepository: {
    find: jest.Mock;
    save: jest.Mock;
    findOneBy: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.senha, salt);
    mockUserRepository.save.mockResolvedValue({
      ...user,
      senha: hashedPassword,
    });
    const result = await service.create(user as User); 
    // expect(result.senha).toEqual(hashedPassword);
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

  it('deve buscar um usuário pelo ID', async () => {
    mockUserRepository.findOneBy.mockResolvedValue({ id: 1, nome: 'Jonh' });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, nome: 'Jonh' });
  });

  it('deve atualizar um usuário', async () => {
    mockUserRepository.update.mockResolvedValue({ affected: 1 });
    const result = await service.update(1, { nome: 'Novo Nome' });
    expect(result).toEqual({ affected: 1 });
  });
  it('deve deletar um usuário', async () => {
    mockUserRepository.delete.mockResolvedValue({ affected: 1 });
    const result = await service.remove(1);
    expect(result.affected).toBe(1);
  });
});
