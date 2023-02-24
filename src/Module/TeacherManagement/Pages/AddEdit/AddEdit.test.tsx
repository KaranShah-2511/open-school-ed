import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddEdit from './AddEdit';

describe('<AddEdit />', () => {
  test('it should mount', () => {
    render(<AddEdit />);

    const addEdit = screen.getByTestId('AddEdit');

    expect(addEdit).toBeInTheDocument();
  });
});