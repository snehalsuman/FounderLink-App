import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea, Select } from './Input';

// ─── Input – 1. Normal working ────────────────────────────────────────────────

describe('Input – normal working', () => {
  it('renders with a label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('fires onChange when user types', () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays error message when error prop is set', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error border class when error is present', () => {
    render(<Input error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('renders leftIcon when provided', () => {
    render(<Input leftIcon={<span data-testid="icon">@</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

// ─── Input – 2. Boundary values ───────────────────────────────────────────────

describe('Input – boundary values', () => {
  it('renders without label (no label element)', () => {
    render(<Input />);
    expect(screen.queryByRole('textbox')).toBeInTheDocument();
    expect(document.querySelector('label')).toBeNull();
  });

  it('renders without error (no error paragraph)', () => {
    render(<Input label="Name" />);
    expect(document.querySelector('p')).toBeNull();
  });

  it('uses id prop for label association when provided', () => {
    render(<Input id="custom-id" label="Name" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom-id');
  });

  it('derives id from label when id is not provided', () => {
    render(<Input label="Full Name" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'full-name');
  });

  it('applies pl-9 class when leftIcon is provided', () => {
    render(<Input leftIcon={<span>x</span>} />);
    expect(screen.getByRole('textbox').className).toContain('pl-9');
  });
});

// ─── Input – 3. Exception handling ───────────────────────────────────────────

describe('Input – exception handling', () => {
  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders with type="password" without exposing value', () => {
    render(<Input type="password" />);
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('renders with disabled prop', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

// ─── Textarea – 1. Normal working ─────────────────────────────────────────────

describe('Textarea – normal working', () => {
  it('renders textarea with label', () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText('Bio')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<Textarea error="Too long" />);
    expect(screen.getByText('Too long')).toBeInTheDocument();
  });

  it('fires onChange on input', () => {
    const onChange = jest.fn();
    render(<Textarea onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalled();
  });
});

// ─── Textarea – 2. Boundary values ────────────────────────────────────────────

describe('Textarea – boundary values', () => {
  it('renders without label', () => {
    render(<Textarea />);
    expect(document.querySelector('label')).toBeNull();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });
});

// ─── Select – 1. Normal working ───────────────────────────────────────────────

describe('Select – normal working', () => {
  it('renders select with options', () => {
    render(
      <Select label="Role">
        <option value="FOUNDER">Founder</option>
        <option value="INVESTOR">Investor</option>
      </Select>
    );
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <Select error="Required" label="Role">
        <option value="">Select</option>
      </Select>
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('fires onChange when an option is selected', () => {
    const onChange = jest.fn();
    render(
      <Select onChange={onChange}>
        <option value="A">A</option>
        <option value="B">B</option>
      </Select>
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'B' } });
    expect(onChange).toHaveBeenCalled();
  });
});

// ─── Select – 2. Boundary values / Exception handling ─────────────────────────

describe('Select – boundary values and exception handling', () => {
  it('renders with no options (empty children) without crashing', () => {
    render(<Select>{null}</Select>);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSelectElement>();
    render(
      <Select ref={ref}>
        <option>X</option>
      </Select>
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });
});