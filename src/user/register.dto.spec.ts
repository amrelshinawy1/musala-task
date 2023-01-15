import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(new RegisterDto()).toBeDefined();
  });

  it('should equals', () => {

    const dto: RegisterDto = {
      username: 'amr',
      password: 'password',
      firstName: 'Hantsy',
      lastName: 'Bai',
      email: 'amr@gmail.com'
    };

    expect(dto).toEqual(
      {
        username: 'amr',
        password: 'password',
        firstName: 'Hantsy',
        lastName: 'Bai',
        email: 'amr@gmail.com'
      }
    );

  });
});
