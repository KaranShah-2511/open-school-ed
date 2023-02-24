import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ClassSetup from './ClassSetup';

describe('<ClassSetup />', () => {
  test('it should mount', () => {
    render(<ClassSetup />);

    const classSetup = screen.getByTestId('ClassSetup');

    expect(classSetup).toBeInTheDocument();
  });
});