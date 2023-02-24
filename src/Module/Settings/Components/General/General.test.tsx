import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import General from './General';

describe('<General />', () => {
  test('it should mount', () => {
    render(<General />);

    const general = screen.getByTestId('General');

    expect(general).toBeInTheDocument();
  });
});