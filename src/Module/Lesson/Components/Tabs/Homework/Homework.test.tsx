import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Homework from './Homework';

describe('<Homework />', () => {
  test('it should mount', () => {
    render(<Homework />);

    const homework = screen.getByTestId('Homework');

    expect(homework).toBeInTheDocument();
  });
});