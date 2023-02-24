import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyHomework from './MyHomework';

describe('<MyHomework />', () => {
  test('it should mount', () => {
    render(<MyHomework />);

    const myHomework = screen.getByTestId('MyHomework');

    expect(myHomework).toBeInTheDocument();
  });
});