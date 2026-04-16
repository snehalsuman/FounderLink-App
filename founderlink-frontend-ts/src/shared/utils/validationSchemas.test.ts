import { loginSchema, registerSchema, startupSchema, investmentSchema, profileSchema } from './validationSchemas';

describe('loginSchema', () => {
  it('passes with valid email and password', async () => {
    await expect(loginSchema.validate({ email: 'user@example.com', password: 'secret123' })).resolves.toBeTruthy();
  });

  it('fails with invalid email', async () => {
    await expect(loginSchema.validate({ email: 'not-an-email', password: 'secret123' })).rejects.toThrow('Invalid email address');
  });

  it('fails when password is too short', async () => {
    await expect(loginSchema.validate({ email: 'user@example.com', password: '123' })).rejects.toThrow('at least 6 characters');
  });

  it('fails when fields are empty', async () => {
    await expect(loginSchema.validate({ email: '', password: '' })).rejects.toThrow();
  });
});

describe('registerSchema', () => {
  const valid = { name: 'Alice', email: 'alice@example.com', password: 'pass123', role: 'ROLE_FOUNDER' };

  it('passes with valid data', async () => {
    await expect(registerSchema.validate(valid)).resolves.toBeTruthy();
  });

  it('fails when name is too short', async () => {
    await expect(registerSchema.validate({ ...valid, name: 'A' })).rejects.toThrow('at least 2 characters');
  });

  it('fails with invalid role', async () => {
    await expect(registerSchema.validate({ ...valid, role: 'ROLE_UNKNOWN' })).rejects.toThrow();
  });

  it('accepts all three valid roles', async () => {
    for (const role of ['ROLE_FOUNDER', 'ROLE_INVESTOR', 'ROLE_COFOUNDER']) {
      await expect(registerSchema.validate({ ...valid, role })).resolves.toBeTruthy();
    }
  });
});

describe('startupSchema', () => {
  const valid = {
    name: 'My Startup',
    industry: 'Fintech',
    description: 'A description that is longer than twenty characters',
    problemStatement: 'A clear problem here',
    solution: 'A clear solution here',
    fundingGoal: 500000,
    stage: 'IDEA',
    location: 'Bangalore',
  };

  it('passes with valid data', async () => {
    await expect(startupSchema.validate(valid)).resolves.toBeTruthy();
  });

  it('fails when description is too short', async () => {
    await expect(startupSchema.validate({ ...valid, description: 'Too short' })).rejects.toThrow('at least 20 characters');
  });

  it('fails with negative funding goal', async () => {
    await expect(startupSchema.validate({ ...valid, fundingGoal: -1000 })).rejects.toThrow('positive');
  });

  it('fails with non-numeric funding goal', async () => {
    await expect(startupSchema.validate({ ...valid, fundingGoal: 'abc' as unknown as number })).rejects.toThrow('must be a number');
  });
});

describe('investmentSchema', () => {
  it('passes with amount above minimum', async () => {
    await expect(investmentSchema.validate({ amount: 5000 })).resolves.toBeTruthy();
  });

  it('fails when amount is below ₹1,000 minimum', async () => {
    await expect(investmentSchema.validate({ amount: 500 })).rejects.toThrow('Minimum investment is ₹1,000');
  });

  it('fails with negative amount', async () => {
    await expect(investmentSchema.validate({ amount: -100 })).rejects.toThrow('Minimum investment is ₹1,000');
  });

  it('fails with non-numeric amount', async () => {
    await expect(investmentSchema.validate({ amount: 'abc' as unknown as number })).rejects.toThrow('must be a number');
  });
});

describe('profileSchema', () => {
  it('passes with all fields empty (all nullable)', async () => {
    await expect(profileSchema.validate({ name: null, bio: null, skills: null })).resolves.toBeTruthy();
  });

  it('fails when bio exceeds 500 characters', async () => {
    await expect(profileSchema.validate({ bio: 'x'.repeat(501) })).rejects.toThrow('under 500 characters');
  });

  it('fails with invalid portfolio URL', async () => {
    await expect(profileSchema.validate({ portfolioLinks: 'not-a-url' })).rejects.toThrow('valid URL');
  });

  it('passes with a valid portfolio URL', async () => {
    await expect(profileSchema.validate({ portfolioLinks: 'https://github.com/user' })).resolves.toBeTruthy();
  });
});
